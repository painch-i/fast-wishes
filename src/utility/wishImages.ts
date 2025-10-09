import { nanoid } from "nanoid";

import type { Tables } from "../database.types";
import type { WishImage } from "../types/wish";
import { supabaseClient } from "./supabaseClient";

const WISH_IMAGE_BUCKET = "wish-images";
const MAX_RETRIES = 2;

export const getWishImageUrl = (storageObjectId: string): string => {
  if (!storageObjectId) return "";
  const { data } = supabaseClient.storage
    .from(WISH_IMAGE_BUCKET)
    .getPublicUrl(storageObjectId);
  return data?.publicUrl ?? "";
};

export const mapWishImages = (
  rows?: Tables<"wishes_images">[]
): WishImage[] => {
  if (!rows?.length) return [];
  return rows.map((row) => ({
    ...row,
    url: getWishImageUrl(row.storage_object_id),
  }));
};

type SyncParams = {
  wishId: number;
  newFiles?: File[];
  removed?: Tables<"wishes_images">[];
};

const uploadSingleImage = async (
  wishId: number,
  file: File,
  attempt = 0
): Promise<string> => {
  const ext = (() => {
    const parts = file.name?.split?.(".");
    const maybeExt = parts?.length ? parts.pop() : undefined;
    if (maybeExt) return maybeExt.toLowerCase();
    if (file.type?.includes("png")) return "png";
    if (file.type?.includes("gif")) return "gif";
    if (file.type?.includes("webp")) return "webp";
    return "jpg";
  })();
  const objectPath = `${wishId}/${nanoid()}.${ext}`;
  const { data, error } = await supabaseClient.storage
    .from(WISH_IMAGE_BUCKET)
    .upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) {
    if (attempt < MAX_RETRIES) {
      return uploadSingleImage(wishId, file, attempt + 1);
    }
    throw error;
  }
  return data?.path ?? objectPath;
};

export const syncWishImages = async ({
  wishId,
  newFiles = [],
  removed = [],
}: SyncParams): Promise<void> => {
  const uploads: string[] = [];

  for (const file of newFiles) {
    const path = await uploadSingleImage(wishId, file);
    uploads.push(path);
  }

  if (uploads.length) {
    const { error } = await supabaseClient
      .from("wishes_images")
      .insert(uploads.map((storage_object_id) => ({
        wish_id: wishId,
        storage_object_id,
      })));
    if (error) throw error;
  }

  if (removed.length) {
    const ids = removed.map((img) => img.id);
    const paths = removed
      .map((img) => img.storage_object_id)
      .filter((path): path is string => !!path);
    const { error: deleteError } = await supabaseClient
      .from("wishes_images")
      .delete()
      .in("id", ids);
    if (deleteError) throw deleteError;
    if (paths.length) {
      const { error: removeError } = await supabaseClient.storage
        .from(WISH_IMAGE_BUCKET)
        .remove(paths);
      if (removeError) throw removeError;
    }
  }
};
