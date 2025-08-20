import { useEffect, useState } from "react";
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
} from "@refinedev/core";

import { EditWishDrawer } from "../../components/admin/wishes/EditWishDrawer";
import { AddWishSheet } from "../../components/wish/AddWishSheet";
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
};

const Row: React.FC<RowProps> = ({ item, onOpen }) => {
  const price = formatPrice(item.price, item.currency);
  const domain = (() => {
    try {
      return item.url ? new URL(item.url).hostname : null;
    } catch {
      return null;
    }
  })();
  const [pressed, setPressed] = useState(false);

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
    if (navigator.vibrate) navigator.vibrate(10);
    onOpen(item);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Modifier ${item.name}`}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: 64,
        padding: "12px 0",
        borderBottom: "1px solid #EEF0F3",
        background: pressed ? colors.accentPeach : undefined,
        cursor: "pointer",
      }}
    >
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
            <Tag
              style={{
                background: colors.accentMint,
                border: "none",
                color: colors.textPrimary,
                flexShrink: 0,
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(item, "url");
              }}
            >
              {domain}
            </Tag>
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
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

  const wishes = data?.data ?? [];

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

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<WishUI | undefined>();
  const [focusField, setFocusField] = useState<keyof WishUI | undefined>();
  const [bannerDismissed, setBannerDismissed] = useState(false);

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

  const openEdit = (record: WishUI, field?: keyof WishUI) => {
    const extras = getExtras(String(record.id));
    setEditing(mapDbToWishUI(record, extras));
    setFocusField(field);
    setEditOpen(true);
  };

  const handleEditSave = async (values: WishUI) => {
    if (!editing) return;
    const { note_private, tags, metadata, ...dbValues } = values;
    update(
      { resource: "wishes", id: editing.id, values: dbValues },
      {
        onSuccess: () => {
          setExtras(String(editing.id), { note_private, tags, metadata });
          message.success("Enregistré ✨");
          setEditOpen(false);
          refetch();
        },
        onError: () =>
          message.error(
            "Oups, on n'a pas pu enregistrer. Tes modifs sont gardées localement."
          ),
      }
    );
  };

  const handleAdd = (values: WishUI) => {
    if (!identity?.id) {
      message.error("Impossible de créer le souhait : utilisateur inconnu");
      return;
    }
    const { note_private, tags, metadata, ...dbValues } = values;
    create(
      { resource: "wishes", values: { ...dbValues, user_id: identity.id } },
      {
        onSuccess: (data) => {
          if (data?.data?.id) {
            setExtras(String(data.data.id), { note_private, tags, metadata });
          }
          message.success("Souhait ajouté ✨");
          setAddOpen(false);
          refetch();
        },
        onError: () =>
          message.error(
            "Oups, on n’a pas pu enregistrer. Tes infos sont gardées en brouillon."
          ),
      }
    );
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
            <Row key={w.id} item={w} onOpen={openEdit} />
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
                  onClick={() => setAddOpen(true)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && setAddOpen(true)
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

      <EditWishDrawer
        open={editOpen}
        initialValues={editing}
        focusField={focusField}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
      />
      <AddWishSheet
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onSubmit={(values) => handleAdd(values)}
      />
      {!addOpen && !editOpen && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          onClick={() => setAddOpen(true)}
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

