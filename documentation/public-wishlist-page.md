# Public Wishlist Page

Accessible at `/l/{slug}` and shows the wishes that a user marked as public.

- Each wish uses **PublicWishCard**. It now prioritizes the first uploaded
  Supabase image (with lazy loading) and falls back to the legacy
  `image_url` or an emoji placeholder.
- A price appears under the description while an optional link icon overlays the avatar.
- Inline **Réserver** button lets visitors reserve a wish; states update to show who reserved it or allow cancellation.
 - Reserving a wish opens a bottom sheet requesting name and email with the confirm action in the header; cancelling a reservation uses a similar confirmation sheet.

