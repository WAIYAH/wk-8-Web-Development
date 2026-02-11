/**
 * Fresh Harvest Market — Product Filters UI
 * Handles filter controls and search interaction
 */

import store from '@scripts/core/store.js';
import ProductService from './productService.js';
import { renderProductGrid } from './productRenderer.js';
import { debounce } from '@scripts/modules/utils/formatters.js';

const ProductFilters = {
  _gridEl: null,
  _resultsCountEl: null,

  init(gridSelector = '#productGrid', resultsCountSelector = '#resultsCount') {
    this._gridEl = document.querySelector(gridSelector);
    this._resultsCountEl = document.querySelector(resultsCountSelector);
    if (!this._gridEl) return;

    this.bindEvents();
    this.applyFilters();
  },

  bindEvents() {
    // Category filter
    const categoryBtns = document.querySelectorAll('[data-filter-category]');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        categoryBtns.forEach(b => b.classList.remove('active', 'bg-harvest-green', 'text-white'));
        e.currentTarget.classList.add('active', 'bg-harvest-green', 'text-white');
        const filters = store.getState('filters');
        store.setState('filters', { ...filters, category: e.currentTarget.dataset.filterCategory });
        this.applyFilters();
      });
    });

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const filters = store.getState('filters');
        store.setState('filters', { ...filters, sort: e.target.value });
        this.applyFilters();
      });
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      const debouncedSearch = debounce((value) => {
        const filters = store.getState('filters');
        store.setState('filters', { ...filters, search: value });
        this.applyFilters();
      }, 300);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }

    // Organic toggle
    const organicToggle = document.getElementById('organicToggle');
    if (organicToggle) {
      organicToggle.addEventListener('change', () => {
        const filters = store.getState('filters');
        store.setState('filters', { ...filters, organic: organicToggle.checked });
        this.applyFilters();
      });
    }

    // Seasonal toggle
    const seasonalToggle = document.getElementById('seasonalToggle');
    if (seasonalToggle) {
      seasonalToggle.addEventListener('change', () => {
        const filters = store.getState('filters');
        store.setState('filters', { ...filters, seasonal: seasonalToggle.checked });
        this.applyFilters();
      });
    }
  },

  applyFilters() {
    const filters = store.getState('filters');
    const products = ProductService.filter(filters);

    if (this._gridEl) {
      this._gridEl.innerHTML = renderProductGrid(products);
    }

    if (this._resultsCountEl) {
      this._resultsCountEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
    }

    // Re-bind add-to-cart buttons
    this._gridEl?.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = Number(btn.dataset.productId);
        document.dispatchEvent(new CustomEvent('fhm:addToCart', { detail: { productId, quantity: 1 } }));
      });
    });
  }
};

export default ProductFilters;
