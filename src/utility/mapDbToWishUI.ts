import { WishUI } from "../types/wish";

/**
 * Merge a Supabase row with locally stored extras.
 * Database fields take precedence while preserving extra metadata
 * kept in localStorage.
 */
export const mapDbToWishUI = (
  dbRow: Partial<WishUI>,
  localExtras: Partial<WishUI> = {}
): WishUI => {
  return {
    ...localExtras,
    ...dbRow,
    metadata: {
      ...(localExtras.metadata ?? {}),
      ...((dbRow as any).metadata ?? {}),
    },
  } as WishUI;
};
