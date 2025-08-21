# Public Wishlist for Offerers

Mobile-first page showing a compact list of gifts for friends and family without requiring an account.

## Header
- Title **"Anniversaire de {Prénom} 🎂"**.
- Subtitle "Choisis ce qui fera plaisir 💝".
- Counter chip "🎁 {X} cadeaux restants".
- Right-aligned actions:
  - **Partager** uses the Web Share API and falls back to copying the URL with a toast "Lien copié ✨".
  - **Créer ma liste** links to `/wishes` in the same tab.

## Gift Tiles
- 56px vignette on the left with domain/initial fallback when no image is present.
- Right side shows a single-line title and a meta-line with the domain pill, optional note and price right-aligned.
- Reserved items display a "✅ Réservé" badge, desaturate slightly and become untappable.
- The entire tile opens the reservation sheet.

## Bottom Sheet
- Shows title, small vignette, price, domain and description when available.
- Primary button **"Réserver"** plus a link **"Proposer un autre lien"**.
- Caption underneath: "On garde la surprise 🤫".
- Success toast: "Réservé ! Merci 💝".

## Footer Callout
- Discrete banner: "Envie de ta propre wishlist ? Créer ma liste" linking to `/wishes`.

## Empty State
- When all wishes are reserved, display: "Tout est réservé 🎉 Merci ! Tu peux encore faire une surprise."
