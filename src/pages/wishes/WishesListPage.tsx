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
import { CreateWishWizard } from "../../components/admin/wishes/CreateWishWizard";
import { EditWishDrawer } from "../../components/admin/wishes/EditWishDrawer";
import { QuickAddBar } from "../../components/admin/wishes/QuickAddBar";
import { WishUI } from "../../types/wish";
import { mapDbToWishUI, getExtras, setExtras } from "../../utility";

export const WishesListPage: React.FC = () => {
  const { tableProps } = useTable<WishUI>({ resource: "wishes" });
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
    const extras = getExtras(record.id);
    setEditing(mapDbToWishUI(record, extras));
    setEditOpen(true);
  };

  const handleEditSave = async (values: WishUI) => {
    if (!editing) return;
    const { notePrivate, tags, metadata, ...dbValues } = values;
    update(
      { resource: "wishes", id: editing.id, values: dbValues },
      {
        onSuccess: () => {
          setExtras(editing.id, { notePrivate, tags, metadata });
          message.success("Enregistré ✨");
          setEditOpen(false);
        },
        onError: () => message.error("Oups, on n'a pas pu enregistrer. Tes modifs sont gardées localement."),
      }
    );
  };

  const handleCreate = (values: WishUI) => {
    const { notePrivate, tags, metadata, ...dbValues } = values;
    create(
      { resource: "wishes", values: dbValues },
      {
        onSuccess: (data) => {
          if (data?.data?.id) {
            setExtras(data.data.id, { notePrivate, tags, metadata });
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
          dataIndex="imageUrl"
          render={(value) => value ? <Image src={value} width={48} /> : null}
        />
        <Table.Column<WishUI> title="Titre" dataIndex="title" />
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
          dataIndex="isPublic"
          render={(value, record) => (
            <Switch
              checked={value}
              onChange={(val) =>
                update(
                  { resource: "wishes", id: record.id, values: { isPublic: val } },
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
      <QuickAddBar onAdd={(url) => openCreate({ url })} />
    </List>
  );
};
