import { dataProvider as supabaseDataProvider } from "@refinedev/supabase";
import type { DataProvider } from "@refinedev/core";
import { WishExtraStore } from "../types/wish";
import { supabaseClient } from "../utility";

const baseProvider = supabaseDataProvider(supabaseClient);
const LOCAL_STORAGE_KEY = "wishes_extra";

function readExtras(): WishExtraStore {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}") as WishExtraStore;
  } catch {
    return {};
  }
}

function writeExtras(store: WishExtraStore) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
}

export const smartDataProvider: DataProvider = {
  ...baseProvider,
  async getList(resource, params) {
    const supRes = await baseProvider.getList(resource, params);
    if (resource !== "wishes") return supRes;
    const extras = readExtras();
    return {
      ...supRes,
      data: supRes.data.map((item: any) => ({ ...item, ...extras[item.id] })),
    };
  },
  async getOne(resource, params) {
    const supRes = await baseProvider.getOne(resource, params);
    if (resource !== "wishes") return supRes;
    const extras = readExtras();
    return {
      ...supRes,
      data: { ...supRes.data, ...extras[supRes.data.id] },
    };
  },
  async create(resource, params) {
    if (resource !== "wishes") return baseProvider.create(resource, params);
    const { variables } = params;
    const supRes = await baseProvider.create(resource, { variables });
    const extras = readExtras();
    extras[supRes.data.id] = { ...extras[supRes.data.id], ...variables };
    writeExtras(extras);
    return {
      ...supRes,
      data: { ...supRes.data, ...extras[supRes.data.id] },
    };
  },
  async update(resource, params) {
    if (resource !== "wishes") return baseProvider.update(resource, params);
    const { variables, id } = params;
    const supRes = await baseProvider.update(resource, { id, variables });
    const extras = readExtras();
    extras[id as string] = { ...extras[id as string], ...variables };
    writeExtras(extras);
    return {
      ...supRes,
      data: { ...supRes.data, ...extras[id as string] },
    };
  },
};
