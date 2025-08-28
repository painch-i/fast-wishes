import React from "react";
import { Button, Card, Tag } from "antd";
import type { Wish } from "./types";
import "./WishCard.css";
import { useTranslation } from "react-i18next";

export interface WishCardProps {
  wish: Wish;
  onReserve?: (wish: Wish) => void;
  onProposeLink?: (wish: Wish) => void;
}

export const WishCard: React.FC<WishCardProps> = ({ wish, onReserve, onProposeLink }) => {
  const reserved = wish.isReserved;
  const { t } = useTranslation();
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
              <span role="img" aria-label="cadeau">
                🎁
              </span>
            </div>
          )}
          {reserved && (
            <Tag color="success" className="reserved-badge">
              {t("public.card.reserved")}
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
        {t("public.card.reserve")}
      </Button>
      <Button
        type="link"
        block
        className="secondary-link"
        onClick={() => onProposeLink?.(wish)}
      >
        {t("public.card.propose")}
      </Button>
    </Card>
  );
};
