<div align="center">

  <img src="public/og-image.jpg" alt="Ethereal Wear - Luxury Fashion House" width="100%" style="border-radius: 12px; margin-bottom: 24px;" />

  # ✧ E T H E R E A L &nbsp; W E A R ✧
  ### *Haute Couture Minimalism & Modern Luxury E-Commerce*

  <p align="center">
    <strong>A state-of-the-art luxury fashion house built on Next.js 16 App Router, React 19, Tailwind CSS v4, and Framer Motion.</strong>
  </p>

  <p align="center">
    <a href="#-key-features">Features</a> •
    <a href="#-architecture--tech-stack">Tech Stack</a> •
    <a href="#-performance--cinematic-ux">Performance</a> •
    <a href="#-technical-seo--rich-snippets">SEO & Open Graph</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-database-schema">Database</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16_App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Prisma-7.9_PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
</div>

---

## ✦ Overview

**Ethereal Wear** is an avant-garde digital flagship store created for the modern connoisseur. Combining magazine-grade editorial aesthetics with lightning-fast performance, this platform showcases fluid scroll-linked micro-interactions, dynamic blur-up image materialization, automated free shipping thresholds, real-time stock matrix management, and bank-grade checkout security.

---

## ✦ Key Features

### 🏛️ Editorial & Cinematic User Experience
- **Gliding Page Transitions (`app/template.tsx`)**: Re-triggers deliberate, heavy-momentum easing curves (`cubic-bezier(0.16, 1, 0.3, 1)`) on route changes to evoke turning high-fashion glossy magazine pages.
- **Hero Parallax Carousel (`HeroSlideshow.tsx`)**: Scroll-linked parallax zoom, subtle filmic vignette scrims, and multi-slide background cross-fading.
- **Dynamic Blur-Up Imagery (`lib/imageUtils.ts` + `OptimizedImage.tsx`)**: Remote PostgreSQL images are pre-computed server-side with `sharp` and `plaiceholder` for zero Layout Shift (CLS) and smooth cross-fade materialization.
- **Hardware-Accelerated Cart Drawer (`CartDrawer.tsx`)**: GPU-accelerated slide-over bag with real-time currency calculation and threshold progress indicators.
- **Interactive Quick View Modal (`QuickViewModal.tsx`)**: Spring-free modal transitions with multi-size inventory selection and instant cart dispatch.

---

### 🛍️ E-Commerce & Checkout Engine
- **Dynamic Free Shipping Threshold**: Parsed in real-time from the announcement marquee configured in `/admin/settings` (e.g. *Orders under Rs. 1,000 incur standard shipping; orders above unlock Free Express*).
- **Customizable Standard Shipping Fee**: Configurable in admin settings with dynamic live checkout preview.
- **Credit Card Brand Detection**: Instant card brand badge illumination (Visa, Mastercard, Amex, Discover) with luhn/expiry/cvc validation via Zod.
- **Authorize.Net SDK Integration**: Robust payment gateway processing with customer billing profiles and order reconciliation.
- **Real-Time Stock & Size Matrix**: Checks per-size stock (`XS`, `S`, `M`, `L`, `XL`) upon checkout and atomically decrements inventory in PostgreSQL.

---

### 👑 Comprehensive Admin Control Suite (`/admin`)
- **Marquee & Banner Management**: Modify announcement ticker text with instant live header preview.
- **Multi-Slide Hero Carousel Builder**: Upload unlimited campaign slides with drag-and-drop ordering and instant image previews.
- **Live Inventory & Product Studio**: Create, edit, feature, and discount products with size-by-size inventory breakdown.
- **Shipping Rates Control**: Real-time standard shipping fee adjustment.
- **Highlight Collections & Customer Reviews**: Rich text description editor with background color pickers.

---

## ✦ Technical SEO & Open Graph Architecture

| Feature | Implementation | Purpose |
| :--- | :--- | :--- |
| **Global Open Graph** | [`app/layout.tsx`](app/layout.tsx) | Generates `1200x630` high-res editorial previews for iMessage, Slack, Discord, Twitter, and ChatGPT |
| **Dynamic Product SEO** | [`app/product/[id]/page.tsx`](app/product/[id]/page.tsx) | Fetches metadata per item and overrides OG image with the specific garment's editorial photo |
| **JSON-LD Schema.org** | [`app/product/[id]/page.tsx`](app/product/[id]/page.tsx) | Structured data for Google Search Rich Product Snippets (price, stock, SKU, ratings) |
| **Dynamic XML Sitemap** | [`app/sitemap.ts`](app/sitemap.ts) | Maps static routes + dynamically iterates database products with `lastModified` dates |
| **Robots.txt Directives** | [`app/robots.ts`](app/robots.ts) | Allows public indexing while disallowing `/admin`, `/checkout`, `/api`, and `/auth` |
| **PWA Web Manifest** | [`app/manifest.ts`](app/manifest.ts) | PWA installation descriptor with gold monogram app icons |

