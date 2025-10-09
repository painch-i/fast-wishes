import { useList } from "@refinedev/core";
import { Button, Drawer, Skeleton, Tag, Typography, message } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import type { Tables } from "../.././database.types";
import type { Wish } from "../../components";
import { PublicWishCard, ReserveBottomSheet } from "../../components";
import { mapWishImages, supabaseClient } from "../../utility";
import "./public-wishlist.page.css";

export const PublicWishlistPage: React.FC = () => {
  const { slug } = useParams();
  const { data, isLoading } = useList<Wish & { owner: Tables<"users"> }>({
    resource: "wishes",
    filters: [
      {
        field: "owner.slug",
        operator: "eq",
        value: slug,
      },
    ],
    meta: {
      select: `
        *,
        owner:users!wishes_user_id_fkey1!inner(slug, user_list_name),
        reservations(
          user:users(name)
        ),
        wishes_images(id, storage_object_id)
      `,
    },
  });

  const owner = data?.data[0]?.owner;

  const rawWishes = data?.data ?? [];
  const wishes = useMemo(() => {
    return rawWishes.map((wish) => {
      const { wishes_images, ...rest } = wish as (Wish & {
        wishes_images?: Tables<"wishes_images">[];
      }) & Record<string, unknown>;
      const images = mapWishImages(wishes_images);
      return {
        ...(rest as Wish),
        images,
        image: images[0]?.url ?? (rest as Wish).image,
      };
    });
  }, [rawWishes]);
  const [reservedIds, setReservedIds] = useState<Set<number>>(new Set());
  const [reservedByMeIds, setReservedByMeIds] = useState<Set<number>>(new Set());
  const [reservedNames, setReservedNames] = useState<Record<number, string>>({});
  const remaining = wishes.filter((w) => !reservedIds.has(w.id)).length;
  const { t } = useTranslation();

  // Use the list's public display name directly if available
  const listName = useMemo(
    () => owner?.user_list_name ?? undefined,
    [owner]
  );
  const title = listName || t("public.header.wishlistMine");

  // Reservation flow state
  const [selected, setSelected] = useState<Wish | null>(null);
  const [open, setOpen] = useState(false);

  const handleReserveClick = (wish: Wish) => {
    setSelected(wish);
    setOpen(true);
  };

  const handleReserved = (wishId: number) => {
    setReservedIds((prev) => new Set(prev).add(wishId));
    setReservedByMeIds((prev) => new Set(prev).add(wishId));
  };

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Wish | null>(null);

  const handleCancelReserve = (wish: Wish) => {
    setCancelTarget(wish);
    setCancelOpen(true);
  };

  const confirmCancelReservation = async () => {
    if (!cancelTarget) return;
    const wish = cancelTarget;
    try {
      const { data: userData } = await supabaseClient.auth.getUser();
      const me = userData.user?.id;
      if (!me) throw new Error("no-user");
      const { error } = await (supabaseClient as any)
        .from("reservations")
        .delete()
        .eq("wish_id", wish.id)
        .eq("user_id", me);
      if (error) throw error;
      setReservedByMeIds((prev) => {
        const next = new Set(prev);
        next.delete(wish.id);
        return next;
      });
      setReservedIds((prev) => {
        const next = new Set(prev);
        next.delete(wish.id);
        return next;
      });
      setReservedNames((prev) => {
        const { [wish.id]: _omit, ...rest } = prev;
        return rest;
      });
      message.success(t("public.reserve.toast.cancelled"));
      setCancelOpen(false);
      setCancelTarget(null);
    } catch {
      message.error(t("wish.toast.updateError"));
    }
  };

  // Fetch reservation status for displayed wishes from DB
  useEffect(() => {
    const fetchReservations = async () => {
      const ids = wishes.map((w) => w.id);
      const reset = () => {
        setReservedIds(new Set());
        setReservedByMeIds(new Set());
        setReservedNames({});
      };
      if (!ids.length) {
        reset();
        return;
      }
      try {
        const { data: userData } = await supabaseClient.auth.getUser();
        const me = userData.user?.id || null;
        const { data, error } = await (supabaseClient as any)
          .from("reservations")
          .select("wish_id,user_id, users(name)")
          .in("wish_id", ids);
        if (error) throw error;
        const all = new Set<number>((data || []).map((r: any) => r.wish_id));
        const mine = new Set<number>((data || []).filter((r: any) => r.user_id === me).map((r: any) => r.wish_id));
        const names: Record<number, string> = {};
        (data || []).forEach((r: any) => {
          const n = r.users?.name as string | undefined;
          if (n) names[r.wish_id] = n;
        });
        setReservedIds(all);
        setReservedByMeIds(mine);
        setReservedNames(names);
      } catch {
        // If we can't load, leave prior state
      }
    };
    fetchReservations();
  }, [wishes]);

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
              <PublicWishCard
                key={w.id}
                wish={w}
                reserved={reservedIds.has(w.id)}
                reservedByMe={reservedByMeIds.has(w.id)}
                reservedName={reservedNames[w.id]}
                onReserve={handleReserveClick}
                onCancelReserve={handleCancelReserve}
              />
            ))}
      </div>
      <ReserveBottomSheet
        open={open}
        wish={selected}
        onClose={() => setOpen(false)}
        onReserved={handleReserved}
        autoSubmitIfPrefilled
      />
      <Drawer
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        placement="bottom"
        height="auto"
        destroyOnClose
        title={cancelTarget?.name || t("public.card.cancelReservation")}
        extra={
          <Button type="primary" onClick={confirmCancelReservation}>
            {t("wish.row.confirm")}
          </Button>
        }
      >
        <Typography.Paragraph>{t("public.card.cancelReservation")}</Typography.Paragraph>
      </Drawer>
    </div>
  );
};
