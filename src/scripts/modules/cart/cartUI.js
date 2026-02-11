/**
 * Fresh Harvest Market — Cart UI
 * Renders cart interface and handles user interactions
 */

import cartManager from './cartManager.js';
import { formatPrice } from '@scripts/modules/utils/formatters.js';
import { showToast } from '@scripts/modules/ui/notifications.js';

const CartUI = {
  init() {
    this.updateBadge();
    this.bindGlobalEvents();

    cartManager.onChange(() => {
      this.updateBadge();
    });
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-count');
    const count = cartManager.getItemCount();
    badges.forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.remove('hidden');
        badge.classList.add('bounce');
        setTimeout(() => badge.classList.remove('bounce'), 500);
      } else {
        badge.classList.add('hidden');
      }
    });
  },

  bindGlobalEvents() {
    // Listen for add-to-cart custom events
    document.addEventListener('fhm:addToCart', (e) => {
      const { productId, quantity = 1 } = e.detail;
      const success = cartManager.addItem(productId, quantity);
      if (success) {
        const item = cartManager.getItem(productId);
        showToast(`${item.product.name} added to cart!`, 'success');
        this.animateAddToCart(e.detail.triggerEl);
      }
    });
  },

  animateAddToCart(triggerEl) {
    // Bounce the cart badge
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
      badge.classList.add('bounce');
      setTimeout(() => badge.classList.remove('bounce'), 500);
    });
  },

  renderCartPage() {
    const container = document.getElementById('cartContent');
    if (!container) return;

    const items = cartManager.getItems();

    if (items.length === 0) {
      container.innerHTML = this.renderEmptyCart();
      return;
    }

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4" id="cartItems">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-dark">Shopping Cart (${cartManager.getItemCount()} items)</h2>
            <button id="clearCartBtn" class="text-sm text-tomato-red hover:underline font-medium">Clear Cart</button>
          </div>
          ${items.map(item => this.renderCartItem(item)).join('')}
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          ${this.renderOrderSummary()}
        </div>
      </div>
    `;

    this.bindCartPageEvents();
  },

  renderCartItem({ product, quantity }) {
    return `
      <div class="bg-white rounded-2xl p-5 shadow-sm flex gap-4 items-center cart-item-row" data-product-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0" width="96" height="96" loading="lazy">
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-dark text-sm sm:text-base truncate">${product.name}</h3>
          <p class="text-stone-gray text-xs sm:text-sm">${formatPrice(product.price)}/${product.unit}</p>
          ${product.originalPrice ? `<p class="text-xs text-tomato-red">Save ${formatPrice(product.originalPrice - product.price)} each</p>` : ''}
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <div class="qty-input">
            <button class="qty-btn cart-qty-btn" data-product-id="${product.id}" data-action="decrease" aria-label="Decrease quantity">−</button>
            <input type="text" class="qty-value" value="${quantity}" readonly aria-label="Quantity">
            <button class="qty-btn cart-qty-btn" data-product-id="${product.id}" data-action="increase" aria-label="Increase quantity">+</button>
          </div>
          <div class="text-right min-w-[60px]">
            <p class="font-bold text-dark text-sm sm:text-base">${formatPrice(product.price * quantity)}</p>
          </div>
          <button class="cart-remove-btn text-stone-gray hover:text-tomato-red transition-colors p-1" data-product-id="${product.id}" aria-label="Remove ${product.name}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  },

  renderOrderSummary() {
    const subtotal = cartManager.getSubtotal();
    const productSavings = cartManager.getProductSavings();
    const volumeDiscount = cartManager.getVolumeDiscount();
    const codeDiscount = cartManager.getCodeDiscount();
    const total = cartManager.getTotal();
    const codes = cartManager.getAppliedCodes();

    return `
      <div class="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
        <h3 class="text-lg font-bold text-dark mb-5">Order Summary</h3>

        <div class="space-y-3 mb-5">
          <div class="flex justify-between text-sm">
            <span class="text-stone-gray">Subtotal</span>
            <span class="font-medium">${formatPrice(subtotal)}</span>
          </div>
          ${productSavings > 0 ? `
          <div class="flex justify-between text-sm text-harvest-green">
            <span>Product Savings</span>
            <span class="font-medium">-${formatPrice(productSavings)}</span>
          </div>` : ''}
          ${volumeDiscount > 0 ? `
          <div class="flex justify-between text-sm text-harvest-green">
            <span>Volume Discount</span>
            <span class="font-medium">-${formatPrice(volumeDiscount)}</span>
          </div>` : ''}
          ${codeDiscount > 0 ? `
          <div class="flex justify-between text-sm text-harvest-green">
            <span>Coupon Discount</span>
            <span class="font-medium">-${formatPrice(codeDiscount)}</span>
          </div>` : ''}
          <div class="flex justify-between text-sm">
            <span class="text-stone-gray">Delivery</span>
            <span class="font-medium text-harvest-green">Free</span>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4 mb-5">
          <div class="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span class="text-harvest-green">${formatPrice(total)}</span>
          </div>
        </div>

        <!-- Discount Code Input -->
        <div class="mb-5">
          <div class="flex gap-2">
            <input type="text" id="discountInput" placeholder="Discount code" class="form-input !py-2.5 !text-sm flex-1" maxlength="20">
            <button id="applyDiscountBtn" class="btn-secondary-fhm !py-2.5 !px-4 !text-sm">Apply</button>
          </div>
          ${codes.length > 0 ? `
          <div class="mt-3 space-y-2">
            ${codes.map(code => `
              <div class="flex items-center justify-between bg-harvest-green/5 rounded-lg px-3 py-2 text-sm">
                <span class="font-medium text-harvest-green">${code}</span>
                <button class="remove-code-btn text-stone-gray hover:text-tomato-red text-xs" data-code="${code}">Remove</button>
              </div>
            `).join('')}
          </div>` : ''}
        </div>

        <button class="btn-primary-fhm w-full !py-3.5 !text-base" id="checkoutBtn">
          Proceed to Checkout
        </button>

        <p class="text-xs text-stone-gray text-center mt-3">Free delivery on all orders</p>
      </div>
    `;
  },

  renderEmptyCart() {
    return `
      <div class="text-center py-20">
        <div class="text-7xl mb-6">🛒</div>
        <h2 class="text-2xl font-bold text-dark mb-3 font-heading">Your Cart is Empty</h2>
        <p class="text-stone-gray mb-8 max-w-md mx-auto">Looks like you haven't added any items yet. Explore our fresh produce and find something delicious!</p>
        <a href="shop.html" class="btn-primary-fhm !text-base">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          Start Shopping
        </a>
      </div>
    `;
  },

  bindCartPageEvents() {
    // Quantity buttons
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = Number(btn.dataset.productId);
        const item = cartManager.getItem(productId);
        if (!item) return;

        if (btn.dataset.action === 'increase') {
          cartManager.updateQuantity(productId, item.quantity + 1);
        } else {
          cartManager.updateQuantity(productId, item.quantity - 1);
        }
        this.renderCartPage();
      });
    });

    // Remove buttons
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = Number(btn.dataset.productId);
        cartManager.removeItem(productId);
        this.renderCartPage();
        showToast('Item removed from cart', 'info');
      });
    });

    // Clear cart
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        cartManager.clearCart();
        this.renderCartPage();
        showToast('Cart cleared', 'info');
      });
    }

    // Apply discount
    const applyBtn = document.getElementById('applyDiscountBtn');
    const discountInput = document.getElementById('discountInput');
    if (applyBtn && discountInput) {
      applyBtn.addEventListener('click', () => {
        const { success, message } = cartManager.applyDiscount(discountInput.value);
        showToast(message, success ? 'success' : 'error');
        if (success) {
          discountInput.value = '';
          this.renderCartPage();
        }
      });
    }

    // Remove discount codes
    document.querySelectorAll('.remove-code-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cartManager.removeDiscount(btn.dataset.code);
        this.renderCartPage();
      });
    });

    // Checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        showToast('Checkout feature coming soon! 🎉', 'info');
      });
    }
  }
};

export default CartUI;
