# Editorial redesign — first review

The supplied brief explicitly asks for tokens and Hero first, followed by review.
This checkpoint implements that stage locally. The hosted site is unchanged.

## First-stage files

- `public/design-tokens.css`: warm paper, burgundy, ink, dark mode, fluid type,
  8px spacing, radii, motion durations and easing.
- `editorial/Hero.tsx`: React/Motion hero, masked headline entrance, wipe/parallax
  slides, progress indicators, hover/focus/explicit pause, keyboard and swipe.
- `editorial/ProductModel.tsx`: photo-based studio treatment and gentle 3D tilt;
  marked integration slot for a future lazy React Three Fiber/GLB viewer.
- `editorial/hero.css`, `editorial/motion-tokens.ts`: Hero layout and motion.
- `editorial/entry.tsx`, `vite.hero.config.ts`, `scripts/build-editorial.mjs`:
  a Vite-built React island that preserves the existing store and admin data.
- `data/storefront-html.ts`, `public/app.js`: connect the new Hero to the current
  product detail dialog. Product data still comes from the server/admin panel.

## Preserved backup

`D:/site/backups/form-before-editorial-2026-10-30/` contains source.zip,
local-data (local D1 database and uploaded images), commit.txt and RESTORE.md.
The local server was stopped before copying its database state.

## Next stage after review

Header scroll behavior, CollectionGrid/FilterBar/ProductCard migration and layout
animations, BagDrawer, Lenis scroll synchronization, optional custom cursor,
route transitions, swatch-specific images and the refined footer remain pending.
The existing versions of these features are retained in this first checkpoint.

## Assets to supply

- Matching product photographs on the same backdrop, plus real second angles
  and swatch-specific images. CSS toning is an interim treatment.
- Optimized GLB models for each product if true 3D and 360-degree viewing are
  wanted. No simulated rotation or alternate image is labeled as real 3D.

There is no Lighthouse score claim: performance must be measured on a completed
production build. Three.js is not downloaded for this photo-only Hero.

Run `npm run dev` to build the Hero bundle and start the local store/admin server.
After editing files in `editorial/`, run `npm run build:editorial` and refresh.
