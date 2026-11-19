# Admin panel

Scope: owner interface, forms, editing, save state.
Reviews uses client/admin-reviews.js and /api/reviews. Review changes save immediately with owner authorization. Customer submissions start pending; approved is public, hidden removes from the site reversibly. Removed story section controls and its Images tab are omitted; old saved settings are preserved.

- `app/admin/route.ts`: owner check before serving the panel.
- `data/admin-html.ts`: active admin shell and product dialog.
- `client/admin.js`: sections, form rendering, config drafts, uploads and record UI.
- `public/admin.css`: admin typography, colours and responsive layout.
- `app/api/settings/route.ts`: config read/save with revision conflict protection.
- `app/api/upload/route.ts`: product/story image uploads.

Settings edits need Save changes. Apply to draft closes the product editor but does not persist until Save changes.
Purchase/sales record actions save immediately through their own API.
Hidden storefront text fields and decorative product badge/tagline fields are intentionally omitted from the panel; preserve existing values when saving products.
The inactive `data/admin-source.html` was archived outside the active site; `data/admin-html.ts` remains the served shell.
Gallery uploads target the original editor input and cannot overwrite a different product when an upload finishes late. Applying a product draft is blocked while uploads are pending. Gallery controls are in `client/admin-gallery.js`; normal Save changes retains revision protection.

In Products → Edit, add colours in Colors, then expand the matching swatch under Photos by colour. Each colour has two optional URL or upload slots. Apply to draft, then Save changes. Removing a colour removes its photo assignments when the draft is applied. A colour without assigned photos uses Product photos.

Check: navigation, edit/cancel, save state, revision conflict, narrow-screen forms. See Login and Records for related work.

Categories: edit the ordered list in Store settings (one per line). Product category selects, mobile navigation, desktop picker and collection filters use this list. Move products before deleting an occupied category. Older settings default to Women, Kids, Men, Home Decor, Kitchen plus existing Tech/Living/Everyday.

Homepage slideshow: per-product `featured` switch selects any number of products in collection order. At least one is required. Old saved settings migrate to the original first three on read; new products start unfeatured. Apply to draft, then Save changes.

Overview reads completed/refunded/cancelled sale records plus anonymous browser-session product activity. Buyers group by recorded phone. Full-record refund status is bookkeeping only, not a payment refund. Product/color rankings exclude refunded sales. Clear activity deletes analytics only, with confirmation; business records remain.
Delivery settings includes bKash and Nagad switches, separate payment numbers, and Personal / Merchant account types. Customer orders displays the selected method and transaction ID, with an owner-controlled verification selector. Save the settings after entering a number and enabling each wallet.
Store settings exposes Phone product columns (1, 2, 3, 4) and Desktop product columns (2–7). Values are validated integers under config.layout and use normal Save changes/revision protection. Historical saved settings receive defaults without rewriting other values.
Offers section: master on/off, homepage banner on/off, optional popup on/off, title, category checkboxes, and start/end in Bangladesh time. Empty category selection means all discounted categories. Save changes persists through normal revision checks. Schedules control advertising visibility, not product discount prices. Banner defaults on; popup defaults off.
