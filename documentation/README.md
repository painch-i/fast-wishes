# Project Documentation

This document tracks high-level technical decisions and UI guidelines for the project.

## Design Tokens
- **Primary color:** `#FF6B6B`
- **Text primary:** `#1F2937`
- **Text secondary:** `#6B7280`
- **Header background:** `#FFF7F4`
- **Radius:** `12px` for cards and images

## Components
- **Header** uses a light peach gradient and balanced title wrapping. The counter badge is centered beneath the subtitle.
- **Wish grid** displays a single column on small screens and switches to two columns from 400px width with generous gaps.
  - **WishCard** features a 4:3 image placeholder, subdued coral CTA, secondary link styling, and a reserved state badge.
  - See `admin-wishes-ui.md` for details on the administration CRUD interface including the redesigned creation wizard with a sticky action bar and mobile progress pills.
- **Wishes List** filters Supabase queries by `user_id` to show only the signed-in user's wishes, preventing leakage of public wishes from other accounts.

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

