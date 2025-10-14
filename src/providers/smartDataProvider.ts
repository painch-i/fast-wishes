import type { DataProvider } from "@refinedev/core";
import { dataProvider as supabaseDataProvider } from "@refinedev/supabase";
import { supabaseClient } from "../utility";

export const smartDataProvider: DataProvider = supabaseDataProvider(supabaseClient);
