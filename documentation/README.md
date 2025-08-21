# Project Documentation

This document tracks high-level technical decisions and UI guidelines for the project.

## Design Tokens
- **Primary color:** `#FF6B6B`
- **Text primary:** `#1F2937`
- **Text secondary:** `#6B7280`
- **Header background:** `#FFF7F4`
- **Accent peach:** `#FFE7E1`
- **Accent mint:** `#E7FFF4`
- **Accent lavender:** `#EFE7FF`
- **Accent yellow:** `#FFF7D6`
- **Separators:** `#EEF0F3`
- **Radius:** `12px` for cards and images

## Theme
- The interface is locked to a light theme across all pages. Dark mode and theme toggles were removed, and the `<meta name="color-scheme" content="light">` hint ensures consistent light rendering on every platform.

## Components
- **Header** uses a light peach gradient and balanced title wrapping. The counter badge is centered beneath the subtitle.
- **Wish grid** displays a single column on small screens and switches to two columns from 400px width with generous gaps.
  - **GiftTile** uses a 56px vignette, domain pill, optional note and price text, and a reserved badge that desaturates the tile.
  - See `public-wishlist-offers.md` for the offerer-facing public page.
  - See `admin-wishes-ui.md` for details on the administration CRUD interface including the redesigned creation wizard with a sticky action bar and mobile progress pills.
 - **Wishes List** filters Supabase queries by `user_id` to show only the signed-in user's wishes and renders a mobile-first list with image/placeholder, chevron and tappable rows. Each row shows a title, contextual prompts for missing description, link and price pills or placeholders. A count badge appears in the header and up to two ghost rows encourage adding more wishes. When at least one wish is public, external-link and share icon buttons in the header link to `/l/{slug}` and trigger the native share sheet or copy the link. A dismissable info banner reminds the user to make wishes public when none are. Skeleton loading, friendly empty/error states and a single centered “+” FAB round out the experience. Long press on a row reveals an inline **Supprimer → Confirmer** chip with undoable deletion, without triggering native text selection or context menus. See `wishes-list-page.md` for details.
- **Add Wish Sheet** provides a bottom sheet/drawer with just four fields (Titre, Description, Prix+Devise, Lien) and warm microcopy. When a wish is saved, the current user's `user_id` is sent with the creation request so the record is linked to their account. Drafts persist locally until submission. See `add-wish-sheet.md` for details.

## Notifications
- Built-in Refine snackbars are disabled so only our custom toasts appear.
- Success and error messages use Ant Design's `message` API (e.g. "Souhait ajouté ✨").
- Mutations opt out of library notifications with `successNotification: false` and `errorNotification: false`. See `notifications.md` for guidance.

## Accessibility
- Interactive elements maintain a minimum touch area of 44px and include aria attributes for state changes.
- Form controls default to a 16px font size to avoid iOS Safari's automatic zoom. Placeholders and select values match this size.
- The global viewport is `width=device-width, initial-scale=1, viewport-fit=cover`. Bottom sheets temporarily append `maximum-scale=1` while open to suppress pinch-zoom then restore the original viewport.
- Scroll containers inside sheets use `overscroll-behavior: contain` to prevent accidental pull-to-refresh.

## Database
Supabase Postgres powers persistence. Types are generated with `npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > database.types.ts` and imported across the codebase to ensure queries match the schema.

## Build
- The project builds via `tsc && vite build` to ensure compatibility with Yarn PnP.
- Extra runtime helpers rely on `@mui/system` for MUI Data Grid and `tslib` for TypeScript transpiled helpers.

## Branding
- Refine-specific banners and metadata were removed.
- A custom star-themed favicon (`public/favicon.svg`) now represents the Fast Wishes brand.
