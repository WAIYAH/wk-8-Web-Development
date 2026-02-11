/**
 * Fresh Harvest Market — LocalStorage Utility
 * Safe wrapper with JSON parsing and error handling
 */

const STORAGE_PREFIX = 'fhm_';

const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`Storage get error [${key}]:`, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Storage set error [${key}]:`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (e) {
      console.error(`Storage remove error [${key}]:`, e);
      return false;
    }
  },

  clear() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  },

  has(key) {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null;
  }
};

export default Storage;
