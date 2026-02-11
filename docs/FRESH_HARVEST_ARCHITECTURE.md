# Fresh Harvest Market — Architecture Blueprint

> **Version:** 1.0.0  
> **Date:** February 11, 2026  
> **Author:** Principal Frontend Engineer  
> **Status:** APPROVED — Ready for Implementation

---

## A. BUSINESS & USER CONTEXT

### Target Customer Personas

| Persona | Description | Motivation | Price Sensitivity | Tech Comfort |
|---------|-------------|------------|-------------------|--------------|
| **Health-Conscious Families** | Parents 28–45 seeking nutritious meals for kids | Organic labels, seasonal variety, meal planning | Medium — will pay premium for organic | Moderate |
| **Professional Chefs** | Restaurant owners, caterers, home cooks | Bulk ordering, rare produce, consistent quality | Low — prioritize quality | High |
| **Budget Shoppers** | Students, young professionals | Weekly deals, volume discounts, staple items | High — deal-driven behavior | High |
| **Organic Enthusiasts** | Wellness-focused individuals 25–55 | Certifications, farm sourcing, sustainability | Low — values-driven spending | Moderate–High |

### User Journey Map

```
Discovery → Browse → Select → Purchase → Reorder
   │          │         │          │          │
   ├─ SEO     ├─ Shop   ├─ Detail  ├─ Cart    ├─ Personalized
   ├─ Social  ├─ Filter ├─ Compare ├─ Checkout│   Homepage
   └─ Referral└─ Search └─ Reviews └─ Confirm └─ Recommendations
```

### Conversion Funnel Optimization

1. **Awareness** — Hero section with value proposition, seasonal imagery
2. **Interest** — Featured products, category browsing, social proof
3. **Desire** — Product detail pages with rich info, discount badges, freshness indicators
4. **Action** — Frictionless add-to-cart, persistent cart, clear pricing
5. **Retention** — Personalized recommendations, reorder suggestions, newsletter

### Competitive Positioning

| Competitor | Strength | FHM Differentiator |
|-----------|----------|-------------------|
| Instacart | Delivery logistics | Direct farm-to-table narrative, no middleman feel |
| FreshDirect | Scale, variety | Local-first sourcing, community connection |
| Local CSA | Authenticity | Modern UX, browsing convenience, personalization |
| Whole Foods Online | Brand trust | Price transparency, dynamic discounts, no Amazon dependency |

---

## B. INFORMATION ARCHITECTURE

### Sitemap

```
Fresh Harvest Market
├── / (index.html) — Homepage
│   ├── Hero Section (seasonal, parallax)
│   ├── Featured Products (personalized)
│   ├── Category Showcase
│   ├── Value Propositions (farm-fresh, organic, delivery)
│   ├── Testimonials / Social Proof
│   └── Newsletter CTA
│
├── /shop (shop.html) — Product Catalog
│   ├── Search Bar (real-time, debounced)
│   ├── Filter Sidebar (category, price, organic, seasonal)
│   ├── Sort Controls (price, popularity, newest)
│   ├── Product Grid (responsive, paginated)
│   └── Recommended For You section
│
├── /product (product.html) — Product Detail
│   ├── Product Image Gallery
│   ├── Price, Discount, Badges
│   ├── Quantity Selector & Add to Cart
│   ├── Nutritional Info
│   ├── Related Products
│   └── Recently Viewed
│
├── /cart (cart.html) — Shopping Cart
│   ├── Cart Items List (editable quantities)
│   ├── Price Breakdown (subtotal, discounts, total)
│   ├── Discount Code Input
│   ├── Recommended Add-ons
│   └── Checkout CTA
│
├── /about (about.html) — Our Story
│   ├── Brand Story with parallax imagery
│   ├── Mission & Values
│   ├── Farm Partners
│   └── Team Section
│
└── /contact (contact.html) — Contact
    ├── Contact Form (validated)
    ├── Store Info / Map placeholder
    ├── FAQ Accordion
    └── Social Links
```

### Content Hierarchy Strategy

