import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useList } from "@refinedev/core";
import { Tag, Skeleton, message } from "antd";
import { GiftTile, ReserveBottomSheet } from "../../components";
import type { Wish } from "../../components";
import "./public-wishlist.page.css";

export const PublicWishlistPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useList<Wish>({
    resource: "wishes",
    filters: [
      { field: "user_slugs.slug", operator: "eq", value: slug },
      { field: "is_public", operator: "eq", value: true },
    ],
    meta: { select: "*, user_slugs!inner(slug)" },
  });

  const wishes = data?.data ?? [];
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
    } catch (e) {
      // ignored
    }
  };

  return (
    <div className="public-wishlist">
      <header className="wishlist-header">
        <div className="header-top">
          <h1>Anniversaire de {slug} 🎂</h1>
          <div className="header-actions">
            <button onClick={handleShare} className="header-action">
              <span role="img" aria-label="Partager">🔗</span> Partager
            </button>
            <button
              onClick={() => navigate("/wishes")}
              className="header-action"
            >
              <span role="img" aria-label="Créer">📝</span> Créer ma liste
            </button>
          </div>
        </div>
        <p className="subtitle">Choisis ce qui fera plaisir 💝</p>
        <Tag className="counter">🎁 {remaining} cadeaux restants</Tag>
      </header>

      {remaining === 0 && !isLoading ? (
        <p className="empty-message">
          Tout est réservé 🎉 Merci ! Tu peux encore faire une surprise.
        </p>
      ) : (
        <div className="wish-grid">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton.Button
                  key={i}
                  active
                  className="wish-skeleton"
                  block
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
