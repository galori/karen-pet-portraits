import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { siteAssets } from './site_assets.mjs';

const root = path.resolve(import.meta.dirname, '..');
const indexPath = path.join(root, 'index.html');
let html = await readFile(indexPath, 'utf8');

for (const asset of siteAssets) {
  const contents = await readFile(path.join(root, asset));
  const revision = createHash('sha256').update(contents).digest('hex').slice(0, 12);
  const escapedAsset = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(${escapedAsset})(?:\\?v=[^"'\\s>]+)?`, 'g');

  if (!pattern.test(html)) {
    throw new Error(`Could not find ${asset} in index.html.`);
  }
  html = html.replace(pattern, `$1?v=${revision}`);
}

await writeFile(indexPath, html);
console.log(`Updated revisions for ${siteAssets.length} local CSS/JS assets.`);
