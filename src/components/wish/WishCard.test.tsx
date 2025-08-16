import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WishCard } from "./WishCard";
import type { Wish } from "./types";

const baseWish: Wish = { id: 1, name: "Vélo" };

describe("WishCard", () => {
  it("renders title", () => {
    render(<WishCard wish={baseWish} />);
    expect(screen.getByText("Vélo")).toBeInTheDocument();
  });

  it("shows reserved state", () => {
    render(<WishCard wish={{ ...baseWish, isReserved: true }} />);
    expect(screen.getByText(/Réservé/)).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /Réserver/i });
    expect(button).toBeDisabled();
  });
});
