import React from "react";
import { EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import { useGetIdentity, useOne, useUpdate } from "@refinedev/core";
import { Alert, Button, Space, Switch, Table, Typography, message } from "antd";
import { UserIdentity, UserSlug } from "../../types";
import type { Tables } from "../../../database.types";
import { useTranslation } from "react-i18next";

export type IWish = Tables<"wishes">;

export type IUser = { id: number };

export const EditWishListPage: React.FC = () => {
  const { data: identity } = useGetIdentity<UserIdentity>();

  const { data: slugData } = useOne<UserSlug>({
    queryOptions: { enabled: !!identity },
    resource: "users",
    id: identity?.id,
  });
  const { t } = useTranslation();

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
        .share({ title: t("wish.list.shareTitle"), url: publicUrl })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(publicUrl)
        .then(() => message.success(t("wish.toast.copied")))
        .catch(() => message.error(t("wish.toast.copyError")));
    }
  };

  return (
    <List>
      {publicUrl && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button href={publicUrl} target="_blank">
              {t("wish.list.viewPublic")}
            </Button>
            <Button onClick={handleShare}>{t("wish.list.sharePublic")}</Button>
          </Space>
          <div>
            <Typography.Text type="secondary">
              {t("wish.list.publicLinkInfo")}
            </Typography.Text>
          </div>
        </div>
      )}
      {!hasPublic && (
        <Alert
          style={{ marginBottom: 16 }}
          message={t("wish.list.banner")}
          type="info"
          showIcon
        />
      )}
      <Table {...tableProps} rowKey="id">
        <Table.Column key="name" dataIndex="name" title={t("lists.public.columns.name")} sorter />
        <Table.Column
          key="description"
          dataIndex="description"
          title={t("lists.public.columns.description")}
          sorter
        />
        <Table.Column
          key="is_public"
          dataIndex="is_public"
          title={t("lists.public.columns.isPublic")}
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
          title={t("lists.public.columns.actions")}
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
