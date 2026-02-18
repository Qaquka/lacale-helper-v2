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


## Vendor fichegen mediainfo

Le mode WASM charge en priorité `vendor/mediainfo-fichegen/MediaInfoWasm.js` (pattern inspiré de fichegen: résolution WASM relative au script).

Fichiers attendus:
- `vendor/mediainfo-fichegen/MediaInfoWasm.js`
- `vendor/mediainfo-fichegen/MediaInfoWasm.wasm`
- `vendor/mediainfo-fichegen/MediaInfoModule.wasm`

Le script embarqué dans `index.html` utilise d'abord ce loader vendor, puis fallback CDN seulement si nécessaire.

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
3. Vérifier l'overlay `Analyse en cours`, puis sa disparition avant/pendant la modale “Coller un NFO”.
4. Vérifier qu'il n'y a **pas** de toast rouge `module MediaInfo ... indisponible` en mode WASM actif.
5. Vérifier le parcours natif: ouverture Coller un NFO -> validation -> bascule écran TMDB (`Recherche TMDB` / `Sélectionnez le film ou la série`).
6. Sélectionner un résultat TMDB et vérifier que les champs se remplissent comme le flux d'origine.
7. Vérifier que le panneau fallback JSON/NFO **n'est pas visible** en cas de succès d'injection.

### Test manuel GH Pages
1. Ouvrir `https://qaquka.github.io/lacale-helper-v2/`.
2. Déposer une vidéo -> overlay -> pas de toast rouge.
3. Vérifier le passage par “Coller un NFO” puis bascule sur l'écran TMDB natif.

---

## Note importante
- **Aucun patch manuel du bundle minifié** `assets/index-*.js` pour cette feature.
- L’intégration front API est faite via `index.html` (scripts encapsulés IIFE), pour éviter les collisions de symboles et les écrans noirs.


## GitHub Pages deployment checklist

Le workflow `.github/workflows/pages.yml` déploie maintenant l'artifact `dist/` avec:
1. `npm ci`
2. `npm run build`
3. `npm run test:dist-vendor` (échoue si `dist/vendor/mediainfo-fichegen/*` manque)
4. `upload-pages-artifact` puis `deploy-pages`

### Paramètres GitHub Pages (obligatoire)
- Aller dans **Settings → Pages**.
- Source = **GitHub Actions** (et non "Deploy from a branch").
- Vérifier que la branche de push déclenchant le workflow est bien `deploy` ou `main`.

### Vérification rapide après déploiement
Ouvrir DevTools (Network + Console) sur `https://qaquka.github.io/lacale-helper-v2/` puis vérifier:

```bash
curl -I https://qaquka.github.io/lacale-helper-v2/vendor/mediainfo-fichegen/MediaInfoWasm.js
curl -I https://qaquka.github.io/lacale-helper-v2/vendor/mediainfo-fichegen/MediaInfoModule.wasm
```

Attendu:
- HTTP `200` pour le loader JS et au moins un `.wasm`.
- Console contient `LC_MEDIAINFO_WASM_MODE_V5 commit ...`.
- Badge discret `WASM V5` visible en bas à droite.
