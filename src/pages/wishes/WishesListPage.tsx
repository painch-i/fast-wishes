import { useState } from "react";
import {
  List,
  useTable,
} from "@refinedev/antd";
import { Table, Image, Switch, Select, InputNumber, Tag, Button } from "antd";
import { useCreate, useUpdate } from "@refinedev/core";
import { WishDrawer } from "../../components/admin/wishes/WishDrawer";
import { QuickAddBar } from "../../components/admin/wishes/QuickAddBar";
import { WishUI } from "../../types/wish";

export const WishesListPage: React.FC = () => {
  const { tableProps } = useTable<WishUI>({ resource: "wishes" });
  const { mutate: update } = useUpdate();
  const { mutate: create } = useCreate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<WishUI> | undefined>();

  const handleSave = (values: WishUI) => {
    if (editing?.id) {
      update({ resource: "wishes", id: editing.id, values }, {
        onSuccess: () => setDrawerOpen(false),
      });
    } else {
      create({ resource: "wishes", values }, {
        onSuccess: () => setDrawerOpen(false),
      });
    }
  };

  const openDrawer = (initial?: Partial<WishUI>) => {
    setEditing(initial);
    setDrawerOpen(true);
  };

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <Button type="primary" onClick={() => openDrawer()}>Créer un souhait</Button>
        </>
      )}
    >
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
              onBlur={(e) => update({ resource: "wishes", id: record.id, values: { price: Number(e.target.value) } })}
            />
          )}
        />
        <Table.Column<WishUI>
          title="Statut"
          dataIndex="status"
          render={(value, record) => (
            <Select
              defaultValue={value}
              onChange={(val) => update({ resource: "wishes", id: record.id, values: { status: val } })}
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
              onChange={(val) => update({ resource: "wishes", id: record.id, values: { isPublic: val } })}
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
            <Button onClick={() => openDrawer(record)}>Éditer</Button>
          )}
        />
      </Table>
      <WishDrawer
        open={drawerOpen}
        initialValues={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />
      <QuickAddBar onAdd={(url) => openDrawer({ url })} />
    </List>
  );
};
