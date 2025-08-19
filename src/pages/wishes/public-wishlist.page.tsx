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

  const wishes = data?.data ?? [];
  const remaining = wishes.filter((w) => !w.isReserved).length;
  const [selected, setSelected] = useState<Wish | null>(null);

  const firstName = slug ? slug.split("-")[0] : "";

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        message.success("Lien copié ✨");
      }
    } catch {
      /* noop */
    }
  };

  return (
    <div className="public-wishlist">
      <header className="wishlist-header">
        <div className="header-top">
          <div className="titles">
            <h1>Anniversaire de {firstName} 🎂</h1>
            <p className="subtitle">Choisis ce qui fera plaisir 💝</p>
          </div>
          <div className="header-actions">
            <button className="action" onClick={handleShare}>
              📤<span>Partager</span>
            </button>
            <a className="action" href="/wishes">
              ✏️<span>Créer ma liste</span>
            </a>
          </div>
        </div>
        <Tag className="counter">
          <span role="img" aria-label="cadeau">🎁</span> {remaining} cadeaux restants
        </Tag>
      </header>

      {remaining === 0 && wishes.length > 0 ? (
        <p className="empty">Tout est réservé 🎉 Merci ! Tu peux encore faire une surprise.</p>
      ) : (
        <div className="wish-grid">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  active
                  avatar={{ shape: "square", size: 56 }}
                  title={{ width: "60%" }}
                  paragraph={false}
                  className="wish-skeleton"
                />
              ))
            : wishes.map((w) => (
                <GiftTile key={w.id} wish={w} onSelect={setSelected} />
              ))}
        </div>
      )}

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
