import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const port = Number(process.env.GALLERY_TEST_PORT || 8124);
const origin = `http://127.0.0.1:${port}`;
const manifest = JSON.parse(await readFile(path.join(root, 'gallery.json'), 'utf8'));
const expectedCounts = Object.fromEntries(
  manifest.categories.map(category => [
    category.id,
    manifest.photos.filter(photo => photo.category === category.id).length
  ])
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForServer(server) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Local server exited with code ${server.exitCode}.`);
    }
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Local server did not start at ${origin}.`);
}

async function verifyViewport(browser, name, options) {
  const context = await browser.newContext(options);
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  const page = await context.newPage();
  const pageErrors = [];
  const failedGalleryRequests = [];

  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === origin &&
        (url.pathname.startsWith('/photos/') || url.pathname === '/gallery.json') &&
        !response.ok()) {
      failedGalleryRequests.push(`${response.status()} ${url.pathname}`);
    }
  });

  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    count => document.querySelectorAll('#masonry-gallery .gallery-item').length === count,
    manifest.photos.length
  );

  const itemCount = await page.locator('#masonry-gallery .gallery-item').count();
  assert(itemCount === manifest.photos.length, `${name}: expected ${manifest.photos.length} gallery items, found ${itemCount}.`);

  const references = await page.locator('#masonry-gallery .gallery-item').evaluateAll(items =>
    items.map(item => item.dataset.reference)
  );
  assert(new Set(references).size === references.length, `${name}: gallery references are not unique.`);

  for (const category of manifest.categories) {
    await page.locator(`#btn-${category.id}`).click();
    await page.waitForFunction(
      ({ categoryId, count }) => {
        const visibleItems = [...document.querySelectorAll('#masonry-gallery .gallery-item')]
          .filter(item => !item.classList.contains('hidden') && item.dataset.category === categoryId);
        return visibleItems.length === count &&
          visibleItems.every(item => {
            const image = item.querySelector('img.gallery-img');
            return image?.complete && image.naturalWidth > 0;
          });
      },
      { categoryId: category.id, count: expectedCounts[category.id] }
    );
  }

  await page.locator('#btn-dogs').click();
  const footerToggle = page.getByRole('button', { name: 'Gallery references' });
  await footerToggle.scrollIntoViewIfNeeded();
  await footerToggle.click();

  await page.waitForFunction(() =>
    document.body.classList.contains('gallery-references-visible') &&
    !document.querySelector('.gallery-number-badge')?.hidden
  );

  const firstVisibleBadge = page.locator('.gallery-item:not(.hidden) .gallery-number-badge').first();
  const firstReference = await firstVisibleBadge.textContent();
  await firstVisibleBadge.click();
  await page.waitForFunction(
    reference => document.querySelector('#gallery-reference-message')?.textContent.includes(`Copied ${reference}`),
    firstReference
  );

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  assert(clipboardText === firstReference, `${name}: copied "${clipboardText}" instead of "${firstReference}".`);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() =>
    document.querySelectorAll('#masonry-gallery .gallery-item').length > 0 &&
    document.body.classList.contains('gallery-references-visible')
  );

  await page.keyboard.press('Shift+N');
  await page.waitForFunction(() => !document.body.classList.contains('gallery-references-visible'));

  assert(pageErrors.length === 0, `${name}: JavaScript errors: ${pageErrors.join('; ')}`);
  assert(failedGalleryRequests.length === 0, `${name}: failed gallery requests: ${failedGalleryRequests.join('; ')}`);

  await context.close();
  console.log(`${name}: passed`);
}

const server = spawn('ruby', ['-run', '-ehttpd', '.', `-p${port}`], {
  cwd: root,
  stdio: ['ignore', 'ignore', 'pipe']
});
let serverErrors = '';
server.stderr.on('data', chunk => {
  serverErrors += chunk.toString();
});

let browser;
try {
  await waitForServer(server);
  browser = await chromium.launch({ headless: true });

  await verifyViewport(browser, 'desktop', {
    viewport: { width: 1440, height: 1000 }
  });
  await verifyViewport(browser, 'mobile', {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  });

  console.log('Gallery browser checks passed.');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  if (server.exitCode && serverErrors) {
    console.error(serverErrors);
  }
}
