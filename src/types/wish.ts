import type { Tables } from "../../database.types";

export type WishStatus = "draft" | "available" | "reserved" | "received" | "archived";

export type WishUI = Tables<"wishes"> & {
  currency?: "EUR" | "USD" | "GBP";
  image_url?: string;
  quantity?: number;
  priority?: 1 | 2 | 3;
  status?: WishStatus;
  note_private?: string;
  tags?: string[];
  metadata?: {
    site_name?: string;
    favicon?: string;
    title?: string;
  };
};

export type WishExtraStore = Record<string, Partial<WishUI>>;
