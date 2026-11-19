# Design

Scope: colours, typography, spacing, responsive layout.

- `public/design-tokens.css`: active theme tokens, colours, type sizes, spacing.
- `public/clean.css`: current storefront cleanup, readable menu/product text, discounts.
- `editorial/hero.css`: hero grid, headline, product slide, responsive sizes.
- `public/contact.css`: contact cards and social buttons.
- `public/styles.css` → `premium.css` → `experience.css` → `contact.css` → `crimson.css` → `clean.css`: legacy storefront cascade. Tokens and generated hero CSS load afterward.
- `data/storefront-html.ts`: exported HTML string; header, sections, dialogs, stylesheet/script links.

Prefer a focused edit in the current owning stylesheet; inspect specificity before adding overrides.
Keep useful labels, product names/prices and action buttons readable. Decorative small labels were removed intentionally.

Check: desktop + 375px phone, light/dark themes, no horizontal overflow. Rebuild for hero edits.

Permanent copy preference: no preview/demo/sample/illustrative/development captions in the storefront or admin. Use finished-store language. Keep truthful unavailable messages at the attempted action for disconnected services. See workspace AGENTS.md.
Phone collection spacing: hero bottom 12px, controls padding 6px, collection top 20px. Category filters use one horizontally scrollable row with 44px tap targets; compact heading/sort spacing brings products higher without reducing readability.
Mobile hero copy is compact: top padding 20px, headline 42–52px on narrow phones, CTA gap 16px, copy/photo gap 20px. Product caption no longer reserves a 140–148px minimum; it sizes to its name, price and 44px View button with 14–16px padding.
Removed the legacy decorative f/star story mark from the served HTML. Desktop Categories select now shares plain navigation typography and transparent, borderless styling, retaining native keyboard/dropdown interaction and a visible focus outline.
Checkout bKash/Nagad options include optimized local WebP logos from the supplied images (public/payment-logos). The Nagad symbol is cropped from the provided lockup; visible payment names provide labels and logos use empty alt to avoid repetition. White logo badges preserve clarity in both themes.
The header uses floating liquid-glass styling: rounded translucent surface, restrained backdrop blur/saturation, fine highlights and shadow. Mobile height is 64px with 10px side margins; its menu is aligned below at 80px. Dark theme, no-backdrop-filter fallback and reduced-transparency preference use readable surfaces. No extra JS or animated filters.
Mobile-first collection: small 18px colour dots in 44px touch targets, simple selected outline and no checkmark/shadow. Colour names remain accessible and visible in details. Mobile card entrance/hover zoom effects are disabled. Store settings has separate phone (1–4) and desktop (2–7) product columns; defaults 2 and 3. Dense mobile grids keep colour selection in the product details.
Header background refinement: neutral 90% light tint / 92% dark tint, reduced saturation and lighter shadow prevent red hero content or photos from creating uneven colour patches through the glass. The frosted header retains its rounded shape and subtle highlight.
Restored clear liquid-glass transparency (58% light / 64% dark tint) and saturation. Removed vertical header margins that created blank strips above/below the floating surface; sticky top remains 8px. The menu stays at 80px to clear the 64px phone header.
Phone glass background continuity: below 700px the hero extends 64px upward behind the sticky header, with matching 64px extra top padding so content stays in place. This removes the plain strip beneath the glass without changing hero content spacing. clean.css URL has a version key to refresh cached phone styles.
Phone product popup: image height clamps to 160–220px (28svh), copy padding 18px, tighter price/stats/description/colour/action gaps, buttons remain at least 44px. Dialog retains viewport-bound scrolling for longer descriptions and uses 14px screen margins.
Phone collection toolbar keeps swipeable categories and a 112px sort select on one row. Hidden native scrollbar removes the long grey line; sort keeps its accessible label, 44px minimum height, native dropdown arrow and focus ring. Desktop retains the Sort by caption.
Phone sort placement: compact 88px sort control shares the top row with the collection heading; categories get their own full-width swipe row below. CSS grid/display:contents positions existing controls without duplicate sorting inputs. Heading scales 18–22px to fit narrow screens.
Header stability: the glass header is fixed at top 8px, with body padding reserving 76px desktop / 64px phone. Fixed page spacing and a stable scrollbar gutter prevent position/width shifts. Phone backdrop blur is limited to 16px. See docs/reviews/security-2026-10-31.md for checks.
Phone navigation: experience.js moves the same theme/account buttons into a labelled action row at the top of the mobile menu below 700px, restoring them to the header on desktop. Account closes navigation before opening its dialog. The category menu uses light/dark translucent glass, bounded scrolling, keyboard focus/Escape handling and opaque fallbacks for unsupported blur or reduced transparency.
Mobile menu readability: 86% light / 90% dark glass tint, bold category labels and fine burgundy gradient dividers separate rows without removing the glass effect.

Category glass motion: product-page.js adds a single sliding red indicator inside .filters, following active category width/position with 460ms easing. Resize and font loading reposition it; reduced motion disables transitions. Phone contact numbers are 15px. Product details stay visible without an expand control.
Compact scroll header: experience.js toggles header-compact after 80px and restores below 24px. Fixed body spacing avoids scroll feedback. Glass shrinks to 56px desktop / 52px phone with 360ms easing, a smaller logo and more opaque tint. Phone controls retain 44px targets and menu follows the compact header. Reduced motion disables transitions.
Scroll visibility: the header hides after 24px of downward travel below the first 100px and returns after 10px upward. An open menu or active keyboard focus keeps it visible. Focus left behind by tap does not pin it. Direction thresholds use the furthest scroll position instead of resetting on tiny reversals. A passive, frame-throttled listener drives the transform and opacity transition. Reduced motion disables transitions.
