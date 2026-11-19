# Workspace navigation

The active site is `D:/site/storefront`. Start with `storefront/PROJECT-MAP.md`, then open only the relevant `docs/features/` guide and source files.

- Scope searches to the selected feature; avoid reading generated bundles, dependencies or the entire repository.
- Edit `editorial/` sources, not generated `public/editorial/`; rebuild after hero changes.
- This work is local-only unless the user requests publication.
- Saved brand, contacts, prices and business records may be changed by the user. Preserve them; defaults are only seeds.
- Check database-writing test scripts before running. Clean up only your own temporary test records.
- Keep the existing backup and `.wrangler/state` intact.

# User-facing copy
Treat the storefront and admin as a finished store in all future UI work. Never add design-preview, demo, sample-product, sample-price, illustrative-product, temporary-brand or development-status captions. Use concise real-store labels. Retain truthful action-level unavailable/error messages for services that are not connected; never imply an order, payment or signup succeeded when it did not. This is a presentation rule, not permission to publish.
