import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(root, 'gallery.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

for (const photo of manifest.photos) {
  const contents = await readFile(path.resolve(root, photo.src));
  photo.revision = createHash('sha256').update(contents).digest('hex').slice(0, 12);
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Updated revisions for ${manifest.photos.length} gallery photos.`);
