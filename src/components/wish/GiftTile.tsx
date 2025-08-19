import React from "react";
import type { Wish } from "./types";
import "./GiftTile.css";

export interface GiftTileProps {
  wish: Wish;
  onClick?: (wish: Wish) => void;
}

export const GiftTile: React.FC<GiftTileProps> = ({ wish, onClick }) => {
  const handleClick = () => {
    if (wish.isReserved) return;
    onClick?.(wish);
  };

  const domain = wish.url ? new URL(wish.url).hostname.replace(/^www\./, "") : null;
  const imageSrc = wish.image;
  const initial = wish.name.charAt(0).toUpperCase();

  return (
    <div
      className={`gift-tile${wish.isReserved ? " reserved" : ""}`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
    >
      <div className="thumbnail">
        {imageSrc ? (
          <img src={imageSrc} alt="" />
        ) : (
          <span aria-hidden>{initial}</span>
        )}
      </div>
      <div className="content">
        <div className="title-row">
          <h3 className="title" title={wish.name}>{wish.name}</h3>
          {wish.price && <span className="price">{wish.price}</span>}
        </div>
        <div className="meta">
          {domain && <span className="domain-pill">{domain}</span>}
          {wish.meta && <span className="meta-text">{wish.meta}</span>}
        </div>
      </div>
      {wish.isReserved && <span className="reserved-badge">✅ Réservé</span>}
    </div>
  );
};
