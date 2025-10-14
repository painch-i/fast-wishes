import { nanoid } from "nanoid";

import type { Tables } from "../database.types";
import type { WishImage } from "../types/wish";
import { supabaseClient } from "./supabaseClient";

const WISH_IMAGE_BUCKET = "wishes-images";
const MAX_RETRIES = 2;
const AUTH_REQUIRED_ERROR = "Cannot access wish images without an authenticated user.";

const getPublicUrl = (objectName?: string | null): string => {
  if (!objectName) return "";
  const { data } = supabaseClient.storage
    .from(WISH_IMAGE_BUCKET)
    .getPublicUrl(objectName);
  return data?.publicUrl ?? "";
};

export const getWishImageUrl = (storageObjectName?: string | null): string => {
  const publicUrl = getPublicUrl(storageObjectName);
  console.log({ storageObjectName, publicUrl });
  return publicUrl;
}
export const mapWishImages = (
  rows?: Tables<"wishes_images">[]
): WishImage[] => {
  if (!rows?.length) return [];
  return rows.map((row) => {
    const objectName = row.storage_object_name ?? null;
    return {
      ...row,
      url: getWishImageUrl(objectName),
    };
  });
};

type SyncParams = {
  wishId: number;
  newFiles?: File[];
  removed?: Tables<"wishes_images">[];
};

const getUserStorageRoot = async (): Promise<string> => {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user?.id;
  if (!userId) throw new Error(AUTH_REQUIRED_ERROR);
  return userId;
};

const uploadSingleImage = async (
  wishId: number,
  userFolder: string,
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
  const objectName = `${userFolder}/${wishId}/${nanoid()}.${ext}`;
  const { error } = await supabaseClient.storage
    .from(WISH_IMAGE_BUCKET)
    .upload(objectName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) {
    if (attempt < MAX_RETRIES) {
      return uploadSingleImage(wishId, userFolder, file, attempt + 1);
    }
    throw error;
  }
  return objectName;
};

export const syncWishImages = async ({
  wishId,
  newFiles = [],
  removed = [],
}: SyncParams): Promise<void> => {
  const uploads: string[] = [];
  const userFolder = newFiles.length ? await getUserStorageRoot() : null;

  for (const file of newFiles) {
    const objectName = await uploadSingleImage(wishId, userFolder!, file);
    uploads.push(objectName);
  }

  if (uploads.length) {
    const { error } = await supabaseClient
      .from("wishes_images")
      .insert(
        uploads.map((storage_object_name) => ({
          wish_id: wishId,
          storage_object_name,
        }))
      );
    if (error) throw error;
  }

  if (removed.length) {
    const ids = removed.map((img) => img.id);
    const names = removed
      .map((img) => img.storage_object_name ?? null)
      .filter((value): value is string => !!value);
    const { error: deleteError } = await supabaseClient
      .from("wishes_images")
      .delete()
      .in("id", ids);
    if (deleteError) throw deleteError;
    if (names.length) {
      const { error: removeError } = await supabaseClient.storage
        .from(WISH_IMAGE_BUCKET)
        .remove(names);
      if (removeError) throw removeError;
    }
  }
};
