# Wishes List Page

Mobile-first list of the signed-in user's wishes with gentle prompts to encourage completion.

## Header
- Title **"Tes souhaits 🎁"**.
- Subtitle "Appuie sur un souhait pour le modifier.".
- When at least one wish exists, a count badge shows `{n} souhait(s)`.
- If the user has a slug, two compact actions appear in the top right:
  - **👁️ Voir** opens `/l/{slug}` in a new tab.
  - **⤴️ Partager** triggers the native share sheet or copies the link.
- A trust note below the actions reads "Ce lien ne montre que tes souhaits publics." with a text link **En savoir plus**.
- If no wish is public, a small blue badge reminds "Rends certains souhaits publics pour les montrer".

## Rows
- Full-width tap area, minimum 64px height. Pressing briefly highlights the row with a peach tint.
- Left: 56×56 vignette with 12px radius.
  - Priority: `image_url` → `metadata.ogImage` → favicon on a pastel gradient → initial letter on a gradient → category emoji.
- Center: title on one line then a single meta-line:
  - The domain chip (neutral gray) is always at the start when a link exists.
  - Description or fallback "Ajoute un petit mot pour guider 💌" truncates next to the chip.
  - If no link is provided, a gray text "+ Lien pour aider à trouver" appears inline.
- Right column: price chip with a light background and thin border. If no price, a text link **Ajouter un prix** with an ➕ icon replaces the chip. Chevron `›` signals navigation.
- Layout rules prevent chips from overlapping and everything ellipsizes instead of wrapping.
- Tapping any part opens the edit drawer, focusing the relevant field.

## Empty and Sparse States
- Zero items: centered 🎁 with text "Aucun souhait pour l’instant. Ajoute ton premier ✨".
- One or two items: two tappable ghost rows with pastel thumbnails inviting new wishes.

## Tip Bar
- On first visit a dismissable tip appears: "Astuce : colle un lien Amazon/Etsy, on préremplit ✨".
- If the clipboard holds a URL, a **Coller** button opens the add sheet prefilled with that link.
- Dismissal stores `wish-tip-dismissed` in `localStorage` to avoid showing again.

## Floating Action Button
- Single centered “+” FAB opens the add sheet.
- Hidden whenever an edit or add modal is active.
