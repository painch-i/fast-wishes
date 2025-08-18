import type { Tables } from "../database.types";

export type UserIdentity = { id: string; role?: string } | null;

export type UserSlug = Tables<"user_slugs">;
