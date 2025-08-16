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

export const smartDataProvider = {
  ...baseProvider,
  async getList(params: any) {
    const supRes = await baseProvider.getList(params);
    if (params.resource !== "wishes") return supRes;
    const extras = readExtras();
    return {
      ...supRes,
      data: supRes.data.map((item: any) => ({
        ...item,
        ...extras[String(item.id)],
      })),
    };
  },
  async getOne(params: any) {
    const supRes = await baseProvider.getOne(params);
    if (params.resource !== "wishes") return supRes;
    const extras = readExtras();
    const idKey = String(supRes.data.id);
    return {
      ...supRes,
      data: { ...supRes.data, ...extras[idKey] },
    };
  },
  async create(params: any) {
    if (params.resource !== "wishes") return baseProvider.create(params);
    const supRes = await baseProvider.create(params);
    const extras = readExtras();
    const idKey = String(supRes.data.id);
    extras[idKey] = { ...extras[idKey], ...params.variables };
    writeExtras(extras);
    return {
      ...supRes,
      data: { ...supRes.data, ...extras[idKey] },
    };
  },
  async update(params: any) {
    if (params.resource !== "wishes") return baseProvider.update(params);
    const supRes = await baseProvider.update(params);
    const extras = readExtras();
    const idKey = String(params.id);
    extras[idKey] = { ...extras[idKey], ...params.variables };
    writeExtras(extras);
    return {
      ...supRes,
      data: { ...supRes.data, ...extras[idKey] },
    };
  },
} as DataProvider;
