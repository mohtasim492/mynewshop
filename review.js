// ----------------- reviews.js -----------------
// Handles review carousel

const reviewSlidesEl = document.getElementById('reviewSlides');
const reviewDots = document.getElementById('reviewDots');
let reviewIndex = 0, reviewTimer;

function populateReviews() {
  reviewSlidesEl.innerHTML = '';
  reviewDots.innerHTML = '';

  reviews.forEach((r, idx) => {
    const div = document.createElement('div');
    div.className = 'review-slide' + (idx === 0 ? ' active' : '');
    div.innerHTML = `
      <div class="bg-[color:var(--surface)] border border-[color:var(--border)] p-6 rounded-2xl w-full md:w-4/5 mx-auto shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="font-semibold text-stone-900">${r.name}</div>
            <div class="text-xs text-stone-500">${r.date} — Rating: ${r.rating}</div>
          </div>
          <div class="text-[12px] stars text-yellow-400">${renderStars(r.rating)}</div>
        </div>
        <p class="mt-4 text-stone-600 italic text-sm leading-relaxed">"${r.comment}"</p>
      </div>`;
    reviewSlidesEl.appendChild(div);

    const dot = document.createElement('button');
    dot.className = 'w-2.5 h-2.5 rounded-full bg-stone-300 hover:bg-stone-400 transition-colors';
    dot.title = `Show review ${idx+1}`;
    dot.addEventListener('click', () => { showReview(idx); clearInterval(reviewTimer); });
    reviewDots.appendChild(dot);
  });

  setReviewDots(reviewIndex);
  reviewTimer = setInterval(nextReview, 6000);
  reviewSlidesEl.addEventListener('mouseenter', () => clearInterval(reviewTimer));
  reviewSlidesEl.addEventListener('mouseleave', () => reviewTimer = setInterval(nextReview, 6000));
}

function setReviewDots(i) { Array.from(reviewDots.children).forEach((d, idx) => d.style.background = idx === i ? 'var(--accent)' : ''); }
function showReview(i) { Array.from(reviewSlidesEl.children).forEach((s, idx) => s.classList.toggle('active', idx === i)); reviewIndex = i; setReviewDots(i); }
function nextReview() { if (!reviewSlidesEl.children.length) return; showReview((reviewIndex+1) % reviewSlidesEl.children.length); }
function prevReview() { if (!reviewSlidesEl.children.length) return; showReview((reviewIndex-1 + reviewSlidesEl.children.length) % reviewSlidesEl.children.length); }

document.getElementById('nextReview').addEventListener('click', () => { nextReview(); clearInterval(reviewTimer); });
document.getElementById('prevReview').addEventListener('click', () => { prevReview(); clearInterval(reviewTimer); });
