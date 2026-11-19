# Animation

Scope: hero slides, red gradient wave, stickers and category motion.

- editorial/Hero.tsx and hero.css: featured-product slideshow, swipe/keyboard controls and motion.
- editorial/BackgroundDepth.tsx and background-depth.css: soft 18-second blush-to-red wave and one decorative character at a time.
- editorial/Sticker.tsx, BigCat.tsx and PersianCat.tsx: original SVG plane, peacock, lion, tiger, Persian cat, sports car and astronaut. The cats travel without red trails. The red wave is hidden during the Persian cat’s pass.
- client/product-page.js and product-page.css: category glass indicator with 460ms easing; follows the active filter and respects reduced motion.
- client/product-gallery.js: compact photo transitions, thumbnails and swipe navigation.

Phone sticker routes sit below the fixed liquid header, with the headline below them. Motion pauses when hidden/offscreen and respects reduced-motion settings. Keep text contrast stable.

Edit editorial/ sources, then run npm run build:editorial. Generated public/editorial/ is rebuilt, not edited manually.

Retired galaxy canvas, ocean-wave asset and raster vehicle stickers were archived outside the active site. Historical animation notes are in D:/site/archive/2026-11-02-cleanup/animation-guide-history.md.
