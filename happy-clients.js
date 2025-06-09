document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('happy-clients-gallery');
    const numImages = 13; // Total number of client images
    
    // Create gallery items
    for (let i = 1; i <= numImages; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item relative';
        
        const imagePath = `images/happy-clients/client${i}.jpg`;
        item.innerHTML = `
            <img src="${imagePath}" alt="Client Portrait ${i}" class="w-full h-auto rounded-lg shadow-lg gallery-img">
            <div class="overlay absolute inset-0 flex items-center justify-center">
                <div class="flex space-x-4">
                  <a href="${imagePath}" download class="download-icon hover:text-amber-400" title="Download">
                    <i class="fas fa-download"></i>
                  </a>
                  <button class="expand-icon" data-img="${imagePath}" title="Expand" style="background:transparent;border:none;outline:none;cursor:pointer;">
                    <img src="images/icons/expand_icon.png" alt="Expand" class="w-8 h-8">
                  </button>
                </div>
            </div>
        `;
        
        gallery.appendChild(item);
    }
    
    // Add fade-in animation when scrolling
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Add animation styles to gallery items
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(item);
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
});

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
