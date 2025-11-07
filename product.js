// ----------------- products.js -----------------
// Fetch, filter, sort, and render products

const productGrid = document.getElementById('productGrid');
const displayInfo = document.getElementById('displayInfo');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const showAllBtn = document.getElementById('showAllBtn');
const categoryButtons = document.querySelectorAll('.cat-btn');

// Render products into DOM
function renderProducts(list) {
  productGrid.innerHTML = '';
  if (!list.length) {
    productGrid.innerHTML = '<div class="col-span-full text-sm text-stone-500">No products found.</div>';
    return;
  }
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'bg-[color:var(--surface)] border border-[color:var(--border)] p-5 rounded-2xl flex flex-col gap-3 shadow-sm card-hover';
    card.innerHTML = `
      <div class="flex-1">
        <img src="${p.image}" class="w-full h-40 object-contain mb-3" />
        <h4 class="text-sm md:text-base font-semibold line-clamp-2 text-stone-900">${p.title}</h4>
        <div class="text-xs text-stone-500">Rating: ${p.rating?.rate || 'N/A'}</div>
      </div>
      <div class="mt-auto flex items-center justify-between">
        <div class="font-semibold text-stone-900 text-lg">${formatPrice(p.price)} BDT</div>
        <div class="flex items-center gap-2">
          <button data-id="${p.id}" class="addToCart px-4 py-2 bg-[color:var(--accent)] text-white text-sm rounded-full font-medium shadow-sm hover:bg-[color:var(--accent-2)]">Add</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });

  // Add to cart functionality
  document.querySelectorAll('.addToCart').forEach(btn => btn.addEventListener('click', e => {
    const id = e.target.dataset.id;
    const product = products.find(x => String(x.id) === String(id));
    if (!product) return;
    if (cart[id]) cart[id].qty++;
    else cart[id] = { id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 };
    saveCart();
    const totals = renderCart();
    showToast(`${product.title} added to cart.`, 'success');
    if (totals && totals.total > balance) showToast('Warning: total exceeds your balance.', 'warning');
  }));
}

// Update display info text
function updateDisplayInfo(count) {
  if (selectedCategory === 'all') {
    displayInfo.textContent = showAllFlag ? `all ${products.length} products` : `first ${initialHalf.length} of ${products.length}`;
  } else {
    const totalCat = products.filter(p => p.myCategory === selectedCategory).length;
    displayInfo.textContent = `${count} of ${totalCat} in ${capitalize(selectedCategory)}`;
  }
}

// Apply filters, search, and sort
function applyFiltersAndRender() {
  let filtered = [...products];

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(p => (p.title || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.myCategory || '').toLowerCase().includes(q));
  }

  if (selectedCategory !== 'all') filtered = filtered.filter(p => p.myCategory === selectedCategory);
  else if (!showAllFlag) filtered = initialHalf.slice();

  if (currentSort === 'low') filtered.sort((a, b) => a.price - b.price);
  if (currentSort === 'high') filtered.sort((a, b) => b.price - a.price);

  renderProducts(filtered);
  updateDisplayInfo(filtered.length);
}

// Event listeners
searchInput.addEventListener('input', e => { currentSearch = e.target.value || ''; applyFiltersAndRender(); });
sortSelect.addEventListener('change', e => { currentSort = e.target.value; applyFiltersAndRender(); });
showAllBtn.addEventListener('click', () => {
  showAllFlag = true;
  selectedCategory = 'all';
  categoryButtons.forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('.cat-btn[data-cat="all"]');
  if (allBtn) allBtn.classList.add('active');
  showToast('Showing all products.', 'info', { duration: 2600 });
  applyFiltersAndRender();
});
categoryButtons.forEach(btn => btn.addEventListener('click', e => {
  categoryButtons.forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  selectedCategory = e.target.dataset.cat;
  showAllFlag = false;
  showToast(`Filtered by ${capitalize(selectedCategory)}.`, 'info', { duration: 2600 });
  applyFiltersAndRender();
}));
