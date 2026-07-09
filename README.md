# Music Shop Online

Music Shop Online is a Next.js storefront and backoffice frontend for a musical instrument shop. It currently runs against a browser-side demo store, but the domain model and UI flows are structured to be replaced by a real backend API without changing product behavior.

The app includes:

- a localized sign-in experience for staff and clients
- a protected staff workspace for dashboard, catalog, inventory, orders, and customers
- a client portal for personal orders, repair requests, and self-service browsing
- shared business settings, media handling, and typed domain entities already modeled in the frontend

The backend handoff document lives in [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md).

## Tech Stack

- Next.js 15 with App Router
- React 18 and TypeScript
- `next-intl` for locale routing and translations
- React Context for app state and session handling
- Zod for form validation
- `next-themes` for light/dark theme switching
- Radix UI primitives through `shadcn/ui` components
- `sonner` for toast notifications
- Shared visual system in `src/app/globals.css`

## Quick Start

```bash
git clone <repository-url>
cd music-shop-fe
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Application Model

- Locales: `ru`, `en`, `uz`
- Default locale: `ru`
- Default entry: `/ru/login`
- Protected routes redirect unauthenticated users to `/{locale}/login?next=...`
- Theme switching is available in the login screen and protected shells
- Currency defaults to `UZS`
- UI translations live in `src/messages/*.json`
- Current persistence is browser-side via `localStorage`

## Demo Sign-In

The current login flow is intentionally demo-oriented.

- Staff login: use one of `admin`, `store_manager`, `catalog_manager`, `sales_operator`
- Staff password: `Secret!1`
- Client login: use an active customer email from the seeded data
- Client password: use the same email value

These credentials are frontend-only placeholders and should be replaced by real backend authentication.

## Routes and Experiences

Current locale-scoped routes:

- `/{locale}/login`
- `/{locale}`
- `/{locale}/catalog`
- `/{locale}/inventory`
- `/{locale}/orders`
- `/{locale}/customers`
- `/{locale}/repairs`

Route behavior depends on session role:

- Staff users currently see dashboard, catalog, inventory, orders, and customers
- Client users see a client portal on the same protected route shell, including client orders and repairs
- `catalog` already groups products, categories, brands, and media inside tabbed UI
- `repairs` is currently mounted as a client-facing route

Modeled but not yet mounted as standalone App Router pages:

- employees
- finance
- settings

Those domains already exist in the frontend code and are part of the planned backend contract.

## Main Modules

- Auth: locale-aware sign-in with staff and client access
- Dashboard: revenue snapshot, low stock, order pipeline, featured products, recent activity
- Catalog: products, categories, brands, pricing, stock, specs, and product media
- Inventory: stock adjustments, low-stock awareness, movement history
- Orders: order queue, totals, payment state, status transitions
- Customers: customer records tied to operational workflows
- Repairs: repair intake and repair status visibility
- Client portal: client home, product browsing, order creation, repair request submission, personal order and repair history
- Shared business settings: currency, threshold, default product status, markup
- Employees and finance: already modeled in feature code for future exposure

## Project Structure

```text
music-shop-fe/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (protected)/     # Auth-protected staff/client routes
│   │   │   └── login/           # Locale-aware sign-in page
│   │   ├── globals.css          # Global theme, layout, and UI tokens
│   │   ├── layout.tsx           # Root HTML shell and font setup
│   │   └── page.tsx             # Redirect to default locale
│   ├── components/
│   │   ├── layout/              # Auth guard, shells, role routing
│   │   ├── shared/              # Shared app-level UI helpers
│   │   ├── theme/               # Theme provider and toggles
│   │   └── ui/                  # shadcn-derived UI primitives
│   ├── features/
│   │   ├── auth/
│   │   ├── brands/
│   │   ├── catalog/
│   │   ├── categories/
│   │   ├── client/
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── finance/
│   │   ├── inventory/
│   │   ├── media/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── shared/
│   ├── i18n.ts                  # Locale configuration
│   ├── lib/                     # Utilities and translation helpers
│   ├── messages/
│   │   ├── en.json
│   │   ├── ru.json
│   │   └── uz.json
│   ├── store/
│   │   ├── music-store-domain.ts
│   │   ├── music-store.tsx
│   │   └── seed.ts
│   └── types/
│       └── music.ts
├── public/
│   └── products/
├── BACKEND_CONTRACT.md
├── components.json
├── Dockerfile
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Backend Integration Direction

The current frontend store already defines the behavior a backend needs to support:

- session-aware auth for staff and clients
- CRUD for categories, brands, customers, employees, and products
- stock adjustments and inventory movement history
- order creation and order status transitions
- repair request creation and repair status tracking
- business settings updates
- product media attachment and primary image selection

The recommended API contract, enums, payload keys, validation rules, and Scala DTO mapping are documented in [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md).

## UI Notes

- The app uses a custom visual system from `src/app/globals.css`
- Navigation supports locale switching and theme switching in protected shells
- Shared controls come from `shadcn/ui`-style components in `src/components/ui`
- Notifications are shown through `sonner`
- The client and staff experiences reuse the same domain store with role-aware shells

## Demo Assets

- Product media is served from `public/products/`
- Seeded assets include `fender-player-stratocaster.jpg`, `yamaha-p125.jpg`, `roland-spd-sx.jpg`, and `shure-sm7b.jpg`

## Docker

```bash
docker build -t music-shop-fe .
docker run -p 3000:3000 music-shop-fe
```

## Notes

- The app currently works without a backend because all state is demo-persisted in the browser
- The intended next step is to replace the local store actions with real API calls while preserving the current domain model and UI behavior
