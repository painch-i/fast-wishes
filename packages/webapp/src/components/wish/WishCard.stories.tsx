import type { Meta, StoryObj } from "@storybook/react";
import { WishCard } from "./WishCard";
import type { Wish } from "./types";

const meta: Meta<typeof WishCard> = {
  title: "WishCard",
  component: WishCard,
};
export default meta;

type Story = StoryObj<typeof WishCard>;

const base: Wish = { id: 1, name: "Un super cadeau", meta: "20€" };

export const Available: Story = {
  args: { wish: base },
};

export const Reserved: Story = {
  args: { wish: { ...base, isReserved: true } },
};

export const LongTitle: Story = {
  args: {
    wish: {
      ...base,
      name: "Un titre extrêmement long pour vérifier le clamp sur deux lignes maximum",
    },
  },
};

export const NoImage: Story = {
  args: { wish: { ...base, image: undefined } },
};
