// portfolio.js
// Place any site-wide JS here (navigation, modals, etc.)
// Gallery logic is in gallery.js

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const btn = document.querySelector('.mobile-menu-button');
    const menu = document.querySelector('.mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }

    // Modal close logic (if you want to expand for gallery modals, do it in gallery.js)
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.add('hidden');
        });
    });
});
