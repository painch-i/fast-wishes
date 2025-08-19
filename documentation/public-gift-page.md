# Public Gift Page

The public gifting page (`/l/:slug`) presents a lightweight, mobile-first interface for contributors. It loads in under a second and keeps interaction to a minimum.

## Layout
- **Header:** compact hero with share and "Créer ma liste" actions. A counter chip displays remaining unreserved gifts.
- **Gift grid:** responsive 1–2 column grid of `GiftTile` components. Tiles are tappable rows with a 56px thumbnail, title and domain pill. Reserved items show a "✅ Réservé" badge and become inactive.
- **Bottom sheet:** selecting a tile opens a sheet with the gift details and a single primary action. A secondary link allows proposing an alternative link. The caption "On garde la surprise 🤫" reinforces the surprise.
- **Footer callout:** soft prompt linking to `/wishes` for creating one's own list.

## Interactions
- **Share:** uses the Web Share API when available, otherwise copies the page URL and shows a "Lien copié ✨" toast.
- **Reserve:** instantly confirms with a "Réservé ! Merci 💝" toast.

## Accessibility
- Interactive targets are at least 44px high and include keyboard handlers. Ant Design's drawer provides focus trapping for the bottom sheet.
