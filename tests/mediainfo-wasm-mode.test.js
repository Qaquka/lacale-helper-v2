const fs = require('fs');
const path = require('path');
const assert = require('assert');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert.ok(indexHtml.includes('LC_MEDIAINFO_WASM_MODE_V3'), 'WASM mode signature missing in index.html');
assert.ok(indexHtml.includes("new URL('vendor/mediainfo/index.min.js', document.baseURI)"), 'Local vendor mediainfo URL missing');
assert.ok(indexHtml.includes("new URL('vendor/mediainfo/MediaInfoModule.wasm', document.baseURI)"), 'Local vendor wasm URL missing');
assert.ok(indexHtml.includes('https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.6/dist/esm-bundle/index.min.js'), 'MediaInfo CDN fallback URL missing');
assert.ok(indexHtml.includes("format: 'object'"), 'MediaInfo factory should use format: object');
assert.ok(indexHtml.includes('analyzer.close()'), 'MediaInfo analyzer close() call missing');

// Exclusive capture flow checks
assert.ok(indexHtml.includes('async function handleFileExclusive(file, event, origin = \'exclusive\')'), 'Exclusive file handler missing');
assert.ok(indexHtml.includes('stopEventCompletely(event);'), 'Exclusive handler must stop event propagation completely');
assert.ok(indexHtml.includes('stopImmediatePropagation'), 'Capture handlers must call stopImmediatePropagation');
assert.ok(indexHtml.includes("document.addEventListener('change'"), 'Capture change listener missing');
assert.ok(indexHtml.includes("document.addEventListener('drop'"), 'Capture drop listener missing');
assert.ok(indexHtml.includes("document.addEventListener('dragover'"), 'Capture dragover listener missing');

// Native-flow injection checks
assert.ok(indexHtml.includes('findClickableByText(/coller un nfo/i)'), 'Should attempt to open "Coller un NFO"');
assert.ok(indexHtml.includes('setNativeValue(targetField, nfoText)'), 'Should inject NFO in native textarea field');
assert.ok(indexHtml.includes('validate.click();'), 'Should click native validation button');

// No artificial re-dispatch on video input after analysis
assert.ok(!indexHtml.includes('input.dispatchEvent(new Event("change"'), 'Should not re-dispatch change on file input');

// Fallback panel hidden by default, only shown on failure
assert.ok(indexHtml.includes("root.style.display = 'none'"), 'Fallback panel must be hidden by default');
assert.ok(indexHtml.includes('showFallbackPanel(mediaInfoObject, nfoText, injected.why);'), 'Fallback should open only when native injection fails');

console.log('MediaInfo WASM mode guards passed.');
