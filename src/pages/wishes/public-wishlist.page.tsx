import React, { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useList } from "@refinedev/core";
import { Tag, Skeleton } from "antd";
import { WishCard, ReserveBottomSheet } from "../../components";
import type { Wish } from "../../components";
import "./public-wishlist.page.css";
import { useTranslation } from "react-i18next";
import type { Tables } from "../../../database.types";

export const PublicWishlistPage: React.FC = () => {
  const { slug } = useParams();
  const { data, isLoading } = useList<Wish>({
    resource: "wishes",
    filters: [
      {
        field: "users.slug",
        operator: "eq",
        value: slug,
      },
      { field: "is_public", operator: "eq", value: true },
    ],
    meta: {
      select: "*, users!inner(slug)",
    },
  });

  // Fetch the user by slug to get the optional name, even if no public wishes
  const { data: userData } = useList<Tables<"users">>({
    resource: "users",
    filters: [{ field: "slug", operator: "eq", value: slug }],
    meta: { select: "*" },
  });

  const wishes = data?.data ?? [];
  const remaining = wishes.filter((w) => !w.isReserved).length;
  const [selected, setSelected] = useState<Wish | null>(null);
  const { t } = useTranslation();

  const ownerName = useMemo(
    () => (userData?.data?.[0] as any)?.user_list_name ?? undefined,
    [userData]
  );
  const title = ownerName
    ? t("public.header.wishlistNamed", { name: ownerName })
    : t("public.header.wishlistMine");

  return (
    <div className="public-wishlist">
      <header className="wishlist-header">
        <h1>{title}</h1>
        <p className="subtitle">{t("public.header.subtitle")}</p>
        <Tag className="counter">
          <span role="img" aria-label={t("public.header.gift")}>
            🎁
          </span>
          {" "}
          {t("public.header.remaining", { count: remaining })}
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
