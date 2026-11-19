# Login and protection

Scope: owner access and customer login status.

- `lib/store-server.ts`: `isAdmin`, stable owner binding, `sameOrigin`, HTML/JSON response helpers.
- `app/admin/route.ts`: unauthorized redirect/403 before panel HTML.
- `app/chatgpt-auth.ts`: starter identity integration.
- `app/api/settings/route.ts`, `upload/route.ts`, `orders/route.ts`: enforce owner access on the server.
- `client/experience.js`: customer account dialog and optional guest preview.

Admin uses the store owner's ChatGPT identity. Loopback development has a local test identity; preserve its development-only restriction.
Customer email/password accounts now use Better Auth 1.7.15 with native D1 storage. Google sign-in, email verification and password-reset email are not connected. The UI only offers working email/password signup, signin and signout. Customer accounts never grant admin access.
Do not confuse frontend hiding with authorization. Maintain origin checks for writes and server validation/pricing.

Phone preview on port 5174 excludes admin and owner APIs. It forwards only allowlisted customer auth endpoints and store_customer.* cookies for accounts/reviews; it never forwards owner cookies. Keep owner tools on localhost.

Check: anonymous denied, correct owner allowed, cross-origin write denied. Do not log credentials.

Service API keys belong in Worker secret bindings. For local development, use the ignored `.dev.vars` file. Read the binding only in the server route that calls the provider. Return the data the storefront needs and require owner authorization for owner-only operations. Vite's browser environment prefix is disabled. Never put private keys in storefront settings, public assets, or source files. If a key was exposed, revoke or rotate it with the provider.

Workers AI chat uses `POST /api/chat` with JSON `{"message":"..."}`. Sign in as the owner and call it from the same store origin. It returns `{"reply":"..."}`. The Worker uses its `AI` binding, so no API token goes in the request or frontend. Requests are limited to four per minute and 40 per UTC day across the store. The normal local preview returns 503 for valid owner requests. To test live inference locally, sign in with Wrangler and start the local server with `$env:STORE_WORKERS_AI = '1'` set in that shell. Inference runs on Cloudflare and uses the account quota. The build includes the binding. Before deploying, use a trusted identity gateway that strips client-supplied identity headers.

Browser script sources live in `client/`. Vite bundles the storefront at `/storefront.js` and serves the admin bundle at `/admin/script.js` after owner authentication. Both bundles omit source maps. The local server blocks direct source and private file requests. The phone preview uses an explicit list of storefront assets and strips query parameters before forwarding requests. Storefront HTML includes the product and delivery information needed by the browser.
Security hardening: body streaming/type limits, nonce-based CSP/security headers, explicit loopback dev binding and production rejection of the local test identity. Read docs/reviews/security-2026-10-31.md before any public deployment; self-hosting needs a verified identity gateway rather than trusting raw identity headers.

Customer auth: lib/customer-auth.ts, app/api/customer-auth/[...all]/route.ts and client/customer-account.js. Better Auth uses separate customer_auth_* tables and signed HttpOnly cookies; anonymous review writes are rejected on the server and review names/customer IDs come from the session. Guest checkout remains unchanged. Local-only signing key is generated and stored in customer_auth_config; production requires BETTER_AUTH_SECRET and HTTPS BETTER_AUTH_URL bindings. Auth tables migrate additively. No cookie cache; signout revokes the DB session. Origin checks, request byte limits and persistent rate limits wrap auth routes. Do not expose the local signing key or cookies.
