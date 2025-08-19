# Project Documentation

This document tracks high-level technical decisions and UI guidelines for the project.

## Design Tokens
- **Primary color:** `#FF6B6B`
- **Text primary:** `#1F2937`
- **Text secondary:** `#6B7280`
- **Header background:** `#FFF7F4`
- **Radius:** `12px` for cards and images

## Theme
- The interface is locked to a light theme across all pages. Dark mode and theme toggles were removed, and the `<meta name="color-scheme" content="light">` hint ensures consistent light rendering on every platform.

## Components
- **Header** uses a light peach gradient and balanced title wrapping. The counter badge is centered beneath the subtitle.
- **Wish grid** displays a single column on small screens and switches to two columns from 400px width with generous gaps.
  - **WishCard** features a 4:3 image placeholder, subdued coral CTA, secondary link styling, and a reserved state badge.
  - See `admin-wishes-ui.md` for details on the administration CRUD interface including the redesigned creation wizard with a sticky action bar and mobile progress pills.
- **Wishes List** filters Supabase queries by `user_id` to show only the signed-in user's wishes and renders a mobile-first list with image/placeholder, chevron and tappable rows. Each row shows a title, contextual prompts for missing description, link and price pills or placeholders. A count badge appears in the header, the first visit shows a dismissable clipboard tip and up to two ghost rows encourage adding more wishes. Skeleton loading, friendly empty/error states and a single centered “+” FAB round out the experience. See `wishes-list-page.md` for details.
- **Add Wish Sheet** provides a bottom sheet/drawer with just four fields (Titre, Description, Prix+Devise, Lien) and warm microcopy. When a wish is saved, the current user's `user_id` is sent with the creation request so the record is linked to their account. Drafts persist locally until submission. See `add-wish-sheet.md` for details.

## Accessibility
- Interactive elements maintain a minimum touch area of 44px and include aria attributes for state changes.

## Database
Supabase Postgres powers persistence. Types are generated with `npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > database.types.ts` and imported across the codebase to ensure queries match the schema.

## Build
- The project builds via `tsc && vite build` to ensure compatibility with Yarn PnP.
- Extra runtime helpers rely on `@mui/system` for MUI Data Grid and `tslib` for TypeScript transpiled helpers.

## Branding
- Refine-specific banners and metadata were removed.
- A custom star-themed favicon (`public/favicon.svg`) now represents the Fast Wishes brand.

