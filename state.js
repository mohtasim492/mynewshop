// ----------------- state.js -----------------  
// App-wide constants and initial state

const API_URL = 'https://fakestoreapi.com/products';

let products = [];       // All products fetched from API
let initialHalf = [];    // First half of products (default view)
let cart = JSON.parse(localStorage.getItem('smartshop_cart') || '{}'); // Cart items keyed by product ID
let balance = Number(localStorage.getItem('smartshop_balance') || 1000); // User balance
let selectedCategory = 'all';
let showAllFlag = false;
let currentSearch = '';
let currentSort = '';

// Sample reviews (local fallback)
const reviews = [
  { name: 'Aisha', comment: 'Great quality!', rating: 5, date: '2025-10-10' },
  { name: 'Rafi', comment: 'Fast delivery, happy.', rating: 4, date: '2025-09-18' },
  { name: 'Mina', comment: 'Will buy again.', rating: 5, date: '2025-08-01' }
];
