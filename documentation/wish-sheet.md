# Wish Sheet

Mobile bottom sheet used for both creating and editing a wish.
It renders in a portal attached to `document.body` with a full-screen
mask. A sticky header stacks a drag handle, a one-line title and a
secondary subtitle with the primary **Ajouter/Enregistrer** action on the
right. The body is the only scrollable area and no footer is needed. While
open, body scrolling is locked and `overscroll-behavior: contain` prevents
pull-to-refresh. Emoji selection has been removed: wishes now rely on
uploaded photos or automatic fallbacks when no media is available.

All labels, placeholders and helper text are sourced from the `i18n` bundles, allowing the sheet to adapt to any supported locale.

## Fields
1. **Titre** – required. Placeholder “Arrosoir inox Haws 1 L” with the
   help text “Un nom clair aide tes proches à choisir.” No emoji picker
   is surfaced anymore.
2. **Photos** – grid preview of already saved images with inline remove
   actions and an Ant Design `Upload` widget configured with
   `listType="picture-card"`. Users can add up to six images per wish;
   the client blocks non-image MIME types and files over 5 MB with
   localized error toasts. New uploads are deferred until submit where
   they are pushed to Supabase storage under `wish-images/{wishId}/`. The
   drawer also keeps track of deletions so removed photos are purged from
   both the join table and storage.
3. **Prix + Devise** – text input with `inputmode="decimal"` and a
   currency selector pre-filled by `guessUserCurrency()` (profile → country
   → last wish → browser locale) using `country-to-currency` with USD
   fallback. Editing an existing wish preserves its stored currency. The
   dropdown renders in a `document.body` portal with `z-index:1002`, and
   each option calls `preventDefault()` on `mousedown` to avoid focus loss
   so taps and clicks always register.
3. **Lien marchand** – single editable URL field (`type="url"`,
   `inputmode="url"`, font-size ≥16px) with a right-side **Coller**
   button using the Clipboard API. The text is the only source of truth
   and no domain badge is rendered. On each change (debounced 400 ms) the
   host sans `www.` populates `merchant_domain`; it also attempts to pull
   Open Graph metadata to fill `image_url` and estimate `brand` when
   empty. Under the field, an optional one-line helper shows favicon,
   domain and extracted title. An “external link” icon opens the URL in a
   new tab when valid, and a clear icon resets the field. Scheme-less
   inputs are prefixed with `https://`. Clipboard refusal focuses the
   field and displays the tip “Maintiens dans le champ puis “Coller””. An
   invalid URL triggers a light error state but the field remains
   optional.
4. **Commentaire perso** – short textarea placeholder “Pourquoi ça me
   ferait plaisir ? Couleur, taille, usage… 💌”.
5. **Priorité** – three chips with one always selected: ⭐ Essentiel,
   💡 Envie (default) and 🎲 Surprise.

Only the title is mandatory. On submit the sheet returns a
`WishFormValues` object including `price_cents`, `merchant_domain`,
`brand`, existing image metadata, plus two extra arrays:

| Field            | Type          | Notes                                                  |
| ---------------- | ------------- | ------------------------------------------------------ |
| `newImages`      | `File[]`      | Client-side files queued for upload.                   |
| `removedImages`  | `WishImage[]` | Already persisted images the user removed in the UI.   |

The parent performs the Supabase mutation, uploads/removes storage
objects, then closes the sheet with a single success toast. When uploads
fail, the mutation still succeeds but the drawer surfaces a dedicated
error toast while keeping the sheet open.
