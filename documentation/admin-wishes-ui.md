# Admin Wishes UI

This module provides a modern CRUD experience for managing wishes using React, Refine and Ant Design. It currently includes:

 - **WishesListPage**: mobile‑first overview list showing a 56px image or 🎁 placeholder, title, two-line description and a price formatted with `Intl.NumberFormat` using the wish currency. Each row is fully tappable and opens the unified WishSheet for editing. When at least one wish is public, a top section shows an external‑link icon that opens the public page; Share/Copy has been removed. An info banner appears if no wish is public. The page includes skeleton loading, a friendly empty state and a retryable error state, with a single floating “+ Ajouter” button to create new wishes.
 - **WishSheet**: bottom sheet rendered on mobile (drawer on desktop) used for both adding and editing a wish. It auto‑detects a default currency via `guessUserCurrency()` and never overrides an existing value. All labels, placeholders and toasts pull from the i18n bundle. It locks body scroll, traps focus and exposes only a title field as required. Success actions trigger a single toast and close the sheet.
 
- **useLinkMetadata hook**: fetches lightweight metadata for pasted URLs.
- **mapDbToWishUI** and **localExtrasStore** utilities: merge Supabase rows with extras stored in `localStorage` and persist unsupported fields locally.

All optional fields are stored in `localStorage` when not available in Supabase, enabling schema-less iteration.
