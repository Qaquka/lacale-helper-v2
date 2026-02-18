# La Cale Helper v2 — Déploiement NAS (Docker) + mode GitHub Pages

Ce dépôt est une **exportation statique HTTrack** (front Vue pré-buildé, sans sources `src/`).

## Pourquoi GitHub Pages casse pour l’analyse vidéo
L’app tente un import dynamique d’un chunk MediaInfo/WASM (`mediainfo-*.js`). Sur GitHub Pages, si le chunk n’est pas servi exactement, la fallback 404 peut renvoyer `index.html` au lieu du JS, ce qui casse l’analyse vidéo.

➡️ Conclusion: GitHub Pages reste utile en **mode NFO only**, mais pour un workflow fiable d’analyse vidéo il faut un backend local (NAS/Docker) avec `mediainfo` natif.

---

## Architectures possibles

### Option A — Tout front-only (GitHub Pages)
- Analyse via chunks wasm côté navigateur.
- ✅ Simple à héberger.
- ❌ Fragile sur export statique (chunks/paths/fallback), non fiable pour gros fichiers.

### Option B — Front statique + API MediaInfo (Node/Python) + Nginx reverse proxy
- Le front appelle `POST /api/analyze`.
- L’API écrit un temp file, exécute `mediainfo --Output=JSON`, renvoie JSON + NFO.
- ✅ Fiable sur NAS (binaire mediainfo natif), pas de CORS via reverse proxy.
- ✅ Ne nécessite pas de patch du bundle minifié.

### Option C — Service externe distant (autre machine)
- API séparée de l’hébergement front.
- ✅ Flexible.
- ❌ Plus de configuration réseau/sécurité/CORS.

## Choix retenu
**Option B**: Nginx + API FastAPI dockerisée avec `mediainfo` installé dans le conteneur API.

---

## Stack implémentée

- `web` (Nginx): sert le front statique sur `http://<NAS>:${WEB_PORT}/lacale-helper-v2/` (défaut 8088).
- `api` (FastAPI): endpoint `POST /api/analyze` (multipart).
- Reverse proxy Nginx: `/api/* -> api:8000/api/*` (pas de CORS côté navigateur LAN).
- Front MediaInfo WASM: priorité aux fichiers vendorisés (`/vendor/mediainfo/index.min.js` + `/vendor/mediainfo/MediaInfoModule.wasm`) avec fallback CDN si ces fichiers ne sont pas présents.

### Sécurité et limites API
- Extensions acceptées: `.mkv`, `.mp4`, `.avi`.
- Taille max: `MAX_UPLOAD_MB` (par défaut 4096 MB).
- Fichier stocké en temporaire dans `/tmp`, supprimé après analyse.
- `client_max_body_size` Nginx aligné à 4096m.

---

## Lancer sur NAS

```bash
cp .env.example .env
# optionnel: modifier WEB_PORT=8090 si 8088 est déjà pris
docker compose up -d --build
```

### Vérifications rapides
```bash
curl -s http://localhost:${WEB_PORT:-8088}/api/health
# => {"status":"ok"}
```

Puis ouvrir:
- `http://localhost:${WEB_PORT:-8088}/lacale-helper-v2/`


### Vérifier l’analyse vidéo API
```bash
curl -s -F "file=@/chemin/video.mkv" http://localhost:${WEB_PORT:-8088}/api/analyze | head
# la sortie doit contenir "media_info_json" et "nfo_text"
```

### Vérifier les assets (pas de 403)
```bash
curl -I http://localhost:${WEB_PORT:-8088}/lacale-helper-v2/assets/index-Ddv4Ao2m.js
```

Le mode MediaInfo WASM intercepte désormais le flux natif (upload/drop) et tente automatiquement le parcours **Coller un NFO -> Valider -> écran TMDB**.

Un panneau fallback JSON/NFO est présent mais **caché par défaut** et ne s'affiche qu'en cas d'échec d'injection native.

---

## Tests

### Front / statique
```bash
node tests/base-links.test.js
node tests/no-missing-chunks.test.js
node tests/source-detection.test.js
node tests/mediainfo-wasm-mode.test.js
```

### API
```bash
python -m pip install -r api/requirements-dev.txt
PYTHONPATH=api pytest -q api/tests
```

### Test manuel (flux natif attendu)
1. Ouvrir `http://localhost:${WEB_PORT:-8088}/lacale-helper-v2/`.
2. Déposer une vidéo (`.mkv/.mp4/.avi`) dans l'UI principale (pas dans un panneau custom).
3. Vérifier l'overlay `Analyse en cours` puis la bascule vers l'écran TMDB (`Recherche TMDB` / `Sélectionnez le film ou la série`).
4. Vérifier qu'il n'y a **pas** de toast rouge `module MediaInfo ... indisponible` en mode WASM actif.
5. Sélectionner un résultat TMDB et vérifier que les champs se remplissent comme le flux d'origine.
6. Vérifier que le panneau fallback JSON/NFO **n'est pas visible** en cas de succès d'injection.

---

## Note importante
- **Aucun patch manuel du bundle minifié** `assets/index-*.js` pour cette feature.
- L’intégration front API est faite via `index.html` (scripts encapsulés IIFE), pour éviter les collisions de symboles et les écrans noirs.
