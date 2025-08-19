import type { Meta, StoryObj } from "@storybook/react";
import { GiftTile } from "./GiftTile";
import type { Wish } from "./types";

const meta: Meta<typeof GiftTile> = {
  component: GiftTile,
  args: {
    wish: { id: 1, name: "Café en grains", price: "20€", url: "https://example.com" } as Wish,
  },
};

export default meta;

export const Default: StoryObj<typeof GiftTile> = {};
