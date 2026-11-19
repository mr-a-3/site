# Testing and preview

Run the smallest relevant check. Do not run every integration script for a visual edit.

| Change | Check |
| --- | --- |
| CSS/HTML | Browser at phone + desktop sizes; light/dark; overflow |
| Hero TSX | `npm run build:editorial` + `node node_modules/typescript/bin/tsc --noEmit` |
| Public JS | `node --check client/admin.js` or changed JS file; browser interaction |
| Discounts | `node scripts/check-discount.mjs`; temporarily writes then restores settings |
| Admin/API | `node tests/admin.integration.mjs`; MUTATES local config and uploads an image |
| Business records | `node scripts/check-records.mjs`; CREATES temporary records; requires cleanup |
| Release build | `npm run build` |

Read integration scripts before running. `check-records.mjs` writes exact-ID cleanup SQL to `D:/site/storefront/logs/order-test-cleanup.sql`; apply only that generated cleanup after verifying it targets test IDs. Never delete real records for testing.

Start: add `D:/site/tooling` to PATH, then `npm run dev` in `D:/site/storefront`. Store/admin run on 127.0.0.1:5173.

With the local store running, use `npm run test:headphones-preview` to open the separate, read-only Studio headphones test at `http://127.0.0.1:5186/#collection`. It serves three colours with two tinted photo crops per colour from memory. It does not write to the catalog.
Optional phone proxy: `node scripts/phone-preview.mjs <computer-WiFi-IPv4>`; requires main server, listens on port 5174, exposes only storefront/media/static assets.

Backups: `D:/site/backups/form-before-editorial-2026-10-30` contains the earlier source and local data. Preserve it.

`node scripts/check-checkout.mjs`: writes a temporary customer COD order, checks server totals/idempotency/tracking/owner transitions, then removes only that verification UUID/name. Uses current saved config; requires local server and local owner cookie. Does not edit settings.

Start Store.cmd runs scripts/start-store.mjs: clears the saved stop preference, starts/reuses the hidden automatic supervisor, and waits for localhost. The supervisor maintains both localhost and the current Wi-Fi phone link. LAN checkout uses getRandomValues UUID fallback for HTTP contexts.

Windows startup is disabled. Start Store launches the background supervisor manually for the current Windows session. Logs are in logs/automatic-start.log.
node scripts/check-wallets.mjs tests payment request validation and payment snapshots using mocked storage; it does not change settings or orders. check-checkout.mjs still verifies the live local COD flow and cleans up its exact verification order.
Security regression commands: node scripts/check-security.mjs (in-memory database only), node scripts/check-wallets.mjs (mock storage), node scripts/check-security-live.mjs (invalid/read-only requests; no saved mutations). Live tests expect the current LAN address in PHONE-LINK.txt. check-checkout.mjs creates and cleans up only its verification order. Do not run legacy admin.integration.mjs casually: it changes settings and uploads media. Review report: docs/reviews/security-2026-10-31.md.

## Computer start/stop controls

- `D:/site/Stop Store.cmd` runs `scripts/stop-store.ps1`. It first writes `.store-stopped`, verifies the store's Node listeners on ports 5173–5175 and their process identities, then stops only those store processes and their Node/workerd children. It does not stop unrelated Node apps or touch saved records/media.
- `D:/site/Start Store.cmd` clears only that marker and starts/reuses the hidden automatic supervisor. A file watcher resumes it promptly if it was started while paused. Both previews run in the background, independent of the launcher's window.
- The stopped preference persists across Windows sign-in/reboot until Start Store is run. The store starts only when launched manually.
- `.store-stopped` is a local ignored file; never delete it casually to bypass the user's stop preference.
- Verified a real stop, automatic startup while stopped, and start cycle. Both localhost and LAN previews were restored after the check. Existing `.wrangler/state`, backups and saved store data were preserved.
Phone privacy: .phone-access-key is a local ignored secret. PHONE-LINK.txt contains the private phone URL. The LAN proxy requires its access token or an HttpOnly SameSite=Strict cookie before serving any page/asset/API. Normal Wi-Fi visits return 403. PC localhost is unchanged. Share Store.cmd enables normal Wi-Fi visits via .phone-sharing; Private Store.cmd disables sharing and rotates the key, revoking all old phone links/cookies. The owner must reopen the fresh PHONE-LINK.txt link after revocation. Keep the link private: it grants access to whoever has it. This preview uses local HTTP, not an encrypted public deployment.
Offers: node scripts/check-offers.mjs validates category scope, real discount maximum, availability, enable switch and schedule boundaries without writes. Browser checks confirmed banner filtering/reset, mobile popup shopping, dismissal/session persistence, admin controls and no overflow. Popup checks used a temporary loopback fixture; saved product prices and promotion settings were not changed. Admin API rejects invalid schedule/category inputs.

Customer accounts: node scripts/check-customer-accounts.mjs [--phone] creates a unique example.invalid account and pending reviews, tests signup/signin/signout/session revocation/anonymous rejection/name binding/CSRF, then removes only that exact email+name account ID and its matching review bodies. No review is published. --phone uses the private phone key internally without printing it, and confirms admin remains blocked. scripts/check-reviews.cjs tests moderation in memory only.
Gallery: node scripts/check-gallery.mjs is schema-only. node scripts/serve-gallery-check.mjs serves a temporary read-only loopback fixture on 5186 with four crops of the first cover; it does not save settings and blocks writes. Stop it after browser verification. Current review and cleanup report: docs/reviews/gallery-security-cleanup-2026-11-02.md.
