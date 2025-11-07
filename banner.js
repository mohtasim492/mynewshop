// ----------------- banner.js -----------------
// Handles homepage banner slider

const bannerSlidesEl = document.getElementById('bannerSlides');
let bannerIndex = 0, bannerTimer;

function populateBanner(items) {
  bannerSlidesEl.innerHTML = '';
  items.slice(0,4).forEach((item, idx) => {
    const img = document.createElement('img');
    img.src = item.image;
    img.className = 'absolute inset-0 w-full h-full object-contain transition-opacity';
    img.style.opacity = idx === 0 ? 1 : 0;
    bannerSlidesEl.appendChild(img);
  });
  startBanner();
}

function showBanner(i) {
  Array.from(bannerSlidesEl.children).forEach((img, idx) => img.style.opacity = idx === i ? 1 : 0);
  bannerIndex = i;
}

function nextBanner() { if(!bannerSlidesEl.children.length) return; showBanner((bannerIndex+1) % bannerSlidesEl.children.length); }
function prevBanner() { if(!bannerSlidesEl.children.length) return; showBanner((bannerIndex-1 + bannerSlidesEl.children.length) % bannerSlidesEl.children.length); }
function startBanner() { clearInterval(bannerTimer); bannerTimer = setInterval(nextBanner, 5000); }

document.getElementById('nextBanner').addEventListener('click', () => { nextBanner(); startBanner(); });
document.getElementById('prevBanner').addEventListener('click', () => { prevBanner(); startBanner(); });
