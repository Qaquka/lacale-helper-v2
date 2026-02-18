const fs = require('fs');
const path = require('path');
const assert = require('assert');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert.ok(indexHtml.includes('LC_MEDIAINFO_WASM_MODE_V2'), 'WASM mode signature missing in index.html');
assert.ok(indexHtml.includes("new URL('vendor/mediainfo/index.min.js', document.baseURI)"), 'Local vendor mediainfo URL missing');
assert.ok(indexHtml.includes("new URL('vendor/mediainfo/MediaInfoModule.wasm', document.baseURI)"), 'Local vendor wasm URL missing');
assert.ok(indexHtml.includes('https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.6/dist/esm-bundle/index.min.js'), 'MediaInfo CDN fallback URL missing');
assert.ok(indexHtml.includes("format: 'object'"), 'MediaInfo factory should use format: object');
assert.ok(indexHtml.includes('analyzer.close()'), 'MediaInfo analyzer close() call missing');

// Native-flow injection checks (Coller un NFO -> textarea -> validate click)
assert.ok(indexHtml.includes('findClickableByText(/coller un nfo/i)'), 'Should attempt to open "Coller un NFO"');
assert.ok(indexHtml.includes('setNativeValue(targetField, nfoText)'), 'Should inject NFO in native textarea field');
assert.ok(indexHtml.includes('findClickableByText(/valider/i, modal)'), 'Should search native validation button');
assert.ok(indexHtml.includes('validate.click();'), 'Should click native validation button');
assert.ok(indexHtml.includes('écran TMDB non détecté après validation'), 'Should report TMDB transition issue when native flow fails');

// Fallback panel should be hidden by default, shown only on failure
assert.ok(indexHtml.includes("root.style.display = 'none'"), 'Fallback panel must be hidden by default');
assert.ok(indexHtml.includes('showFallbackPanel(mediaInfoObject, nfoText, injected.why);'), 'Fallback panel should be shown only when injection fails');

console.log('MediaInfo WASM mode guards passed.');
