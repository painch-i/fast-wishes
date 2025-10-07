import { createClient } from "@refinedev/supabase";
import type { Database } from ".././database.types";

const SUPABASE_URL = "https://sxfqmmsawxxrafjfusdu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZnFtbXNhd3h4cmFmamZ1c2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTU2NDEsImV4cCI6MjA3MDA3MTY0MX0.AZ9MxVBGovMLGjsxJUVESbYDq3-Er7T7k1SV9qV4cdQ";

export const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
});
