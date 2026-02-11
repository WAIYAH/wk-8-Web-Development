/**
 * Fresh Harvest Market — Product Service
 * Loads, filters, sorts, and searches products
 */

import productsData from '@data/products.json';
import store from '@scripts/core/store.js';

const ProductService = {
  _products: productsData.products,

  getAll() {
    return [...this._products];
  },

  getById(id) {
    return this._products.find(p => p.id === Number(id));
  },

  getBySlug(slug) {
    return this._products.find(p => p.slug === slug);
  },

  getByCategory(category) {
    if (!category || category === 'all') return this.getAll();
    return this._products.filter(p => p.category === category);
  },

  getFeatured(count = 4) {
    return [...this._products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count);
  },

  getOnSale() {
    return this._products.filter(p => p.originalPrice && p.originalPrice > p.price);
  },

  getSeasonal() {
    return this._products.filter(p => p.seasonal);
  },

  getOrganic() {
    return this._products.filter(p => p.organic);
  },

  search(query) {
    if (!query || query.trim().length === 0) return this.getAll();
    const q = query.toLowerCase().trim();
    return this._products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q)
    );
  },

  filter({ category = 'all', sort = 'default', search = '', priceRange = [0, 100], organic = false, seasonal = false }) {
    let results = this.getAll();

    // Category filter
    if (category && category !== 'all') {
      results = results.filter(p => p.category === category);
    }

    // Search filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Price range filter
    if (priceRange) {
      results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }

    // Organic filter
    if (organic) {
      results = results.filter(p => p.organic);
    }

    // Seasonal filter
    if (seasonal) {
      results = results.filter(p => p.seasonal);
    }

    // Sorting
    switch (sort) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return results;
  },

  getDiscountPercentage(product) {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }
};

export default ProductService;
