# Gallery, security and workspace review — 2 November 2026

Local work only. This review combines source checks, browser verification and regression tests; it is not a penetration-test certification.

## Product photos and bug fixes

- Product `image` remains the cover. Optional `images` supports three extra unique images, with the same allowed image URL rules and a maximum of four photos total. Older products retain their cover unchanged.
- Admin → Products → Edit has four photo slots with individual upload, replacement, preview and extra-photo removal. Apply to draft, then Save changes. Removing a reference does not erase an uploaded R2 object.
- Product details have compact thumbnails, photo counter, phone swipes, keyboard navigation, reduced-motion handling and short transitions. The homepage/cards still use the cover.
- A late upload cannot overwrite a newly opened product editor; draft application is blocked while uploads are pending. Upload fields and removal are disabled during their upload.
- Fixed a stale Overview request overwriting the Reviews screen. Product gallery keyboard arrows no longer propagate to background controls.
- Tightened customer signup/signin payload validation and stripped unrelated fields. Names are bounded/trimmed, email is validated and passwords require 10–128 characters. Existing session, origin, byte-limit and rate-limit protections remain.

## Security and dependency findings

- Replaced the obsolete nested esbuild 0.18.20 helper with the existing patched 0.28.2 through a scoped override. The affected development-server origin behavior is described in [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99). Other locked dependency versions were preserved, and Drizzle's configuration check passed.
- Final npm audit: **0 known vulnerabilities in production dependencies**. The full tree retains **16 moderate advisories in development-only ESLint/minimatch tooling**, with no high/critical findings. A forced incompatible major override was not applied. Exact reports: `logs/gallery-security-production-audit.json` and `logs/gallery-security-audit.json`.
- Anonymous/forged owner access, cross-origin writes, malformed/oversized JSON, unsafe image URLs, invalid uploads, invalid prices, excessive gallery length, stale settings saves, stock/price/colour tampering, reused manual payment references and unverified wallet transitions were checked.
- Customer reviews require a valid signed-in session, derive name/customer ID on the server, remain pending until owner approval, and cannot grant admin access. The private phone preview still excludes owner APIs and forwards only allowlisted customer cookies/routes.
- Existing production boundaries remain: public hosting needs HTTPS, production auth secrets/base URL and a trusted owner gateway. Google sign-in, email verification/reset email, courier booking and automatic payment gateway integration are not connected.

## Validation

- TypeScript and the production build passed. Build log: `logs/gallery-security-build.txt` (upstream source-map warnings only).
- `check-gallery.mjs`, `check-security.mjs`, `check-wallets.mjs`, `check-offers.mjs` and `check-reviews.cjs` passed with schema-only/in-memory/mocked storage.
- `check-security-live.mjs`, `check-customer-accounts.mjs --phone` and `check-checkout.mjs` passed after the dependency reinstall and preview restart. Tests removed only their unique temporary account, pending reviews and verification order. Saved settings were checked unchanged.
- Browser checks: four loaded photos, thumbnail selection, keyboard switching, quantity, 375px phone, desktop, dark mode, no horizontal overflow and no console errors. A read-only loopback fixture supplied alternate crops without changing saved product images. The fixture server was stopped afterward.
- PC and private phone previews are running again with automatic startup restored. Original backups, saved prices/contacts/products/accounts/orders/reviews and `.wrangler/state` were preserved.

## File organization

- Archived **80** old screenshots, exports, recovery files, inactive HTML/preview code, unused motion code and unused raster stickers.
- Archived the inactive legacy `D:/site/admin-runtime` copy (**115 files**) after checking runtime processes and confirming it contained no database files.
- Archive: `D:/site/archive/2026-11-02-cleanup/`. `manifest.json` and `legacy-runtime-manifest.json` record original paths/checksums; all **195 moved files** were verified. Historical animation notes are also retained there.
- Current screenshot proof is in `docs/screenshots/`; future test recovery files go under `logs/`. `D:/site/README.md` and `PROJECT-MAP.md` describe the active structure. Build/runtime caches, dependencies, saved uploads and existing backups were retained where required.
