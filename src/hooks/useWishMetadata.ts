import { useEffect, useState } from "react";

export type Metadata = {
  siteName?: string;
  title?: string;
  favicon?: string;
  image?: string;
};

export const useWishMetadata = (url?: string) => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    const timer = setTimeout(() => {
      // Mocked metadata fetch
      setMetadata({
        siteName: "Amazon",
        title: "Titre détecté",
        favicon: "https://www.amazon.com/favicon.ico",
        image: `https://picsum.photos/seed/${encodeURIComponent(url)}/640/480`,
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [url]);

  return { metadata, loading };
};
