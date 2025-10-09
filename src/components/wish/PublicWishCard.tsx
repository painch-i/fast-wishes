import { Button, Card } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { useFormat } from "../../i18n/use-format";
import { guessUserCurrency } from "../../utility/guessUserCurrency";
import "./PublicWishCard.css";
import type { Wish } from "./types";

interface PublicWishCardProps {
  wish: Wish;
  reserved?: boolean;
  reservedByMe?: boolean;
  reservedName?: string;
  onReserve?: (wish: Wish) => void;
  onCancelReserve?: (wish: Wish) => void;
}

export const PublicWishCard: React.FC<PublicWishCardProps> = ({
  wish,
  reserved = false,
  reservedByMe = false,
  reservedName,
  onReserve,
  onCancelReserve
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useFormat();
  const hasUrl = !!wish.url;
  const primaryImage = wish.images?.[0]?.url ?? wish.image;

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

  // Prix
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

  const reservable = !reserved;

  return (
    <Card className={`public-wish-card gallery${reserved ? " is-reserved" : ""}`} hoverable>
      {/* MEDIA TOP */}
      <div className="pw-media" onClick={openLink} role={hasUrl ? "button" : undefined} tabIndex={hasUrl ? 0 : -1}>
        {primaryImage ? (
          <img className="pw-media-img" src={primaryImage} alt="" loading="lazy" />
        ) : (
          <div className="pw-media-fallback" aria-hidden>{wish.emoji || pickEmoji(wish.name)}</div>
        )}
        {reserved && (
          <div className={`pw-badge ${reservedByMe ? "me" : ""}`}>
            {reservedByMe
              ? t("public.card.reservedByYouPlain")
              : reservedName
                ? t("public.card.reservedByNamePlain", { name: reservedName })
                : t("public.card.reservedPlain")}
          </div>
        )}
        {hasUrl && <div className="pw-media-gradient" aria-hidden />}
      </div>

      {/* CONTENT */}
      <div className="pw-content">
        <h3 className="pw-title" title={wish.name}>{wish.name}</h3>
        {wish.description && (
          <p className="pw-desc" title={wish.description || undefined}>{wish.description}</p>
        )}
      </div>

      {/* FOOTER */}
      <div className="pw-footer">
        {priceLabel && <div className="pw-price">{priceLabel}</div>}
        {reservable ? (
          <Button type="primary" size="middle" className="pw-cta" onClick={() => onReserve?.(wish)}>
            {t("public.card.reserve")}
          </Button>
        ) : reservedByMe ? (
          <Button size="middle" className="pw-cta me" onClick={() => onCancelReserve?.(wish)}
                  title={t("public.card.cancelReservation")}>
            {t("public.card.reservedByYouPlain")}
          </Button>
        ) : (
          <Button size="middle" className="pw-cta reserved" disabled>
            {reservedName ? t("public.card.reservedByNamePlain", { name: reservedName }) : t("public.card.reservedPlain")}
          </Button>
        )}
      </div>
    </Card>
  );
};
