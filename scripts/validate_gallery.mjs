import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(root, 'gallery.json');
const errors = [];

function report(message) {
  errors.push(message);
}

function detectImageType(buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: 'png', mimeType: 'image/png' };
  }
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { extension: 'webp', mimeType: 'image/webp' };
  }
  if (['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) {
    return { extension: 'gif', mimeType: 'image/gif' };
  }
  return null;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

let manifest;
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch (error) {
  console.error(`Could not read gallery.json: ${error.message}`);
  process.exit(1);
}

if (manifest.version !== 1) {
  report('gallery.json must have version 1.');
}
if (!Array.isArray(manifest.categories) || manifest.categories.length === 0) {
  report('gallery.json must include categories.');
}
if (!Array.isArray(manifest.photos) || manifest.photos.length === 0) {
  report('gallery.json must include photos.');
}

const categories = new Map();
for (const category of manifest.categories || []) {
  if (!category.id || !category.folder || !category.referencePrefix) {
    report(`Invalid category: ${JSON.stringify(category)}`);
    continue;
  }
  if (!Number.isInteger(category.nextReference) || category.nextReference < 1) {
    report(`${category.id}: nextReference must be a positive integer.`);
  }
  if (categories.has(category.id)) {
    report(`Duplicate category id: ${category.id}`);
  }
  categories.set(category.id, category);
}

const ids = new Set();
const sources = new Set();
const hashes = new Map();
const highestReferences = new Map();

for (const photo of manifest.photos || []) {
  const label = photo.id || photo.src || 'unknown photo';
  const category = categories.get(photo.category);

  if (!category) {
    report(`${label}: unknown category "${photo.category}".`);
    continue;
  }
  if (!new RegExp(`^${category.referencePrefix}-\\d{3}$`).test(photo.id || '')) {
    report(`${label}: id must match ${category.referencePrefix}-NNN.`);
  } else {
    const referenceNumber = Number(photo.id.slice(2));
    highestReferences.set(
      category.id,
      Math.max(highestReferences.get(category.id) || 0, referenceNumber)
    );
  }
  if (ids.has(photo.id)) {
    report(`${label}: duplicate permanent id.`);
  }
  ids.add(photo.id);

  if (!photo.src || sources.has(photo.src)) {
    report(`${label}: missing or duplicate src "${photo.src}".`);
  }
  sources.add(photo.src);

  if (!photo.alt || photo.alt.trim().length < 5) {
    report(`${label}: add meaningful alt text.`);
  }

  const expectedFolder = `photos/${category.folder}/`;
  if (!photo.src?.startsWith(expectedFolder)) {
    report(`${label}: src must be inside ${expectedFolder}.`);
  }

  let contents;
  try {
    contents = await readFile(path.resolve(root, photo.src));
  } catch {
    report(`${label}: file does not exist at ${photo.src}.`);
    continue;
  }

  const imageType = detectImageType(contents);
  if (!imageType) {
    report(`${label}: unsupported or invalid image file.`);
    continue;
  }

  const actualExtension = path.extname(photo.src).slice(1).toLowerCase();
  const allowedExtensions = imageType.extension === 'jpg' ? ['jpg', 'jpeg'] : [imageType.extension];
  if (!allowedExtensions.includes(actualExtension)) {
    report(`${label}: extension .${actualExtension} does not match ${imageType.mimeType}.`);
  }

  const expectedFilename = `${photo.id.toLowerCase()}.${actualExtension}`;
  if (path.basename(photo.src) !== expectedFilename) {
    report(`${label}: filename must be ${expectedFilename}.`);
  }

  const hash = createHash('sha256').update(contents).digest('hex');
  const expectedRevision = hash.slice(0, 12);
  if (photo.revision !== expectedRevision) {
    report(`${label}: revision is stale; run npm run gallery:sync.`);
  }

  const duplicate = hashes.get(hash);
  if (duplicate) {
    report(`${label}: exact duplicate of ${duplicate}.`);
  } else {
    hashes.set(hash, label);
  }
}

for (const category of categories.values()) {
  const highestReference = highestReferences.get(category.id) || 0;
  if (category.nextReference <= highestReference) {
    report(`${category.id}: nextReference must be greater than ${highestReference}.`);
  }
}

const activeFiles = new Set(
  (await walk(path.join(root, 'photos')))
    .map(filePath => path.relative(root, filePath).split(path.sep).join('/'))
);

for (const filePath of activeFiles) {
  if (!sources.has(filePath)) {
    report(`Unlisted file in active gallery folder: ${filePath}`);
  }
}

if (errors.length > 0) {
  console.error(`Gallery validation failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const counts = new Map();
for (const photo of manifest.photos) {
  counts.set(photo.category, (counts.get(photo.category) || 0) + 1);
}

const summary = [...counts]
  .map(([category, count]) => `${category}: ${count}`)
  .join(', ');
console.log(`Gallery is valid (${manifest.photos.length} photos; ${summary}).`);
