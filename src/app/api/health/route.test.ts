import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("Health API Route", () => {
  // covers: AC-4 (health check returns status ok and timestamp)
  it("returns status ok and valid ISO timestamp with status 200", async () => {
    const response = await GET();

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("status", "ok");
    expect(data).toHaveProperty("timestamp");
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });
});
