// ----------------- helpers.js -----------------
// Utility functions

function saveCart() {
  localStorage.setItem('smartshop_cart', JSON.stringify(cart));
}

function saveBalance() {
  localStorage.setItem('smartshop_balance', String(balance));
}

function formatPrice(n) {
  return Number(n).toFixed(2);
}

function capitalize(str) {
  return str && str.length ? str[0].toUpperCase() + str.slice(1) : '';
}

function mapCategory(apiCategory) {
  apiCategory = (apiCategory || '').toLowerCase();
  if (apiCategory.includes('electronics')) return 'gadgets';
  if (['men','women','clothing','jewelery','jewelry'].some(c => apiCategory.includes(c))) return 'fashion';
  return 'home';
}

function renderStars(n) {
  const full = Math.floor(n || 0);
  let html = '';
  for (let i = 0; i < 5; i++) html += i < full ? '★' : '☆';
  return html;
}

let toastContainerEl = document.getElementById('toastContainer');

const toastDefaultDurations = {
  success: 2800,
  info: 3200,
  warning: 3600,
  error: 4000
};

function ensureToastContainer() {
  if (toastContainerEl) return toastContainerEl;
  const existing = document.getElementById('toastContainer');
  if (existing) { toastContainerEl = existing; return toastContainerEl; }
  if (!document.body) return null;
  const el = document.createElement('div');
  el.id = 'toastContainer';
  el.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3';
  document.body.appendChild(el);
  toastContainerEl = el;
  return toastContainerEl;
}

function dismissToast(toast) {
  if (!toast) return;
  if (toast._dismissTimer) clearTimeout(toast._dismissTimer);
  toast.classList.remove('show');
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 220);
}

function showToast(message, type = 'info', options = {}) {
  const mountTarget = toastContainerEl || ensureToastContainer();
  if (!mountTarget) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const textNode = document.createElement('span');
  textNode.textContent = message;
  toast.appendChild(textNode);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'toast-close';
  closeBtn.setAttribute('aria-label', 'Dismiss notification');
  closeBtn.textContent = 'X';
  closeBtn.addEventListener('click', () => dismissToast(toast));
  toast.appendChild(closeBtn);

  mountTarget.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  const duration = Number(options.duration) || toastDefaultDurations[type] || 3000;
  toast._dismissTimer = setTimeout(() => dismissToast(toast), duration);
}