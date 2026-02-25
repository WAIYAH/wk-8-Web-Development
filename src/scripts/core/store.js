/**
 * Fresh Harvest Market — Central Pub/Sub Store
 * Lightweight reactive state management with localStorage persistence
 */

class Store {
  #state = {};
  #listeners = new Map();

  constructor(initialState = {}) {
    this.#state = { ...initialState };
  }

  getState(key) {
    return key ? this.#state[key] : { ...this.#state };
  }

  setState(key, value) {
    const oldValue = this.#state[key];
    this.#state[key] = value;

    if (this.#listeners.has(key)) {
      this.#listeners.get(key).forEach((cb) => {
        try {
          cb(value, oldValue);
        } catch (e) {
          console.error(`Store listener error [${key}]:`, e);
        }
      });
    }

    // Wildcard listeners
    if (this.#listeners.has('*')) {
      this.#listeners.get('*').forEach((cb) => {
        try {
          cb(key, value, oldValue);
        } catch (e) {
          console.error('Store wildcard listener error:', e);
        }
      });
    }
  }

  subscribe(key, callback) {
    if (!this.#listeners.has(key)) {
      this.#listeners.set(key, new Set());
    }
    this.#listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.#listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) this.#listeners.delete(key);
      }
    };
  }

  unsubscribe(key, callback) {
    const listeners = this.#listeners.get(key);
    if (listeners) {
      listeners.delete(callback);
    }
  }
}

// Singleton store instance
const store = new Store({
  cart: { items: [], lastUpdated: null },
  products: [],
  filters: { category: 'all', sort: 'default', search: '', priceRange: [0, 100] },
  user: { viewHistory: [], searchHistory: [], categoryAffinity: {}, cartHistory: [] },
  ui: { cartOpen: false, mobileMenuOpen: false, currentPage: '' },
});

export default store;
