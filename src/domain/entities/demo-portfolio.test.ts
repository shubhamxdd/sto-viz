import { describe, expect, it } from "vitest";
import {
  calculateDemoPortfolioTotalInvestedPaise,
  DEMO_PORTFOLIOS,
  getDemoPortfolioById,
} from "./demo-portfolio";
import { validateIsin } from "./security";

describe("Curated Demo Portfolios (AC-1, AC-4)", () => {
  it("contains exactly 3 curated sample portfolios", () => {
    expect(DEMO_PORTFOLIOS).toHaveLength(3);
    const ids = DEMO_PORTFOLIOS.map((p) => p.id);
    expect(ids).toEqual(["nifty-titans", "tech-frontier", "green-horizon"]);
  });

  it("ensures each portfolio has 5 constituent stocks with valid ISINs and positive quantities", () => {
    for (const portfolio of DEMO_PORTFOLIOS) {
      expect(portfolio.holdings).toHaveLength(5);
      expect(portfolio.name).toBeTruthy();
      expect(portfolio.tagline).toBeTruthy();
      expect(portfolio.description).toBeTruthy();

      for (const holding of portfolio.holdings) {
        expect(() => validateIsin(holding.isin)).not.toThrow();
        expect(holding.symbol).toBeTruthy();
        expect(holding.quantity).toBeGreaterThan(0);
        expect(BigInt(holding.buyPricePaise)).toBeGreaterThan(0n);
        expect(holding.purchasedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("calculates total invested capital for demo portfolios accurately", () => {
    const titans = getDemoPortfolioById("nifty-titans");
    expect(titans).toBeDefined();
    if (!titans) return;

    const totalPaise = calculateDemoPortfolioTotalInvestedPaise(titans);
    // Reliance: 35 * 295000 = 10325000
    // TCS: 25 * 382000 = 9550000
    // HDFC: 60 * 164000 = 9840000
    // LT: 15 * 356000 = 5340000
    // ITC: 80 * 43000 = 3440000
    // Sum = 38495000 paise (₹3,84,950.00)
    expect(totalPaise).toBe(38495000n);
  });

  it("returns undefined for unknown portfolio ID", () => {
    expect(getDemoPortfolioById("unknown-id")).toBeUndefined();
  });
});
