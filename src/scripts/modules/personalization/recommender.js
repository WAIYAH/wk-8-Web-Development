/**
 * Fresh Harvest Market — Recommendation Engine
 * Progressive recommendation algorithm based on user behavior
 */

import ProductService from '@scripts/modules/products/productService.js';
import Tracker from './tracker.js';

const Recommender = {
  /**
   * Get personalized recommendations for the user
   * Uses progressive algorithm based on data richness
   */
  getRecommendations(count = 4) {
    const interactions = Tracker.getInteractionCount();

    if (interactions >= 25) {
      return this.getBehavioralRecommendations(count);
    } else if (interactions >= 10) {
      return this.getCategoryRecommendations(count);
    } else if (interactions >= 3) {
      return this.getFrequencyRecommendations(count);
    }

    // Fallback: top-rated products
    return ProductService.getFeatured(count);
  },

  /**
   * Level 1: Frequency-based — Most viewed products
   */
  getFrequencyRecommendations(count = 4) {
    const recentIds = Tracker.getRecentlyViewed(count * 2);
    const products = recentIds.map((id) => ProductService.getById(id)).filter(Boolean);

    // Pad with featured if not enough
    if (products.length < count) {
      const featured = ProductService.getFeatured(count).filter((p) => !recentIds.includes(p.id));
      products.push(...featured);
    }

    return products.slice(0, count);
  },

  /**
   * Level 2: Category affinity — Products from preferred categories
   */
  getCategoryRecommendations(count = 4) {
    const topCategories = Tracker.getTopCategories(2);
    const recentIds = new Set(Tracker.getRecentlyViewed(10));

    // Get products from preferred categories, excluding recently viewed
    let products = [];
    topCategories.forEach((cat) => {
      const catProducts = ProductService.getByCategory(cat)
        .filter((p) => !recentIds.has(p.id))
        .sort((a, b) => b.rating - a.rating);
      products.push(...catProducts);
    });

    // Pad with cross-category (discover new things)
    if (products.length < count) {
      const all = ProductService.getAll()
        .filter((p) => !recentIds.has(p.id) && !products.find((r) => r.id === p.id))
        .sort((a, b) => b.rating - a.rating);
      products.push(...all);
    }

    return products.slice(0, count);
  },

  /**
   * Level 3: Behavioral patterns — Price sensitivity, cart co-occurrence
   */
  getBehavioralRecommendations(count = 4) {
    const profile = Tracker.getProfile();
    const recentIds = new Set(Tracker.getRecentlyViewed(10));

    // Calculate average price from view history
    const viewedPrices = profile.viewHistory.map((v) => v.price).filter(Boolean);
    const avgPrice =
      viewedPrices.length > 0 ? viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length : 3;

    // Score each product
    const all = ProductService.getAll().filter((p) => !recentIds.has(p.id));
    const scored = all.map((product) => {
      let score = 0;

      // Category affinity score
      const catScore = profile.categoryAffinity[product.category] || 0;
      score += catScore * 2;

      // Price proximity (prefer similar price range)
      const priceDiff = Math.abs(product.price - avgPrice);
      score += Math.max(0, 5 - priceDiff);

      // Bonus for high-rated
      score += product.rating;

      // Bonus for on-sale items
      if (product.originalPrice && product.originalPrice > product.price) {
        score += 3;
      }

      // Bonus for organic (if user views organic frequently)
      const organicViews = profile.viewHistory.filter((v) => {
        const p = ProductService.getById(v.productId);
        return p && p.organic;
      }).length;
      if (product.organic && organicViews > 3) score += 2;

      return { product, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map((s) => s.product);
  },

  /**
   * Get "recently viewed" products
   */
  getRecentlyViewed(count = 4) {
    const ids = Tracker.getRecentlyViewed(count);
    return ids.map((id) => ProductService.getById(id)).filter(Boolean);
  },

  /**
   * Get the recommendation level label
   */
  getRecommendationLevel() {
    const interactions = Tracker.getInteractionCount();
    if (interactions >= 25) return 'Personalized for You';
    if (interactions >= 10) return 'Based on Your Preferences';
    if (interactions >= 3) return 'Recently Popular';
    return 'Top Picks';
  },
};

export default Recommender;
