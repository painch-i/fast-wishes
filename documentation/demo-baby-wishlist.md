# Demo baby wishlist page

The baby registry demo lives at `/en/demo/baby-wishlist`. It is a static, login-free page designed for marketing screenshots aimed at parents-to-be.

## Purpose
- Provide a clean English wishlist example that avoids exposing real user data.
- Highlight share-ready copy for baby shower or birth list campaigns.
- Offer multi-image cards to show the carousel controls in action.

## Implementation
- **Route:** Declared in `src/App.tsx` as `demo/baby-wishlist` under the locale-aware router.
- **Page:** `src/pages/demo/BabyWishlistDemoPage.tsx` assembles a curated set of `PublicWishCard` components with baby-focused items (crib, monitor, carrier, sound machine, newborn kit).
- **Styling:** `src/pages/demo/BabyWishlistDemoPage.css` lays out a two-column hero header and a responsive wish grid with pill tags for quick campaign notes.
- **Data:** Uses static `Wish` objects with demo owner IDs, price/currency, optional links, and Unsplash image URLs to keep the layout rich without hitting Supabase.

## How to use
1. Open `/en/demo/baby-wishlist` in the deployed app or locally while the dev server runs.
2. Capture the hero + grid for ads or landing pages; the copy is already English-first.
3. Share the link directly—authentication is not required for this route.
