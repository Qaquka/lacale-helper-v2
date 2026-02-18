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
assert.ok(indexHtml.includes('data-lc-wasm-badge'), 'WASM badge marker missing in index.html');
assert.ok(indexHtml.includes("const DEBUG = localStorage.getItem('LC_DEBUG_WASM') === '1';"), 'Debug toggle missing');
assert.ok(indexHtml.includes("console.log('[LC_WASM]'"), 'Debug logger missing');

// MediaInfo text rendering format guards
assert.ok(indexHtml.includes('function renderMediaInfoText(tracks)'), 'renderMediaInfoText(tracks) missing');
assert.ok(indexHtml.includes('function pick(track, candidates)'), 'pick(track, candidates) helper missing');
assert.ok(indexHtml.includes("padEnd(PADDING, ' ')"), 'MediaInfo text keys should use fixed-width padding');
assert.ok(indexHtml.includes('const sectionDefs = ['), 'Section definition table missing');
assert.ok(indexHtml.includes('header: (_, i) => `Audio #${i + 1}`'), 'Audio #i section numbering missing');
assert.ok(indexHtml.includes('header: (_, i) => `Text #${i + 1}`'), 'Text #i section numbering missing');
assert.ok(indexHtml.includes('const menuTrack = list.find'), 'Menu section should be conditional');
assert.ok(!indexHtml.includes('N/A'), 'Renderer must not inject N/A placeholders');

// Exclusive capture flow checks
assert.ok(indexHtml.includes("async function handleFileExclusive(file, event, origin = 'exclusive')"), 'Exclusive file handler missing');
assert.ok(indexHtml.includes('stopEventCompletely(event);'), 'Exclusive handler must stop event propagation completely');
assert.ok(indexHtml.includes('stopImmediatePropagation'), 'Capture handlers must call stopImmediatePropagation');
assert.ok(indexHtml.includes("document.addEventListener('change'"), 'Capture change listener missing');
assert.ok(indexHtml.includes("document.addEventListener('drop'"), 'Capture drop listener missing');
assert.ok(indexHtml.includes("document.addEventListener('dragover'"), 'Capture dragover listener missing');

// Stealth native-flow injection checks
assert.ok(indexHtml.includes('async function injectNfoStealth(nfoText)'), 'Stealth NFO injection function missing');
assert.ok(indexHtml.includes('startStealthObserver'), 'Stealth mutation observer missing');
assert.ok(indexHtml.includes('lc-stealth-style'), 'Stealth style id missing');
assert.ok(indexHtml.includes('lc-stealth-hide'), 'Stealth hide class missing');
assert.ok(indexHtml.includes('applyStealthToModal(modal, stealthNodes);'), 'Modal should be hidden during automation');
assert.ok(indexHtml.includes('findClickableByText(/coller\\s+un\\s+nfo/i)'), 'Should auto-open "Coller un NFO"');
assert.ok(indexHtml.includes('setNativeValue(targetField, nfoText);'), 'Should inject NFO in native textarea field');
assert.ok(indexHtml.includes('/analyser\\s+le\\s+nfo/i'), 'Should prioritize exact "Analyser le NFO" button');
assert.ok(indexHtml.includes('const injected = await injectNfoStealth(nfoText);'), 'Auto stealth injection must run after analysis');

// Autofill checks (size/source/TMDB)
assert.ok(indexHtml.includes('const sizeHuman = humanFileSize(file.size);'), 'File size computation missing');
assert.ok(indexHtml.includes('const sourceDetected = detectReleaseGroup('), 'Release group detection missing');
assert.ok(indexHtml.includes('const titleCandidate = computeTitleCandidate('), 'TMDB title candidate detection missing');
assert.ok(indexHtml.includes("fillFieldIfFound(/taille|file size|size/i, sizeHuman, 'size');"), 'Size field autofill missing');
assert.ok(indexHtml.includes("fillFieldIfFound(/source|team|release/i, sourceDetected, 'source');"), 'Source field autofill missing');
assert.ok(indexHtml.includes('await prefillTmdbTitle(titleCandidate);'), 'TMDB title prefill missing');
assert.ok(indexHtml.includes('setNativeValue(input, titleCandidate);'), 'TMDB input native value assignment missing');

// Success should hide fallback
assert.ok(indexHtml.includes("root.style.display = 'none'"), 'Fallback panel must be hidden by default');
assert.ok(indexHtml.includes('showFallbackPanel(mediaInfoObject, nfoText, injected.why);'), 'Fallback should open only when native injection fails');
assert.ok(indexHtml.includes('hideFallbackPanel();'), 'Fallback must be explicitly hidden on native success');
assert.ok(indexHtml.includes('setOverlayVisible(false);'), 'Overlay must be hidden (including finally path)');
assert.ok(indexHtml.includes('Analyse OK — cliquez sur Suivant/TMDB.'), 'Non-blocking TMDB status hint missing');

// Base-href/path safety for GH Pages
const resolvedVendor = new URL('vendor/mediainfo-fichegen/MediaInfoWasm.js', 'https://qaquka.github.io/lacale-helper-v2/').toString();
assert.strictEqual(resolvedVendor, 'https://qaquka.github.io/lacale-helper-v2/vendor/mediainfo-fichegen/MediaInfoWasm.js');

console.log('MediaInfo WASM mode guards passed.');
