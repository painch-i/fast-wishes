export type WishStatus = "draft" | "available" | "reserved" | "received" | "archived";

export type WishUI = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  price?: number;
  currency?: "EUR" | "USD" | "GBP";
  imageUrl?: string;
  quantity?: number;
  priority?: 1 | 2 | 3;
  isPublic?: boolean;
  status?: WishStatus;
  notePrivate?: string;
  tags?: string[];
  metadata?: {
    siteName?: string;
    favicon?: string;
    title?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type WishExtraStore = Record<string, Partial<WishUI>>;
