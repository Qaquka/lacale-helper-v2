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

const backendRootPaths = ['api', 'docker-compose.yml', 'Dockerfile'];
for (const relativePath of backendRootPaths) {
  assert.ok(!fs.existsSync(path.resolve(ROOT, relativePath)), `${relativePath} should be removed`);
}

const backendDistPaths = ['api', 'docker-compose.yml', 'Dockerfile'];
for (const relativePath of backendDistPaths) {
  assert.ok(!fs.existsSync(path.resolve(DIST, relativePath)), `dist/${relativePath} should be removed`);
}

console.log('Dist vendor files are present:', wasmFiles.join(', '));
