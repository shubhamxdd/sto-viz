import { describe, expect, it } from "vitest";
import { env } from "./env";

describe("Application Environment Configuration", () => {
  it("provides valid default environment settings in non production mode", () => {
    expect(env).toBeDefined();
    expect(["development", "production", "test"]).toContain(env.NODE_ENV);
    expect(typeof env.PORT).toBe("number");
    expect(env.PORT).toBeGreaterThan(0);
    expect(env.DATABASE_URL).toContain("postgresql://");
    expect(env.BETTER_AUTH_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(env.BETTER_AUTH_URL).toMatch(/^https?:\/\//);
  });

  it("contains valid database connection string structure", () => {
    expect(env.DATABASE_URL).toMatch(/^postgresql:\/\/.+:.+@.+:\d+\/.+$/);
  });
});
