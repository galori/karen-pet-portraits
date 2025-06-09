// shared-modal.js
// Shared logic for expand/download modals in all galleries

(function(global) {
  function createExpandModal(imgSrc) {
    let modal = document.getElementById('expand-modal');
    let prevOverflow = document.body.style.overflow;
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
      const closeModal = () => {
        modal.remove();
        document.body.style.overflow = prevOverflow || '';
      };
      modal.querySelector('.close-expand-modal').onclick = closeModal;
      modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    } else {
      modal.querySelector('img').src = imgSrc;
      modal.classList.remove('hidden');
    }
    document.body.style.overflow = 'hidden';
  }

  function addExpandListeners(selector) {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        const imgSrc = this.getAttribute('data-img');
        createExpandModal(imgSrc);
      });
    });
  }

  function addDownloadListeners(selector) {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Let default <a download> behavior happen
      });
    });
  }

  global.SharedModal = {
    createExpandModal,
    addExpandListeners,
    addDownloadListeners
  };
})(window);
