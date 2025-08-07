export type User = {
  id: string;
};

export type UserIdentity = User | null;

export type UserSlug = {
  created_at: string;
  id: string;
  slug: string;
}