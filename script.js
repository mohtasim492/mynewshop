   // ---------- App State ----------
    // Using the FakeStore API as requested:
    const API = 'https://fakestoreapi.com/products';

    // application state
    let products = [];         // all products with myCategory field
    let initialHalf = [];      // first 50% slice shown by default
    // cart stored as an object keyed by product id for quick lookup { id: { id, title, price, image, qty } }
    let cart = JSON.parse(localStorage.getItem('smartshop_cart') || '{}');
    // user balance persisted via localStorage (default 1000)
    let balance = Number(localStorage.getItem('smartshop_balance') || 1000);
    let selectedCategory = 'all';
    let showAllFlag = false;   // whether user clicked "Show All Products"
    let currentSearch = '';
    let currentSort = '';

    // ---------- DOM refs ----------
    const productGrid = document.getElementById('productGrid');
    const cartCount = document.getElementById('cartCount');
    const cartDropdown = document.getElementById('cartDropdown');
    const cartItems = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const deliveryEl = document.getElementById('delivery');
    const shippingEl = document.getElementById('shipping');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    const balanceEl = document.getElementById('balance');
    const addMoneyBtn = document.getElementById('addMoney');
    const applyCoupon = document.getElementById('applyCoupon');
    const couponInput = document.getElementById('couponInput');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartBtn = document.getElementById('cartBtn');
    const bannerSlidesEl = document.getElementById('bannerSlides');
    const reviewSlidesEl = document.getElementById('reviewSlides');
    const displayInfo = document.getElementById('displayInfo');
    const showAllBtn = document.getElementById('showAllBtn');
    const searchInput = document.getElementById('search');
    const sortSelect = document.getElementById('sort');
    const siteHeader = document.getElementById('siteHeader');
    const reviewDots = document.getElementById('reviewDots');

    // ---------- Sample/local reviews ----------
    // You already had reviews inlined — kept them as a local JSON-like array.
    let reviews = [
      { name: 'Aisha', comment: 'Great quality!', rating: 5, date: '2025-10-10' },
      { name: 'Rafi', comment: 'Fast delivery, happy.', rating: 4, date: '2025-09-18' },
      { name: 'Mina', comment: 'Will buy again.', rating: 5, date: '2025-08-01' }
    ];

    // ---------- Helpers ----------
    function saveCart(){ localStorage.setItem('smartshop_cart', JSON.stringify(cart)); }
    function saveBalance(){ localStorage.setItem('smartshop_balance', String(balance)); }
    function fmt(n){ return Number(n).toFixed(2); }

    // update the balance UI safely (handles non-number cases)
    function updateBalanceUI(){
      // ensure balance is a number
      if(isNaN(balance)) balance = 0;
      balanceEl.innerHTML = `Balance: <strong>${fmt(balance)} BDT</strong>`;
    }

    // calculate subtotal, delivery, shipping and discount using DOM values
    function calculateCart(){
      const items = Object.values(cart);
      const subtotal = items.reduce((s,i)=> s + i.qty * i.price, 0);
      const delivery = items.length ? 50 : 0;
      const shipping = items.length ? (subtotal > 2000 ? 0 : 100) : 0;
      // discount percent stored as data attribute on discountEl (string)
      const discountPercent = Number(discountEl.dataset.value || 0);
      const discountAmount = subtotal * discountPercent / 100;
      const total = subtotal + delivery + shipping - discountAmount;

      subtotalEl.textContent = fmt(subtotal);
      deliveryEl.textContent = fmt(delivery);
      shippingEl.textContent = fmt(shipping);
      discountEl.textContent = fmt(discountAmount);
      totalEl.textContent = fmt(total);

      return { subtotal, delivery, shipping, discountAmount, total };
    }

    // render cart UI and attach quantity controls
    function renderCart(){
      cartItems.innerHTML = '';
      const items = Object.values(cart);
      cartCount.textContent = items.reduce((c,i)=>c+i.qty,0) || 0;

      if(!items.length){
        cartItems.innerHTML = '<div class="text-sm text-slate-400">Cart is empty.</div>';
      }

      items.forEach(it=>{
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 py-2 border-b border-slate-800';
        div.innerHTML = `
          <img src="${it.image}" class="w-12 h-12 object-contain rounded" />
          <div class="flex-1 text-sm">
            <div class="text-slate-200">${it.title}</div>
            <div class="text-xs text-slate-400">${fmt(it.price)} BDT × ${it.qty}</div>
          </div>
          <div class="flex flex-col gap-1">
            <button data-id="${it.id}" class="increase text-xs px-2 py-1 bg-slate-700 rounded">+</button>
            <button data-id="${it.id}" class="decrease text-xs px-2 py-1 bg-slate-700 rounded">-</button>
          </div>
        `;
        cartItems.appendChild(div);
      });

      // attach listeners for quantity buttons (delegation-like approach)
      cartItems.querySelectorAll('.increase').forEach(b=>b.addEventListener('click', e=>{
        const id = e.target.dataset.id;
        if(!cart[id]) return;
        cart[id].qty++;
        saveCart();
        renderCart();
        const { total } = calculateCart();
        if(total > balance) alert('Warning: total exceeds your balance. Add money or remove items.');
      }));

      cartItems.querySelectorAll('.decrease').forEach(b=>b.addEventListener('click', e=>{
        const id = e.target.dataset.id;
        if(!cart[id]) return;
        cart[id].qty--;
        if(cart[id].qty <= 0) delete cart[id];
        saveCart();
        renderCart();
      }));

      calculateCart();
    }

    // ---------- Categorize products ----------
    // Converts API categories into project categories (gadgets / fashion / home)
    function mapCategory(apiCategory){
      apiCategory = (apiCategory||'').toLowerCase();
      if(apiCategory.includes('electronics')) return 'gadgets';
      if(apiCategory.includes('men') || apiCategory.includes('women') || apiCategory.includes('clothing') || apiCategory.includes('jewelery') || apiCategory.includes('jewelry')) return 'fashion';
      return 'home';
    }

    // ---------- Rendering products with filters + initial 50% ----------
    function applyFiltersAndRender(){
      let arr = [...products];

      // search by title / description / category
      if(currentSearch){
        const q = currentSearch.toLowerCase();
        arr = arr.filter(p => (p.title||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q) || (p.myCategory||'').toLowerCase().includes(q));
      }

      // category filter
      if(selectedCategory && selectedCategory !== 'all'){
        arr = arr.filter(p => p.myCategory === selectedCategory);
      } else {
        // if all & not showAllFlag, only display first half
        if(!showAllFlag){
          arr = initialHalf.slice();
        }
      }

      // sorting
      if(currentSort === 'low') arr.sort((a,b)=>a.price-b.price);
      if(currentSort === 'high') arr.sort((a,b)=>b.price-a.price);

      renderProducts(arr);
      updateDisplayInfo(arr.length);
    }

    function updateDisplayInfo(count){
      // friendly display text that mirrors project requirement
      if(selectedCategory === 'all'){
        if(!showAllFlag) displayInfo.textContent = `first ${initialHalf.length} of ${products.length}`;
        else displayInfo.textContent = `all ${products.length} products`;
      } else {
        const totalCat = products.filter(p=>p.myCategory === selectedCategory).length;
        displayInfo.textContent = `${count} of ${totalCat} in ${capitalize(selectedCategory)}`;
      }
    }

    // create product cards using JavaScript DOM
    function renderProducts(list){
      productGrid.innerHTML = '';
      if(!list.length){
        productGrid.innerHTML = '<div class="col-span-full text-sm text-slate-400">No products found.</div>';
        return;
      }
      list.forEach(p=>{
        const card = document.createElement('div');
        card.className = 'bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent p-4 rounded-2xl flex flex-col card-hover';
        card.innerHTML = `
          <div class="flex-1">
            <img src="${p.image}" class="w-full h-40 object-contain mb-3" />
            <h4 class="text-sm font-semibold mb-1 line-clamp-2 text-slate-100">${p.title}</h4>
            <div class="text-xs text-slate-400 mb-2">Rating: ${p.rating?.rate || 'N/A'}</div>
          </div>
          <div class="mt-auto flex items-center justify-between">
            <div class="font-bold text-slate-100">${fmt(p.price)} BDT</div>
            <div class="flex items-center gap-2">
              <button data-id="${p.id}" class="addToCart px-3 py-1 bg-[color:var(--accent)] text-white text-sm rounded">Add</button>
            </div>
          </div>
        `;
        productGrid.appendChild(card);
      });

      // attach add-to-cart listeners (for all created buttons)
      document.querySelectorAll('.addToCart').forEach(b=>b.addEventListener('click', e=>{
        const id = e.target.dataset.id;
        const p = products.find(x=>String(x.id)===String(id));
        if(!p) return;
        if(cart[id]) cart[id].qty++;
        else cart[id] = { id: p.id, title: p.title, price: p.price, image: p.image, qty:1 };
        saveCart();
        renderCart();
        const { total } = calculateCart();
        if(total > balance){ alert('Warning: total exceeds your balance. Add money or remove items.'); }
      }));
    }

    // ---------- Fetch products and initialize ----------
    async function fetchProducts(){
      try{
        const res = await fetch(API);
        const data = await res.json();
        products = data.map(p => ({ ...p, myCategory: mapCategory(p.category) }));

        // show first half initially (as requirement)
        const half = Math.ceil(products.length / 2);
        initialHalf = products.slice(0, half);

        // populate banner with first few product images
        populateBanner(products.slice(0,4));
        applyFiltersAndRender();
      }catch(e){
        // fallback sample data (keeps site usable offline)
        console.error('Fetch failed, using fallback sample', e);
        products = [
          { id:1,title:'Sample Gadget', price:500, image:'https://via.placeholder.com/300', rating:{rate:4.2}, myCategory:'gadgets', description:'Sample gadget' },
          { id:2,title:'Sample Fashion', price:800, image:'https://via.placeholder.com/300', rating:{rate:4.5}, myCategory:'fashion', description:'Sample fashion' },
          { id:3,title:'Sample Home', price:300, image:'https://via.placeholder.com/300', rating:{rate:4.0}, myCategory:'home', description:'Sample home' }
        ];
        initialHalf = products.slice(0, Math.ceil(products.length/2));
        populateBanner(products.slice(0,3));
        applyFiltersAndRender();
      }
    }

    // ---------- Banner logic (auto + manual) ----------
    let bannerIndex = 0, bannerTimer;
    function populateBanner(items){
      bannerSlidesEl.innerHTML = '';
      const images = items.map(i=>i.image);
      images.forEach((src, idx)=>{
        const img = document.createElement('img');
        img.src = src;
        img.className = 'absolute inset-0 w-full h-full object-cover transition-opacity';
        img.style.opacity = idx===0?1:0;
        bannerSlidesEl.appendChild(img);
      });
      // start auto sliding
      startBanner();
    }
    function startBanner(){ clearInterval(bannerTimer); bannerTimer = setInterval(()=> nextBanner(), 5000); }
    function showBanner(i){
      const nodes = bannerSlidesEl.children;
      for(let k=0;k<nodes.length;k++){ nodes[k].style.opacity = k===i?1:0; }
      bannerIndex = i;
    }
    function nextBanner(){ if(!bannerSlidesEl.children.length) return; showBanner((bannerIndex+1) % bannerSlidesEl.children.length); }
    function prevBanner(){ if(!bannerSlidesEl.children.length) return; showBanner((bannerIndex-1 + bannerSlidesEl.children.length) % bannerSlidesEl.children.length); }
    document.getElementById('nextBanner').addEventListener('click', ()=>{ nextBanner(); startBanner(); });
    document.getElementById('prevBanner').addEventListener('click', ()=>{ prevBanner(); startBanner(); });

    // ---------- Reviews carousel ----------
    let reviewIndex = 0, reviewTimer;
    function populateReviews(){
      reviewSlidesEl.innerHTML = '';
      reviewDots.innerHTML = '';
      reviews.forEach((r,idx)=>{
        const d = document.createElement('div');
        d.className = 'review-slide';
        if(idx === 0) d.classList.add('active');
        d.innerHTML = `
          <div class="bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent p-4 rounded-lg w-full md:w-4/5 mx-auto shadow">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="font-semibold text-slate-100">${r.name}</div>
                <div class="text-xs text-slate-400">${r.date} — Rating: ${r.rating}</div>
              </div>
              <div class="text-[12px] stars text-yellow-400">
                ${renderStars(r.rating)}
              </div>
            </div>
            <p class="mt-3 text-slate-300 italic text-sm">"${r.comment}"</p>
          </div>
        `;
        reviewSlidesEl.appendChild(d);

        // dot
        const dot = document.createElement('button');
        dot.className = 'w-3 h-3 rounded-full bg-slate-600';
        dot.title = `Show review ${idx+1}`;
        dot.addEventListener('click', ()=> { showReview(idx); clearInterval(reviewTimer); });
        reviewDots.appendChild(dot);
      });

      // set active dot
      setReviewDots(reviewIndex);
      reviewTimer = setInterval(()=> nextReview(), 6000);
      // pause on hover
      reviewSlidesEl.addEventListener('mouseenter', ()=> clearInterval(reviewTimer));
      reviewSlidesEl.addEventListener('mouseleave', ()=> { clearInterval(reviewTimer); reviewTimer = setInterval(()=> nextReview(), 6000); });
    }
    function setReviewDots(i){
      Array.from(reviewDots.children).forEach((d,idx)=> d.style.background = idx===i ? 'var(--accent)' : '' );
    }
    function showReview(i){
      const nodes = reviewSlidesEl.children;
      for(let k=0;k<nodes.length;k++){
        nodes[k].classList.toggle('active', k===i);
      }
      reviewIndex = i;
      setReviewDots(i);
    }
    function nextReview(){ if(!reviewSlidesEl.children.length) return; showReview((reviewIndex+1) % reviewSlidesEl.children.length); }
    function prevReview(){ if(!reviewSlidesEl.children.length) return; showReview((reviewIndex-1 + reviewSlidesEl.children.length) % reviewSlidesEl.children.length); }
    document.getElementById('nextReview').addEventListener('click', ()=>{ nextReview(); clearInterval(reviewTimer); });
    document.getElementById('prevReview').addEventListener('click', ()=>{ prevReview(); clearInterval(reviewTimer); });

    // helper to render star icons (keeps original look)
    function renderStars(n){
      const full = Math.floor(n||0);
      let html = '';
      for(let i=0;i<5;i++){
        if(i < full){
          html += '<svg viewBox="0 0 20 20" fill="currentColor" class="inline-block"><path d="M9.049.927c.3-.921 1.603-.921 1.902 0l1.2 3.684a1 1 0 00.95.69h3.874c.969 0 1.371 1.24.588 1.81l-3.135 2.276a1 1 0 00-.364 1.118l1.2 3.684c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.264 2.16c-.784.57-1.838-.197-1.539-1.118l1.2-3.684a1 1 0 00-.364-1.118L2.098 7.111c-.783-.57-.38-1.81.588-1.81h3.874a1 1 0 00.95-.69L9.049.927z"/></svg>';
        } else {
          html += '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" class="inline-block text-slate-500"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M9.049.927c.3-.921 1.603-.921 1.902 0l1.2 3.684a1 1 0 00.95.69h3.874c.969 0 1.371 1.24.588 1.81l-3.135 2.276a1 1 0 00-.364 1.118l1.2 3.684c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.264 2.16c-.784.57-1.838-.197-1.539-1.118l1.2-3.684a1 1 0 00-.364-1.118L2.098 7.111c-.783-.57-.38-1.81.588-1.81h3.874a1 1 0 00.95-.69L9.049.927z"/></svg>';
        }
      }
      return html;
    }

    // ---------- UI interactions ----------
    // mobile menu toggle
    document.getElementById('mobileMenuBtn').addEventListener('click', ()=> document.getElementById('mobileNav').classList.toggle('hidden'));

    // cart dropdown toggle (updates aria-expanded for accessibility)
    cartBtn.addEventListener('click', ()=> {
      cartDropdown.classList.toggle('hidden');
      cartBtn.setAttribute('aria-expanded', String(!cartDropdown.classList.contains('hidden')));
    });

    // add money: increments by 1000 (requirement)
    addMoneyBtn.addEventListener('click', ()=>{
      balance += 1000;
      saveBalance();
      updateBalanceUI();
    });

    // coupon apply: SMART10 => 10% discount
    applyCoupon.addEventListener('click', ()=>{
      const code = couponInput.value.trim().toUpperCase();
      if(code === 'SMART10'){
        discountEl.dataset.value = 10;
        alert('SMART10 applied: 10%');
      } else {
        discountEl.dataset.value = 0;
        alert('Invalid coupon');
      }
      calculateCart();
    });

    // checkout flow: checks balance and confirms purchase
    checkoutBtn.addEventListener('click', ()=>{
      const { total } = calculateCart();
      if(total > balance){ alert('Insufficient balance. Please add money.'); return; }
      if(confirm('Confirm purchase for ' + fmt(total) + ' BDT?')){
        balance -= total;
        saveBalance();
        updateBalanceUI();
        cart = {};
        saveCart();
        renderCart();
        alert('Purchase successful — thank you!');
      }
    });

    // category buttons (toggles selected category & updates styles)
    document.querySelectorAll('.cat-btn').forEach(btn=>{
      btn.addEventListener('click', e=>{
        document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('bg-[color:var(--accent)]','text-white'));
        e.target.classList.add('bg-[color:var(--accent)]','text-white');
        selectedCategory = e.target.dataset.cat;
        showAllFlag = false;
        applyFiltersAndRender();
      });
    });

    // Show All button toggles full list when in "all"
    showAllBtn.addEventListener('click', ()=>{
      if(selectedCategory !== 'all'){
        selectedCategory = 'all';
        document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('bg-[color:var(--accent)]','text-white'));
        const allBtn = document.querySelector('.cat-btn[data-cat="all"]');
        if(allBtn) allBtn.classList.add('bg-[color:var(--accent)]','text-white');
      }
      showAllFlag = true;
      applyFiltersAndRender();
    });

    // search & sort controls
    searchInput.addEventListener('input', (e)=>{
      currentSearch = e.target.value || '';
      applyFiltersAndRender();
    });
    sortSelect.addEventListener('change', (e)=>{
      currentSort = e.target.value;
      applyFiltersAndRender();
    });

    // contact form (simple validation + thank you message as required)
    document.getElementById('contactForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      alert('Thanks for contacting us — we will reply soon.');
      e.target.reset();
    });

    // highlight active nav item (on click)
    document.querySelectorAll('.nav-item').forEach(a=> a.addEventListener('click', ()=>{
      document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('text-indigo-500','font-semibold'));
      a.classList.add('text-[color:var(--accent)]','font-semibold');
    }));

    // back to top button & header scrolled glass effect
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', ()=>{
      if(window.scrollY>300) backToTop.classList.remove('hidden'); else backToTop.classList.add('hidden');
      if(window.scrollY>8) siteHeader.classList.add('scrolled'); else siteHeader.classList.remove('scrolled');
    });
    backToTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}) );

    // utility
    function capitalize(s){ return s && s.length ? s[0].toUpperCase() + s.slice(1) : s; }

    // ---------- Init ----------
    (function init(){
      // ensure discount dataset exists
      if(!discountEl.dataset) discountEl.dataset = {};
      discountEl.dataset.value = discountEl.dataset.value || 0;

      // UI initial state
      updateBalanceUI();
      renderCart();
      populateReviews();
      fetchProducts();
    })();