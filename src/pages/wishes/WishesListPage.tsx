import { useEffect, useRef, useState } from "react";
import { Typography, Skeleton, Button, Tag, message, Alert } from "antd";
import { OpenInNew, Share } from "@mui/icons-material";
import "./WishesListPage.css";
import { colors } from "../../theme";
import {
  useGetIdentity,
  useList,
  useCreate,
  useUpdate,
  useOne,
  useDelete,
} from "@refinedev/core";

import { WishSheet } from "../../components/wish/WishSheet";
import { WishUI } from "../../types/wish";
import { UserIdentity, UserSlug } from "../../types";
import { mapDbToWishUI, getExtras, setExtras } from "../../utility";

const browserLocale = () =>
  typeof navigator !== "undefined" && navigator.language
    ? navigator.language
    : undefined;

const defaultCurrency = (locale?: string) => {
  if (!locale) return "EUR";
  try {
    const region = new Intl.Locale(locale).maximize().region;
    const map: Record<string, string> = {
      US: "USD",
      GB: "GBP",
      FR: "EUR",
      DE: "EUR",
      ES: "EUR",
    };
    return (region && map[region]) || "EUR";
  } catch {
    return "EUR";
  }
};

const formatPrice = (
  price?: number | string | null,
  currency?: string | null
) => {
  if (price == null) return null;
  const numeric = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(Number(numeric))) return null;
  const locale = browserLocale();
  const cur = currency || defaultCurrency(locale);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: cur,
  }).format(numeric);
};

type RowProps = {
  item: WishUI;
  onOpen: (item: WishUI, field?: keyof WishUI) => void;
  onDelete: (item: WishUI) => void;
};

