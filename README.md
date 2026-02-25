# 🌿 Fresh Harvest Market

A premium organic produce e-commerce experience built with Vanilla ES6 Modules, Tailwind CSS v4, and Vite. Features a client-side personalization engine, discount system, cinematic scroll animations, and mobile-first responsive design.

## 🚀 Features

- **Pub/Sub State Management** — Centralized reactive store with wildcard listeners
- **Personalization Engine** — 3-tier recommendation algorithm (frequency → category → behavioral scoring)
- **Discount Engine** — Code-based and volume-based discounts with validation
- **Scroll Animations** — IntersectionObserver-powered cinematic reveals, parallax, and counters
- **Product Filters** — Category, search, sort, organic/seasonal toggles
- **Persistent Cart** — Full CRUD operations with localStorage persistence
- **Dynamic Rendering** — All product grids, cart, and recommendations rendered via JS with skeleton loading
- **SEO Optimized** — JSON-LD structured data, semantic HTML, Open Graph ready
- **Accessibility** — ARIA labels, keyboard navigation, reduced-motion support

## 📋 Pages

| Page        | Description                                                                                |
| ----------- | ------------------------------------------------------------------------------------------ |
| **Home**    | Parallax hero, featured products, personalized recommendations, seasonal picks, newsletter |
| **Shop**    | Full catalog with category filters, search, sort, organic/seasonal toggles                 |
| **Product** | Dynamic detail view with nutrition info, quantity selector, related products               |
| **Cart**    | Full cart management, discount codes, volume discounts, order summary                      |
| **About**   | Our Story, mission, team members                                                           |
| **Contact** | Validated contact form, FAQ accordion, store info                                          |

## 📦 Tech Stack

- **Vite 7** — Lightning-fast HMR & multi-page build
- **Tailwind CSS v4** — Utility-first CSS with custom design tokens
- **Vanilla ES6 Modules** — No frameworks, pure JavaScript
- **Google Fonts** — Playfair Display, Inter, Caveat

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
├── docs/                        # Architecture documentation
├── public/                      # Static files (robots.txt, sitemap)
├── src/
│   ├── assets/images/           # Optimized images
│   │   ├── brand/               # Brand images (farm, sustainable)
│   │   ├── hero/                # Hero images
│   │   └── products/            # Product images
│   ├── data/                    # JSON data (products, categories, discounts)
│   ├── pages/                   # HTML pages
│   │   ├── index.html           # Home
│   │   ├── shop.html            # Shop
│   │   ├── product.html         # Product detail
│   │   ├── cart.html            # Cart
│   │   ├── about.html           # About
│   │   └── contact.html         # Contact
│   ├── scripts/
│   │   ├── core/                # App entry, state store, router
│   │   └── modules/             # Feature modules
│   │       ├── cart/            # Cart manager & UI
│   │       ├── personalization/ # Tracker & recommender
│   │       ├── products/        # Service, renderer, filters
│   │       └── ui/              # Animations, notifications
│   └── styles/
│       └── main.css             # Tailwind v4 + design tokens
├── vite.config.js               # Vite configuration
└── package.json
```

## 👤 Author

**Lucky Nakola** — [GitHub](https://github.com/WAIYAH)

## 📜 License

MIT License
