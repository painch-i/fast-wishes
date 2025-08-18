import { useState } from "react";
import {
  Typography,
  Skeleton,
  Button,
  message,
} from "antd";
import {
  useGetIdentity,
  useList,
  useCreate,
  useUpdate,
} from "@refinedev/core";

import { EditWishDrawer } from "../../components/admin/wishes/EditWishDrawer";
import { CreateWishWizard } from "../../components/admin/wishes/CreateWishWizard";
import { WishUI } from "../../types/wish";
import { UserIdentity } from "../../types";
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
  onClick: (item: WishUI) => void;
};

const Row: React.FC<RowProps> = ({ item, onClick }) => {
  const price = formatPrice(item.price, item.currency);
  const [pressed, setPressed] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Modifier ${item.name}`}
      onClick={() => onClick(item)}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && onClick(item)
      }
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #F0F2F5",
        background: pressed ? "#FAFAFA" : undefined,
        cursor: "pointer",
      }}
    >
      {item.image_url ? (
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
      ) : (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "#F6F7F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 24,
          }}
        >
          🎁
        </div>
      )}
      <div style={{ flex: 1, marginLeft: 12, overflow: "hidden" }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 16,
            color: "#1F2937",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.name}
        </div>
        {item.description && (
          <div
            style={{
              fontSize: 14,
              color: "#6B7280",
              lineHeight: 1.35,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.description}
          </div>
        )}
      </div>
      {price && (
        <div
          style={{
            marginLeft: 12,
            fontSize: 16,
            fontWeight: 600,
            color: "#111827",
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          {price}
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

  const wishes = data?.data ?? [];

  const { mutate: update } = useUpdate();
  const { mutate: create } = useCreate();

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<WishUI | undefined>();

  const openEdit = (record: WishUI) => {
    const extras = getExtras(String(record.id));
    setEditing(mapDbToWishUI(record, extras));
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

  const handleCreate = (values: WishUI) => {
    const { note_private, tags, metadata, ...dbValues } = values;
    create(
      { resource: "wishes", values: dbValues },
      {
        onSuccess: (data) => {
          if (data?.data?.id) {
            setExtras(String(data.data.id), { note_private, tags, metadata });
          }
          message.success("Enregistré ✨");
          setCreateOpen(false);
          refetch();
        },
        onError: () =>
          message.error(
            "Oups, on n'a pas pu enregistrer. Tes modifs sont gardées localement."
          ),
      }
    );
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ margin: "16px 0" }}>
        <Typography.Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Tes souhaits 🎁
        </Typography.Title>
        <Typography.Text type="secondary">
          Ajoute ce qui compte, on garde le reste simple.
        </Typography.Text>
      </div>

      {isLoading && (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #F0F2F5",
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
            <Row key={w.id} item={w} onClick={openEdit} />
          ))}
        </div>
      )}

      <EditWishDrawer
        open={editOpen}
        initialValues={editing}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
      />
      <CreateWishWizard
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onSubmit={(values) => handleCreate(values)}
      />
      {!createOpen && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          onClick={() => setCreateOpen(true)}
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

