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

function initializeGallery(photos) {
  masonryGallery.innerHTML = ''; // Clear any existing content
  photos.forEach(photo => {
    const div = document.createElement('div');
    // Add category as a data attribute and initially hide if not 'cats'
    div.className = `gallery-item relative ${photo.category !== 'cats' ? 'hidden' : ''}`;
    div.dataset.category = photo.category;
    div.innerHTML = `
      <img src="${photo.path}" alt="${photo.file}" class="w-full h-auto rounded-lg gallery-img">
      <div class="overlay absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg cursor-pointer">
        <div class="flex space-x-4">
          <a href="${photo.path}" download class="text-white hover:text-green-400 download-icon" title="Download">
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
        btn.classList.add('bg-green-600', 'text-white');
        btn.classList.remove('bg-white', 'text-green-600');
      } else {
        btn.classList.remove('bg-green-600', 'text-white');
        btn.classList.add('bg-white', 'text-green-600');
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
    filterGalleryView('cats'); // Show 'cats' by default and set button styles
  });

GALLERY_CATEGORIES.forEach(cat => {
  const btn = document.getElementById('btn-' + cat.id);
  if (btn) {
    btn.addEventListener('click', () => filterGalleryView(cat.id));
  }
});
