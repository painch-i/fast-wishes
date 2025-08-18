import { useState } from "react";
import { List, useTable } from "@refinedev/antd";
import {
  Table,
  Image,
  Switch,
  Select,
  InputNumber,
  Tag,
  Button,
  Typography,
  Empty,
  message,
  Space,
} from "antd";
import { useCreate, useUpdate } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { CreateWishWizard } from "../../components/admin/wishes/CreateWishWizard";
import { EditWishDrawer } from "../../components/admin/wishes/EditWishDrawer";
import { QuickAddBar } from "../../components/admin/wishes/QuickAddBar";
import { WishUI } from "../../types/wish";
import { UserIdentity } from "../../types";
import { mapDbToWishUI, getExtras, setExtras } from "../../utility";

export const WishesListPage: React.FC = () => {
  const { data: identity } = useGetIdentity<UserIdentity>();
  const { tableProps } = useTable<WishUI>({
    resource: "wishes",
    queryOptions: {
      enabled: !!identity,
    },
    filters: {
      permanent: [
        {
          field: "user_id",
          operator: "eq",
          value: identity?.id,
        },
      ],
    },
  });
  const { mutate: update } = useUpdate();
  const { mutate: create } = useCreate();

  const [createOpen, setCreateOpen] = useState(false);
  const [createInitial, setCreateInitial] = useState<Partial<WishUI> | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<WishUI | undefined>();

  const openCreate = (initial?: Partial<WishUI>) => {
    setCreateInitial(initial);
    setCreateOpen(true);
  };

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
        },
        onError: () => message.error("Oups, on n'a pas pu enregistrer. Tes modifs sont gardées localement."),
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
        },
        onError: () => message.error("Oups, on n'a pas pu enregistrer. Tes modifs sont gardées localement."),
      }
    );
  };

  return (
    <List>
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3}>Tes souhaits 🎁</Typography.Title>
        <Typography.Paragraph>
          Ajoute, organise et rends-les visibles à tes proches. On t’accompagne.
        </Typography.Paragraph>
        <Space>
          <Button type="primary" onClick={() => openCreate()}>Créer un souhait</Button>
          <Button onClick={() => openCreate()}>Importer depuis un lien</Button>
        </Space>
      </div>
      <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
        <Table.Column<WishUI>
          title="Image"
          dataIndex="image_url"
          render={(value) => value ? <Image src={value} width={48} /> : null}
        />
        <Table.Column<WishUI> title="Titre" dataIndex="name" />
        <Table.Column<WishUI>
          title="Prix"
          dataIndex="price"
          render={(value, record) => (
            <InputNumber
              min={0}
              defaultValue={value}
              onBlur={(e) =>
                update(
                  { resource: "wishes", id: record.id, values: { price: Number(e.target.value) } },
                  { onSuccess: () => message.success("C'est noté ✔️") }
                )
              }
            />
          )}
        />
        <Table.Column<WishUI>
          title="Statut"
          dataIndex="status"
          render={(value, record) => (
            <Select
              defaultValue={value}
              onChange={(val) =>
                update(
                  { resource: "wishes", id: record.id, values: { status: val } },
                  { onSuccess: () => message.success("C'est noté ✔️") }
                )
              }
              options={["draft", "available", "reserved", "received", "archived"].map(v => ({ value: v }))}
            />
          )}
        />
        <Table.Column<WishUI>
          title="Public ?"
          dataIndex="is_public"
          render={(value, record) => (
            <Switch
              checked={value}
              onChange={(val) =>
                update(
                  { resource: "wishes", id: record.id, values: { is_public: val } },
                  { onSuccess: () => message.success("C'est noté ✔️") }
                )
              }
            />
          )}
        />
        <Table.Column<WishUI>
          title="Tags"
          dataIndex="tags"
          render={(tags: string[] = []) => tags.map((t) => <Tag key={t}>{t}</Tag>)}
        />
        <Table.Column<WishUI>
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Button onClick={() => openEdit(record)}>Éditer</Button>
          )}
        />
      </Table>
      {(!tableProps?.dataSource || tableProps.dataSource.length === 0) && (
        <Empty description="Aucun souhait pour l’instant. Commence par un lien, c’est magique." />
      )}
      <EditWishDrawer
        open={editOpen}
        initialValues={editing}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
      />
      <CreateWishWizard
        open={createOpen}
        initialValues={createInitial}
        onCancel={() => setCreateOpen(false)}
        onSubmit={(values) => handleCreate(values)}
      />
      {!createOpen && (
        <QuickAddBar
          onAdd={(url) => openCreate({ url })}
          aria-hidden={createOpen}
        />
      )}
    </List>
  );
};
