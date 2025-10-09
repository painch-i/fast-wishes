import type { Tables } from "../.././database.types";
import type { WishImage } from "../../types/wish";

export type Wish = Tables<"wishes"> & {
  image?: string;
  meta?: string;
  isReserved?: boolean;
  emoji?: string | null;
  images?: WishImage[];
};
