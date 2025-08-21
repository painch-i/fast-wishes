# Wishes List Page

Mobile-first list of the signed-in user's wishes with gentle prompts to encourage completion.

## Header
- Title **"Tes souhaits 🎁"**.
- Subtitle "Appuie sur un souhait pour le modifier.".
- When at least one wish exists, a count badge shows `{n} souhait(s)`.

## Public List Access
- If at least one wish is public, two icon buttons appear in the header:
  - External link opens `/l/{slug}` in a new tab.
  - Share button uses the Web Share API with clipboard fallback.
- Icons are 20–22 px inside 36 px circles, spaced by 8 px and aligned right.
- Icons stay hidden when no wish is public.
- When there are wishes but none are public, a dismissable info banner reminds the user to make at least one wish public.

## Rows
- Full-width tap area, minimum 64px height. Pressing briefly highlights the row with a peach tint.
- Left: 56×56 vignette with 12px radius.
  - Priority: `image_url` → site favicon on a hashed pastel background → initial letter → category emoji.
- Center: title on one line then a single meta-line:
  - The domain chip (mint background) is always at the start when a link exists.
  - Description or fallback "Ajoute un petit mot pour guider 💌" truncates to the right of the chip.
  - If no link provided, an extra line "+ Lien pour aider à trouver" appears.
- Right column: price pill (peach) or dashed "Ajouter un prix" pill. Chevron `›` signals navigation.
- Layout rules prevent chips from overlapping and everything ellipsizes instead of wrapping.
- Tapping any part opens the edit drawer, focusing the relevant field.

### Suppression rapide
- Appui long (600 ms) sur une ligne pour afficher une puce rouge **Supprimer** sur cet item uniquement.
- Taper ailleurs annule le mode danger.
- Premier tap sur la puce → devient **Confirmer** (rouge plein) pendant ~2 s.
- Second tap supprime l’élément de façon optimiste et affiche un toast "Souhait supprimé. Annuler".
- Le toast reste 5 s ; cliquer sur **Annuler** réinsère l’élément à sa position d’origine.
- Tentative sur un souhait réservé → toast "Déjà réservé — impossible de supprimer.".
- Un bouton invisible `aria-label="Supprimer {titre}"` permet l’accès clavier/lecteur d’écran.

## Empty and Sparse States
- Zero items: centered 🎁 with text "Aucun souhait pour l’instant. Ajoute ton premier ✨".
- One or two items: two tappable ghost rows with pastel thumbnails inviting new wishes.

## Tip Bar
- Removed; no tip or paste helper is shown.

## Floating Action Button
- Single centered “+” FAB opens the add sheet.
- Hidden whenever an edit or add modal is active.
