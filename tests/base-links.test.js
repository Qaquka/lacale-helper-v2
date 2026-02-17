const fs = require('fs');
const path = require('path');
const assert = require('assert');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Guard 1: lightweight home-link patch is injected in index.html (not in bundle).
assert.ok(indexHtml.includes('(() => {'), 'Inline home-link patch is missing');
assert.ok(indexHtml.includes("const PROJECT_ROOT_PREFIX = '/lacale-helper-v2/';"), 'Project root prefix guard is missing');
assert.ok(indexHtml.includes("if (href === '/')"), 'Home link interception for "/" is missing');
assert.ok(indexHtml.includes('window.location.assign(resolveProjectRoot())'), 'Home link should navigate to project base');

// Guard 2: optional project-root absolute links are normalized via base href.
assert.ok(indexHtml.includes('if (href.startsWith(PROJECT_ROOT_PREFIX))'), 'Project path interception is missing');
assert.ok(indexHtml.includes('window.location.assign(resolveProjectPath(href))'), 'Project path rewrite navigation is missing');

// Guard 3: assets remain unchanged.
assert.ok(
  indexHtml.includes('src="assets/index-Ddv4Ao2m.js"'),
  'index.html script asset path was unexpectedly changed'
);
assert.ok(
  indexHtml.includes('href="assets/index-BXI7GdG3.css"'),
  'index.html stylesheet asset path was unexpectedly changed'
);

// Guard 4: patch execution order is safe (before module bundle).
assert.ok(
  indexHtml.indexOf('window.location.assign(resolveProjectRoot())') < indexHtml.indexOf('src="assets/index-Ddv4Ao2m.js"'),
  'Home-link patch should be defined before the bundle script'
);

// Guard 5: simulated GH Pages root resolution stays in project path.
const resolved = new URL('./', 'https://qaquka.github.io/lacale-helper-v2/').toString();
assert.strictEqual(resolved, 'https://qaquka.github.io/lacale-helper-v2/');

console.log('Base-link guards passed.');
