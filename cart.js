// ----------------- cart.js -----------------
// Cart management

const cartCount = document.getElementById('cartCount');
const cartDropdown = document.getElementById('cartDropdown');
const cartItemsEl = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const deliveryEl = document.getElementById('delivery');
const shippingEl = document.getElementById('shipping');
const discountEl = document.getElementById('discount');
const totalEl = document.getElementById('total');
const balanceEl = document.getElementById('balance');
const addMoneyBtn = document.getElementById('addMoney');
const applyCouponBtn = document.getElementById('applyCoupon');
const couponInput = document.getElementById('couponInput');
const checkoutBtn = document.getElementById('checkoutBtn');

function updateBalanceUI() {
  if (isNaN(balance)) balance = 0;
  balanceEl.innerHTML = `Balance: <strong class="text-stone-800">${formatPrice(balance)} BDT</strong>`;
}

function calculateCart() {
  const items = Object.values(cart);
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const delivery = items.length ? 50 : 0;
  const shipping = items.length ? (subtotal > 2000 ? 0 : 100) : 0;
  const discountPercent = Number(discountEl.dataset.value || 0);
  const discountAmount = subtotal * discountPercent / 100;
  const total = subtotal + delivery + shipping - discountAmount;

  subtotalEl.textContent = formatPrice(subtotal);
  deliveryEl.textContent = formatPrice(delivery);
  shippingEl.textContent = formatPrice(shipping);
  discountEl.textContent = formatPrice(discountAmount);
  totalEl.textContent = formatPrice(total);

  return { subtotal, delivery, shipping, discountAmount, total };
}

function renderCart() {
  cartItemsEl.innerHTML = '';
  const items = Object.values(cart);
  cartCount.textContent = items.reduce((c, i) => c + i.qty, 0) || 0;

  if (!items.length) {
    cartItemsEl.innerHTML = '<div class="text-sm text-stone-500">Cart is empty.</div>';
    return calculateCart();
  }

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-3 py-3 border-b border-[color:var(--border)] last:border-0';
    div.innerHTML = `
      <img src="${item.image}" class="w-12 h-12 object-contain rounded-lg border border-[color:var(--border)] bg-white" />
      <div class="flex-1 text-sm">
        <div class="text-stone-800 font-medium leading-snug">${item.title}</div>
        <div class="text-xs text-stone-500">${formatPrice(item.price)} BDT × ${item.qty}</div>
      </div>
      <div class="flex flex-col gap-1">
        <button data-id="${item.id}" class="increase text-xs px-2 py-1 bg-[color:var(--surface-muted)] text-stone-700 rounded-md border border-[color:var(--border)]">+</button>
        <button data-id="${item.id}" class="decrease text-xs px-2 py-1 bg-[color:var(--surface-muted)] text-stone-700 rounded-md border border-[color:var(--border)]">-</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  // Attach quantity buttons
  cartItemsEl.querySelectorAll('.increase').forEach(btn => btn.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (!cart[id]) return;
    const itemTitle = cart[id].title || 'Item';
    cart[id].qty++;
    saveCart();
    const totals = renderCart();
    showToast(`Increased ${itemTitle} quantity.`, 'info', { duration: 2200 });
    if (totals && totals.total > balance) showToast('Warning: total exceeds your balance.', 'warning');
  }));
  cartItemsEl.querySelectorAll('.decrease').forEach(btn => btn.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (!cart[id]) return;
    const itemTitle = cart[id].title || 'Item';
    cart[id].qty--;
    const remainingQty = cart[id] ? cart[id].qty : 0;
    if (remainingQty <= 0) delete cart[id];
    saveCart();
    const totals = renderCart();
    const msg = remainingQty > 0 ? `Decreased ${itemTitle} quantity.` : `${itemTitle} removed from cart.`;
    showToast(msg, 'info', { duration: 2200 });
    if (totals && totals.total > balance) showToast('Warning: total exceeds your balance.', 'warning');
  }));

  return calculateCart();
}

// Add money
addMoneyBtn.addEventListener('click', () => {
  balance += 1000;
  saveBalance();
  updateBalanceUI();
  showToast(`Balance updated: ${formatPrice(balance)} BDT`, 'success');
});

// Apply coupon
applyCouponBtn.addEventListener('click', () => {
  const code = couponInput.value.trim().toUpperCase();
  if (code === 'SMART10') {
    discountEl.dataset.value = 10;
    showToast('SMART10 applied: 10% discount.', 'success');
  } else {
    discountEl.dataset.value = 0;
    showToast('Invalid coupon code.', 'error');
  }
  calculateCart();
});

// Checkout
checkoutBtn.addEventListener('click', () => {
  const totals = calculateCart();
  if (!totals.subtotal) { showToast('Add items to your cart before checkout.', 'info'); return; }
  if (totals.total > balance) { showToast('Insufficient balance for checkout.', 'error'); return; }
  if (confirm(`Confirm purchase for ${formatPrice(totals.total)} BDT?`)) {
    balance -= totals.total;
    saveBalance();
    cart = {};
    saveCart();
    renderCart();
    updateBalanceUI();
    showToast('Purchase successful!', 'success');
  }
});

// Toggle cart dropdown
document.getElementById('cartBtn').addEventListener('click', () => {
  cartDropdown.classList.toggle('hidden');
  document.getElementById('cartBtn').setAttribute('aria-expanded', String(!cartDropdown.classList.contains('hidden')));
});
