/**
 * Fresh Harvest Market — Application Entry Point
 * Bootstraps all modules based on current page
 */

import '@styles/main.css';
import Router from './router.js';
import store from './store.js';
import CartUI from '@scripts/modules/cart/cartUI.js';
import Tracker from '@scripts/modules/personalization/tracker.js';
import Animations from '@scripts/modules/ui/animations.js';

// Initialize core systems
document.addEventListener('DOMContentLoaded', () => {
  const page = Router.init();

  // Core systems (every page)
  Tracker.init();
  CartUI.init();
  initNavigation();
  Animations.init();

  // Page-specific initialization
  switch (page) {
    case 'home':
      initHomePage();
      break;
    case 'shop':
      initShopPage();
      break;
    case 'product':
      initProductPage();
      break;
    case 'cart':
      initCartPage();
      break;
    case 'contact':
      initContactPage();
      break;
  }

  // Page transition
  document.body.classList.add('page-transition');
});

// --- Navigation ---
function initNavigation() {
  const nav = document.querySelector('.nav-main');
  if (!nav) return;

  // Scroll glassmorphism
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Mobile hamburger
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
    });
  }

  // Active link highlighting
  const page = Router.getPage();
  document.querySelectorAll('.nav-link-custom').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (
      (page === 'home' && (href.includes('index') || href === '/' || href === '')) ||
      href.includes(page)
    ) {
      link.classList.add('active');
    }
  });
}

// --- Home Page ---
async function initHomePage() {
  const { default: ProductService } = await import('@scripts/modules/products/productService.js');
  const { renderProductCard } = await import('@scripts/modules/products/productRenderer.js');
  const { default: Recommender } = await import('@scripts/modules/personalization/recommender.js');

  // Featured products
  const featuredGrid = document.getElementById('featuredProducts');
  if (featuredGrid) {
    const featured = ProductService.getFeatured(4);
    featuredGrid.innerHTML = featured.map(p => renderProductCard(p)).join('');
    bindAddToCart(featuredGrid);
  }

  // Personalized recommendations
  const recoGrid = document.getElementById('recommendedProducts');
  if (recoGrid) {
    const recs = Recommender.getRecommendations(4);
    recoGrid.innerHTML = recs.map(p => renderProductCard(p)).join('');
    bindAddToCart(recoGrid);

    const recoLabel = document.getElementById('recoLabel');
    if (recoLabel) recoLabel.textContent = Recommender.getRecommendationLevel();
  }

  // Seasonal picks
  const seasonalGrid = document.getElementById('seasonalProducts');
  if (seasonalGrid) {
    const seasonal = ProductService.getSeasonal().slice(0, 4);
    seasonalGrid.innerHTML = seasonal.map(p => renderProductCard(p)).join('');
    bindAddToCart(seasonalGrid);
  }

  // Newsletter
  initNewsletter();

  // Re-observe new elements
  Animations.refresh();
}

// --- Shop Page ---
async function initShopPage() {
  const { default: ProductFilters } = await import('@scripts/modules/products/productFilters.js');
  ProductFilters.init('#productGrid', '#resultsCount');
  Animations.refresh();
}

// --- Product Detail Page ---
async function initProductPage() {
  const { default: ProductService } = await import('@scripts/modules/products/productService.js');
  const { renderProductDetail, renderProductCard } = await import('@scripts/modules/products/productRenderer.js');
  const { default: Recommender } = await import('@scripts/modules/personalization/recommender.js');

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    window.location.href = 'shop.html';
    return;
  }

  const product = ProductService.getById(Number(productId));
  if (!product) {
    window.location.href = 'shop.html';
    return;
  }

  // Track view
  Tracker.trackView(product);

  // Render detail
  const detailContainer = document.getElementById('productDetail');
  if (detailContainer) {
    detailContainer.innerHTML = renderProductDetail(product);

    // Quantity controls
    const qtyValue = detailContainer.querySelector('.qty-value');
    detailContainer.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        let qty = parseInt(qtyValue.value, 10);
        if (btn.dataset.action === 'increase') qty = Math.min(qty + 1, 99);
        else qty = Math.max(qty - 1, 1);
        qtyValue.value = qty;
      });
    });

    // Add to cart (with quantity)
    detailContainer.querySelector('.add-to-cart-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const qty = parseInt(qtyValue.value, 10);
      document.dispatchEvent(new CustomEvent('fhm:addToCart', {
        detail: { productId: product.id, quantity: qty }
      }));
    });
  }

  // Breadcrumb
  const breadcrumbName = document.getElementById('breadcrumbProductName');
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  // Page title
  document.title = `${product.name} — Fresh Harvest Market`;

  // Related products
  const relatedGrid = document.getElementById('relatedProducts');
  if (relatedGrid) {
    const related = ProductService.getByCategory(product.category)
      .filter(p => p.id !== product.id)
      .slice(0, 4);
    relatedGrid.innerHTML = related.map(p => renderProductCard(p)).join('');
    bindAddToCart(relatedGrid);
  }

  Animations.refresh();
}

// --- Cart Page ---
async function initCartPage() {
  const { default: CartUI } = await import('@scripts/modules/cart/cartUI.js');
  CartUI.renderCartPage();
}

// --- Contact Page ---
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { validateContactForm } = await import('@scripts/modules/utils/validators.js');
    const { showToast } = await import('@scripts/modules/ui/notifications.js');

    const fields = {
      name: form.querySelector('#contactName').value,
      email: form.querySelector('#contactEmail').value,
      subject: form.querySelector('#contactSubject').value,
      message: form.querySelector('#contactMessage').value
    };

    const { valid, errors } = validateContactForm(fields);

    // Clear previous errors
    form.querySelectorAll('.field-error').forEach(el => el.remove());

    if (!valid) {
      Object.entries(errors).forEach(([field, msg]) => {
        const input = form.querySelector(`#contact${field.charAt(0).toUpperCase() + field.slice(1)}`);
        if (input) {
          const err = document.createElement('p');
          err.className = 'field-error text-tomato-red text-xs mt-1';
          err.textContent = msg;
          input.parentNode.appendChild(err);
        }
      });
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
    form.reset();
  });
}

// --- Newsletter ---
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { isValidEmail } = await import('@scripts/modules/utils/validators.js');
    const { showToast } = await import('@scripts/modules/ui/notifications.js');

    const email = form.querySelector('#newsletterEmail').value;
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    showToast('Thanks for subscribing! 🎉', 'success');
    form.reset();
  });
}

// --- Helper: Bind add-to-cart buttons within a container ---
function bindAddToCart(container) {
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = Number(btn.dataset.productId);
      document.dispatchEvent(new CustomEvent('fhm:addToCart', {
        detail: { productId, quantity: 1, triggerEl: btn }
      }));
    });
  });
}
