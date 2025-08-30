# Translation Usage Check

`scripts/check-translations.mjs` scans the `src` directory for `t("...")` calls and ensures each key exists in the `fr` and `en` locale files under `src/i18n/locales`. Run `yarn check:translations` to catch missing entries before committing.
