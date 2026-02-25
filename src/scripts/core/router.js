/**
 * Fresh Harvest Market — Simple Page Router
 * Detects current page and initializes appropriate modules
 */

const Router = {
  currentPage: '',

  detect() {
    const path = window.location.pathname;
    if (path.includes('shop')) return 'shop';
    if (path.includes('product')) return 'product';
    if (path.includes('cart')) return 'cart';
    if (path.includes('about')) return 'about';
    if (path.includes('contact')) return 'contact';
    return 'home';
  },

  init() {
    this.currentPage = this.detect();
    document.body.setAttribute('data-page', this.currentPage);
    return this.currentPage;
  },

  getPage() {
    return this.currentPage;
  },
};

export default Router;
