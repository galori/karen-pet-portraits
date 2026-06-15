// gallery.js
// Loads the ordered gallery manifest and provides stable references for edits.

const GALLERY_REFERENCE_STORAGE_KEY = 'gallery-references-visible';
const masonryGallery = document.getElementById('masonry-gallery');
const gallerySection = document.getElementById('gallery');
const referenceToggle = document.getElementById('gallery-reference-toggle');
const referenceStatus = document.getElementById('gallery-reference-status');
const referenceMessage = document.getElementById('gallery-reference-message');
const referenceDone = document.getElementById('gallery-reference-done');

let galleryCategories = [];
let allPhotos = [];
let referencesVisible = readStoredReferenceMode();
let referenceMessageTimer;

function readStoredReferenceMode() {
  try {
    return localStorage.getItem(GALLERY_REFERENCE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function getDownloadName(photo) {
  const ext = photo.src.split('.').pop().toLowerCase();
  return `portrait-by-karen.${ext}`;
}

function getAssetUrl(photo) {
  return `${photo.src}?v=${photo.revision}`;
}

function initializeGallery(photos) {
  masonryGallery.innerHTML = '';

  photos.forEach(photo => {
    const div = document.createElement('div');
    div.className = `gallery-item relative ${photo.category !== 'dogs' ? 'hidden' : ''}`;
    div.dataset.category = photo.category;
    div.dataset.reference = photo.id;
    div.innerHTML = `
      <img src="${getAssetUrl(photo)}" alt="${photo.alt}" loading="lazy" decoding="async" class="w-full h-auto rounded-lg gallery-img">
      <button type="button" class="gallery-number-badge absolute top-3 left-3 bg-slate-800 bg-opacity-90 text-white text-base font-bold rounded-full flex items-center justify-center shadow-lg" aria-label="Copy gallery reference ${photo.id}" title="Copy ${photo.id}" hidden>${photo.id}</button>
      <div class="overlay absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg cursor-pointer">
        <div class="flex space-x-4">
          <a href="${getAssetUrl(photo)}" download="${getDownloadName(photo)}" class="text-white hover:text-green-400 download-icon" title="Download">
            <i class="fas fa-download text-3xl"></i>
          </a>
          <button class="expand-icon" data-img="${getAssetUrl(photo)}" title="Expand" style="background:transparent;border:none;outline:none;cursor:pointer;">
            <img src="images/icons/expand_icon.png" alt="Expand" class="w-8 h-8">
          </button>
        </div>
      </div>
    `;

    div.querySelector('.gallery-number-badge').addEventListener('click', event => {
      event.stopPropagation();
      copyGalleryReference(photo.id);
    });
    masonryGallery.appendChild(div);
  });

  if (window.SharedModal) {
    SharedModal.addExpandListeners('.expand-icon');
  }

  setReferenceMode(referencesVisible);
}

function setReferenceMode(visible, { scrollToGallery = false } = {}) {
  referencesVisible = visible;
  document.body.classList.toggle('gallery-references-visible', visible);

  const badges = masonryGallery.querySelectorAll('.gallery-number-badge');
  badges.forEach(badge => {
    badge.hidden = !visible;
  });

  if (referenceToggle) {
    referenceToggle.setAttribute('aria-pressed', String(visible));
    referenceToggle.textContent = visible ? 'Hide gallery references' : 'Gallery references';
  }
  if (referenceStatus) {
    referenceStatus.hidden = !visible;
  }
  if (visible) {
    showReferenceMessage('Gallery references are on. Tap a reference to copy it.');
  }

  try {
    localStorage.setItem(GALLERY_REFERENCE_STORAGE_KEY, String(visible));
  } catch {
    // Reference mode still works when storage is unavailable.
  }

  if (visible && scrollToGallery) {
    requestAnimationFrame(() => gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
}

function showReferenceMessage(message) {
  if (!referenceMessage) return;
  clearTimeout(referenceMessageTimer);
  referenceMessage.textContent = message;
}

async function copyGalleryReference(reference) {
  try {
    await navigator.clipboard.writeText(reference);
  } catch {
    const input = document.createElement('textarea');
    input.value = reference;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }

  showReferenceMessage(`Copied ${reference}. You can paste it into your message.`);
  referenceMessageTimer = setTimeout(() => {
    if (referencesVisible) {
      showReferenceMessage('Gallery references are on. Tap a reference to copy it.');
    }
  }, 3000);
}

// Keyboard shortcut: Shift+N to toggle image numbers
document.addEventListener('keydown', (e) => {
  if (!e.shiftKey || e.code !== 'KeyN' || e.repeat) return;

  const target = e.target;
  if (target instanceof HTMLElement &&
      (target.isContentEditable || target.matches('input, textarea, select'))) return;

  e.preventDefault();
  setReferenceMode(!referencesVisible);
});

function filterGalleryView(selectedCategory) {
  const galleryItems = masonryGallery.children;
  for (let item of galleryItems) {
    if (item.dataset.category === selectedCategory) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  }

  // Update button styles
  galleryCategories.forEach(cat => {
    const btn = document.getElementById('btn-' + cat.id);
    if (btn) {
      if (cat.id === selectedCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
}

fetch(`gallery.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(res => {
    if (!res.ok) throw new Error(`Gallery manifest returned ${res.status}`);
    return res.json();
  })
  .then(manifest => {
    galleryCategories = manifest.categories;
    allPhotos = manifest.photos;
    initializeGallery(allPhotos);
    filterGalleryView('dogs');
  })
  .catch(error => {
    console.error('Could not load gallery:', error);
    masonryGallery.innerHTML = '<p class="gallery-load-error">The gallery could not be loaded. Please try refreshing the page.</p>';
  });

document.querySelectorAll('.gallery-filter-link').forEach(button => {
  button.addEventListener('click', () => filterGalleryView(button.id.replace('btn-', '')));
});

referenceToggle?.addEventListener('click', () => {
  setReferenceMode(!referencesVisible, { scrollToGallery: !referencesVisible });
});

referenceDone?.addEventListener('click', () => setReferenceMode(false));
