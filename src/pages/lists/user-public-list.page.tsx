

import {
  EditButton,
  List,
  ShowButton,
  useTable
} from "@refinedev/antd";
import { Space, Switch, Table } from "antd";
import { useParams } from "react-router";
import type { Tables } from "../../../database.types";

export type IWish = Tables<"wishes">;


export type IUser = {
  id: number;
};



export const UserPublicList: React.FC = () => {
  const params = useParams();
  const slug = params.slug;

  const { tableProps } = useTable<IWish>({
    resource: 'wishes',
    filters: {
      permanent: [
        {
        field: "user_slugs.slug",
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
      select: "*, user_slugs!inner(slug)",
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column key="name" dataIndex="name" title="Name" sorter />
        <Table.Column key="description" dataIndex="description" title="Description" sorter/>
        <Table.Column key="is_public" dataIndex="is_public" title="Is Public ?" sorter
          render={(value: boolean) => <Switch checked={value} disabled />}
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