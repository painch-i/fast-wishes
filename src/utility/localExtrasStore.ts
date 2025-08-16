import { WishExtraStore, WishUI } from "../types/wish";

const STORAGE_KEY = "wishExtras";

const readStore = (): WishExtraStore => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishExtraStore) : {};
  } catch {
    return {};
  }
};

const writeStore = (store: WishExtraStore) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const getExtras = (id: string): Partial<WishUI> => {
  const store = readStore();
  return store[id] ?? {};
};

export const setExtras = (id: string, extras: Partial<WishUI>): void => {
  const store = readStore();
  store[id] = extras;
  writeStore(store);
};

export const removeExtras = (id: string): void => {
  const store = readStore();
  delete store[id];
  writeStore(store);
};
