# Admin Wishes UI

This module provides a modern CRUD experience for managing wishes using React, Refine and Ant Design. It currently includes:

- **WishesListPage**: table view with inline editing for price, status and public visibility.
- **WishDrawer** with **WishForm**: drawer-based form divided in tabs (only General tab implemented) to create or edit a wish. Metadata from pasted URLs is mocked.
- **QuickAddBar**: sticky input allowing quick creation from a URL. It opens the drawer pre‑filled.
- **PreviewPublic**: renders a public-facing `WishCard` preview of a wish.
- **useWishMetadata hook**: fetches mock metadata for a URL.
- **smartDataProvider**: hybrid data provider merging Supabase records with localStorage for missing fields.

All optional fields are stored in localStorage when not available in Supabase, enabling schema-less iteration.
