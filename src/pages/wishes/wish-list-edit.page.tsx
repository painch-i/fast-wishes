
import {
  EditButton,
  List,
  ShowButton,
  useTable
} from "@refinedev/antd";
import { useGetIdentity, useOne, useUpdate } from "@refinedev/core";
import { Space, Switch, Table } from "antd";
import { Link } from "react-router";
import { UserIdentity, UserSlug } from "../../types";

export type IWish = {
  id: number;
};


export type IUser = {
  id: number;
};


export const EditWishListPage: React.FC = () => {
  const { data: identity } = useGetIdentity<UserIdentity>();

  const { data: slugData } = useOne<UserSlug>({
    queryOptions: {
      enabled: !!identity,
    },
    resource: 'user_slugs',
    id: identity?.id,
  })

  console.log({
    slugData,
  });

  const { tableProps } = useTable<IWish>({
    queryOptions: {
      enabled: !!identity,
    },
    resource: 'wishes',
    filters: {
      permanent: [{
        field: "user_id",
        operator: "eq",
        value: identity?.id,
      }]
    },
    meta: {
      select: "*",
    },
  });

  const { mutate } = useUpdate({
    resource: "wishes",
    mutationMode: 'optimistic',
  });



  return (
    <List>
    <Link to={`/l/${slugData?.data.slug}`} target="_blank" >See live list</Link>
      <Table {...tableProps} rowKey="id">
        <Table.Column key="name" dataIndex="name" title="Name" sorter />
        <Table.Column key="description" dataIndex="description" title="Description" sorter/>
        <Table.Column key="is_public" dataIndex="is_public" title="Is Public ?" sorter
          render={(value: boolean, record: IWish) => <Switch checked={value} onChange={(newValue) => mutate({ id: record.id, values: { is_public: newValue }})}/>}
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