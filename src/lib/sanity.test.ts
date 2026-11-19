import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

// Placeholder test: proves Vitest and SQLite run. Replaced by real tests later.
describe("test setup", () => {
  it("can open an in-memory SQLite database", () => {
    const db = new Database(":memory:");
    const row = db.prepare("select 1 + 1 as two").get() as { two: number };
    expect(row.two).toBe(2);
  });
});
