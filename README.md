# VietCraft 🌿

> **Natural Home Decor Blog & Amazon Affiliate Product Discovery Platform**  
> Celebrating Vietnamese artisanal traditions, renewable natural materials, and mindful living for US homes.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![Node](https://img.shields.io/badge/Node.js-24-green.svg)
![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![Node](https://img.shields.io/badge/Node.js-24-green.svg)
![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)
![Tests](https://img.shields.io/badge/Tests-49%20Passed%20(100%25)-success.svg)

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Monorepo Architecture](#-monorepo-architecture)
3. [100% CMS-Managed Architecture](#-100-cms-managed-architecture)
4. [Design System & Palette](#-design-system--palette)
5. [Key Features](#-key-features)
6. [Quick Start & Local Setup](#-quick-start--local-setup)
7. [Seed Data & Admin Credentials](#-seed-data--admin-credentials)
8. [Running Tests](#-running-tests)
9. [Docker Deployment](#-docker-deployment)
10. [Amazon Affiliate Compliance](#-amazon-affiliate-compliance)
11. [Documentation Links](#-documentation-links)

---

## 🌿 Project Overview

**VietCraft** is a full-stack production-ready MERN platform that bridges the ancient craft communities of Vietnam with modern mindful interiors across the United States.

### The Six Foundational Materials
- **Rattan & Bamboo**: Hand-split, smoked, and woven lanterns and baskets from Phú Vinh (Chương Mỹ).
- **Ceramics**: Wheel-thrown stoneware and wood-ash crackle celadon glazes from Bát Tràng and Phù Lãng.
- **Lacquer (Sơn Ta)**: Twenty painstakingly cured coats of natural tree resin from Hạ Thái.
- **Wood**: Sculptural pedestals, live-edge bowls, and stools carved from reclaimed teak and acacia.
- **Woven Fibers**: Sun-cured seagrass and water hyacinth braided by coastal guilds in Kim Sơn and the Mekong Delta.
- **Silk**: Mulberry and tussah silks woven on wooden handlooms and tinted with botanical dyes in Mã Châu and Vạn Phúc.

---

## 🏛️ Monorepo Architecture

```
vietcraft/
├── apps/
│   ├── web/              # Public Storefront (React 18 + Vite + Tailwind CSS)
│   │   ├── src/pages/    # Home, Discover, Products, Journal, About, GenericPage, Search
│   │   └── src/components/# Header (CMS), Footer (CMS), HeroCarousel, ProductCard, ArticleCard
│   │
│   ├── api/              # Backend REST API (Node.js + Express + TypeScript + Mongoose)
│   │   ├── src/models/   # HeaderSettings, FooterSettings, SiteSettings, Page, User, Material, Category, Product, Post, Homepage
│   │   └── src/routes/   # Header, Footer, Pages, Settings, Auth, Materials, Products, Articles, Search, Contact
│   │
│   └── admin/            # Admin CMS Dashboard (React 18 + Vite + Tailwind CSS)
│       └── src/pages/    # AdminHeaderPage, AdminFooterPage, AdminPagesListPage, AdminPageEditPage, Settings, HomepageCMS, Posts, Products
│
├── packages/
│   ├── shared/           # Shared TypeScript interfaces, Zod validation schemas, constants
│   └── config/           # Shared Tailwind preset & TSConfig
│
├── docs/                 # Architecture, API specification, Deployment, Security checklist, Backup strategy
├── docker-compose.yml    # Complete multi-container deployment
└── .env.example
```

---

## 🛠️ 100% CMS-Managed Architecture

Every user-facing aspect of VietCraft is dynamically managed via the Admin CMS without code redeployments:

1. **Header & Navigation (`/admin/header`)**:
   - Custom brand logo upload & logo text display.
   - Dynamic tree navigation builder: add, edit, reorder links, toggling visibility and new-tab attributes.
   - Dynamic "Discover" materials dropdown menu toggles.
   - Call-to-action button text & destination URL.
   - Live search input placeholder customization.
2. **Footer (`/admin/footer`)**:
   - Brand mission statement & editorial description.
   - Multi-column footer link groups with customizable headings and order.
   - Social media profiles (Instagram, Pinterest, Facebook, etc.).
   - Guild contact details (email, phone, address, business hours).
   - Slow living newsletter banner title, description, and privacy notice.
   - Dynamic copyright text and FTC compliance notices.
3. **Dynamic Pages Manager (`/admin/pages`)**:
   - Rich Markdown content editor for all editorial & legal pages (`/about`, `/affiliate-disclosure`, `/privacy-policy`, `/terms`, or custom pages).
   - Custom slug generator, SEO titles, meta descriptions, and publication status.
4. **Homepage Sections (`/admin/homepage`)**:
   - Visual editor for hero slides, material showcases, featured product carousels, and section ordering.
5. **Brand & Global Settings (`/admin/settings`)**:
   - Brand identity, contact info, Google Analytics & Meta Pixel tracking IDs, default OpenGraph tags.


---

## 🎨 Design System & Palette

| Token | Hex | Role |
|---|---|---|
| **Warm Ivory** | `#F7F4EE` | Organic canvas background, gentle on the eyes |
| **Deep Forest** | `#26382E` | Deep botanical green for headers, accents, buttons |
| **Natural Sand** | `#D8C6A8` | Warm neutral accent, card borders, badges |
| **Clay** | `#A76D52` | Earthy terracotta for active highlights, CTAs, tags |
| **Charcoal** | `#252525` | High-contrast editorial typography |
| **White** | `#FFFFFF` | Crisp card backgrounds & inputs |

Typography:
- **Headings**: Cormorant Garamond / Playfair Display (editorial, timeless, craft-centered)
- **Body**: DM Sans / Inter (clean, accessible, high legibility)

---

## ⚡ Key Features

- **Dynamic Homepage CMS**: Manage hero carousel slides, material headlines, featured products, about narrative, and section ordering without code deployments.
- **Curated Amazon Affiliate Engine**:
  - Encapsulated in `AmazonProductService`.
  - Automatic ASIN validation (10 alphanumeric uppercase characters).
  - Compliant affiliate URL construction with configured Associate tag (`vietcraft-20`).
  - FTC 16 CFR Part 255 compliance: Disclosures on every product card, detail page, and site footer.
  - Safe outbound link handling (`rel="nofollow sponsored noopener noreferrer"`).
  - Outbound click tracking with anonymized IP hashing.
- **Unified Search**: Multi-index search across post titles, excerpts, tags, and product descriptions with filter tabs.
- **Role-Based Admin CMS**:
  - Secure authentication with bcrypt password hashing and JWT access + refresh tokens.
  - Role authorization (Admin & Editor).
  - Rich text article editor with slug generation and reading time calculation.
  - Product editor with image manager, dimensions, and Amazon ASIN validation.
  - Newsletter subscriber manager with one-click CSV export.
  - Affiliate click analytics showing popular products.
- **SEO Ready**: Dynamic meta titles, descriptions, OpenGraph tags, canonical links, sitemap.xml, robots.txt, and JSON-LD structured data (Article, Product, Breadcrumb).

---

## 🚀 Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Seed Database
The application includes realistic sample data (6 materials, 8 categories, 14 curated products with valid ASINs, 13 rich editorial articles, homepage settings, and initial admin account):
```bash
npm run seed
```

### 4. Start Development Servers
Run the whole full-stack system concurrently:
```bash
npm run dev:api    # Starts REST API on http://localhost:5000
npm run dev:web    # Starts Public Storefront on http://localhost:5173
npm run dev:admin  # Starts Admin CMS on http://localhost:5174
```

---

## 🔑 Seed Data & Admin Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@vietcraft.com` | `AdminSecurePassword123!` |

*(Can also be customized via `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` in `.env`)*

---

## 🧪 Running Tests

VietCraft includes automated integration tests (Supertest + Vitest) and frontend tests (React Testing Library):

```bash
# Run all workspace test suites
npm test

# Run API & E2E integration test suite
npm run test --workspace=@vietcraft/api

# Run Public Web component test suite
npm run test --workspace=@vietcraft/web
```

---

## 🐳 Docker Deployment

To launch MongoDB, API, Public Website, and Admin CMS in isolated containers:

```bash
docker-compose up -d --build
```

- Public Web: `http://localhost:5173`
- Admin CMS: `http://localhost:5174`
- REST API: `http://localhost:5000`

---

## ⚖️ Amazon Affiliate Compliance

VietCraft operates in strict compliance with the **Amazon Associates Program Operating Agreement** and **FTC Endorsement Guides**:
- No invented prices, fake reviews, or artificial ratings.
- Prices are timestamped according to the latest check date.
- Clear disclosure notice on all pages earning affiliate commissions.

---

## 📚 Documentation Links
- [System Architecture](docs/architecture.md)
- [REST API Specification](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Production Security Checklist](docs/security-checklist.md)
- [Database Backup Strategy](docs/backup-strategy.md)
