document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('happy-clients-gallery');
    const numImages = 13; // Total number of client images
    
    // Create gallery items
    for (let i = 1; i <= numImages; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item relative';
        
        const imagePath = `images/happy-clients/client${i}.jpg`;
        item.innerHTML = `
            <img src="${imagePath}" alt="Client Portrait ${i}" class="w-full h-auto rounded-lg shadow-lg">
            <div class="overlay absolute inset-0 flex items-center justify-center">
                <a href="${imagePath}" download class="download-icon hover:text-amber-400">
                    <i class="fas fa-download"></i>
                </a>
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
});
