export const supportedLngs = ["fr", "en", "pseudo"] as const;
export type Locale = typeof supportedLngs[number];
export const fallbackLng: Locale = "fr";

export const loadLocale = async (lng: Locale) => {
  const module = await import(/* @vite-ignore */ `./locales/${lng}/common.json`);
  return module.default;
};

export const oppositeLocale = (lng: Locale): Locale => (lng === "fr" ? "en" : "fr");
