# Products

Scope: product data, discounts, collection, search, bag.
Gallery: `image` is the existing cover; `images` holds 0–3 additional unique URLs. Defaults preserve older products. `client/admin-gallery.js` renders four editable/uploadable photo slots; Apply to draft + Save changes persists them. `client/product-gallery.js` adds thumbnails, keyboard arrows and phone swipe navigation, and hides controls for a single cover. Additional images do not change the homepage/card cover. `scripts/check-gallery.mjs` is schema-only; `scripts/serve-gallery-check.mjs` provides a loopback read-only four-photo fixture without saving products.
Compact detail view: client/product-page.js and product-page.css enhance the existing product dialog with quantity, always-visible description, written reviews and similar-category products. Story section is removed from served HTML and its controls are omitted from admin; saved story values are retained.
Written reviews: app/api/reviews/route.ts uses a separate product_reviews table. Customer POST requires a valid account session and submits pending reviews with the account name/customer ID; only approved reviews are public, and the product showReviews switch gates list/submission. Admin Reviews can add, edit, approve, or hide reviews; Remove from site is reversible hiding. No verified-buyer claim is made. Approved written review ratings replace the detail summary while loaded; existing manual product statistics remain saved. Tests: node scripts/check-reviews.cjs uses in-memory SQLite only.
Checkout delivery details are mandatory: trimmed full name (2+ characters), valid Bangladesh mobile, district and trimmed full address (8+ characters). Upazila / Area / Zone and Other area are optional; supplied dropdown selections still must belong to the district. Required labels use an asterisk; native validation plus explicit submit checks run before the existing server validation. Wallet payments also require a transaction ID.

- `lib/store-config.ts`: validated product/settings schema.
- `client/app.js`: `renderProducts`, `renderSearch`, `viewProduct`, `renderCart`, `total`, price helpers.
- `client/admin.js`: `openProduct` and product-form submit.
- `editorial/Hero.tsx`: featured products and sale display; `editorial/types.ts`: TypeScript shape.
- `data/default-products.json`: initial seed only. Saved settings override it.

`price` is the original price. Optional `discountPrice` must be lower; blank/null ends a sale. Display original with strike-through, current price and computed % OFF. Use current price for sorting and totals. Preserve zero as a valid price.
The first three products appear in the hero. Never overwrite live saved prices for a visual demonstration without a request.

Check: schema, admin save/reload, card/hero/detail/search, bag totals, sale removal. No real checkout/payment backend yet.

Product statistics: `rating` (0–5, one decimal), `reviewCount`, `soldCount`, `stock` (whole quantity or null/unknown). Admin edits these manually. No reviews means rating/reviews 0. Product details render fractional stars and availability; stock 0 disables the detail add button and all add actions enforce stock limits. These figures are not automatically linked to business records or customer review submissions.

`showReviews` defaults to true. Per-product admin switch hides only stars/review count when false; existing ratings are retained. Sold count and stock remain visible.

Categories: edit the ordered list in Store settings (one per line). Product category selects, mobile navigation, desktop picker and collection filters use this list. Move products before deleting an occupied category. Older settings default to Women, Kids, Men, Home Decor, Kitchen plus existing Tech/Living/Everyday.

Homepage slideshow: per-product `featured` switch selects any number of products in collection order. At least one is required. Old saved settings migrate to the original first three on read; new products start unfeatured. Apply to draft, then Save changes.

Activity: /api/analytics accepts validated product views, detail clicks and color clicks once per browser session/product/kind/color. Views require 50% card visibility. No cookies or personal data are sent; a sessionStorage UUID deduplicates. Activity is approximate, not bot-proof. Owner GET shows aggregates and latest 200 events; owner DELETE clears activity. Table is lazily initialized. Phone-only proxy on 5174 currently blocks analytics POST; use main storefront for tracked activity.

Product details have Add to bag and Buy now. Buy now adds one with existing stock/quantity checks, closes details and starts the same optional account/guest checkout flow. Existing bag items remain. This does not connect payment processing.

Color selection: 44px swatch buttons with visible selection and approximate human-readable color names (nearest palette in app.js). Selections synchronize between collection, details, bag and checkout. Cart persists one selected color per product; choosing another color updates that product in the bag. Actual hex is retained for order validation. These descriptive names do not change admin color values.
Availability wording is now binary: stock 0 is Out of stock; positive or untracked (null) stock is In stock. Null already permits purchases without quantity tracking; no quantity is invented or displayed. Detail colour dots use 34px-wide / 44px-tall buttons with 18px dots to reduce gaps.
Offer eligibility in client/offers-state.js uses actual discountPrice < price, excludes stock 0, applies selected categories and schedule. client/offers.js adds the homepage banner before the collection, a filtered Offers chip and optional dismissible popup once per browser session per offer signature. Normal category selection exits offer filtering. No product prices or stock are changed by promotion controls.
