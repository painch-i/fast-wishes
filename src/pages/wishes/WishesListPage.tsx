import { OpenInNew, Settings } from "@mui/icons-material";
import {
  useCreate,
  useDelete,
  useGetIdentity,
  useList,
  useOne,
  useUpdate,
} from "@refinedev/core";
import { Alert, Button, Drawer, Form, Input, Skeleton, Tag, Typography, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { colors } from "../../theme";
import "./WishesListPage.css";

import { useTranslation } from "react-i18next";
import { WishSheet } from "../../components/wish/WishSheet";
import { useFormat } from "../../i18n";
import { UserIdentity, UserSlug } from "../../types";
import { WishUI } from "../../types/wish";
import { getExtras, mapDbToWishUI, setExtras } from "../../utility";

type RowProps = {
  item: WishUI;
  onOpen: (item: WishUI, field?: keyof WishUI) => void;
  onDelete: (item: WishUI) => void;
};

const Row: React.FC<RowProps> = ({ item, onOpen, onDelete }) => {
  const { formatPrice } = useFormat();
  const { t } = useTranslation();
  const priceCents =
    item.price_cents != null
      ? item.price_cents
      : item.price
      ? Math.round(parseFloat(String(item.price)) * 100)
      : null;
  const price = formatPrice(priceCents, item.currency || undefined);
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
        message.warning(t("wish.toast.reserved"));
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
      aria-label={t("wish.row.edit", { name: item.name })}
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
        aria-label={t("wish.row.delete", { name: item.name })}
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
            {item.description || t("wish.row.addNote")}
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
            {t("wish.row.addLink")}
          </div>
        )}
      </div>
      {danger ? (
        <button
          ref={chipRef}
          aria-label={confirm ? t("wish.row.confirm") : t("wish.row.delete", { name: item.name })}
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
          {confirm ? t("wish.row.confirm") : t("wish.row.remove")}
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
              {t("wish.row.addPrice")}
            </Tag>
          )}
          <span style={{ color: "#9CA3AF", fontSize: 16 }}>›</span>
        </div>
      )}
    </div>
  );
};

