const fs = require('fs');
const path = require('path');
const assert = require('assert');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const bundle = fs.readFileSync(path.join(__dirname, '..', 'assets', 'index-Ddv4Ao2m.js'), 'utf8');

// Guard 1: lightweight home-link patch is injected in index.html (not in bundle).
assert.ok(indexHtml.includes('(() => {'), 'Inline home-link patch is missing');
assert.ok(indexHtml.includes("a[href=\"/\"]"), 'Home link interception should target only a[href="/"]');
assert.ok(indexHtml.includes("getAttribute('href') || './'"), 'Base href fallback should use "./"');
assert.ok(indexHtml.includes("new URL('./', baseValue)"), 'Home link should resolve to base root');
assert.ok(indexHtml.includes('window.location.assign'), 'Home link navigation assignment is missing');
assert.ok(indexHtml.includes("window.addEventListener('unhandledrejection'"), 'MediaInfo unhandledrejection guard is missing');

// Guard 2: assets remain unchanged.
assert.ok(
  indexHtml.includes('src="assets/index-Ddv4Ao2m.js"'),
  'index.html script asset path was unexpectedly changed'
);
assert.ok(
  indexHtml.includes('href="assets/index-BXI7GdG3.css"'),
  'index.html stylesheet asset path was unexpectedly changed'
);

// Guard 3: patch execution order is safe (before module bundle).
assert.ok(
  indexHtml.indexOf('window.location.assign') < indexHtml.indexOf('src="assets/index-Ddv4Ao2m.js"'),
  'Home-link patch should be defined before the bundle script'
);

// Guard 4: ensure previous injected bundle patch symbols are gone.
assert.ok(!bundle.includes('function Pu(e="./")'), 'Injected Pu helper must not be present in bundle');
assert.ok(!bundle.includes('function __lhShouldRewrite'), 'Injected rewrite helper must not be present in bundle');
assert.ok(!bundle.includes('function __lhFixBaseAnchors'), 'Injected anchor fix helper must not be present in bundle');

// Simulate GH Pages base path behavior for home link.
const resolved = new URL('./', 'https://qaquka.github.io/lacale-helper-v2/').toString();
assert.strictEqual(resolved, 'https://qaquka.github.io/lacale-helper-v2/');

console.log('Base-link guards passed.');
