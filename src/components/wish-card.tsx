import { Card, Button, Tag } from "antd";

export type WishCardProps = {
  name: string;
  description?: string;
  image?: string;
  isReserved?: boolean;
  onReserve?: () => void;
  onProposeLink?: () => void;
};

const DEFAULT_IMAGE = "https://placehold.co/600x400?text=🎁";

export const WishCard: React.FC<WishCardProps> = ({
  name,
  description,
  image,
  isReserved,
  onReserve,
  onProposeLink,
}) => {
  return (
    <Card
      hoverable
      cover={
        <img
          alt={name}
          src={image || DEFAULT_IMAGE}
          style={{ height: 200, objectFit: "cover" }}
        />
      }
    >
      <Card.Meta title={name} description={description} />

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {isReserved ? (
          <Tag color="green">Déjà réservé</Tag>
        ) : (
          <Button type="primary" onClick={onReserve} block>
            Réserver
          </Button>
        )}
        <Button type="link" onClick={onProposeLink} style={{ padding: 0 }}>
          Proposer un autre lien
        </Button>
      </div>
    </Card>
  );
};