---

## ✦ Architecture & Tech Stack

```
ethereal-wear/
├── app/
│   ├── layout.tsx                # Root layout, fonts, and global OG metadata
│   ├── template.tsx              # Cinematic route transition wrapper
│   ├── page.tsx                  # Flagship homepage with editorial galleries
│   ├── sitemap.ts                # Dynamic XML sitemap generator
│   ├── robots.ts                 # Crawler access directives
│   ├── manifest.ts               # PWA Web App manifest
│   ├── icon.png                  # Monogram browser tab favicon
│   ├── apple-icon.png            # iOS Home screen touch icon
│   ├── opengraph-image.png       # 1200x630 social card fallback
│   ├── shop/                     # Filterable archive with category/price sort
│   ├── product/[id]/             # Dynamic PDP with JSON-LD & gallery
│   ├── checkout/                 # Secure checkout & Authorize.Net payment
│   ├── account/                  # Customer profile & past order tracking
│   ├── admin/                    # Store management, products & settings
│   └── api/                      # REST endpoints for orders, products & settings
├── components/
│   ├── Header.tsx                # Sticky luxury nav with announcement marquee
│   ├── HeroSlideshow.tsx         # Scroll-linked parallax hero carousel
│   ├── ProductCard.tsx           # Editorial product card with hover angles
│   ├── ProductGallery.tsx        # High-res photo gallery with blur-up
│   ├── CartDrawer.tsx            # Slide-over shopping bag with threshold tracker
│   ├── QuickViewModal.tsx        # Instant item inspection modal
│   └── OptimizedImage.tsx        # Framer Motion cross-fade image wrapper
├── lib/
│   ├── prisma.ts                 # Singleton Prisma client with pg adapter
│   ├── shippingUtils.ts          # Free shipping threshold regex parser
│   ├── imageUtils.ts             # Sharp & Plaiceholder blur data generator
│   └── auth.ts                   # NextAuth credentials & session handler
├── prisma/
│   └── schema.prisma             # PostgreSQL schema (Products, Orders, Settings)
└── server/
    └── services/                 # Decoupled server services for products & settings
```

---

## ✦ Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **PostgreSQL**: Local instance or cloud database (Neon, Supabase, AWS RDS)

### 2. Installation
```bash
git clone https://github.com/your-username/ethereal-wear.git
cd ethereal-wear
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ethereal_wear?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-jwt-key"
NEXTAUTH_URL="http://localhost:3000"

# Public URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Authorize.Net (Optional for mock/sandbox payment)
AUTHORIZENET_API_LOGIN_ID="your-login-id"
AUTHORIZENET_TRANSACTION_KEY="your-transaction-key"
```

### 4. Database Setup
```bash
# Push schema changes to your database
npx prisma db push

# Generate fresh Prisma Client types
npx prisma generate

# (Optional) Seed demo products
npm run seed
```

### 5. Launch Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✦ Database Schema Summary

```prisma
model Product {
  id             String      @id @default(cuid())
  name           String
  description    String
  price          Float
  imageUrl       String
  hoverImageUrl  String?
  category       String
  stock          Int         @default(0)
  sizeStock      Json?       // {"XS": 10, "S": 15, "M": 20, "L": 10, "XL": 5}
  images         String[]    @default([])
  sku            String?
  isFeatured     Boolean     @default(false)
  isOnSale       Boolean     @default(false)
  salePercentage Int?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model StoreSettings {
  id             String      @id @default("global")
  topBannerText  String      @default("FREE SHIPPING ON ALL ORDERS OVER RS. 1000")
  shippingFee    Float       @default(500)
  heroHeading    String      @default("Timeless Forms & Sculptural Silhouettes")
  heroSubheading String      @default("High-end minimalist craftsmanship made for the discerning connoisseur.")
  heroButtonText String      @default("EXPLORE THE ARCHIVE")
  heroButtonLink String      @default("/shop")
  heroImage      String      @default("/hero_luxury.jpg")
  categories     String?     // JSON string
  highlights     String?     // JSON string
  reviews        String?     // JSON string
  updatedAt      DateTime    @updatedAt
}
```

---

## ✦ License & Credits

Crafted with passion for **Ethereal Wear** Haute Couture Atelier. Distributed under the MIT License.
