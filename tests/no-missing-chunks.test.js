const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.join(__dirname, '..');
const indexPath = path.join(repoRoot, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

const collectIndexReferences = () => {
  const refs = [];

  const moduleScriptRegex = /<script\s+[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*>/gi;
  const modulePreloadRegex = /<link\s+[^>]*rel=["']modulepreload["'][^>]*href=["']([^"']+)["'][^>]*>/gi;

  let match;
  while ((match = moduleScriptRegex.exec(indexHtml)) !== null) refs.push(match[1]);
  while ((match = modulePreloadRegex.exec(indexHtml)) !== null) refs.push(match[1]);

  return refs;
};

const toRepoPath = (assetRef, baseDir = repoRoot) => {
  const clean = assetRef.split('?')[0].split('#')[0];
  return path.resolve(baseDir, clean);
};

const scanDynamicImports = (entryAssetRefs) => {
  const missing = [];
  const importRegex = /import\(["'](\.\/[^"']+\.js)["']\)/g;

  for (const ref of entryAssetRefs) {
    const entryAbsPath = toRepoPath(ref, repoRoot);
    assert.ok(fs.existsSync(entryAbsPath), `Missing entry/modulepreload asset: ${ref}`);

    const entryCode = fs.readFileSync(entryAbsPath, 'utf8');
    let match;
    while ((match = importRegex.exec(entryCode)) !== null) {
      const importedRef = match[1];
      const importedAbsPath = path.resolve(path.dirname(entryAbsPath), importedRef);
      if (!fs.existsSync(importedAbsPath)) {
        missing.push(path.relative(repoRoot, importedAbsPath));
      }
    }
  }

  return missing;
};

const refs = collectIndexReferences();
assert.ok(refs.length > 0, 'No module assets referenced by index.html');

for (const ref of refs) {
  const filePath = toRepoPath(ref, repoRoot);
  assert.ok(fs.existsSync(filePath), `Referenced asset does not exist: ${ref}`);
}

const missingDynamicChunks = scanDynamicImports(refs);
assert.deepStrictEqual(
  missingDynamicChunks,
  [],
  `Missing dynamic import chunks referenced by entry assets: ${missingDynamicChunks.join(', ')}`
);

console.log('No missing chunks detected.');
