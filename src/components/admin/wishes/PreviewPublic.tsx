import { WishCard } from "../../wish/WishCard";
import { WishUI } from "../../../types/wish";

export const PreviewPublic: React.FC<{ wish: WishUI }> = ({ wish }) => {
  const mapped = {
    id: Number(wish.id),
    name: wish.title,
    image: wish.imageUrl,
    meta: wish.url,
    isReserved: wish.status === "reserved",
  };

  return (
    <div style={{ padding: 16 }}>
      <WishCard wish={mapped} />
    </div>
  );
};
