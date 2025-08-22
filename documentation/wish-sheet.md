# Wish Sheet

Mobile bottom sheet used for both creating and editing a wish.
It renders in a portal attached to `document.body` with a full-screen
mask. A sticky header stacks a drag handle, a one-line title and a
secondary subtitle. The body is the only scrollable area and the footer
remains visible with safe-area padding, exposing **Annuler** and a
primary **Ajouter/Enregistrer** button. While open, body scrolling is
locked and `overscroll-behavior: contain` prevents pull-to-refresh.

## Fields
1. **Titre** – required. Placeholder “Arrosoir inox Haws 1 L” with the
   help text “Un nom clair aide tes proches à choisir.”
2. **Prix + Devise** – text input with `inputmode="decimal"`, a currency
   selector (EUR by default) and a toggle “≈” that sets
   `price_is_approx=true`.
3. **Lien marchand** – URL field with a right-side **Coller** button that
   uses the Clipboard API. On user input it fills `merchant_domain`
   (sans `www.`) and tries to derive `image_url` and `brand` from Open
   Graph metadata. A fallback tip “Maintiens puis Coller” appears when
   clipboard access is refused.
4. **Commentaire perso** – short textarea placeholder “Pourquoi ça me
   ferait plaisir ? Couleur, taille, usage… 💌”.
5. **Priorité** – three chips with one always selected: ⭐ Essentiel,
   💡 Envie (default) and 🎲 Surprise.
6. **Tag** – autocomplete allowing free text with suggestions
   (Maison, Cuisine, Sport, Lecture, Tech, Mode, Beauté, Jeux).

Only the title is mandatory. On submit the sheet returns a `WishUI`
object including `price_cents`, `price_is_approx`, `merchant_domain`,
`brand`, `tag` and any metadata. The parent performs an optimistic
creation or update then closes the sheet and shows a single success
toast.