- **H1** — One per page, primary keyword-rich
- **H2** — Major sections within page
- **H3** — Subsections, product names in grids
- Visual hierarchy reinforced through typography scale (1.25 ratio)

### Navigation Flow

- **Primary Nav** — Home, Shop, About, Contact + Cart icon with badge
- **Mobile** — Hamburger menu + sticky bottom bar (Cart shortcut)
- **Breadcrumbs** — On Shop and Product Detail pages
- **Footer Nav** — Full sitemap links, social, legal

---

## C. TECHNICAL ARCHITECTURE

### Module System

Vanilla ES6 modules loaded via Vite's bundler. Each module exports pure functions or classes.

```
src/scripts/
├── core/
│   ├── app.js          — Application bootstrap, module initialization
│   ├── router.js       — Simple page-detection router (no SPA)
│   └── store.js        — Central Pub/Sub state management
│
├── modules/
│   ├── cart/            — Cart business logic, UI rendering, persistence
│   ├── products/        — Product service, renderer, filter engine
│   ├── personalization/ — Tracker, recommender, profile manager
│   ├── ui/              — Animations, notifications, modals
│   └── utils/           — LocalStorage wrapper, formatters, validators
│
└── components/
    ├── layout/          — Header, Footer, Navigation (render functions)
    ├── ui/              — Button, Card, Badge, Modal (pure components)
    └── business/        — ProductCard, CartItem, RecommendationCard
```

### State Management — Pub/Sub Event Store

```javascript
// Pattern: Central event bus with namespaced topics
class Store {
  #state = {};
  #listeners = new Map();

  getState(key) { ... }
  setState(key, value) { ... }   // Triggers listeners
  subscribe(key, callback) { ... }
  unsubscribe(key, callback) { ... }
}
```

**Reasoning:** Lightweight, no framework dependency, decouples modules. Cart, Products, and Personalization modules communicate through store events rather than direct coupling.

### LocalStorage Schema

```json
{
  "fhm_cart": {
    "items": [{ "productId": 1, "quantity": 2 }],
    "lastUpdated": "ISO-8601"
  },
  "fhm_user_profile": {
    "viewHistory": [{ "productId": 1, "timestamp": "ISO", "category": "fruits" }],
    "searchHistory": ["organic apples", "tomatoes"],
    "categoryAffinity": { "fruits": 12, "vegetables": 8 },
    "cartHistory": [{ "productId": 1, "action": "add", "timestamp": "ISO" }]
  },
  "fhm_preferences": {
    "theme": "light",
    "reducedMotion": false
  },
  "fhm_discounts": {
    "applied": [],
    "firstPurchase": true
  }
}
```

### Component Rendering — Factory Functions

```javascript
// Pure function pattern — returns HTML string
export function ProductCard(product, options = {}) {
  return `<article class="..." data-product-id="${product.id}">...</article>`;
}
```

**Reasoning:** Simpler than classes for presentational components. Easy to test, compose, and render into DOM via `innerHTML` or `insertAdjacentHTML`.

### Build System — Vite

- **Dev server** with hot module replacement
- **CSS** — Tailwind CSS processed via PostCSS
- **JS** — ES module bundling, tree-shaking
- **Assets** — Image optimization pipeline
- **Output** — `/dist` folder for production

---

## D. PERSONALIZATION ENGINE ARCHITECTURE

### Interaction Tracking

Every meaningful user interaction is captured client-side:

| Event Type | Data Captured | Storage Key |
|-----------|---------------|-------------|
| Product View | productId, category, timestamp, duration | `fhm_user_profile.viewHistory` |
| Product Click | productId, source, position | `fhm_user_profile.viewHistory` |
| Cart Action | productId, action, quantity | `fhm_user_profile.cartHistory` |
| Search Query | query, resultsCount | `fhm_user_profile.searchHistory` |
| Category Browse | category, timeSpent | `fhm_user_profile.categoryAffinity` |

### Recommendation Algorithm (3-Tier Progressive)

