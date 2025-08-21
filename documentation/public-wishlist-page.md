# Public Wishlist Page

Lightweight public view for offerers to browse and reserve gifts without creating an account.

## Header
- Title **"Anniversaire de {Prénom} 🎂"**.
- Subtitle "Choisis ce qui fera plaisir 💝".
- Counter chip shows "🎁 {n} cadeaux restants".
- Action buttons on the right: **Partager** (Web Share API with clipboard fallback) and **Créer ma liste** linking to `/wishes`.

## Gift Tiles
- Compact **GiftTile** cards with a 56px thumbnail, one-line title and meta-line.
- Meta-line shows a domain pill and optional note; price aligns to the right.
- Reserved wishes show a "✅ Réservé" badge and become non tappable.
- Skeleton tiles render while data loads.

## Bottom Sheet
- Tapping a tile opens the **ReserveBottomSheet** with image, price, domain link and description.
- Primary action **Réserver** and secondary link **Proposer un autre lien**.
- Caption at the bottom: "On garde la surprise 🤫".
- Reservation shows a toast "Réservé ! Merci 💝".

## Footer Callout
- Discreet banner: "Envie de ta propre wishlist ? Créer ma liste" linking to `/wishes`.
