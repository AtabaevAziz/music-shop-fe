# Music Shop Online

Music Shop Online is a Next.js storefront and backoffice frontend for a musical instrument shop. The app is wired to a backend API and active workflows no longer use browser-side demo persistence.

The app includes:

- a localized sign-in experience for admins and clients
- a protected admin workspace for dashboard, catalog, inventory, orders, and customers
- a client portal for personal orders, repair requests, and self-service browsing
- shared business settings, media handling, and typed domain entities already modeled in the frontend

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
cp .env.example .env.local
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Required env:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

If the app shows a backend URL configuration error on the login screen, verify that `.env.local` exists and contains `NEXT_PUBLIC_API_BASE_URL` pointing at the running backend.

Local integration checklist:

1. Start the backend first and confirm `http://localhost:8080/api/v1/health` returns `200`.
2. Confirm `http://localhost:8080/api/v1/auth/session` returns `{ "session": null }` before login.
3. Start the frontend on `http://localhost:3000`.
4. Verify backend `.env` contains `CLIENT_ORIGIN=http://localhost:3000` and `SESSION_SECURE_COOKIE=false` for local HTTP development.

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
- Runtime data is loaded from the backend API through typed service clients

## Demo Sign-In

The login flow uses the seeded backend accounts.

- Admin login: `admin`
- Admin password: `Secret!1`
- Client login: use an active customer email from the seeded data
- Client password: use the same email value

These credentials come from the backend seed data.

## Routes and Experiences

Current locale-scoped routes:

- `/{locale}/login`
- `/{locale}`
- `/{locale}/categories`
- `/{locale}/catalog`
- `/{locale}/products/[id]`
- `/{locale}/app`
- `/{locale}/app/catalog`
- `/{locale}/app/inventory`
- `/{locale}/app/orders`
- `/{locale}/app/customers`
- `/{locale}/app/repairs`
- `/{locale}/app/employees`
- `/{locale}/app/finance`
- `/{locale}/app/settings`

Route behavior depends on session role:

- Admin users currently see dashboard, catalog, inventory, orders, customers, employees, finance, and settings
- Client users see a client portal on the same protected route shell, including client orders and repairs
- `catalog` already groups products, categories, brands, and media inside tabbed UI
- `repairs` is currently mounted as a client-facing route

## Main Modules

- Auth: locale-aware sign-in with admin and client access
- Dashboard: revenue snapshot, low stock, order pipeline, featured products, recent activity
- Catalog: products, categories, brands, pricing, stock, specs, and product media
- Inventory: stock adjustments, low-stock awareness, movement history
- Orders: order queue, totals, payment state, status transitions
- Customers: customer records tied to operational workflows
- Repairs: repair intake and repair status visibility
- Client portal: client home, product browsing, order creation, repair request submission, personal order and repair history
- Shared business settings: currency, threshold, default product status, markup
- Employees, finance, and settings: mounted as API-backed backoffice modules

## Project Structure

```text
music-shop-fe/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (protected)/     # Auth-protected admin/client routes
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
│   └── types/
│       └── music.ts
├── public/
│   └── products/
├── components.json
├── Dockerfile
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Backend Integration Direction

The active frontend integration is defined by the current API-backed services and runtime config layer:

- session-aware auth for admins and clients
- CRUD for categories, brands, customers, employees, and products
- stock adjustments and inventory movement history
- order creation and order status transitions
- repair request creation and repair status tracking
- business settings updates
- product media attachment and primary image selection
- locale-aware runtime config for auth, navigation, permissions, workflows, and dictionaries

The source of truth for the integration lives in the typed service clients under `src/services/` and the protected route shells that consume backend runtime config.

## UI Notes

- The app uses a custom visual system from `src/app/globals.css`
- Navigation supports locale switching and theme switching in protected shells
- Shared controls come from `shadcn/ui`-style components in `src/components/ui`
- Notifications are shown through `sonner`
- The client and admin experiences share typed API services and role-aware shells

## Demo Assets

- Product media is served from `public/products/`
- Seeded assets include `fender-player-stratocaster.jpg`, `yamaha-p125.jpg`, `roland-spd-sx.jpg`, and `shure-sm7b.jpg`

## Docker

```bash
docker build -t music-shop-fe .
docker run -p 3000:3000 music-shop-fe
```

## Notes

- The frontend requires a running backend with cookie-based auth and seeded PostgreSQL data
- If protected routes show a backend-unavailable/session-check error, verify backend reachability first with `/api/v1/health`, then confirm `CLIENT_ORIGIN`, cookies, and `NEXT_PUBLIC_API_BASE_URL`.
- Legacy demo-store code may still exist in the repo, but active routes use API-backed queries and mutations
