# Add Wish Sheet

A mobile-first bottom sheet (drawer on desktop) that lets users quickly add a wish with minimal friction.

## Fields
1. **Titre** – required, placeholder "Bouilloire inox silencieuse" with inline help.
2. **Description** – multiline, placeholder: "Pourquoi ça me ferait plaisir ? Une petite note pour guider (couleur, taille, usage…)."
3. **Prix + Devise** – single control combining an amount and a currency chip (EUR default, tap to change).
4. **Lien** – optional URL field. Displays the domain with a shortcut to open the link after entry.

All fields except the title are optional. Invalid links trigger a gentle warning but never block submission. Drafts persist in `localStorage` under `add-wish-draft` so unfinished entries survive accidental closure.

## Usage
The component is opened from the floating “+” button on the wishes list. When submitted, it attaches the signed-in user's `user_id` to the new wish so it belongs to their account. On save it shows the success toast “Souhait ajouté ✨” and refreshes the list. Errors display “Oups, on n’a pas pu enregistrer. Tes infos sont gardées en brouillon.”

