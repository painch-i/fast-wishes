import i18n from "./index";

export function useFormat() {
  const lang = i18n.language;
  return {
    formatPrice: (cents?: number | null, currency?: string | null) => {
      if (cents == null) return "";
      const cur = currency || "USD";
      return new Intl.NumberFormat(lang, { style: "currency", currency: cur }).format(
        cents / 100
      );
    },
    formatNumber: (n: number) => new Intl.NumberFormat(lang).format(n),
    formatDate: (d: Date | number | string) =>
      new Intl.DateTimeFormat(lang).format(new Date(d)),
  };
}
