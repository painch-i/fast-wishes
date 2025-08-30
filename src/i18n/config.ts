export const supportedLngs = ["fr", "en", "pseudo"] as const;
export type Locale = typeof supportedLngs[number];
export const fallbackLng: Locale = "en";

const localeFiles = import.meta.glob<Record<string, string>>("./locales/*/common.json");

export const loadLocale = async (lng: Locale) => {
  const importer = localeFiles[`./locales/${lng}/common.json`];
  if (!importer) {
    throw new Error(`Locale ${lng} not found`);
  }
  const module = await importer();
  return module.default;
};

export const oppositeLocale = (lng: Locale): Locale => (lng === "fr" ? "en" : "fr");
