import { Button, Card } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { useFormat } from "../../i18n/use-format";
import { guessUserCurrency } from "../../utility/guessUserCurrency";
import { getWishImageUrl } from "../../utility/wishImages";
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
  const imageUrls = React.useMemo(() => {
    const urls = [
      ...(wish.images
        ?.map((img) => getWishImageUrl(img.storage_object_name) || img.url || "")
        .filter((url): url is string => Boolean(url)) ?? [])
    ];
    console.log({
      urls,
    })
    if (wish.image) {
      urls.push(wish.image);
    }
    return Array.from(new Set(urls));
  }, [wish.images, wish.image]);
  const hasImages = imageUrls.length > 0;
  const showControls = imageUrls.length > 1;
  const [activeImage, setActiveImage] = React.useState(0);

  React.useEffect(() => {
    setActiveImage(0);
  }, [imageUrls.length, wish.id]);

  const handlePrev = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (imageUrls.length < 2) return;
    setActiveImage((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (imageUrls.length < 2) return;
    setActiveImage((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.stopPropagation();
    setActiveImage(index);
  };

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
        {hasImages ? (
          <div className="pw-carousel" aria-label={t("public.card.carousel.label", { defaultValue: "Images du souhait" })}>
            <div
              className="pw-carousel-track"
              style={{ transform: `translateX(-${activeImage * 100}%)` }}
            >
              {imageUrls.map((src, index) => (
                <img
                  key={`${src}-${index}`}
                  className="pw-carousel-img"
                  src={src}
                  alt={wish.name}
                  loading="lazy"
                />
              ))}
            </div>
            {showControls && (
              <>
                <button
                  type="button"
                  className="pw-carousel-control prev"
                  onClick={handlePrev}
                  aria-label={t("public.card.carousel.prev", { defaultValue: "Image précédente" })}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M15.5 4.5 8.5 12l7 7.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="pw-carousel-control next"
                  onClick={handleNext}
                  aria-label={t("public.card.carousel.next", { defaultValue: "Image suivante" })}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M15.5 4.5 8.5 12l7 7.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="pw-carousel-dots">
                  {imageUrls.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      type="button"
                      className={`pw-carousel-dot${index === activeImage ? " active" : ""}`}
                      aria-label={t("public.card.carousel.goTo", {
                        index: index + 1,
                        count: imageUrls.length,
                        defaultValue: "Voir l'image {{index}} sur {{count}}"
                      })}
                      aria-pressed={index === activeImage}
                      onClick={(event) => handleDotClick(event, index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
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