export const WishesListPage: React.FC = () => {
  const { t } = useTranslation();
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
    resource: "users",
    id: identity?.id,
    queryOptions: { enabled: !!identity },
  });

  const publicUrl = slugData?.data.slug
    ? `${window.location.origin}/l/${slugData.data.slug}`
    : undefined;
  const hasPublic = wishes.some((w) => w.is_public);

  const { mutate: update } = useUpdate();
  const { mutate: updateUser } = useUpdate();
  const { mutate: create } = useCreate();
  const { mutate: deleteOne } = useDelete();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<WishUI | undefined>();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm] = Form.useForm<{ slug: string; name?: string | null }>();
  const watchedSlug = Form.useWatch("slug", settingsForm);
  const pendingDelete = useRef<{ item: WishUI; index: number; timeout: number } | null>(null);

  useEffect(() => {
    if (localStorage.getItem("public-banner-dismissed")) {
      setBannerDismissed(true);
    }
  }, []);

  // Share and external open actions removed; keep a simple anchor link.

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
            message.success(t("wish.toast.updated"));
            setSheetOpen(false);
            refetch();
          },
          onError: () =>
            message.error(t("wish.toast.updateError")),
        }
      );
    } else {
      if (!identity?.id) {
        message.error(t("wish.toast.unknownUser"));
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
            message.success(t("wish.toast.created"));
            setSheetOpen(false);
            refetch();
          },
          onError: () =>
            message.error(t("wish.toast.saveError")),
        }
      );
    }
  };

  const handleDelete = (wish: WishUI) => {
    if (wish.status === "reserved") {
      message.warning(t("wish.toast.reserved"));
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
          {t("wish.toast.deleted")} {" "}
          <Button type="link" onClick={undo} style={{ padding: 0 }}>
            {t("common.cancel")}
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
            message.error(t("wish.toast.deleteError"));
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
            {t("wish.list.title")}
          </Typography.Title>
          <div className="header-icons">
            <button
              className="icon-btn"
              aria-label={t("wish.list.settings", "Settings")}
              onClick={() => {
                // Prefill form with current values
                settingsForm.setFieldsValue({
                  slug: slugData?.data.slug || "",
                  name: slugData?.data.user_list_name || undefined,
                });
                setSettingsOpen(true);
              }}
            >
              <span className="icon-btn-inner">
                <Settings style={{ width: 20, height: 20 }} />
              </span>
            </button>
            {hasPublic && publicUrl && (
              <a
                className="icon-btn"
                aria-label={t("wish.list.viewPublic")}
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="icon-btn-inner">
                  <OpenInNew style={{ width: 20, height: 20 }} />
                </span>
              </a>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography.Text type="secondary">
            {t("wish.list.instructions")}
          </Typography.Text>
          {wishes.length > 0 && (
            <Tag
              style={{
                background: "#F3F4F6",
                border: "none",
                color: "#111827",
              }}
            >
              {t("wish.list.count", { count: wishes.length })}
            </Tag>
          )}
        </div>
      </div>

      {!bannerDismissed && wishes.length > 0 && !hasPublic && (
        <Alert
          style={{ marginBottom: 16 }}
          message={t("wish.list.banner")}
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
            {t("wish.list.loadError")}
          </Typography.Text>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => refetch()}>{t("wish.list.retry")}</Button>
          </div>
        </div>
      )}

      {!isLoading && !isError && wishes.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 48 }}>🎁</div>
          <Typography.Paragraph>
            {t("wish.list.empty")}
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
              {[t("wish.list.ghost1"), t("wish.list.ghost2")].map((placeholder, i) => (
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
        previousWishCurrency={wishes.find((w) => w.currency)?.currency}
        onCancel={() => setSheetOpen(false)}
        onSubmit={handleSave}
      />

      <Drawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        placement={window.matchMedia && window.matchMedia("(max-width:600px)").matches ? "bottom" : "right"}
        height={window.matchMedia && window.matchMedia("(max-width:600px)").matches ? "60vh" : undefined}
        width={360}
        title={t("wish.list.settingsTitle")}
      >
        <Form
          form={settingsForm}
          layout="vertical"
          initialValues={{ slug: slugData?.data.slug, name: slugData?.data.user_list_name || undefined }}
          onFinish={(values) => {
            if (!identity?.id) return;
            const sanitized = (values.slug || "")
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
              .replace(/--+/g, "-")
              .replace(/^-+|-+$/g, "");
            if (sanitized !== values.slug) settingsForm.setFieldsValue({ slug: sanitized });
            updateUser(
              {
                resource: "users",
                id: identity.id,
                values: { slug: sanitized, user_list_name: values.name ?? null },
                successNotification: false,
                errorNotification: false,
              },
              {
                onSuccess: () => {
                  message.success(t("wish.toast.updated"));
                  setSettingsOpen(false);
                },
                onError: () => {
                  message.error(t("wish.toast.updateError"));
                },
              }
            );
          }}
        >
          <Form.Item
            name="slug"
            label={t("common.slug")}
            rules={[{ required: true, message: t("wish.sheet.name.required") }]}
          >
            <Input
              placeholder="mon-slug"
              onChange={(e) => {
                const v = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")
                  .replace(/--+/g, "-")
                  .replace(/^-+|-+$/g, "");
                if (v !== e.target.value) settingsForm.setFieldsValue({ slug: v });
              }}
            />
          </Form.Item>
          <Form.Item name="name" label={t("common.name")}> 
            <Input placeholder={t("common.name")} />
          </Form.Item>
          {watchedSlug && (
            <Typography.Text type="secondary">
              {t("wish.list.publicLinkInfo")} {" "}
              <code>{`${window.location.origin}/l/${watchedSlug}`}</code>
            </Typography.Text>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <Button onClick={() => setSettingsOpen(false)}>{t("common.cancel")}</Button>
            <Button type="primary" onClick={() => settingsForm.submit()}>
              {t("common.save")}
            </Button>
          </div>
        </Form>
      </Drawer>
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
