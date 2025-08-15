import { useList, useUpdate } from "@refinedev/core";
import { useState } from "react";
import { useParams } from "react-router";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";

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

  const { data } = useList<IWish>({
    resource: "wishes",
    filters: [
      { field: "user_slugs.slug", operator: "eq", value: slug },
      { field: "is_public", operator: "eq", value: true },
    ],
    meta: {
      select: "*, user_slugs!inner(slug)",
    },
  });

  const sortedData = [...(data?.data ?? [])].sort(
    (a, b) => a[sortKey] - b[sortKey]
  );

  const { mutate } = useUpdate({
    resource: "wishes",
    mutationMode: "optimistic",
  });

  return (
    <div className="mx-auto max-w-2xl p-4 space-y-4">
      <Select value={sortKey} onValueChange={(v) => setSortKey(v as "price" | "priority") }>
        <SelectTrigger>
          <SelectValue placeholder="Sort wishes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Sort by Priority</SelectItem>
          <SelectItem value="price">Sort by Price</SelectItem>
        </SelectContent>
      </Select>
      <div className="space-y-4">
        {sortedData.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <Badge variant="secondary">€{item.price}</Badge>
            </div>
            <p className="mt-2 text-sm text-gray-700">{item.description}</p>
            <Badge variant="destructive" className="mt-2">
              Priority {item.priority}
            </Badge>
            <Button
              className="mt-4"
              disabled={item.is_reserved}
              onClick={() => mutate({ id: item.id, values: { is_reserved: true } })}
            >
              {item.is_reserved ? "Already reserved" : "Reserve"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
