# Public Wishlist Page

Displays a user's public wishes without requiring a pre-existing session. The page
is reachable at `/{locale}/l/{slug}` and shows wishes marked as public for the
specified user.

## Anonymous Access
- Visitors are logged in anonymously before data is fetched.
- This prevents the router from redirecting to the authenticated wishes page and
  allows fetching data from Supabase.

## Data Fetching
- Uses `useList` on the `wishes` resource with filters:
  - `user_slugs.slug` equals the URL's `slug` parameter.
  - `is_public` equals `true`.
- Selects `*, user_slugs!inner(slug)` to access the slug within the result set.


