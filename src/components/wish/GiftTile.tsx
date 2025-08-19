import React from "react";
import { Tag } from "antd";
import type { Wish } from "./types";
import "./GiftTile.css";

export interface GiftTileProps {
  wish: Wish;
  onSelect?: (wish: Wish) => void;
}

export const GiftTile: React.FC<GiftTileProps> = ({ wish, onSelect }) => {
  const reserved = wish.isReserved;
  const domain = wish.url
    ? new URL(wish.url).hostname.replace(/^www\./, "")
    : "";

  const handleClick = () => {
    if (!reserved) {
      onSelect?.(wish);
    }
  };

  const thumb = wish.image ? (
    <img src={wish.image} alt="" />
  ) : (
    <span className="placeholder" aria-hidden>
      {wish.name.charAt(0).toUpperCase()}
    </span>
  );

  return (
    <button
      type="button"
      className={`gift-tile${reserved ? " reserved" : ""}`}
      onClick={handleClick}
      disabled={reserved}
    >
      <div className="thumb">{thumb}</div>
      <div className="content">
        <p className="title" title={wish.name}>
          {wish.name}
        </p>
        <div className="meta">
          {domain && <span className="domain">{domain}</span>}
          {wish.meta && <span className="note">{wish.meta}</span>}
          {wish.price && <span className="price">{wish.price}</span>}
        </div>
      </div>
      {reserved && (
        <Tag color="success" className="reserved-badge">
          ✅ Réservé
        </Tag>
      )}
    </button>
  );
};
