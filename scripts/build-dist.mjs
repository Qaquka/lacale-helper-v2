import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');

const include = [
  'index.html',
  '404.html',
  'favicon.svg',
  'assets',
  'vendor',
  'public',
];

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const entry of include) {
  const src = join(root, entry);
  if (!existsSync(src)) continue;
  const dest = join(distDir, entry);
  cpSync(src, dest, { recursive: true });
}

const copied = readdirSync(distDir);
if (!copied.length) {
  throw new Error('Dist build produced no files.');
}

console.log(`Built dist with entries: ${copied.join(', ')}`);
