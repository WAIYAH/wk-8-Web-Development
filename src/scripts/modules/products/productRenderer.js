/**
 * Fresh Harvest Market — Product Renderer
 * Renders product cards and detail views
 */

import { formatPrice, formatDiscount } from '@scripts/modules/utils/formatters.js';
import ProductService from './productService.js';

export function renderProductCard(product) {
  const discount = ProductService.getDiscountPercentage(product);
  const stars = renderStars(product.rating);

  return `
    <article class="product-card group" data-product-id="${product.id}" data-category="${product.category}">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" loading="lazy" width="400" height="300">
        ${product.organic ? `<span class="organic-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.58.66A15.04 15.04 0 0 1 7 17.5c2-2.5 5.5-4.5 10-5.5"/><path d="M2 12c.87.67 1.54 1.39 2.03 2.15"/></svg> Organic</span>` : ''}
        ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
        ${product.seasonal ? `<span class="absolute bottom-3 left-3 bg-carrot-orange text-white text-xs font-semibold px-2.5 py-1 rounded-full z-2">Seasonal</span>` : ''}
      </div>
      <div class="p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-stone-gray uppercase tracking-wider">${product.category}</span>
          <div class="flex items-center gap-1 text-xs text-carrot-orange">${stars} <span class="text-stone-gray ml-1">(${product.reviews})</span></div>
        </div>
        <h3 class="text-lg font-bold text-dark mb-2 font-heading">${product.name}</h3>
        <p class="text-sm text-stone-gray mb-4 leading-relaxed line-clamp-2">${product.description}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold text-harvest-green">${formatPrice(product.price)}</span>
            ${product.originalPrice ? `<span class="text-sm text-stone-gray line-through">${formatPrice(product.originalPrice)}</span>` : ''}
            <span class="text-xs text-stone-gray">/${product.unit}</span>
          </div>
          <button class="btn-primary-fhm !py-2 !px-4 !text-sm add-to-cart-btn" data-product-id="${product.id}" aria-label="Add ${product.name} to cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add
          </button>
        </div>
      </div>
    </article>
  `;
}

export function renderProductGrid(products) {
  if (products.length === 0) {
    return `
      <div class="col-span-full text-center py-16">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-bold text-dark mb-2">No Products Found</h3>
        <p class="text-stone-gray">Try adjusting your filters or search terms.</p>
      </div>
    `;
  }
  return products.map((p) => renderProductCard(p)).join('');
}

export function renderProductDetail(product) {
  const discount = ProductService.getDiscountPercentage(product);
  const stars = renderStars(product.rating);

  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <!-- Image -->
      <div class="relative rounded-2xl overflow-hidden bg-white shadow-lg">
        <img src="${product.image}" alt="${product.name}" class="w-full h-[400px] lg:h-[500px] object-cover" width="600" height="500">
        ${product.organic ? `<span class="organic-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.58.66A15.04 15.04 0 0 1 7 17.5c2-2.5 5.5-4.5 10-5.5"/><path d="M2 12c.87.67 1.54 1.39 2.03 2.15"/></svg> Organic</span>` : ''}
        ${discount > 0 ? `<span class="discount-badge text-base px-4 py-1.5">-${discount}%</span>` : ''}
      </div>

      <!-- Info -->
      <div class="flex flex-col justify-center">
        <span class="text-sm font-medium text-stone-gray uppercase tracking-wider mb-2">${product.category}</span>
        <h1 class="text-3xl lg:text-4xl font-bold text-dark mb-3 font-heading">${product.name}</h1>
        <div class="flex items-center gap-2 mb-4">
          <div class="flex text-carrot-orange text-lg">${stars}</div>
          <span class="text-sm text-stone-gray">${product.rating} (${product.reviews} reviews)</span>
        </div>
        <p class="text-stone-gray leading-relaxed mb-6">${product.description}</p>

        <!-- Price -->
        <div class="flex items-end gap-3 mb-6">
          <span class="text-3xl font-bold text-harvest-green">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="text-lg text-stone-gray line-through">${formatPrice(product.originalPrice)}</span>` : ''}
          <span class="text-sm text-stone-gray">per ${product.unit}</span>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap gap-2 mb-6">
          ${product.organic ? '<span class="px-3 py-1 bg-harvest-green/10 text-harvest-green text-sm font-medium rounded-full">🌿 Organic</span>' : ''}
          ${product.seasonal ? '<span class="px-3 py-1 bg-carrot-orange/10 text-carrot-orange text-sm font-medium rounded-full">🌞 Seasonal</span>' : ''}
          ${product.stock < 30 ? '<span class="px-3 py-1 bg-tomato-red/10 text-tomato-red text-sm font-medium rounded-full">⚡ Low Stock</span>' : ''}
        </div>

        <!-- Quantity + Add to Cart -->
        <div class="flex items-center gap-4 mb-8">
          <div class="qty-input">
            <button class="qty-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
            <input type="text" class="qty-value" value="1" readonly aria-label="Quantity">
            <button class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn-primary-fhm flex-1 add-to-cart-btn" data-product-id="${product.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add to Cart
          </button>
        </div>

        <!-- Nutrition -->
        <div class="bg-farm-white rounded-xl p-5 border border-sprout-green/20">
          <h3 class="text-sm font-bold text-dark mb-3 uppercase tracking-wider">Nutrition Per Serving</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${Object.entries(product.nutrition)
              .map(
                ([key, val]) => `
              <div class="text-center">
                <div class="text-lg font-bold text-harvest-green">${val}</div>
                <div class="text-xs text-stone-gray capitalize">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderSkeletonCard() {
  return `
    <div class="product-card">
      <div class="skeleton h-[220px]"></div>
      <div class="p-5">
        <div class="skeleton h-3 w-20 mb-3"></div>
        <div class="skeleton h-5 w-3/4 mb-2"></div>
        <div class="skeleton h-3 w-full mb-4"></div>
        <div class="flex justify-between items-center">
          <div class="skeleton h-6 w-16"></div>
          <div class="skeleton h-9 w-20 rounded-full"></div>
        </div>
      </div>
    </div>
  `;
}

export function renderSkeletonGrid(count = 8) {
  return Array.from({ length: count }, () => renderSkeletonCard()).join('');
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < full; i++) html += '★';
  if (half) html += '★';
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += '☆';
  return html;
}
