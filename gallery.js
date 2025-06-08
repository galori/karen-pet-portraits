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
    div.className = 'gallery-item';
    div.innerHTML = `<img src="${photo.path}" alt="${photo.file}">`;
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
