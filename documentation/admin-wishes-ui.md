# Admin Wishes UI

This module provides a modern CRUD experience for managing wishes using React, Refine and Ant Design. It currently includes:

 - **WishesListPage**: mobile‑first overview list showing a 56px image or 🎁 placeholder, title, two-line description and a price formatted with `Intl.NumberFormat` using the wish currency. Each row is fully tappable and opens the unified WishSheet for editing. A top section now exposes a **"Voir la liste publique"** button with Share/Copy support and an info banner if no wish is public. The page includes skeleton loading, a friendly empty state and a retryable error state, with a single floating “+ Ajouter” button to create new wishes.
 - **CreateWishWizard**: responsive full‑screen modal. Desktop shows a two‑column layout with a vertical stepper and live WishCard preview. Mobile replaces the stepper with tappable progress pills. A sticky action bar keeps “Précédent”, “Suivant/Créer” et “Annuler” buttons always accessible.
 - **WishSheet**: bottom sheet rendered on mobile (drawer on desktop) used for both adding and editing a wish. It auto‑detects a default currency via `guessUserCurrency()` and never overrides an existing value. It locks body scroll, traps focus and exposes only a title field as required. Success actions trigger a single toast and close the sheet.
 - **EditWishListPage**: shows admin table of wishes and now exposes a visible “Voir la liste publique” button with Share/Copy support plus an info banner when no public wish exists.
- **useLinkMetadata hook**: fetches lightweight metadata for pasted URLs.
- **mapDbToWishUI** and **localExtrasStore** utilities: merge Supabase rows with extras stored in `localStorage` and persist unsupported fields locally.

All optional fields are stored in `localStorage` when not available in Supabase, enabling schema-less iteration.
