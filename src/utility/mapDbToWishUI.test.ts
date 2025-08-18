import { describe, expect, it, beforeEach } from "vitest";
import { mapDbToWishUI } from "./mapDbToWishUI";
import { getExtras, setExtras, removeExtras } from "./localExtrasStore";

describe("mapDbToWishUI", () => {
  it("merges db row with extras, giving precedence to db", () => {
    const dbRow = { id: "1", name: "db", price: 10 };
    const extras = { price: 5, note_private: "secret", metadata: { foo: "bar" } };
    const result = mapDbToWishUI(dbRow, extras);
    expect(result.name).toBe("db");
    expect(result.price).toBe(10);
    expect(result.note_private).toBe("secret");
    expect(result.metadata?.foo).toBe("bar");
  });
});

describe("localExtrasStore", () => {
  beforeEach(() => {
    removeExtras("1");
  });
  it("stores and retrieves extras", () => {
    setExtras("1", { note_private: "hello" });
    expect(getExtras("1")).toEqual({ note_private: "hello" });
  });
  it("removes extras", () => {
    setExtras("1", { note_private: "hello" });
    removeExtras("1");
    expect(getExtras("1")).toEqual({});
  });
});
