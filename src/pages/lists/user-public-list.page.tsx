

import {
  EditButton,
  List,
  ShowButton,
  useTable
} from "@refinedev/antd";
import { Space, Switch, Table } from "antd";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import type { Tables } from "../.././database.types";

export type IWish = Tables<"wishes">;


export type IUser = {
  id: number;
};



export const UserPublicList: React.FC = () => {
  const params = useParams();
  const slug = params.slug;
  const { t } = useTranslation();

  const { tableProps } = useTable<IWish>({
    resource: 'wishes',
    filters: {
      permanent: [
        {
        field: "users.slug",
        operator: "eq",
        value: slug,
      },
      {
        field: "is_public",
        operator: "eq",
        value: true,
      },
    ]
    },
    meta: {
      select: "*, users!inner(slug)",
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column key="name" dataIndex="name" title={t("lists.public.columns.name")} sorter />
        <Table.Column key="description" dataIndex="description" title={t("lists.public.columns.description")} sorter/>
        <Table.Column key="is_public" dataIndex="is_public" title={t("lists.public.columns.isPublic")} sorter
          render={(value: boolean) => <Switch checked={value} disabled />}
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
