import countryToCurrency from "country-to-currency";

export interface GuessUserCurrencyArgs {
  profileCurrency?: string | null;
  profileCountry?: string | null;
  previousWishCurrency?: string | null;
}

/**
 * Guess the user's currency based on profile info, previous wishes and
 * browser locale. Falls back to USD.
 */
export const guessUserCurrency = ({
  profileCurrency,
  profileCountry,
  previousWishCurrency,
}: GuessUserCurrencyArgs): string => {
  if (profileCurrency) return profileCurrency;

  if (profileCountry) {
    const mapped = (countryToCurrency as Record<string, string>)[
      profileCountry.toUpperCase()
    ];
    if (mapped) return mapped;
  }

  if (previousWishCurrency) return previousWishCurrency;

  let region: string | undefined;
  if (typeof navigator !== "undefined") {
    const locale = navigator.language || navigator.languages?.[0];
    if (locale) {
      const parts = locale.split("-");
      if (parts[1]) {
        region = parts[1].toUpperCase();
      }
    }
  }

  const country = region || "US";
  const currency = (countryToCurrency as Record<string, string>)[country];
  return currency || "USD";
};
