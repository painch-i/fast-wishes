import { useEffect, useState } from "react";

export type LinkMetadata = {
  siteName?: string;
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
    fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setMetadata(data);
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
