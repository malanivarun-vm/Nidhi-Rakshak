import { afterEach, describe, expect, it } from "vitest";
import { closeDatabase, createDatabase } from "./index";

describe("database factory", () => {
  afterEach(async () => {
    await closeDatabase();
  });

  it("reuses a database for the same connection string", () => {
    const connectionString = "postgresql://example.test/database";

    expect(createDatabase(connectionString)).toBe(
      createDatabase(connectionString),
    );
  });
});
