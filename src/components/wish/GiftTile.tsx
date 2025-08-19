import React from "react";
import { Tag } from "antd";
import type { Wish } from "./types";
import "./GiftTile.css";

interface GiftTileProps {
  wish: Wish;
  onSelect?: (wish: Wish) => void;
}

const getDomain = (url?: string | null) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const getThumb = (wish: Wish): string | null => {
  if (wish.image) return wish.image;
  if (wish.url) {
    const domain = getDomain(wish.url);
    if (domain) {
      return `https://www.google.com/s2/favicons?domain=${domain}`;
    }
  }
  return null;
};

export const GiftTile: React.FC<GiftTileProps> = ({ wish, onSelect }) => {
  const domain = getDomain(wish.url);
  const thumb = getThumb(wish);

  const handleClick = () => {
    if (!wish.isReserved) {
      onSelect?.(wish);
    }
  };

  return (
    <div
      className={`gift-tile${wish.isReserved ? " reserved" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter") handleClick();
      }}
    >
      <div className="thumb">
        {thumb ? (
          <img src={thumb} alt="" />
        ) : (
          <div className="placeholder" aria-hidden>
            {wish.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="content">
        <div className="title" title={wish.name}>
          {wish.name}
        </div>
        <div className="meta">
          {domain && <span className="domain-pill">{domain}</span>}
          {wish.description && <span className="note">{wish.description}</span>}
          {wish.price && <span className="price">{wish.price}</span>}
        </div>
      </div>
      {wish.isReserved && (
        <Tag color="success" className="reserved-badge">
          ✅ Réservé
        </Tag>
      )}
    </div>
  );
};

