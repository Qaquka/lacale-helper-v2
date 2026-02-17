const fs = require('fs');
const path = require('path');
const assert = require('assert');

const bundlePath = path.join(__dirname, '..', 'assets', 'index-Ddv4Ao2m.js');
const bundle = fs.readFileSync(bundlePath, 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Guard 1: no absolute-root internal href left in bundle templates.
assert.ok(!bundle.includes('href="/"'), 'Bundle still contains href="/"');

// Guard 2: home/logo link should be relative.
assert.ok(
  bundle.includes('<a href="./" class="flex items-center gap-3 hover:opacity-80 transition-opacity">'),
  'Home/logo link is not base-relative (./)'
);

// Guard 3: rewrite helper is scoped (not global a[href^="/"]).
assert.ok(bundle.includes('function __lhShouldRewrite'), 'Scoped rewrite guard is missing');
assert.ok(bundle.includes('a[href]'), 'Anchor selector should target anchors only');
assert.ok(bundle.includes('e==="/"||e.startsWith("/lacale-helper-v2/")'), 'Guard should only rewrite root/project links');
assert.ok(bundle.includes('e.startsWith("/assets/")'), 'Asset path exclusion is missing');
assert.ok(bundle.includes('e.startsWith("/favicon")'), 'Favicon exclusion is missing');
assert.ok(bundle.includes('e==="/robots.txt"'), 'robots.txt exclusion is missing');

// Guard 4: index.html asset URLs remain relative and untouched.
assert.ok(
  indexHtml.includes('src="assets/index-Ddv4Ao2m.js"'),
  'index.html script asset path was unexpectedly changed'
);
assert.ok(
  indexHtml.includes('href="assets/index-BXI7GdG3.css"'),
  'index.html stylesheet asset path was unexpectedly changed'
);

// Simulate GH Pages base path behavior for home link.
const resolved = new URL('./', 'https://qaquka.github.io/lacale-helper-v2/').toString();
assert.strictEqual(resolved, 'https://qaquka.github.io/lacale-helper-v2/');

console.log('Base-link guards passed.');
