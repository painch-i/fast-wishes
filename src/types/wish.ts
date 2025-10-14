import type { Tables } from ".././database.types";

export type WishStatus = "draft" | "available" | "reserved" | "received" | "archived";

export type WishUI = Tables<"wishes"> & {
  images?: WishImage[];
};

export type WishImage = Tables<"wishes_images"> & {
  url: string;
};

export type WishFormValues = WishUI & {
  newImages?: File[];
  removedImages?: WishImage[];
};
