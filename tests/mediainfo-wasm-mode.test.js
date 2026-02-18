const fs = require('fs');
const path = require('path');
const assert = require('assert');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert.ok(indexHtml.includes('LC_MEDIAINFO_WASM_MODE_V1'), 'WASM mode signature missing in index.html');
assert.ok(indexHtml.includes("new URL('vendor/mediainfo/index.min.js', document.baseURI)"), 'Local vendor mediainfo URL missing');
assert.ok(indexHtml.includes("new URL('vendor/mediainfo/MediaInfoModule.wasm', document.baseURI)"), 'Local vendor wasm URL missing');
assert.ok(indexHtml.includes('https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.6/dist/esm-bundle/index.min.js'), 'MediaInfo CDN fallback URL missing');
assert.ok(indexHtml.includes("format: 'object'"), 'MediaInfo factory should use format: object');
assert.ok(indexHtml.includes('analyzer.close()'), 'MediaInfo analyzer close() call missing');
assert.ok(indexHtml.includes('setupCaptureInterceptors'), 'Upload interception hook missing');
assert.ok(indexHtml.includes('injectNfoToApp'), 'NFO injection hook missing');

console.log('MediaInfo WASM mode guards passed.');
