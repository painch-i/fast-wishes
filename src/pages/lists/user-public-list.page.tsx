import { List } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Row, Col, Typography, Spin } from "antd";
import { useParams } from "react-router";
import { WishCard } from "../../components/wish-card";

export type Wish = {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  is_reserved?: boolean;
};

export const UserPublicList: React.FC = () => {
  const { slug } = useParams();

  const { data, isLoading } = useList<Wish>({
    resource: "wishes",
    filters: [
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
    meta: {
      select: "*, user_slugs!inner(slug)",
    },
  });

  const wishes = data?.data ?? [];
  const remaining = wishes.filter((w) => !w.is_reserved).length;
  const allReserved = wishes.length > 0 && remaining === 0;

  const headerTitle = slug ? `Anniversaire de ${slug} 🎂` : "Liste de souhaits";

  return (
    <List title={headerTitle} breadcrumb={false} headerButtons={null}>
      <Typography.Paragraph type="secondary">
        {allReserved ? (
          <>Tout a été réservé, tu peux toujours faire une surprise 🎁</>
        ) : (
          <>
            Choisis ce qui fera plaisir 💝<br />
            {remaining} cadeaux restants à réserver
          </>
        )}
      </Typography.Paragraph>

      {isLoading ? (
        <Spin />
      ) : (
        <Row gutter={[16, 16]}
          style={{ marginTop: 16 }}>
          {wishes.map((wish) => (
            <Col xs={24} sm={12} md={8} key={wish.id}>
              <WishCard
                name={wish.name}
                description={wish.description}
                image={wish.image_url}
                isReserved={wish.is_reserved}
                onReserve={() => {}}
                onProposeLink={() => {}}
              />
            </Col>
          ))}
        </Row>
      )}

      {!allReserved && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            padding: "8px 0",
            background: "#fff",
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
            fontWeight: 500,
            marginTop: 24,
          }}
        >
          {remaining} cadeaux restants à réserver
        </div>
      )}
    </List>
  );
};
