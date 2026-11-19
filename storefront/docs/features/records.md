# Purchases, sales and data

Scope: manual business records, database, settings/media persistence.

- `app/api/orders/route.ts`: owner-only record listing, creation and status updates.
- `client/admin.js`: `renderOrders`, `drawOrders`, new-record form and status buttons.
- `db/schema.ts`: `storeSettings`, `storeAdmin`, `storeOrders`.
- `drizzle/*.sql`, `drizzle/meta/_journal.json`: migrations.
- `lib/store-server.ts`: DB binding, defaults and saved-settings parsing.
- `app/media/[key]/route.ts`: uploaded media serving.

Despite the internal `/api/orders` name, these are MANUAL BUSINESS RECORDS, not customer checkout orders.
`record_type`: purchase or sale. Purchases use entered unit cost; sales use server-side current product prices. Snapshot product name, price, quantity and currency at creation.
Statuses: pending, confirmed, sold (UI: Completed), cancelled. Only completed records count in totals, grouped by the current currency. Amounts are integer minor units (100 per BDT).
No stock adjustment, payment processing or profit accounting is implemented.

Keep schema, migrations and journal consistent. Preserve `.wrangler/state`: it contains local settings, business records and uploaded files.

## Bangladesh customer orders
`app/api/customer-orders/route.ts` is separate from manual business records. Public POST actions: quote, place, track (UUID + normalized BD phone). GET/PATCH require owner. `lib/delivery-config.ts` stores editable district-zone fees, weight surcharge, free-delivery threshold, disabled districts, COD and availability. `client/checkout.js` renders guest COD checkout; `public/checkout.css` styles it. Default store rates: Dhaka district 80, Gazipur/Narayanganj 100, other districts 130 BDT, first 1kg included then 20 per started extra kg. Store rates, not courier quotes. Product `weightKg` defaults to 0.5.

Customer orders snapshot prices/colors, compute money on server, validate expected total, enforce one product line per ID, deduplicate request keys and cap five orders/phone/hour. A single conditional INSERT checks stock reservations atomically. Pending/confirmed/shipped/delivered/refunded consume the configured stock ceiling; cancelled/returned release reservations. This inventory model is separate from manual business records; do not also deduct stock for the same customer sale. Null stock allows orders without a quantity limit beyond 20 per order.

States: pending → confirmed/cancelled; confirmed → shipped/cancelled; shipped → delivered/returned; delivered → refunded. Closed states cannot reopen. Refund is a full-record bookkeeping status; no payment is sent. Courier booking is manual in the merchant account; save courier/tracking in admin. Delivered customer products contribute to Overview sales; delivery fees are excluded from product revenue. List shows latest 2000 orders.

Schema: drizzle/0003_customer_orders.sql + db/schema.ts. Runtime also initializes this table/index for existing local checkouts. Phone proxy forwards only public POST customer-orders/analytics (no cookies or admin APIs), validates LAN Origin, limits request size.

Verification: scripts/check-checkout.mjs creates one temporary verification order and finally deletes only its exact UUID/name using the local database path. It checks pricing, tampering, duplicates, tracking privacy, authorization and status transitions.

Checkout area selection: public/bd-upazilas.json bundles bilingual district-linked upazilas, with provenance in data/geography/README.md. District changes reset the area; Other thana / area allows city addresses. Server validates district membership for listed areas.
Manual bKash/Nagad: delivery.bkash and delivery.nagad each have enabled, number and accountType (personal/merchant). Defaults disabled with blank numbers; saved contacts are never reused automatically. Checkout instructs Send Money for personal, Merchant Payment for merchant, and collects a transaction ID. Server snapshots method/number/accountType/reference/status in customer_orders.payment JSON; default {} keeps historical COD records compatible. Manual payments start unverified, owner-only verification is independent of order status, and confirmation/shipping requires verification. Same-provider reference reuse is guarded within the atomic insert. No gateway call or money transfer occurs. Migration 0004 and runtime column detection preserve existing orders.
Security review adds persistent request_limits counters (migration 0005), streamed API body limits, public throttling and strict missing-colour rejection. Customer updates compare status/payment/updated_at atomically and optional expectedUpdatedAt from admin prevents stale-screen overwrites. Phone proxy supplies per-socket-peer limits; no personal data or raw IP is stored in backend counters.
