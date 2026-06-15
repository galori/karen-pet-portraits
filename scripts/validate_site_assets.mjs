import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { siteAssets } from './site_assets.mjs';

const root = path.resolve(import.meta.dirname, '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const errors = [];

for (const asset of siteAssets) {
  const contents = await readFile(path.join(root, asset));
  const expectedRevision = createHash('sha256').update(contents).digest('hex').slice(0, 12);
  const escapedAsset = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...html.matchAll(new RegExp(`${escapedAsset}\\?v=([^"'\\s>]+)`, 'g'))];

  if (matches.length !== 1) {
    errors.push(`${asset}: expected exactly one versioned reference in index.html.`);
    continue;
  }
  if (matches[0][1] !== expectedRevision) {
    errors.push(`${asset}: stale revision; run npm run assets:sync.`);
  }
}

if (errors.length > 0) {
  console.error(`Site asset validation failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Site assets are valid (${siteAssets.length} versioned files).`);
