const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.resolve(ROOT, 'dist');

if (!fs.existsSync(DIST)) {
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
}

const vendorDir = path.resolve(DIST, 'vendor', 'mediainfo-fichegen');
assert.ok(fs.existsSync(vendorDir), 'dist/vendor/mediainfo-fichegen must exist');

const wasmJsPath = path.resolve(vendorDir, 'MediaInfoWasm.js');
assert.ok(fs.existsSync(wasmJsPath), 'dist/vendor/mediainfo-fichegen/MediaInfoWasm.js must exist');

const wasmFiles = fs
  .readdirSync(vendorDir)
  .filter((fileName) => fileName.toLowerCase().endsWith('.wasm'));
assert.ok(wasmFiles.length > 0, 'dist/vendor/mediainfo-fichegen must contain at least one .wasm file');

const backendRootPaths = ['api', 'Dockerfile'];
for (const relativePath of backendRootPaths) {
  assert.ok(!fs.existsSync(path.resolve(ROOT, relativePath)), `${relativePath} should be removed`);
}

const backendDistPaths = ['api', 'Dockerfile'];
for (const relativePath of backendDistPaths) {
  assert.ok(!fs.existsSync(path.resolve(DIST, relativePath)), `dist/${relativePath} should be removed`);
}

function findFilesByName(startDir, fileName) {
  const matches = [];
  const stack = [startDir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '.git' || entry.name === 'node_modules') continue;
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name === fileName) {
        matches.push(fullPath);
      }
    }
  }
  return matches;
}

const composeAtRoot = findFilesByName(ROOT, 'docker-compose.yml').filter(
  (fullPath) => !fullPath.startsWith(`${DIST}${path.sep}`)
);
assert.deepStrictEqual(
  composeAtRoot,
  [],
  `docker-compose.yml should be removed from repository: ${composeAtRoot.join(', ')}`
);

const composeInDist = findFilesByName(DIST, 'docker-compose.yml');
assert.deepStrictEqual(
  composeInDist,
  [],
  `docker-compose.yml should not be copied to dist: ${composeInDist.join(', ')}`
);

console.log('Dist vendor files are present:', wasmFiles.join(', '));
