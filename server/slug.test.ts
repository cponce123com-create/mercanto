import { describe, expect, it, vi } from "vitest";
import { getUniqueSlug } from "./routers";
import * as db from "./db";

vi.mock("./db", () => ({
  getExistingSlugsStartingWith: vi.fn(),
}));

describe("getUniqueSlug", () => {
  it("returns base slug when no existing slugs", async () => {
    vi.mocked(db.getExistingSlugsStartingWith).mockResolvedValue([]);
    const slug = await getUniqueSlug({}, "My Store", "tienda");
    expect(slug).toBe("my-store");
  });

  it("returns incremental slug when base slug exists", async () => {
    vi.mocked(db.getExistingSlugsStartingWith).mockResolvedValue(["my-store"]);
    const slug = await getUniqueSlug({}, "My Store", "tienda");
    expect(slug).toBe("my-store-2");
  });

  it("returns next available incremental slug", async () => {
    vi.mocked(db.getExistingSlugsStartingWith).mockResolvedValue(["my-store", "my-store-2", "my-store-3"]);
    const slug = await getUniqueSlug({}, "My Store", "tienda");
    expect(slug).toBe("my-store-4");
  });

  it("handles empty base value with default slug", async () => {
    vi.mocked(db.getExistingSlugsStartingWith).mockResolvedValue([]);
    const slug = await getUniqueSlug({}, "", "tienda");
    expect(slug).toBe("tienda");
  });
});
