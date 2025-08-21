import React, { useState } from "react";
import { useParams } from "react-router";
import { useList } from "@refinedev/core";
import { Tag, Skeleton, message } from "antd";
import { GiftTile, ReserveBottomSheet } from "../../components";
import type { Wish } from "../../components";
import "./public-wishlist.page.css";

export const PublicWishlistPage: React.FC = () => {
  const { slug } = useParams();
  const { data, isLoading } = useList<Wish>({
    resource: "wishes",
    filters: [
      {
        field: "user_slugs.slug",
        operator: "eq",
        value: slug,
      },
      { field: "is_public", operator: "eq", value: true },
    ],
    meta: {
      select: "*, user_slugs!inner(slug)",
    },
  });

  const wishes = (data?.data ?? []).map((w) => ({
    ...w,
    isReserved: (w as any).status === "reserved",
  }));
  const remaining = wishes.filter((w) => !w.isReserved).length;
  const [selected, setSelected] = useState<Wish | null>(null);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        message.success("Lien copié ✨");
      }
    } catch {}
  };

  return (
    <div className="public-wishlist">
      <header className="wishlist-header">
        <div className="header-top">
          <h1>Anniversaire de Ismael 🎂</h1>
          <div className="actions">
            <button onClick={handleShare}>🔗 Partager</button>
            <a href="/wishes" className="create-link">➕ Créer ma liste</a>
          </div>
        </div>
        <p className="subtitle">Choisis ce qui fera plaisir 💝</p>
        <Tag className="counter">
          <span role="img" aria-label="cadeau">🎁</span> {remaining} cadeaux restants
        </Tag>
      </header>
      <div className="wish-grid">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton.Button
                key={i}
                active
                className="wish-skeleton"
                shape="round"
                block
              />
            ))
          : wishes.map((w) => (
              <GiftTile key={w.id} wish={w} onClick={setSelected} />
            ))}
      </div>
      <ReserveBottomSheet
        open={!!selected}
        wish={selected}
        onClose={() => setSelected(null)}
      />
      <footer className="wishlist-footer">
        <a href="/wishes">Envie de ta propre wishlist ? Créer ma liste</a>
      </footer>
    </div>
  );
};
