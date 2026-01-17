// nav.js
// Dynamic nav highlighting
const navLinks = document.querySelectorAll('.nav-link');
const sectionIds = Array.from(navLinks).map(link => link.getAttribute('data-section'));
const sections = sectionIds.map(id => document.getElementById(id));

function setActiveNav(sectionId) {
  navLinks.forEach(link => {
    if (link.getAttribute('data-section') === sectionId) {
      link.classList.add('text-green-600', 'border-b-4', 'border-green-600', 'font-semibold');
      link.classList.remove('text-gray-500');
    } else {
      link.classList.remove('text-green-600', 'border-b-4', 'border-green-600', 'font-semibold');
      link.classList.add('text-gray-500');
    }
  });
}

// On click, set active
navLinks.forEach(link => {
  link.addEventListener('click', function () {
    setActiveNav(this.getAttribute('data-section'));
  });
});

// On scroll, set active based on section in view
window.addEventListener('scroll', () => {
  let current = sectionIds[0];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 80) {
        current = sectionIds[i];
      }
    }
  }
  setActiveNav(current);
});

// Set initial active nav
setActiveNav(sectionIds[0]);
