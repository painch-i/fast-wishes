import type { Tables } from "../../../database.types";

export type Wish = Tables<"wishes"> & {
  image?: string;
  meta?: string;
  isReserved?: boolean;
};
