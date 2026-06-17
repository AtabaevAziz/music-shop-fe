# Music Shop Online

Music Shop Online is a Next.js frontend demo of an online musical instrument store with a browser-side operations backoffice. Catalog, inventory, orders, customers, finance, media, and settings are managed entirely on the client and persisted in browser storage.

## Tech Stack

- Next.js 15 with App Router
- React 18 and TypeScript
- `next-intl` for locale routing and message-based translations
- Client-side state via React Context
- Zod for form validation
- `next/font` for app typography
- `next-themes` for light/dark theme switching
- Radix UI primitives through `shadcn/ui` components
- `sonner` for toast notifications
- Shared visual system in `src/app/globals.css`
- `shadcn/ui` integration via `components.json` and `src/components/ui`

## Quick Start

```bash
git clone <repository-url>
cd music-shop-fe
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Open the repository as a JavaScript/TypeScript project in WebStorm or IntelliJ IDEA. This project does not use Gradle or Android tooling.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm fix
pnpm typecheck
pnpm format
pnpm prepare
```

## Project Structure

High-level project map:

```text
music-shop-fe/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (protected)/     # Auth-protected backoffice pages
│   │   │   └── login/           # Demo sign-in
│   │   ├── globals.css          # Global theme, layout, and UI tokens
│   │   ├── layout.tsx           # Root HTML shell and font setup
│   │   └── page.tsx             # Redirect to default locale
│   ├── i18n.ts                  # next-intl locale configuration
│   ├── messages/
│   │   ├── en.json              # English UI messages
│   │   └── ru.json              # Russian UI messages
│   ├── components/
│   │   ├── layout/              # App shell and auth guard
│   │   ├── shared/              # App-specific shared UI wrappers and helpers
│   │   ├── theme/               # Theme provider and navbar toggle
│   │   └── ui/                  # shadcn-derived UI building blocks
│   ├── features/
│   │   ├── auth/                # Login experience
│   │   ├── dashboard/           # Operational dashboard
│   │   ├── catalog/             # Product catalog CRUD
│   │   ├── inventory/           # Stock operations and thresholds
│   │   ├── orders/              # Order queue and workflow
│   │   ├── finance/             # Revenue and payment visibility
│   │   ├── media/               # Product media workflow
│   │   ├── settings/            # Store settings
│   │   ├── brands/              # Brand management
│   │   ├── categories/          # Category management
│   │   ├── customers/           # Customer records
│   │   ├── employees/           # Staff records
│   │   └── shared/              # Reusable feature-level CRUD building blocks
│   ├── lib/
│   │   ├── translations.ts      # Dynamic label and flash/activity helpers
│   │   └── utils.ts             # Formatting and small utilities
│   ├── store/
│   │   ├── music-store.tsx      # Demo store provider and actions
│   │   └── seed.ts              # Initial in-memory database
│   └── types/
│       └── music.ts             # Domain types
├── public/
│   └── products/                # Seeded product media
├── components.json              # shadcn/ui configuration
├── Dockerfile
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Application Model

- Locales: `ru` and `en`
- Default entry: `/ru/login`
- UI translations are stored in `src/messages/*.json` and consumed via `useTranslations()`
- Protected routes render inside a shared backoffice shell
- Demo sessions are role-based: `admin`, `store_manager`, `catalog_manager`, `sales_operator`
- State persists in `localStorage`

## Main Modules

- Dashboard with revenue, low stock, order pipeline, featured products, and recent activity
- Catalog for products, brands, and categories
- Inventory for stock adjustments, replenishment risk, and movement history
- Orders and customers for store operations
- Employees, finance, media, and settings for internal backoffice workflows

## UI Notes

- The app uses a custom backoffice visual system driven from `src/app/globals.css`
- Light and dark themes are switched from the navbar and provided through `next-themes`
- Most shared controls now come from `shadcn/ui`-style components in `src/components/ui/`
- App-specific wrappers such as shared page headers, form field composition, and flash-to-toast bridging live in `src/components/shared/`
- Dialogs, sheets, dropdowns, tables, selects, and form controls follow Radix-based `shadcn/ui` patterns
- User feedback is shown through toast notifications powered by `sonner`
- `src/components/ui/primitives.tsx` is now limited to small domain-specific helpers instead of being the main UI layer

## Demo Assets

- Product media is served from `public/products/`
- Seeded assets include `fender-player-stratocaster.jpg`, `yamaha-p125.jpg`, `roland-spd-sx.jpg`, and `shure-sm7b.jpg`

## Docker

```bash
docker build -t music-shop-fe .
docker run -p 3000:3000 music-shop-fe
```

## Notes

- This repository is a frontend-only demo and does not require a backend to run
- Documentation should be updated alongside future structural or product-positioning changes
