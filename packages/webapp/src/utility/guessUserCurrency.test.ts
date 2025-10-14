import { describe, expect, it, vi } from "vitest";
import { guessUserCurrency } from "./guessUserCurrency";

describe("guessUserCurrency", () => {
  it("returns profile currency if provided", () => {
    expect(
      guessUserCurrency({ profileCurrency: "EUR", profileCountry: "US" })
    ).toBe("EUR");
  });

  it("maps profile country to currency", () => {
    expect(
      guessUserCurrency({ profileCountry: "GB" })
    ).toBe("GBP");
  });

  it("uses previous wish currency before locale", () => {
    expect(
      guessUserCurrency({ previousWishCurrency: "JPY" })
    ).toBe("JPY");
  });

  it("falls back to browser locale region then USD", () => {
    const original = global.navigator;
    // locale with region
    // @ts-ignore
    global.navigator = { language: "fr-FR" };
    expect(guessUserCurrency({})).toBe("EUR");
    // locale without region
    // @ts-ignore
    global.navigator = { language: "fr" };
    expect(guessUserCurrency({})).toBe("USD");
    global.navigator = original;
  });
});
