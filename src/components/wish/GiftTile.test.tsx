import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GiftTile } from "./GiftTile";
import type { Wish } from "./types";

const baseWish: Wish = { id: 1, name: "Vélo" };

describe("GiftTile", () => {
  it("renders title", () => {
    render(<GiftTile wish={baseWish} />);
    expect(screen.getByText("Vélo")).toBeInTheDocument();
  });

  it("shows reserved state", () => {
    render(<GiftTile wish={{ ...baseWish, isReserved: true }} />);
    expect(screen.getByText(/Réservé/)).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /Vélo/ });
    expect(button).toBeDisabled();
  });
});
