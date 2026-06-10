# Music Instruments Backoffice

Operational admin panel demo for a musical instruments retailer, built as a `Next.js` backoffice with a browser-only client data layer.

## What is included

- Protected internal shell with mock login roles
- Dashboard, catalog, categories, brands, inventory, orders, customers, employees, finance, settings, and media modules
- `RU` and `EN` route-level localization structure
- Local persistence via `localStorage` for frontend-only demo state

## Run

Use a machine with Node.js and `pnpm` installed, then:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`, then sign in as one of the mock roles from the login screen.

## Demo behavior

- All CRUD and status changes run through the in-app frontend store in `src/data/store.tsx`
- Demo data resets from the sidebar action
- State persists between reloads through browser storage
