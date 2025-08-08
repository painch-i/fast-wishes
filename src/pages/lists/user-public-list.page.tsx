import { useList, useUpdate } from "@refinedev/core";
import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select } from "../../components/ui/select";

export type IWish = {
  id: number;
  name: string;
  description: string;
  price: number;
  priority: number;
  is_reserved: boolean;
};

export const UserPublicList: React.FC = () => {
  const { slug } = useParams();
  const [sortKey, setSortKey] = useState<"price" | "priority">("priority");

  const { data } = useList<IWish>({
    resource: "wishes",
    filters: [
      { field: "user_slugs.slug", operator: "eq", value: slug },
      { field: "is_public", operator: "eq", value: true },
    ],
    meta: { select: "*, user_slugs!inner(slug)" },
  });

  const { mutate } = useUpdate();

  const sortedData = [...(data?.data ?? [])].sort(
    (a, b) => a[sortKey] - b[sortKey]
  );

  return (
    <div className="container mx-auto p-4">
      <Select
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value as "price" | "priority")}
        className="mb-4"
      >
        <option value="priority">Sort by Priority</option>
        <option value="price">Sort by Price</option>
      </Select>
      <div className="grid gap-4">
        {sortedData.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{item.name}</CardTitle>
              <Badge variant="outline">€{item.price}</Badge>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-slate-600">{item.description}</p>
              <Badge className="mb-4">Priority {item.priority}</Badge>
              <Button
                disabled={item.is_reserved}
                onClick={() =>
                  mutate({
                    resource: "wishes",
                    id: item.id,
                    values: { is_reserved: true },
                  })
                }
              >
                {item.is_reserved ? "Already reserved" : "Reserve"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
