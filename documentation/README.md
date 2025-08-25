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
  - **WishCard** features a 4:3 image placeholder, subdued coral CTA, secondary link styling, and a reserved state badge.
  - See `admin-wishes-ui.md` for details on the administration CRUD interface including the redesigned creation wizard with a sticky action bar and mobile progress pills.
 - **Wishes List** filters Supabase queries by `user_id` to show only the signed-in user's wishes and renders a mobile-first list with image/placeholder, chevron and tappable rows. Each row shows a title, contextual prompts for missing description, link and price pills formatted with `Intl.NumberFormat` using the stored currency, or placeholders when absent. A count badge appears in the header and up to two ghost rows encourage adding more wishes. When at least one wish is public, external-link and share icon buttons in the header link to `/l/{slug}` and trigger the native share sheet or copy the link. A dismissable info banner reminds the user to make wishes public when none are. Skeleton loading, friendly empty/error states and a single centered “+” FAB round out the experience. Long press on a row reveals an inline **Supprimer → Confirmer** chip with undoable deletion, without triggering native text selection or context menus. See `wishes-list-page.md` for details.
 - **Wish Sheet** is a unified bottom sheet/drawer used to add or edit a wish. It captures title, price with currency and “≈” toggle, a single merchant link field with paste button and inline domain/title preview, personal comment, priority chips and a freeform tag. The currency defaults to `guessUserCurrency()` which reads the profile, prior wishes or browser locale via `country-to-currency` and falls back to USD. The currency dropdown portals to `document.body` with a high `z-index` and prevents `mousedown` blur so options remain tappable. When a wish is saved the user's `user_id` is attached and the sheet closes with a single success toast. All copy is sourced from the i18n bundles. See `wish-sheet.md` for details.

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
Supabase Postgres powers persistence. The Supabase CLI requires two environment variables:

- `SUPABASE_PROJECT_ID` – your project identifier
- `SUPABASE_KEY` – the service role key used by the CLI

Before starting any task, regenerate the database types to keep them in sync:

`npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > database.types.ts`

The resulting `database.types.ts` file is imported across the codebase to ensure queries match the schema.

## Edge Functions
- **enrich-wish** fetches basic metadata for a supplied URL to prefill wish details. See `wish-enrichment-edge-function.md` for implementation notes.
- Edge functions deploy automatically to Supabase when commits land on `main` via the `deploy-edge-functions.yml` GitHub workflow.

## Build
- The project builds via `tsc && vite build` to ensure compatibility with Yarn PnP.
- Extra runtime helpers rely on `@mui/system` for MUI Data Grid and `tslib` for TypeScript transpiled helpers.

## Internationalization
- Translations are handled with **i18next** and **react-i18next** with an ICU plugin for plurals.
- Supported locales: `fr`, `en`, and a stretching `pseudo` locale. Invalid locales redirect to French.
- Language is detected from the URL path, then cookie, local storage, and browser settings. Preference persists in both cookie and `localStorage`.
- Translation namespaces (`common.json`) load on demand via dynamic imports.
- The top-level router uses paths like `/:locale/*` and updates `<html lang>` accordingly.
- The `useFormat` helper exposes `formatPrice`, `formatNumber`, and `formatDate` using the active locale via `Intl`.
- Run `yarn check:i18n` in CI to ensure French and English keys remain in sync.
- All user-facing components rely on semantic translation keys stored in `common.json` for French, English and pseudo locales.

## Branding
- Refine-specific banners and metadata were removed.
- A custom star-themed favicon (`public/favicon.svg`) now represents the Fast Wishes brand.

