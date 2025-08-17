# Admin Wishes UI

This module provides a modern CRUD experience for managing wishes using React, Refine and Ant Design. It currently includes:

 - **WishesListPage**: hero section, inline table edits with optimistic feedback and an empty state inviting users to start from a link.
 - **CreateWishWizard**: responsive full‑screen modal. Desktop shows a two‑column layout with a vertical stepper and live WishCard preview. Mobile replaces the stepper with tappable progress pills. A sticky action bar keeps “Précédent”, “Suivant/Créer” and “Annuler” buttons always accessible.
- **EditWishDrawer**: right-side drawer with tabs (Général, Détails, Visibilité) and an unsaved-changes guard.
- **QuickAddBar**: sticky input allowing quick creation from a URL, opening the wizard pre-filled.
- **useLinkMetadata hook**: fetches lightweight metadata for pasted URLs.
- **mapDbToWishUI** and **localExtrasStore** utilities: merge Supabase rows with extras stored in `localStorage` and persist unsupported fields locally.

All optional fields are stored in `localStorage` when not available in Supabase, enabling schema-less iteration.
