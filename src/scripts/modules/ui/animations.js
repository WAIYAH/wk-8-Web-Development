/**
 * Fresh Harvest Market — Animation System
 * Intersection Observer based scroll animations
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const Animations = {
  _observer: null,

  init() {
    if (prefersReducedMotion.matches) {
      // Instantly show all elements
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        el.classList.add('animate-in');
      });
      return;
    }

    this._observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            this._observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    this.observe();
    this.initParallax();
    this.initCounters();
  },

  observe() {
    document.querySelectorAll('.animate-on-scroll, .stagger-children').forEach((el) => {
      this._observer?.observe(el);
    });
  },

  // Re-observe after dynamic content is added
  refresh() {
    this.observe();
  },

  initParallax() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg || prefersReducedMotion.matches) return;

    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scroll = window.scrollY;
            if (scroll < window.innerHeight) {
              heroBg.style.transform = `translateY(${scroll * 0.3}px)`;
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  },

  initCounters() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (counters.length === 0) return;

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  },

  animateCounter(el) {
    const target = parseInt(el.dataset.countTo, 10);
    const duration = parseInt(el.dataset.countDuration || '2000', 10);
    const suffix = el.dataset.countSuffix || '';
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  },

  // Add ripple effect to button
  addRipple(e) {
    if (prefersReducedMotion.matches) return;
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    ripple.className = 'ripple';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  },
};

export default Animations;
