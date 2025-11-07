// ----------------- events.js -----------------
// Handles miscellaneous UI events

// Mobile menu toggle
document.getElementById('mobileMenuBtn').addEventListener('click', () => document.getElementById('mobileNav').classList.toggle('hidden'));

// Contact form
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  showToast('Thanks for contacting us — we will reply soon.', 'success');
  e.target.reset();
});

// Navigation highlight
document.querySelectorAll('.nav-item').forEach(a => a.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  a.classList.add('active');
}));

// Back to top & header scroll effect
const backToTop = document.getElementById('backToTop');
const siteHeader = document.getElementById('siteHeader');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('hidden', window.scrollY <= 300);
  siteHeader.classList.toggle('scrolled', window.scrollY > 8);
});

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
