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

    // Smooth scrolling for anchor links
    const mobileMenu = document.querySelector('.mobile-menu');
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Only handle if href is not just '#'
            if (this.getAttribute('href') === '#') return;
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                
                const navHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Email obfuscation and copy to clipboard
    const emailLink = document.getElementById('email-link');
    const copyEmailButton = document.getElementById('copy-email-button');
    const copySuccessMessage = document.getElementById('copy-success-message');

    if (emailLink && copyEmailButton && copySuccessMessage) {
        const user = 'karen';
        const domain = 'steinitz.com';
        const email = user + '@' + domain;

        emailLink.href = 'mailto:' + email;
        emailLink.innerHTML = email;

        copyEmailButton.addEventListener('click', () => {
            navigator.clipboard.writeText(email).then(() => {
                copySuccessMessage.classList.remove('hidden');
                setTimeout(() => {
                    copySuccessMessage.classList.add('hidden');
                }, 2000);
            });
        });
    }
});