**Level 1 — Frequency (Immediate):**
- Most viewed products in last 7 days
- Recently viewed carousel
- Minimum: 3 product views to activate

**Level 2 — Category Affinity (Moderate data):**
- Weighted category preferences from view/cart history
- Cross-category suggestions (vegetables buyer → herbs)
- Minimum: 10 interactions

**Level 3 — Behavioral Patterns (Rich data):**
- Price sensitivity scoring (avg cart value vs clicks)
- Frequently bought together (co-occurrence in carts)
- Seasonal preference alignment
- Minimum: 25 interactions

### Privacy Design

- **Zero PII** — No names, emails, or identifiable data in tracking
- **Client-side only** — All data in localStorage
- **Clear data option** — User can wipe all tracking data
- **No cookies** — Purely localStorage-based
- **Transparent** — Users can see what's tracked in a preferences UI

---

## E. E-COMMERCE LOGIC SPECIFICATION

### Cart Data Structure

```javascript
class CartManager {
  #items = new Map();          // productId → { product, quantity }
  #discountCodes = new Set();  // Applied codes
  #subscribers = [];           // Update callbacks

  // CRUD Operations
  addItem(productId, qty = 1)
  removeItem(productId)
  updateQuantity(productId, qty)
  clearCart()

  // Calculations
  getSubtotal()     // Sum of (price × qty)
  getDiscountTotal() // Sum of all applied discounts
  getTotal()         // Subtotal - Discounts
  getItemCount()     // Total quantity across items

  // Discount Engine
  applyDiscount(code)
  removeDiscount(code)
  calculateItemDiscount(item) // Per-item discount logic

  // Persistence
  save() → localStorage
  load() ← localStorage

  // Events
  onChange(callback)
  #emit()
}
```

### Discount Engine

```javascript
const DiscountRules = {
  // Static product discounts (from products.json)
  PRODUCT_SALE: { type: 'percentage', value: varies },

  // Dynamic behavioral discounts
  FIRST_PURCHASE: { type: 'percentage', value: 0.15, code: 'WELCOME15' },
  VOLUME_3:      { type: 'percentage', value: 0.05, minQty: 3 },
  VOLUME_5:      { type: 'percentage', value: 0.10, minQty: 5 },
  VOLUME_10:     { type: 'percentage', value: 0.15, minQty: 10 },
  REORDER:       { type: 'percentage', value: 0.20, code: 'REORDER20' },

  // Flash sales (time-based)
  FLASH_SALE:    { type: 'percentage', value: 0.25, schedule: 'weekly' }
};
```

### Price Calculation Pipeline

```
Base Price (per unit)
  → × Quantity
  → - Product Sale Discount (if applicable)
  → - Volume Discount (if threshold met)
  → = Item Subtotal
  
Cart Subtotal (sum of item subtotals)
  → - Coupon Code Discount
  → - First Purchase Discount
  → = Cart Total
```

---

## F. UI/UX ANIMATION FRAMEWORK

### Performance Budget

| Metric | Budget | Enforcement |
|--------|--------|-------------|
| Total animation JS | < 15KB gzipped | Bundle analysis |
| Concurrent animations | ≤ 5 | Intersection Observer |
| Frame rate | 60fps minimum | GPU-only properties |
| Time to Interactive impact | < 100ms | Deferred loading |

### Scroll-Triggered Animations (Intersection Observer)

```javascript
// Single observer, multiple targets
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target); // One-shot
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
```

**Animation Catalog:**

| Element | Animation | Trigger | Duration |
|---------|-----------|---------|----------|
| Hero text | Fade in + slide up | Page load | 800ms |
| Hero background | Parallax scroll | Scroll position | Continuous |
| Product cards | Staggered fade-in + scale | Scroll into view | 400ms + 100ms stagger |
| Product card hover | Elevation + shadow | Mouse enter | 300ms |
| Add-to-cart button | Ripple + fly-to-cart | Click | 600ms |
| Cart badge | Bounce + scale | Item added | 400ms |
| Section headings | Slide in from left | Scroll into view | 600ms |
| Value props | Fade + counter animation | Scroll into view | 800ms |
| Page transitions | Fade in | Page load | 400ms |
| Toast notifications | Slide in + auto-dismiss | Event trigger | 300ms in, 3s display |

