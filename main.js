// ----------------- main.js -----------------
// Initialization

async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    products = data.map(p => ({ ...p, myCategory: mapCategory(p.category) }));
    const half = Math.ceil(products.length / 2);
    initialHalf = products.slice(0, half);
    populateBanner(products);
    applyFiltersAndRender();
  } catch (e) {
    console.error('Fetch failed, using fallback sample', e);
    products = [
      { id:1,title:'Sample Gadget', price:500, image:'https://via.placeholder.com/300', rating:{rate:4.2}, myCategory:'gadgets', description:'Sample gadget' },
      { id:2,title:'Sample Fashion', price:800, image:'https://via.placeholder.com/300', rating:{rate:4.5}, myCategory:'fashion', description:'Sample fashion' },
      { id:3,title:'Sample Home', price:300, image:'https://via.placeholder.com/300', rating:{rate:4.0}, myCategory:'home', description:'Sample home' }
    ];
    initialHalf = products.slice(0, Math.ceil(products.length/2));
    populateBanner(products);
    applyFiltersAndRender();
  }
}

// Initialize app
(function init() {
  if (!discountEl.dataset) discountEl.dataset = {};
  discountEl.dataset.value = discountEl.dataset.value || 0;

  updateBalanceUI();
  renderCart();
  populateReviews();
  fetchProducts();
})();
