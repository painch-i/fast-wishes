import React from "react";
import { EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import { useGetIdentity, useOne, useUpdate } from "@refinedev/core";
import { Alert, Button, Space, Switch, Table, Typography, message } from "antd";
import { UserIdentity, UserSlug } from "../../types";
import type { Tables } from "../../../database.types";

export type IWish = Tables<"wishes">;

export type IUser = { id: number };

export const EditWishListPage: React.FC = () => {
  const { data: identity } = useGetIdentity<UserIdentity>();

  const { data: slugData } = useOne<UserSlug>({
    queryOptions: { enabled: !!identity },
    resource: "user_slugs",
    id: identity?.id,
  });

  const { tableProps } = useTable<IWish>({
    queryOptions: { enabled: !!identity },
    resource: "wishes",
    filters: {
      permanent: [
        { field: "user_id", operator: "eq", value: identity?.id },
      ],
    },
    meta: { select: "*" },
  });

  const { mutate } = useUpdate({
    resource: "wishes",
    mutationMode: "optimistic",
  });

  const publicUrl = slugData?.data.slug
    ? `${window.location.origin}/l/${slugData.data.slug}`
    : undefined;
  const hasPublic = (tableProps.dataSource as IWish[] | undefined)?.some(
    (w) => w.is_public
  );

  const handleShare = () => {
    if (!publicUrl) return;
    if (navigator.share) {
      navigator
        .share({ title: "Ma liste de souhaits", url: publicUrl })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(publicUrl)
        .then(() => message.success("Lien copié ✨"))
        .catch(() => message.error("Impossible de copier le lien"));
    }
  };

  return (
    <List>
      {publicUrl && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button href={publicUrl} target="_blank">
              Voir la liste publique
            </Button>
            <Button onClick={handleShare}>Partager</Button>
          </Space>
          <div>
            <Typography.Text type="secondary">
              Ce lien ne montre que tes souhaits publics.
            </Typography.Text>
          </div>
        </div>
      )}
      {!hasPublic && (
        <Alert
          style={{ marginBottom: 16 }}
          message="Ta liste publique n’affiche encore rien. Rends un souhait public pour le montrer."
          type="info"
          showIcon
        />
      )}
      <Table {...tableProps} rowKey="id">
        <Table.Column key="name" dataIndex="name" title="Name" sorter />
        <Table.Column
          key="description"
          dataIndex="description"
          title="Description"
          sorter
        />
        <Table.Column
          key="is_public"
          dataIndex="is_public"
          title="Is Public ?"
          sorter
          render={(value: boolean, record: IWish) => (
            <Switch
              checked={value}
              onChange={(newValue) =>
                mutate({ id: record.id, values: { is_public: newValue } })
              }
            />
          )}
        />

        <Table.Column<IWish>
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

