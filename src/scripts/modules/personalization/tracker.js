/**
 * Fresh Harvest Market — Personalization Tracker
 * Captures user interactions for recommendation engine
 */

import Storage from '@scripts/modules/utils/localStorage.js';

const MAX_HISTORY = 50;

const Tracker = {
  _profile: null,

  init() {
    this._profile = Storage.get('user_profile') || {
      viewHistory: [],
      searchHistory: [],
      categoryAffinity: {},
      cartHistory: [],
      lastVisit: null,
    };
    this._profile.lastVisit = new Date().toISOString();
    this.save();
  },

  trackView(product) {
    if (!product) return;
    this._profile.viewHistory.unshift({
      productId: product.id,
      category: product.category,
      price: product.price,
      timestamp: new Date().toISOString(),
    });

    // Trim history
    if (this._profile.viewHistory.length > MAX_HISTORY) {
      this._profile.viewHistory = this._profile.viewHistory.slice(0, MAX_HISTORY);
    }

    // Update category affinity
    const cat = product.category;
    this._profile.categoryAffinity[cat] = (this._profile.categoryAffinity[cat] || 0) + 1;

    this.save();
  },

  trackSearch(query, resultsCount) {
    if (!query || !query.trim()) return;
    this._profile.searchHistory.unshift({
      query: query.trim(),
      resultsCount,
      timestamp: new Date().toISOString(),
    });

    if (this._profile.searchHistory.length > 20) {
      this._profile.searchHistory = this._profile.searchHistory.slice(0, 20);
    }

    this.save();
  },

  trackCartAction(productId, action, quantity) {
    this._profile.cartHistory.unshift({
      productId,
      action,
      quantity,
      timestamp: new Date().toISOString(),
    });

    if (this._profile.cartHistory.length > MAX_HISTORY) {
      this._profile.cartHistory = this._profile.cartHistory.slice(0, MAX_HISTORY);
    }

    this.save();
  },

  getProfile() {
    return { ...this._profile };
  },

  getViewHistory() {
    return [...this._profile.viewHistory];
  },

  getCategoryAffinity() {
    return { ...this._profile.categoryAffinity };
  },

  getRecentlyViewed(count = 4) {
    const seen = new Set();
    return this._profile.viewHistory
      .filter((v) => {
        if (seen.has(v.productId)) return false;
        seen.add(v.productId);
        return true;
      })
      .slice(0, count)
      .map((v) => v.productId);
  },

  getTopCategories(count = 3) {
    return Object.entries(this._profile.categoryAffinity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([cat]) => cat);
  },

  getInteractionCount() {
    return (
      this._profile.viewHistory.length +
      this._profile.searchHistory.length +
      this._profile.cartHistory.length
    );
  },

  clearData() {
    this._profile = {
      viewHistory: [],
      searchHistory: [],
      categoryAffinity: {},
      cartHistory: [],
      lastVisit: null,
    };
    this.save();
  },

  save() {
    Storage.set('user_profile', this._profile);
  },
};

export default Tracker;
