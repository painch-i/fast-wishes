import type { Tables } from "../database.types";

export type UserIdentity = { id: string; role?: string } | null;

// Extend generated users table type to include the new column.
export type UserSlug = Tables<"users"> & { user_list_name?: string | null };
