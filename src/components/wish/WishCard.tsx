import React from "react";
import { Button, Card, Tag } from "antd";
import type { Wish } from "./types";
import "./WishCard.css";

export interface WishCardProps {
  wish: Wish;
  onReserve?: (wish: Wish) => void;
  onProposeLink?: (wish: Wish) => void;
}

export const WishCard: React.FC<WishCardProps> = ({ wish, onReserve, onProposeLink }) => {
  const reserved = wish.isReserved;
  return (
    <Card
      className={`wish-card${reserved ? " reserved" : ""}`}
      hoverable
      cover={
        <div className="image-wrapper">
          {wish.image ? (
            <img src={wish.image} alt={wish.name} />
          ) : (
            <div className="placeholder" aria-hidden>
              🎁
            </div>
          )}
          {reserved && (
            <Tag color="success" className="reserved-badge">
              ✅ Réservé
            </Tag>
          )}
        </div>
      }
    >
      <h3 className="wish-title" title={wish.name}>
        {wish.name}
      </h3>
      {wish.meta && <p className="wish-meta">{wish.meta}</p>}
      <Button
        type="primary"
        block
        disabled={reserved}
        aria-disabled={reserved}
        onClick={() => onReserve?.(wish)}
      >
        Réserver
      </Button>
      <Button type="link" block onClick={() => onProposeLink?.(wish)}>
        Proposer un autre lien
      </Button>
    </Card>
  );
};
