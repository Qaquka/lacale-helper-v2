# fichegen-style MediaInfo WASM vendor files

This folder is loaded first by `index.html` via:

- `vendor/mediainfo-fichegen/MediaInfoWasm.js`
- `vendor/mediainfo-fichegen/MediaInfoWasm.wasm`
- `vendor/mediainfo-fichegen/MediaInfoModule.wasm`

The loader uses `document.currentScript` to resolve `.wasm` relative to this script (same pattern as fichegen).
If local wasm loading fails, `index.html` falls back to jsDelivr.
