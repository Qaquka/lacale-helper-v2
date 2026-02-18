const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const distDir = path.join(root, 'dist');

if (!fs.existsSync(distDir)) {
  execSync('npm run build', { cwd: root, stdio: 'inherit' });
}

const vendorDir = path.join(distDir, 'vendor', 'mediainfo-fichegen');
assert.ok(fs.existsSync(vendorDir), 'dist/vendor/mediainfo-fichegen must exist');

const wasmJs = path.join(vendorDir, 'MediaInfoWasm.js');
assert.ok(fs.existsSync(wasmJs), 'dist vendor loader MediaInfoWasm.js is missing');

const wasmCandidates = fs.readdirSync(vendorDir).filter((name) => name.toLowerCase().endsWith('.wasm'));
assert.ok(wasmCandidates.length > 0, 'dist vendor folder must contain at least one .wasm file');

// Project must remain static-only.
for (const removedPath of ['api', 'docker-compose.yml', 'Dockerfile', 'nginx.conf']) {
  assert.ok(!fs.existsSync(path.join(root, removedPath)), `${removedPath} should be removed for static-only project`);
}


const forbiddenDistPaths = [
  path.join(distDir, 'api'),
  path.join(distDir, 'public', 'api'),
];
for (const forbiddenPath of forbiddenDistPaths) {
  assert.ok(!fs.existsSync(forbiddenPath), `${path.relative(root, forbiddenPath)} should not exist in static dist`);
}

console.log('Dist vendor files are present:', wasmCandidates.join(', '));
