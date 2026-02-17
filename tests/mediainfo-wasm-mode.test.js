const fs = require('fs');
const path = require('path');
const assert = require('assert');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert.ok(indexHtml.includes('LC_MEDIAINFO_WASM_MODE_V1'), 'WASM mode signature missing in index.html');
assert.ok(indexHtml.includes('https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.6/dist/mediainfo.min.js'), 'MediaInfo CDN script URL missing');
assert.ok(indexHtml.includes('https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.6/dist/MediaInfoModule.wasm'), 'MediaInfo WASM URL missing');
assert.ok(indexHtml.includes('setupCaptureInterceptors'), 'Upload interception hook missing');
assert.ok(indexHtml.includes('injectNfoToApp'), 'NFO injection hook missing');

console.log('MediaInfo WASM mode guards passed.');
