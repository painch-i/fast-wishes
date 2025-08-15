import React, { useState } from "react";
import { useParams } from "react-router";
import { useList } from "@refinedev/core";
import { Tag, Skeleton } from "antd";
import { WishCard, ReserveBottomSheet } from "../../components";
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
  });

  const wishes = data?.data ?? [];
  const remaining = wishes.filter((w) => !w.isReserved).length;
  const [selected, setSelected] = useState<Wish | null>(null);

  return (
    <div className="public-wishlist">
      <header className="wishlist-header">
        <h1>Anniversaire de Ismael 🎂</h1>
        <p className="subtitle">Choisis ce qui fera plaisir 💝</p>
        <Tag className="counter">🎁 {remaining} cadeaux restants</Tag>
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
              <WishCard
                key={w.id}
                wish={w}
                onReserve={setSelected}
                onProposeLink={setSelected}
              />
            ))}
      </div>
      <ReserveBottomSheet
        open={!!selected}
        wish={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};