const Row: React.FC<RowProps> = ({ item, onOpen, onDelete }) => {
  const price = formatPrice(item.price, item.currency);
  const domain = (() => {
    try {
      return item.url ? new URL(item.url).hostname : null;
    } catch {
      return null;
    }
  })();
  const [pressed, setPressed] = useState(false);
  const [danger, setDanger] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const longPress = useRef<number>();
  const longPressed = useRef(false);
  const confirmTimer = useRef<number>();
  const rowRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLButtonElement>(null);
  const startPos = useRef<{ x: number; y: number }>();

  const accents = [
    colors.accentPeach,
    colors.accentMint,
    colors.accentLavender,
    colors.accentYellow,
  ];

  const hashColor = (seed: string) => {
    let sum = 0;
    for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
    return accents[sum % accents.length];
  };

  const getEmoji = (name?: string) => {
    const n = (name || "").toLowerCase();
    if (/livre|book/.test(n)) return "📚";
    if (/tech|usb|phone|laptop|ordinateur|électronique/.test(n)) return "🔌";
    if (/cuisine|kitchen|cook|casserole|poêle/.test(n)) return "🍳";
    if (/maison|home|déco/.test(n)) return "🏠";
    if (/pull|shirt|robe|vêt/.test(n)) return "👕";
    return "🎁";
  };

  const renderThumb = () => {
    const accent = hashColor(domain || item.name || "");
    if (item.image_url) {
      return (
        <img
          src={item.image_url}
          alt=""
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      );
    }
    if (item.metadata?.favicon) {
      return (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img src={item.metadata.favicon} alt="" style={{ width: 24, height: 24 }} />
        </div>
      );
    }
    const emoji = getEmoji(item.name);
    if (emoji !== "🎁") {
      return (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 24,
          }}
        >
          {emoji}
        </div>
      );
    }
    const initial = item.name?.[0]?.toUpperCase() || "?";
    return (
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 24,
          fontWeight: 600,
          color: colors.textPrimary,
        }}
      >
        {initial}
      </div>
    );
  };

  const handleClick = () => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (danger) {
      setDanger(false);
      setConfirm(false);
      return;
    }
    navigator.vibrate?.(10);
    onOpen(item);
  };

  const startPress = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) {
      cancelPress();
      return;
    }
    setPressed(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    longPress.current = window.setTimeout(() => {
      longPressed.current = true;
      setPressed(false);
      if (item.status === "reserved") {
        message.warning("Déjà réservé — impossible de supprimer.");
        return;
      }
      setDanger(true);
      navigator.vibrate?.(10);
    }, 600);
  };

  const movePress = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!longPress.current || !startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    if (dx > 10 || dy > 10) cancelPress();
  };

  const cancelPress = () => {
    setPressed(false);
    if (longPress.current) {
      clearTimeout(longPress.current);
      longPress.current = undefined;
    }
    startPos.current = undefined;
  };

  useEffect(() => {
    if (danger) {
      const handleOutside = (e: PointerEvent) => {
        if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
          setDanger(false);
          setConfirm(false);
        }
      };
      document.addEventListener("pointerdown", handleOutside);
      chipRef.current?.focus();
      return () => document.removeEventListener("pointerdown", handleOutside);
    }
  }, [danger]);

  const handleDelete = () => {
    if (!confirm) {
      setConfirm(true);
      confirmTimer.current = window.setTimeout(() => {
        setConfirm(false);
        setDanger(false);
      }, 3000);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setConfirm(false);
    setDanger(false);
    onDelete(item);
  };

  return (
    <div
      ref={rowRef}
      className="wish-row"
      role="button"
      tabIndex={0}
      aria-label={`Modifier ${item.name}`}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
      onPointerDown={startPress}
      onPointerMove={movePress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: 64,
        padding: "12px 0",
        borderBottom: "1px solid #EEF0F3",
        background: danger
          ? "rgba(255,107,107,0.08)"
          : pressed
            ? colors.accentPeach
            : undefined,
        cursor: "pointer",
      }}
    >
      <button
        className="visually-hidden"
        aria-label={`Supprimer ${item.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setDanger(true);
          navigator.vibrate?.(10);
        }}
      />
      {renderThumb()}
      <div style={{ flex: 1, marginLeft: 12, overflow: "hidden" }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 16,
            color: colors.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {domain && (
            <span
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                flexShrink: 0,
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(item, "url");
              }}
            >
              {domain}
            </span>
          )}
          <span
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(item, "description");
            }}
          >
            {item.description || "Ajoute un petit mot pour guider 💌"}
          </span>
        </div>
        {!domain && (
          <div
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 4,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(item, "url");
            }}
          >
            + Lien pour aider à trouver
          </div>
        )}
      </div>
      {danger ? (
        <button
          ref={chipRef}
          aria-label={confirm ? "Confirmer" : `Supprimer ${item.name}`}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          style={{
            background: confirm ? colors.primary : "transparent",
            border: `1px solid ${colors.primary}`,
            color: confirm ? "#fff" : colors.primary,
            borderRadius: 16,
            height: 32,
            padding: "0 12px",
            marginLeft: 8,
            fontWeight: 600,
            transition: "all 150ms",
          }}
        >
          {confirm ? "Confirmer" : "Supprimer"}
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: 8,
          }}
        >
          {price ? (
            <Tag
              style={{
                background: colors.accentPeach,
                border: "none",
                fontWeight: 600,
                color: colors.textPrimary,
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(item, "price");
              }}
            >
              {price}
            </Tag>
          ) : (
            <Tag
              style={{
                background: colors.accentPeach,
                border: `1px dashed ${colors.primary}`,
                color: colors.primary,
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(item, "price");
              }}
            >
              Ajouter un prix
            </Tag>
          )}
          <span style={{ color: "#9CA3AF", fontSize: 16 }}>›</span>
        </div>
      )}
    </div>
  );
};

export const WishesListPage: React.FC = () => {
  const { data: identity } = useGetIdentity<UserIdentity>();

  const { data, isLoading, isError, refetch } = useList<WishUI>({
    resource: "wishes",
    filters: [
      { field: "user_id", operator: "eq", value: identity?.id },
    ],
    queryOptions: { enabled: !!identity },
  });
  const [wishes, setWishes] = useState<WishUI[]>([]);
  useEffect(() => {
    if (data?.data) setWishes(data.data);
  }, [data]);

  const { data: slugData } = useOne<UserSlug>({
    resource: "user_slugs",
    id: identity?.id,
    queryOptions: { enabled: !!identity },
  });

  const publicUrl = slugData?.data.slug
    ? `${window.location.origin}/l/${slugData.data.slug}`
    : undefined;
  const hasPublic = wishes.some((w) => w.is_public);

  const { mutate: update } = useUpdate();
  const { mutate: create } = useCreate();
  const { mutate: deleteOne } = useDelete();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<WishUI | undefined>();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const pendingDelete = useRef<{ item: WishUI; index: number; timeout: number } | null>(null);

  useEffect(() => {
    if (localStorage.getItem("public-banner-dismissed")) {
      setBannerDismissed(true);
    }
  }, []);

  const handleShare = () => {
    if (!publicUrl) return;
    navigator.vibrate?.(10);
    if (navigator.share) {
      navigator
        .share({ title: "Ma liste de souhaits", url: publicUrl })
        .catch(() => {});
    } else {
      navigator.clipboard
        ?.writeText(publicUrl)
        .then(() => message.success("Lien copié ✨"))
        .catch(() => message.error("Impossible de copier le lien"));
    }
  };

  const handleOpenPublic = () => {
    if (!publicUrl) return;
    navigator.vibrate?.(10);
    window.open(publicUrl, "_blank");
  };

  const dismissBanner = () => {
    localStorage.setItem("public-banner-dismissed", "1");
    setBannerDismissed(true);
  };

  const openEdit = (record: WishUI, _field?: keyof WishUI) => {
    const extras = getExtras(String(record.id));
    setEditing(mapDbToWishUI(record, extras));
    setSheetOpen(true);
  };

  const openAdd = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };

  const handleSave = (values: WishUI) => {
    const { note_private, tags, metadata, price_cents, ...dbValues } = values as any;
    if (values.id) {
      update(
        {
          resource: "wishes",
          id: values.id,
          values: { ...dbValues, price: price_cents != null ? String(price_cents / 100) : null },
          successNotification: false,
          errorNotification: false,
        },
        {
          onSuccess: () => {
            setExtras(String(values.id), { note_private, tags, metadata });
            message.success("Modifications enregistrées ✨");
            setSheetOpen(false);
            refetch();
          },
          onError: () =>
            message.error(
              "Oups, on n'a pas pu enregistrer. Tes modifs sont gardées localement."
            ),
        }
      );
    } else {
      if (!identity?.id) {
        message.error("Impossible de créer le souhait : utilisateur inconnu");
        return;
      }
      create(
        {
          resource: "wishes",
          values: {
            ...dbValues,
            price: price_cents != null ? String(price_cents / 100) : null,
            user_id: identity.id,
          },
          successNotification: false,
          errorNotification: false,
        },
        {
          onSuccess: (data) => {
            if (data?.data?.id) {
              setExtras(String(data.data.id), { note_private, tags, metadata });
            }
            message.success("Souhait ajouté ✨");
            setSheetOpen(false);
            refetch();
          },
          onError: () =>
            message.error(
              "Oups, on n’a pas pu enregistrer. Tes infos sont gardées en brouillon."
            ),
        }
      );
    }
  };

  const handleDelete = (wish: WishUI) => {
    if (wish.status === "reserved") {
      message.warning("Déjà réservé — impossible de supprimer.");
      return;
    }
    const index = wishes.findIndex((w) => w.id === wish.id);
    if (index === -1) return;
    const newList = [...wishes];
    newList.splice(index, 1);
    setWishes(newList);
    const key = `delete-${wish.id}`;
    const undo = () => {
      if (pendingDelete.current) clearTimeout(pendingDelete.current.timeout);
      message.destroy(key);
      const restored = [...newList];
      restored.splice(index, 0, wish);
      setWishes(restored);
      pendingDelete.current = null;
    };
    message.open({
      key,
      type: "info",
      duration: 5,
      content: (
        <span aria-live="polite">
          Souhait supprimé. {" "}
          <Button type="link" onClick={undo} style={{ padding: 0 }}>
            Annuler
          </Button>
        </span>
      ),
    });
    const timeout = window.setTimeout(() => {
      deleteOne(
        {
          resource: "wishes",
          id: wish.id,
          successNotification: false,
          errorNotification: false,
        },
        {
          onError: () => {
            undo();
            message.error("Oups, impossible de supprimer. Réessayer.");
          },
        }
      );
      pendingDelete.current = null;
    }, 5000);
    pendingDelete.current = { item: wish, index, timeout };
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ margin: "16px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Typography.Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Tes souhaits 🎁
          </Typography.Title>
          {hasPublic && (
            <div className="header-icons">
              <button
                className="icon-btn"
                aria-label="Voir la boutique (page publique)"
                onClick={handleOpenPublic}
                disabled={!publicUrl}
              >
                <span className="icon-btn-inner">
                  <OpenInNew style={{ width: 20, height: 20 }} />
                </span>
              </button>
              <button
                className="icon-btn"
                aria-label="Partager le lien public"
                onClick={handleShare}
                disabled={!publicUrl}
              >
                <span className="icon-btn-inner">
                  <Share style={{ width: 20, height: 20 }} />
                </span>
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography.Text type="secondary">
            Appuie sur un souhait pour le modifier.
          </Typography.Text>
          {wishes.length > 0 && (
            <Tag
              style={{
                background: "#F3F4F6",
                border: "none",
                color: "#111827",
              }}
            >
              {wishes.length} souhait{wishes.length > 1 ? "s" : ""}
            </Tag>
          )}
        </div>
      </div>

      {!bannerDismissed && wishes.length > 0 && !hasPublic && (
        <Alert
          style={{ marginBottom: 16 }}
          message="Ta liste publique n’affiche encore rien. Rends un souhait public pour le montrer."
          type="info"
          showIcon
          closable
          onClose={dismissBanner}
        />
      )}

      {isLoading && (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #EEF0F3",
              }}
            >
              <Skeleton.Avatar
                active
                shape="square"
                size={56}
                style={{ borderRadius: 12 }}
              />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton.Input
                  active
                  style={{ width: "60%", marginBottom: 8 }}
                  size="small"
                />
                <Skeleton.Input
                  active
                  style={{ width: "80%" }}
                  size="small"
                />
              </div>
              <Skeleton.Input
                active
                style={{ width: 80, marginLeft: 12 }}
                size="small"
              />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Typography.Text>
            Oups, impossible d’afficher la liste.
          </Typography.Text>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => refetch()}>Réessayer</Button>
          </div>
        </div>
      )}

      {!isLoading && !isError && wishes.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 48 }}>🎁</div>
          <Typography.Paragraph>
            Aucun souhait pour l’instant. Ajoute ton premier ✨
          </Typography.Paragraph>
        </div>
      )}

      {!isLoading && !isError && wishes.length > 0 && (
        <div>
          {wishes.map((w) => (
            <Row key={w.id} item={w} onOpen={openEdit} onDelete={handleDelete} />
          ))}
          {wishes.length <= 2 && (
            <>
              {[
                "Ajouter un souhait (ex : 'Bouilloire inox')",
                "Ajouter un souhait (ex : 'Pull M – couleur beige')",
              ].map((placeholder, i) => (
                <div
                  key={`ghost-${i}`}
                  role="button"
                  tabIndex={0}
                  onClick={openAdd}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && openAdd()
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid #EEF0F3",
                    cursor: "pointer",
                    minHeight: 64,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: i % 2 === 0 ? colors.accentPeach : colors.accentMint,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 24,
                      color: colors.primary,
                    }}
                  >
                    +
                  </div>
                  <div style={{ marginLeft: 12, color: colors.textSecondary }}>{placeholder}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <WishSheet
        open={sheetOpen}
        mode={editing ? "edit" : "create"}
        initialValues={editing}
        onCancel={() => setSheetOpen(false)}
        onSubmit={handleSave}
      />
      {!sheetOpen && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          onClick={openAdd}
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          +
        </Button>
      )}
    </div>
  );
};

