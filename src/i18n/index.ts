import i18n from "i18next";
import ICU from "i18next-icu";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { loadLocale, supportedLngs, fallbackLng, Locale } from "./config";

const loaded = new Set<Locale>();

i18n
  .use(ICU)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs,
    fallbackLng,
    defaultNS: "common",
    returnEmptyString: false,
    resources: {},
    detection: {
      order: ["path", "cookie", "localStorage", "navigator"],
      caches: ["cookie", "localStorage"],
      cookieMinutes: 525600, // 1 year
      lookupCookie: "locale",
    },
  });

export async function changeLocale(lng: Locale) {
  if (!loaded.has(lng)) {
    const resources = await loadLocale(lng);
    i18n.addResourceBundle(lng, "common", resources, true, true);
    loaded.add(lng);
  }
  await i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
}

export async function preloadLocale(lng: Locale) {
  if (loaded.has(lng)) return;
  const resources = await loadLocale(lng);
  i18n.addResourceBundle(lng, "common", resources, true, true);
  loaded.add(lng);
}

export { useFormat } from "./use-format";
export default i18n;
