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
   selector pre-filled by `guessUserCurrency()` (profile → country → last
   wish → browser locale) using `country-to-currency` with USD fallback,
   and a toggle “≈” that sets `price_is_approx=true`. Editing an existing
   wish preserves its stored currency. The dropdown renders in a
   `document.body` portal with `z-index:1002`, and each option calls
   `preventDefault()` on `mousedown` to avoid focus loss so taps and
   clicks always register.
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
6. **Catégories** – 1 à 3 chips via une puce fantôme « + Ajouter une catégorie ».
   Un tap la transforme en champ inline (placeholder “Ex. Maison, Cuisine, Sport…”)
   avec une rangée de suggestions défilable : Maison, Cuisine, Sport, Lecture, Tech,
   Mode, Beauté, Jeux, Bébé, Voyage. “Créer « {texte} »” apparaît si aucune
   suggestion ne correspond. Entrée/OK ou tap sur une suggestion valide la
   catégorie. Chaque chip est supprimable (×), l’ajout se masque à trois entrées et
   les valeurs sont normalisées (trim + capitalisation) sans doublons.

Only the title is mandatory. On submit the sheet returns a `WishUI`
object including `price_cents`, `price_is_approx`, `merchant_domain`,
`brand`, `tags` and any metadata. The parent performs an optimistic
creation or update then closes the sheet and shows a single success
toast.
