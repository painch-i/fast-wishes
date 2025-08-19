import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GiftTile } from "./GiftTile";
import type { Wish } from "./types";

const base: Wish = { id: 1, name: "Livre", url: "https://example.com" };

describe("GiftTile", () => {
  it("renders title and domain", () => {
    render(<GiftTile wish={base} />);
    expect(screen.getByText("Livre")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  it("shows reserved state", () => {
    render(<GiftTile wish={{ ...base, isReserved: true }} />);
    expect(screen.getByText(/Réservé/)).toBeInTheDocument();
  });
});
