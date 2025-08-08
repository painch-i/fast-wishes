import { List } from "@refinedev/antd";
import { useTable } from "@refinedev/antd";
import { useUpdate } from "@refinedev/core";
import {
  Button,
  Card,
  List as AntdList,
  Select,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { useParams } from "react-router";

export type IWish = {
  id: number;
  name: string;
  description: string;
  price: number;
  priority: number;
  is_reserved: boolean;
};

export const UserPublicList: React.FC = () => {
  const params = useParams();
  const slug = params.slug;

  const [sortKey, setSortKey] = useState<"price" | "priority">("priority");

  const { tableProps } = useTable<IWish>({
    resource: "wishes",
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
      ],
    },
    meta: {
      select: "*, user_slugs!inner(slug)",
    },
  });

  const sortedData = [...(tableProps.dataSource ?? [])].sort(
    (a, b) => a[sortKey] - b[sortKey]
  );

  const { mutate } = useUpdate({
    resource: "wishes",
    mutationMode: "optimistic",
  });

  return (
    <List>
      <Select
        value={sortKey}
        onChange={(value) => setSortKey(value)}
        style={{ width: 220, marginBottom: 16 }}
        options={[
          { label: "Sort by Priority", value: "priority" },
          { label: "Sort by Price", value: "price" },
        ]}
      />
      <AntdList
        dataSource={sortedData}
        renderItem={(item) => (
          <AntdList.Item>
            <Card
              title={item.name}
              extra={<Tag color="blue">€{item.price}</Tag>}
              style={{ width: "100%" }}
            >
              <Typography.Paragraph>{item.description}</Typography.Paragraph>
              <Tag color="volcano">Priority {item.priority}</Tag>
              <Button
                type="primary"
                style={{ marginTop: 12 }}
                disabled={item.is_reserved}
                onClick={() =>
                  mutate({ id: item.id, values: { is_reserved: true } })
                }
              >
                {item.is_reserved ? "Already reserved" : "Reserve"}
              </Button>
            </Card>
          </AntdList.Item>
        )}
      />
    </List>
  );
};

