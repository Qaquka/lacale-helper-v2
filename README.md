# lacale-helper-v2

Export statique de l'outil upload-helper, adapté pour un déploiement **100% GitHub Pages static**.

## Projet 100% GitHub Pages static

Ce dépôt ne contient plus de backend/API/Docker.

- Front statique (HTML/CSS/JS buildés)
- Mode MediaInfo WASM via `index.html` (IIFE encapsulée)
- Déploiement GitHub Pages via GitHub Actions en publiant `dist/`

## MediaInfo WASM (vendor fichegen)

Le mode WASM charge en priorité:

- `vendor/mediainfo-fichegen/MediaInfoWasm.js`
- `vendor/mediainfo-fichegen/MediaInfoWasm.wasm`
- `vendor/mediainfo-fichegen/MediaInfoModule.wasm`

Le rendu NFO injecté dans le pipeline natif **Coller un NFO** est généré au format texte MediaInfo:

- sections conditionnelles (`General`, `Video`, `Audio #i`, `Text #i`, `Menu`)
- alignement fixe `key.padEnd(WIDTH) + " : " + value`
- pas de champs inventés, pas de `N/A`

## Commandes

```bash
npm ci
npm test
npm run build
```

## Déploiement GitHub Pages

Le workflow `.github/workflows/pages.yml` exécute:

1. `npm ci`
2. `npm test`
3. `npm run build`
4. `upload-pages-artifact` sur `dist/`
5. `deploy-pages`

### Paramètre GitHub obligatoire

Dans **Settings → Pages** du repo:

- Source = **GitHub Actions**

## Vérification post-déploiement

Dans DevTools (Console + Network) sur `https://qaquka.github.io/lacale-helper-v2/`:

- console contient le stamp `LC_MEDIAINFO_WASM_MODE_V5 ...`
- badge discret `WASM V5` visible en bas à droite
- `vendor/mediainfo-fichegen/MediaInfoWasm.js` et au moins un `.wasm` répondent `200`

Exemples:

```bash
curl -I https://qaquka.github.io/lacale-helper-v2/vendor/mediainfo-fichegen/MediaInfoWasm.js
curl -I https://qaquka.github.io/lacale-helper-v2/vendor/mediainfo-fichegen/MediaInfoModule.wasm
```

## Flow attendu

1. Upload / drop vidéo
2. Overlay "Analyse en cours..."
3. Injection native via "Coller un NFO"
4. Validation
5. Écran TMDB natif ("Sélectionnez le film ou la série" / "Recherche TMDB")

Le fallback JSON/NFO ne doit s'afficher qu'en cas d'échec d'injection native.
