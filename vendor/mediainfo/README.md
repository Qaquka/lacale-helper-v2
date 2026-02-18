# MediaInfo vendor assets

Place these files here for fully local/no-external WASM loading:

- `index.min.js` (from `mediainfo.js` package `dist/esm-bundle/index.min.js`)
- `MediaInfoModule.wasm`

`index.html` already prioritizes these local files via `document.baseURI` and falls back to CDN only if they are missing.
