const fs = require('fs');
const path = require('path');
const assert = require('assert');

const bundle = fs.readFileSync(path.join(__dirname, '..', 'assets', 'index-Ddv4Ao2m.js'), 'utf8');

// Guard 1: no absolute-root internal href left in bundle templates.
assert.ok(!bundle.includes('href="/"'), 'Bundle still contains href="/"');

// Guard 2: home/logo link should be relative.
assert.ok(
  bundle.includes('<a href="./" class="flex items-center gap-3 hover:opacity-80 transition-opacity">'),
  'Home/logo link is not base-relative (./)'
);

// Guard 3: base utility present and used to rewrite root links.
assert.ok(bundle.includes('function Pu(e="./")'), 'withBase/toBase utility is missing');
assert.ok(bundle.includes('a[href^="/"]'), 'root-link rewrite selector is missing');

// Simulate GH Pages base path behavior with URL resolution.
const resolved = new URL('./', 'https://qaquka.github.io/lacale-helper-v2/').toString();
assert.strictEqual(resolved, 'https://qaquka.github.io/lacale-helper-v2/');

console.log('Base-link guards passed.');
