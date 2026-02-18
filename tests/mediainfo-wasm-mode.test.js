const fs = require('fs');
const path = require('path');
const assert = require('assert');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert.ok(indexHtml.includes('LC_MEDIAINFO_WASM_MODE_V5'), 'WASM mode signature missing in index.html');
assert.ok(indexHtml.includes('<script src="vendor/mediainfo-fichegen/MediaInfoWasm.js"></script>'), 'Fichegen vendor script tag missing');
assert.ok(indexHtml.includes('window.LCFichegenMediaInfo'), 'Fichegen loader global should be used as priority');
assert.ok(indexHtml.includes('[fichegen-loader]'), 'Fichegen loader attempt marker missing');
assert.ok(indexHtml.includes('https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.6/dist/esm-bundle/index.min.js'), 'MediaInfo CDN fallback URL missing');
assert.ok(indexHtml.includes("format: 'object'"), 'MediaInfo factory should use format: object');
assert.ok(indexHtml.includes('analyzer.close()'), 'MediaInfo analyzer close() call missing');
assert.ok(indexHtml.includes("console.log(__LC_WASM_MODE_SIGNATURE, 'commit', __LC_WASM_MODE_COMMIT);"), 'WASM version stamp console log missing');
assert.ok(indexHtml.includes("data-lc-wasm-badge"), 'WASM badge marker missing in index.html');


// MediaInfo text rendering format guards
assert.ok(indexHtml.includes('function renderMediaInfoText(tracks)'), 'renderMediaInfoText(tracks) missing');
assert.ok(indexHtml.includes('function pick(track, candidates)'), 'pick(track, candidates) helper missing');
assert.ok(indexHtml.includes("padEnd(PADDING, ' ')"), 'MediaInfo text keys should use fixed-width padding');
assert.ok(indexHtml.includes("const sectionDefs = ["), 'Section definition table missing');
assert.ok(indexHtml.includes("header: (_, i) => `Audio #${i + 1}`"), 'Audio #i section numbering missing');
assert.ok(indexHtml.includes("header: (_, i) => `Text #${i + 1}`"), 'Text #i section numbering missing');
assert.ok(indexHtml.includes("const menuTrack = list.find"), 'Menu section should be conditional');
assert.ok(!indexHtml.includes('N/A'), 'Renderer must not inject N/A placeholders');
assert.ok(indexHtml.includes('renderMediaInfoText(mediaInfoObject?.media?.track || [])'), 'Analysis flow must inject exact MediaInfo text output');

// Exclusive capture flow checks
assert.ok(indexHtml.includes('async function handleFileExclusive(file, event, origin = \'exclusive\')'), 'Exclusive file handler missing');
assert.ok(indexHtml.includes('stopEventCompletely(event);'), 'Exclusive handler must stop event propagation completely');
assert.ok(indexHtml.includes('stopImmediatePropagation'), 'Capture handlers must call stopImmediatePropagation');
assert.ok(indexHtml.includes("document.addEventListener('change'"), 'Capture change listener missing');
assert.ok(indexHtml.includes("document.addEventListener('drop'"), 'Capture drop listener missing');
assert.ok(indexHtml.includes("document.addEventListener('dragover'"), 'Capture dragover listener missing');

// Native-flow injection checks
assert.ok(indexHtml.includes('async function injectNfoNative(nfoText)'), 'Native NFO injection function missing');
assert.ok(indexHtml.includes('findClickableByText(/coller un nfo/i)'), 'Should attempt to open "Coller un NFO"');
assert.ok(indexHtml.includes('setNativeValue(targetField, nfoText)'), 'Should inject NFO in native textarea field');
assert.ok(indexHtml.includes('validate.click();'), 'Should click native validation button');

// TMDB detection is best-effort only
assert.ok(indexHtml.includes('detectAndScrollTmdb(); // best effort, non bloquant'), 'TMDB detect should be best effort and non-blocking');

// Fallback behavior and overlay cleanup
assert.ok(indexHtml.includes("root.style.display = 'none'"), 'Fallback panel must be hidden by default');
assert.ok(indexHtml.includes('showFallbackPanel(mediaInfoObject, nfoText, injected.why);'), 'Fallback should open only when native injection fails');
assert.ok(indexHtml.includes('hideFallbackPanel();'), 'Fallback must be explicitly hidden on native success');
assert.ok(indexHtml.includes('setOverlayVisible(false);'), 'Overlay must be hidden (including finally path)');

// Base-href/path safety for GH Pages
const resolvedVendor = new URL('vendor/mediainfo-fichegen/MediaInfoWasm.js', 'https://qaquka.github.io/lacale-helper-v2/').toString();
assert.strictEqual(resolvedVendor, 'https://qaquka.github.io/lacale-helper-v2/vendor/mediainfo-fichegen/MediaInfoWasm.js');

console.log('MediaInfo WASM mode guards passed.');
