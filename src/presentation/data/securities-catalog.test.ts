import { describe, expect, it } from "vitest";
import { SECURITIES_CATALOG, searchSecurities } from "./securities-catalog";

describe("Securities Catalog & Client Search Index", () => {
  // covers: AC-1 (searchable catalog across NSE and BSE listed equities)
  it("contains pre-seeded Indian equities with dual listings", () => {
    expect(SECURITIES_CATALOG.length).toBeGreaterThanOrEqual(14);

    const reliance = SECURITIES_CATALOG.find(
      (s) => s.companyName === "Reliance Industries Limited",
    );
    expect(reliance).toBeDefined();
    expect(reliance?.isin).toBe("INE002A01018");

    const nseListing = reliance?.listings.find((l) => l.exchange === "NSE");
    const bseListing = reliance?.listings.find((l) => l.exchange === "BSE");

    expect(nseListing?.symbol).toBe("RELIANCE");
    expect(nseListing?.isPrimary).toBe(true);
    expect(bseListing?.symbol).toBe("500325");
    expect(bseListing?.isPrimary).toBe(false);
  });

  it("filters securities instantly by ticker symbol", () => {
    const results = searchSecurities("TCS");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(
      results.some((r) => r.companyName.includes("Tata Consultancy Services")),
    ).toBe(true);
  });

  it("filters securities instantly by company name case-insensitively", () => {
    const results = searchSecurities("infosys");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].listings[0].symbol).toBe("INFY");
  });

  it("filters securities instantly by ISIN", () => {
    const results = searchSecurities("INE040A01034");
    expect(results.length).toBe(1);
    expect(results[0].companyName).toBe("HDFC Bank Limited");
  });

  it("returns full catalog when query is empty", () => {
    const results = searchSecurities("   ");
    expect(results.length).toBe(SECURITIES_CATALOG.length);
  });
});
