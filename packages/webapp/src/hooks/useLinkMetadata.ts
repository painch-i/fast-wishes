import { useEffect, useState } from "react";
import { supabaseClient } from "../utility";

export type LinkMetadata = {
  site_name?: string;
  title?: string;
  favicon?: string;
  image?: string;
};

/**
 * Lightweight hook to fetch metadata for a given URL.
 * The implementation is mock-friendly and falls back silently
 * when the remote service is unavailable.
 */
export const useLinkMetadata = (url?: string) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;
    let active = true;
    setLoading(true);
    supabaseClient.functions
      .invoke("enrich-wish", { body: { url } })
      .then(({ data }) => {
        if (active) setMetadata(data as LinkMetadata);
      })
      .catch(() => {
        if (active) setMetadata(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url]);

  return { metadata, loading };
};
