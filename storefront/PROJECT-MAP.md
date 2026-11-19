# Project map

Start here. Choose one feature guide and read only the files needed for that task.

| Area | Guide | Main source |
| --- | --- | --- |
| Design / layout | [Design](docs/features/design.md) | `public/design-tokens.css`, `public/clean.css` |
| Products / discounts / bag | [Products](docs/features/products.md) | `client/app.js`, `lib/store-config.ts` |
| Admin panel | [Admin](docs/features/admin.md) | `client/admin.js`, `public/admin.css` |
| Animation / hero | [Animation](docs/features/animation.md) | `editorial/` |
| Login / protection | [Login](docs/features/login.md) | `lib/store-server.ts`, `app/admin/route.ts` |
| Contact / WhatsApp / social | [Contacts](docs/features/contacts.md) | `client/experience.js`, `public/contact.css` |
| Purchases / sales / storage | [Records](docs/features/records.md) | `app/api/orders/route.ts`, `db/schema.ts` |
| Testing / local preview | [Testing](docs/features/testing.md) | `tests/`, `scripts/check-*.mjs` |

## How the site fits together

- Storefront: `app/route.ts` reads saved settings and serves `data/storefront-html.ts`.
- Store scripts: `client/content.js` applies saved text; `client/app.js` handles shopping; `client/experience.js` handles theme, guest options and contacts.
- Hero: `editorial/entry.tsx` replaces the original hero with React components.
- Admin: `app/admin/route.ts` protects `data/admin-html.ts`; `/api/settings` saves configuration.
- Database: D1 stores settings, owner identity and business records. R2 stores uploaded photos.

## Current state

Local work in `D:/site/storefront`. Store: `http://127.0.0.1:5173/`; admin: `/admin`.
BDT is the default. Company name and contacts come from saved settings, not hardcoded defaults.
Bangladesh guest COD checkout creates customer orders. Delivery settings and Customer orders are in admin. Customer email/password accounts are connected. Google sign-in, password-reset email, courier booking and automatic online payments are not connected.
Business purchase/sales records are entered manually in admin.

## Quick commands

```powershell
$env:PATH='D:/site/tooling;'+$env:PATH
npm run dev
npm run build:editorial
node node_modules/typescript/bin/tsc --noEmit
```

`editorial/` changes need `build:editorial` then refresh; the separate hero bundle does not live-reload from source.
Use the feature guides for checks with database side effects.
Manual bKash/Nagad payments are supported via Delivery settings (personal Send Money or merchant Payment). Transaction IDs require owner verification; automatic payment gateways remain unconnected.
Local security and header-scroll review: docs/reviews/security-2026-10-31.md. Request parsing: lib/request-security.ts; public throttling: lib/public-rate-limit.ts; LAN per-peer limiter: scripts/preview-rate-limit.mjs.
Computer controls: D:/site/Start Store.cmd and D:/site/Stop Store.cmd. Start launches the store manually. Stop shuts it down and saves the stopped preference. See docs/features/testing.md.
Private phone preview: storefront/PHONE-LINK.txt contains the secret link for your phone. Share Store.cmd allows normal Wi-Fi visitors; Private Store.cmd revokes shared access and rotates the phone key. PC localhost is unchanged. Never print or commit .phone-access-key or the secret link.
Promotions: Admin → Offers. Source client/offers-state.js (eligibility), client/offers.js (banner/popup/filter), public/clean.css (appearance). Test scripts/check-offers.mjs is read-only.
Product galleries: client/admin-gallery.js (four photo slots), client/product-gallery.js (detail thumbnails/swipe/keyboard), schema image + images[0–3]. Gallery guide/tests: docs/features/products.md.
Cleanup: D:/site/README.md describes active folders. Retired source/assets and old exports are recoverable in D:/site/archive/2026-11-02-cleanup; manifests record original paths. Existing backups and .wrangler/state remain intact.
Latest verification/security/cleanup report: docs/reviews/gallery-security-cleanup-2026-11-02.md. Production audit has no known vulnerabilities; 16 moderate development-only lint advisories remain.
