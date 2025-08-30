import React from "react";
import { Card, Button } from "antd";
import type { Wish } from "./types";
import "./PublicWishCard.css";
import { useTranslation } from "react-i18next";
import { useFormat } from "../../i18n/use-format";
import { guessUserCurrency } from "../../utility/guessUserCurrency";

interface PublicWishCardProps {
  wish: Wish;
}

export const PublicWishCard: React.FC<PublicWishCardProps> = ({ wish }) => {
  const { t } = useTranslation();
  const { formatPrice } = useFormat();
  const hasUrl = !!wish.url;
  const reservable = !wish.isReserved;

  const openLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasUrl) window.open(wish.url as string, "_blank", "noopener,noreferrer");
  };

  const pickEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (/(billet|ticket|concert|spectacle|show)/.test(n)) return "🎟️";
    if (/(livre|book)/.test(n)) return "📚";
    if (/(lego|jouet|poupée|doll|toy|jeu)/.test(n)) return "🧸";
    if (/(vêt|cloth|t-shirt|tshirt|shirt|pull|chauss|shoe|sneaker)/.test(n)) return "👟";
    if (/(bouilloire|thé|tea|café|coffee|mug)/.test(n)) return "🍵";
    if (/(phone|téléphone|ipad|tablet|ordi|laptop|tech|gadget)/.test(n)) return "📱";
    if (/(maquillage|beaut|parfum|skin|soin)/.test(n)) return "💄";
    if (/(plante|plant|fleur)/.test(n)) return "🌿";
    if (/(voyage|travel)/.test(n)) return "✈️";
    return "🎁";
  };

  // Format price using locale + currency
  let priceLabel: string | null = null;
  if (wish.price != null) {
    const raw = String(wish.price).replace(/\s/g, "").replace(",", ".");
    const num = Number.isFinite(Number(raw)) ? Number(raw) : null;
    if (num != null) {
      const cents = Math.round(num * 100);
      const cur = (wish as any).currency || guessUserCurrency({});
      priceLabel = formatPrice(cents, cur);
    }
  }

  return (
    <Card className={`public-wish-card${wish.isReserved ? " is-reserved" : ""}`} hoverable>
      <div className="pw-hero">
        {wish.image ? (
          <img src={wish.image} alt="" aria-hidden className="pw-hero-img" />
        ) : (
          <div className="pw-emoji" aria-hidden>
            {wish.emoji || pickEmoji(wish.name)}
          </div>
        )}
        {priceLabel && <div className="pw-price-tag">{priceLabel}</div>}
        {hasUrl && (
          <button type="button" className="pw-link" aria-label="Ouvrir le lien" onClick={openLink}>
            🔗
          </button>
        )}
      </div>

      <div className="pw-body">
        <div className="pw-text">
          <h3 className="pw-title" title={wish.name}>
            {wish.name}
          </h3>
          {wish.description && (
            <p className="pw-desc" title={wish.description || undefined}>
              {wish.description}
            </p>
          )}
        </div>
        {reservable && (
          <Button type="primary" size="middle" className="pw-cta-inline">
            {t("public.card.reserve")}
          </Button>
        )}
      </div>
    </Card>
  );
};
