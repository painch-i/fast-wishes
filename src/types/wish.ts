import type { Tables } from ".././database.types";

export type WishStatus = "draft" | "available" | "reserved" | "received" | "archived";

export type WishUI = Tables<"wishes"> & {
  currency?: string;
  image_url?: string;
  quantity?: number;
  priority?: 1 | 2 | 3;
  status?: WishStatus;
  note_private?: string;
  tags?: string[];
  emoji?: string | null;
  metadata?: {
    site_name?: string;
    favicon?: string;
    title?: string;
  };
  merchant_domain?: string;
  brand?: string;
  price_cents?: number | null;
};

export type WishExtraStore = Record<string, Partial<WishUI>>;
