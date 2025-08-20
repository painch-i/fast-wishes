# Add Wish Sheet

A mobile-first bottom sheet (drawer on desktop) that lets users quickly add a wish with minimal friction.

## Fields
1. **Titre** – required, placeholder "Bouilloire inox silencieuse" with inline help.
2. **Description** – multiline, placeholder: "Pourquoi ça me ferait plaisir ? Une petite note pour guider (couleur, taille, usage…)."
3. **Prix + Devise** – single control combining an amount and a currency chip (EUR default, tap to change).
4. **Lien** – optional URL field with a **Coller** button that pastes the clipboard on user gesture. Displays the domain with a shortcut to open the link after entry and gently falls back with the tip “Maintiens dans le champ puis Coller” when clipboard access is refused.

All fields except the title are optional. Invalid links trigger a gentle warning but never block submission. Drafts persist in `localStorage` under `add-wish-draft` so unfinished entries survive accidental closure.

### Mobile considerations
- Every input and select renders at a minimum of 16px so iOS Safari never auto-zooms on focus.
- The price field uses a text input with `inputmode="decimal"` and an inline currency selector to avoid native number steppers.
- While the sheet is open a `maximum-scale=1` attribute is temporarily added to the viewport meta tag to prevent pinch-zoom and is restored on close.
- The drawer body applies `overscroll-behavior: contain` while the document body is scroll-locked with `overscroll-behavior: none` to block pull-to-refresh.

### Overlay and layering
- The sheet and its overlay render in a portal attached directly to `document.body`.
- A fixed mask with ~50% opacity covers the page and captures all clicks; the sheet panel sits above the mask with `z-index` 1001 (mask 1000, dropdowns 1002).
- When open the document body is scroll-locked and the admin header loses its sticky positioning so nothing bleeds through.
- Dropdowns like the currency selector render inside the sheet with an even higher `z-index` to appear above the header and footer.

## Usage
The component is opened from the floating “+” button on the wishes list. When submitted, it attaches the signed-in user's `user_id` to the new wish so it belongs to their account. On save it shows the success toast “Souhait ajouté ✨” and refreshes the list. Errors display “Oups, on n’a pas pu enregistrer. Tes infos sont gardées en brouillon.”