### Reduced Motion Compliance

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

All JavaScript animations check `window.matchMedia('(prefers-reduced-motion: reduce)')` before executing.

---

## G. IMPLEMENTATION PHASES WITH QUALITY GATES

### Phase 1: Foundation & Architecture (Priority: CRITICAL)
- [x] Architecture document ← **This document**
- [ ] Project folder structure creation
- [ ] Vite + Tailwind CSS configuration
- [ ] Core store module (Pub/Sub)
- [ ] LocalStorage utility wrapper
- [ ] Component factory pattern established
- [ ] products.json + categories.json data files
- [ ] Git initial commit

**Quality Gate:** `npm run dev` starts, Tailwind classes render, store pub/sub works.

### Phase 2: Product Catalog & Pages
- [ ] All 6 HTML pages (index, shop, product, cart, about, contact)
- [ ] Header/Footer shared components
- [ ] ProductCard component
- [ ] Shop page with grid layout
- [ ] Product filtering (category, price range)
- [ ] Product sorting (price, name)
- [ ] Real-time search with debounce
- [ ] Product detail page with dynamic rendering

**Quality Gate:** All pages render, filtering works without reload, responsive at all breakpoints.

### Phase 3: Shopping Experience
- [ ] CartManager class implementation
- [ ] Add/remove/update cart items
- [ ] Cart page with full item management
- [ ] Price calculation with discount engine
- [ ] Cart persistence (localStorage)
- [ ] Cart badge counter in header (real-time)
- [ ] Discount code application

**Quality Gate:** Cart operations accurate, persists on refresh, discount math verified.

### Phase 4: Personalization Engine
- [ ] Interaction tracker module
- [ ] User profile localStorage schema
- [ ] Frequency-based recommendation (Level 1)
- [ ] Category affinity scoring (Level 2)
- [ ] "Recommended For You" section on homepage
- [ ] "Recently Viewed" carousel
- [ ] Dynamic homepage personalization

**Quality Gate:** Recommendations change based on browsing behavior, no PII stored.

### Phase 5: Animation & Polish
- [ ] Intersection Observer animation system
- [ ] Parallax hero section
- [ ] Product card hover effects
- [ ] Add-to-cart micro-animations
- [ ] Toast notification system
- [ ] Skeleton loading states
- [ ] Page load transitions
- [ ] Reduced motion compliance

**Quality Gate:** 60fps animations, no layout shifts, prefers-reduced-motion honored.

### Phase 6: Optimization & Launch
- [ ] Semantic HTML audit
- [ ] JSON-LD structured data
- [ ] Meta tags optimization
- [ ] robots.txt + sitemap.xml
- [ ] Image optimization (lazy loading, srcset)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance audit (Lighthouse > 90)
- [ ] Final code cleanup and documentation

**Quality Gate:** Lighthouse all categories > 90, zero console errors, cross-browser verified.

---

## DESIGN SYSTEM SUMMARY

### Colors
```
Primary:   #2B5F3B (Harvest Green), #4A7C59 (Leaf Green), #86A788 (Sprout Green)
Accent:    #E35F5F (Tomato Red), #F9A826 (Carrot Orange), #E58C8C (Berry Pink)
Neutral:   #FCFAF7 (Farm White), #8B7355 (Soil Brown), #6B7280 (Stone Gray)
```

### Typography
- **Headings:** Playfair Display (serif, editorial)
- **Body:** Inter (sans-serif, readable)
- **Accent:** Caveat (handwritten, organic feel)
- **Scale:** 1.25 (major third)

### Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128

### Breakpoints
- Mobile: 320px–639px (base)
- Tablet: 640px–1023px
- Desktop: 1024px–1279px
- Wide: 1280px+

---

> **Blueprint Status: APPROVED**  
> **Next Action: Begin Phase 1 — Foundation & Architecture**
