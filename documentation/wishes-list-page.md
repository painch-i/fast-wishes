# Wishes List Page

Mobile-first list of the signed-in user's wishes with gentle prompts to encourage completion.

## Header
- Title **"Tes souhaits 🎁"**.
- Subtitle "Appuie sur un souhait pour le modifier.".
- When at least one wish exists, a count badge shows `{n} souhait(s)`.

## Rows
- Full-width, minimum 64px height, and react to press with a light background and slight elevation.
- Left: 56×56 image or 🎁 placeholder.
- Center: one-line title then contextual hints:
  - Description or fallback "Ajoute un petit mot pour guider 💌".
  - If no link provided, extra line "+ Lien pour aider à trouver".
- Right side pills:
  - Domain pill when a link exists.
  - Price pill or dashed "Ajouter un prix" pill.
  - Chevron `›` to indicate navigation.
- Tapping any part opens the edit drawer, focusing the relevant field.

## Empty and Sparse States
- Zero items: centered 🎁 with text "Aucun souhait pour l’instant. Ajoute ton premier ✨".
- One or two items: two tappable ghost rows encouraging new wishes.

## Tip Bar
- On first visit a dismissable tip appears: "Astuce : colle un lien Amazon/Etsy, on préremplit ✨".
- If the clipboard holds a URL, a **Coller** button opens the add sheet prefilled with that link.
- Dismissal stores `wish-tip-dismissed` in `localStorage` to avoid showing again.

## Floating Action Button
- Single centered “+” FAB opens the add sheet.
- Hidden whenever an edit or add modal is active.
