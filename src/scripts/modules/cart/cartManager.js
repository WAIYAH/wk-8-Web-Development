/**
 * Fresh Harvest Market — Cart Manager
 * Core cart business logic, calculations, and event emission
 */

import store from '@scripts/core/store.js';
import Storage from '@scripts/modules/utils/localStorage.js';
import ProductService from '@scripts/modules/products/productService.js';
import discountsData from '@data/discounts.json';

class CartManager {
  #items = new Map();
  #appliedCodes = new Set();
  #subscribers = [];

  constructor() {
    this.load();
  }

  // --- CRUD ---

  addItem(productId, quantity = 1) {
    const product = ProductService.getById(productId);
    if (!product) return false;

    const current = this.#items.get(productId);
    if (current) {
      current.quantity = Math.min(current.quantity + quantity, 99);
    } else {
      this.#items.set(productId, { product, quantity });
    }

    this.#emit();
    this.save();
    return true;
  }

  removeItem(productId) {
    const removed = this.#items.delete(productId);
    if (removed) {
      this.#emit();
      this.save();
    }
    return removed;
  }

  updateQuantity(productId, quantity) {
    const item = this.#items.get(productId);
    if (!item) return false;

    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    item.quantity = Math.min(quantity, 99);
    this.#emit();
    this.save();
    return true;
  }

  clearCart() {
    this.#items.clear();
    this.#appliedCodes.clear();
    this.#emit();
    this.save();
  }

  getItems() {
    return Array.from(this.#items.values());
  }

  getItem(productId) {
    return this.#items.get(productId);
  }

  hasItem(productId) {
    return this.#items.has(productId);
  }

  // --- Calculations ---

  getItemCount() {
    let count = 0;
    this.#items.forEach(item => count += item.quantity);
    return count;
  }

  getSubtotal() {
    let subtotal = 0;
    this.#items.forEach(item => {
      subtotal += item.product.price * item.quantity;
    });
    return Math.round(subtotal * 100) / 100;
  }

  getProductSavings() {
    let savings = 0;
    this.#items.forEach(item => {
      if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
        savings += (item.product.originalPrice - item.product.price) * item.quantity;
      }
    });
    return Math.round(savings * 100) / 100;
  }

  getVolumeDiscount() {
    let discount = 0;
    this.#items.forEach(item => {
      const rule = discountsData.volumeDiscounts
        .filter(d => item.quantity >= d.minQty)
        .sort((a, b) => b.minQty - a.minQty)[0];

      if (rule) {
        discount += item.product.price * item.quantity * rule.discount;
      }
    });
    return Math.round(discount * 100) / 100;
  }

  getCodeDiscount() {
    let discount = 0;
    const subtotal = this.getSubtotal();

    this.#appliedCodes.forEach(code => {
      const rule = discountsData.discounts.find(d => d.code === code && d.active);
      if (!rule) return;
      if (rule.minOrder && subtotal < rule.minOrder) return;

      if (rule.type === 'percentage') {
        discount += subtotal * rule.value;
      } else if (rule.type === 'fixed') {
        discount += rule.value;
      }
    });

    return Math.round(Math.min(discount, subtotal) * 100) / 100;
  }

  getTotalDiscount() {
    return Math.round((this.getVolumeDiscount() + this.getCodeDiscount()) * 100) / 100;
  }

  getTotal() {
    const total = this.getSubtotal() - this.getTotalDiscount();
    return Math.round(Math.max(0, total) * 100) / 100;
  }

  // --- Discount Codes ---

  applyDiscount(code) {
    const upper = code.toUpperCase().trim();
    const rule = discountsData.discounts.find(d => d.code === upper && d.active);

    if (!rule) return { success: false, message: 'Invalid discount code' };
    if (this.#appliedCodes.has(upper)) return { success: false, message: 'Code already applied' };
    if (rule.minOrder && this.getSubtotal() < rule.minOrder) {
      return { success: false, message: `Minimum order of $${rule.minOrder} required` };
    }

    this.#appliedCodes.add(upper);
    this.#emit();
    this.save();
    return { success: true, message: rule.description };
  }

  removeDiscount(code) {
    const removed = this.#appliedCodes.delete(code.toUpperCase().trim());
    if (removed) {
      this.#emit();
      this.save();
    }
    return removed;
  }

  getAppliedCodes() {
    return [...this.#appliedCodes];
  }

  // --- Persistence ---

  save() {
    Storage.set('cart', {
      items: Array.from(this.#items.entries()).map(([id, { quantity }]) => ({ productId: id, quantity })),
      codes: [...this.#appliedCodes],
      lastUpdated: new Date().toISOString()
    });
  }

  load() {
    const saved = Storage.get('cart');
    if (!saved || !saved.items) return;

    this.#items.clear();
    saved.items.forEach(({ productId, quantity }) => {
      const product = ProductService.getById(productId);
      if (product) {
        this.#items.set(productId, { product, quantity });
      }
    });

    if (saved.codes) {
      saved.codes.forEach(code => this.#appliedCodes.add(code));
    }

    this.#emit();
  }

  // --- Events ---

  onChange(callback) {
    this.#subscribers.push(callback);
    return () => {
      this.#subscribers = this.#subscribers.filter(cb => cb !== callback);
    };
  }

  #emit() {
    const data = {
      items: this.getItems(),
      itemCount: this.getItemCount(),
      subtotal: this.getSubtotal(),
      productSavings: this.getProductSavings(),
      volumeDiscount: this.getVolumeDiscount(),
      codeDiscount: this.getCodeDiscount(),
      totalDiscount: this.getTotalDiscount(),
      total: this.getTotal(),
      codes: this.getAppliedCodes()
    };

    store.setState('cart', data);

    this.#subscribers.forEach(cb => {
      try { cb(data); } catch (e) { console.error('Cart subscriber error:', e); }
    });
  }
}

// Singleton
const cartManager = new CartManager();
export default cartManager;
