// gallery.js
// Dynamically loads images from photos_list.txt and displays them by category

const GALLERY_CATEGORIES = [
  { id: 'cats', label: 'Cats', folder: 'cat' },
  { id: 'dogs', label: 'Dogs', folder: 'dog' },
  { id: 'graphite', label: 'Graphite', folder: 'graphite' },
  { id: 'ink', label: 'Ink & Pen', folder: 'ink_and_pen' }
];

const masonryGallery = document.getElementById('masonry-gallery');
let allPhotos = [];

function getCategoryFromPath(path) {
  if (path.includes('/cat/')) return 'cats';
  if (path.includes('/dog/')) return 'dogs';
  if (path.includes('/graphite/')) return 'graphite';
  if (path.includes('/ink_and_pen/')) return 'ink';
  return null;
}

function getDownloadName(photo) {
  const ext = photo.path.split('.').pop().toLowerCase();
  return `portrait-by-karen.${ext}`;
}

let numbersVisible = false;

function initializeGallery(photos) {
  masonryGallery.innerHTML = ''; // Clear any existing content
  photos.forEach((photo, index) => {
    const div = document.createElement('div');
    // Add category as a data attribute and initially hide if not 'cats'
    div.className = `gallery-item relative ${photo.category !== 'dogs' ? 'hidden' : ''}`;
    div.dataset.category = photo.category;
    div.dataset.index = index + 1; // 1-based index for human-friendly numbering
    div.innerHTML = `
      <img src="${photo.path}" alt="${photo.file}" class="w-full h-auto rounded-lg gallery-img">
      <div class="gallery-number-badge absolute top-3 left-3 bg-slate-800 bg-opacity-75 text-white text-xl font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg hidden">${index + 1}</div>
      <div class="overlay absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg cursor-pointer">
        <div class="flex space-x-4">
          <a href="${photo.path}" download="${getDownloadName(photo)}" class="text-white hover:text-green-400 download-icon" title="Download">
            <i class="fas fa-download text-3xl"></i>
          </a>
          <button class="expand-icon" data-img="${photo.path}" title="Expand" style="background:transparent;border:none;outline:none;cursor:pointer;">
            <img src="images/icons/expand_icon.png" alt="Expand" class="w-8 h-8">
          </button>
        </div>
      </div>
    `;
    masonryGallery.appendChild(div);
  });

  // Use shared modal logic for expand icons
  if (window.SharedModal) {
    SharedModal.addExpandListeners('.expand-icon');
  }
}

function toggleGalleryNumbers() {
  numbersVisible = !numbersVisible;
  const badges = masonryGallery.querySelectorAll('.gallery-number-badge');
  const items = masonryGallery.querySelectorAll('.gallery-item');

  badges.forEach((badge, idx) => {
    const item = items[idx];
    if (numbersVisible) {
      // Show badge, push overlay down with lower z-index
      badge.classList.remove('hidden');
      badge.classList.add('z-10');
      if (item) {
        const overlay = item.querySelector('.overlay');
        if (overlay) overlay.style.zIndex = '1';
      }
    } else {
      // Hide badge, restore overlay z-index
      badge.classList.add('hidden');
      badge.classList.remove('z-10');
      if (item) {
        const overlay = item.querySelector('.overlay');
        if (overlay) overlay.style.zIndex = '';
      }
    }
  });

  console.log('Gallery numbers toggled:', numbersVisible);
}

// Keyboard shortcut: Shift+N to toggle image numbers
document.addEventListener('keydown', (e) => {
  if (e.shiftKey && (e.key === 'N' || e.key === 'n' || e.code === 'KeyN')) {
    // Don't toggle if user is typing in an input/textarea
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    e.preventDefault();
    console.log('Shift+N pressed');
    toggleGalleryNumbers();
  }
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
  GALLERY_CATEGORIES.forEach(cat => {
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

fetch('photos_list.txt')
  .then(res => res.text())
  .then(text => {
    allPhotos = text.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//') && !line.endsWith('.DS_Store'))
      .map(path => ({
        path,
        file: path.split('/').pop(),
        category: getCategoryFromPath(path)
      }))
      .filter(photo => photo.category);
    
    initializeGallery(allPhotos); // Load all images into the DOM
    filterGalleryView('dogs'); // Show 'dogs' by default and set button styles
  });

GALLERY_CATEGORIES.forEach(cat => {
  const btn = document.getElementById('btn-' + cat.id);
  if (btn) {
    btn.addEventListener('click', () => filterGalleryView(cat.id));
  }
});
