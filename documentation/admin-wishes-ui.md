# Admin Wishes UI

This module provides a modern CRUD experience for managing wishes using React, Refine and Ant Design. It currently includes:

 - **WishesListPage**: mobile‑first overview list showing a 56px image or 🎁 placeholder, title, two-line description and a price formatted from the browser's locale and currency. Each row is fully tappable and opens the EditWishDrawer. It includes skeleton loading, a friendly empty state and a retryable error state, with a single floating “+ Ajouter” button to create new wishes.
 - **CreateWishWizard**: responsive full‑screen modal. Desktop shows a two‑column layout with a vertical stepper and live WishCard preview. Mobile replaces the stepper with tappable progress pills. A sticky action bar keeps “Précédent”, “Suivant/Créer” and “Annuler” buttons always accessible.
- **EditWishDrawer**: right-side drawer that reuses `WishForm`, offering the same fields as creation in a single minimalist view.
- **useLinkMetadata hook**: fetches lightweight metadata for pasted URLs.
- **mapDbToWishUI** and **localExtrasStore** utilities: merge Supabase rows with extras stored in `localStorage` and persist unsupported fields locally.

All optional fields are stored in `localStorage` when not available in Supabase, enabling schema-less iteration.
