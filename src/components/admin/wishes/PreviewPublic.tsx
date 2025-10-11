import { WishCard } from "../../wish/WishCard";
import type { Wish } from "../../wish/types";
import { WishUI } from "../../../types/wish";

export const PreviewPublic: React.FC<{ wish: WishUI }> = ({ wish }) => {
  const mapped = {
    ...wish,
    id: Number(wish.id),
    name: wish.name,
    image: wish.image_url,
    images: wish.images,
    meta: wish.url ?? undefined,
    isReserved: wish.status === "reserved",
  } as Wish;

  return (
    <div style={{ padding: 16 }}>
      <WishCard wish={mapped} />
    </div>
  );
};
