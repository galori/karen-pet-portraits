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

function renderGallery(category) {
  masonryGallery.innerHTML = '';
  allPhotos.filter(photo => photo.category === category).forEach(photo => {
    const div = document.createElement('div');
    div.className = 'gallery-item relative';
    div.innerHTML = `
      <img src="${photo.path}" alt="${photo.file}" class="w-full h-auto rounded-lg gallery-img">
      <div class="overlay absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg cursor-pointer">
        <div class="flex space-x-4">
          <a href="${photo.path}" download class="text-white hover:text-amber-400 download-icon" title="Download">
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
  // Update button styles
  GALLERY_CATEGORIES.forEach(cat => {
    const btn = document.getElementById('btn-' + cat.id);
    if (btn) {
      if (cat.id === category) {
        btn.classList.add('bg-amber-600', 'text-white');
        btn.classList.remove('bg-white', 'text-amber-600');
      } else {
        btn.classList.remove('bg-amber-600', 'text-white');
        btn.classList.add('bg-white', 'text-amber-600');
      }
    }
  });

  // Add expand modal logic
  document.querySelectorAll('.expand-icon').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      const imgSrc = this.getAttribute('data-img');
      showExpandModal(imgSrc);
    });
  });
}

// Modal for expanded image
function showExpandModal(imgSrc) {
  let modal = document.getElementById('expand-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'expand-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80';
    modal.innerHTML = `
      <div class="relative max-w-4xl w-full flex flex-col items-center">
        <button class="absolute top-2 right-2 text-white text-3xl font-bold close-expand-modal" title="Close">&times;</button>
        <img src="${imgSrc}" alt="Expanded" class="max-h-[80vh] w-auto rounded-lg shadow-2xl border-4 border-white">
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-expand-modal').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  } else {
    modal.querySelector('img').src = imgSrc;
    modal.classList.remove('hidden');
  }
  document.body.style.overflow = 'hidden';
  modal.ontransitionend = () => { document.body.style.overflow = ''; };
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
    renderGallery('cats');
  });

GALLERY_CATEGORIES.forEach(cat => {
  const btn = document.getElementById('btn-' + cat.id);
  if (btn) {
    btn.addEventListener('click', () => renderGallery(cat.id));
  }
});
