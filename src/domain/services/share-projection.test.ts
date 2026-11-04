import { describe, expect, it } from "vitest";
import { generateShareToken, projectPublicShareView } from "./share-projection";

describe("share-projection", () => {
  it("generates cryptographically random 64 hex character tokens", () => {
    const token1 = generateShareToken();
    const token2 = generateShareToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).toMatch(/^[a-f0-9]{64}$/);
    expect(token1).not.toBe(token2);
  });

  it("sanitizes public payload by omitting quantities, costs, and buy prices", () => {
    const projected = projectPublicShareView({
      portfolioName: "Cyberpunk City",
      mode: "live",
      showRupeeTotals: false,
      constituents: [
        {
          symbol: "RELIANCE",
          companyName: "Reliance Industries",
          sector: "Oil, Gas and Energy",
          quantity: 50,
          totalCostPaise: 12500000n, // ₹1,25,000
          closePricePaise: 275000n, // ₹2,750 per share -> current value ₹1,37,500 (+10%)
          pricingAsOf: "2026-11-04",
        },
      ],
    });

    expect(projected.portfolioName).toBe("Cyberpunk City");
    expect(projected.mode).toBe("live");
    expect(projected.snapshotAsOf).toBeNull();
    expect(projected.buildings).toHaveLength(1);

    const b = projected.buildings[0];
    expect(b.symbol).toBe("RELIANCE");
    expect(b.profitOrLossPercent).toBe(10);
    expect(b.pricingAsOf).toBe("2026-11-04");

    // Ensure private fields are NOT present
    const raw = b as unknown as Record<string, unknown>;
    expect(raw.quantity).toBeUndefined();
    expect(raw.totalCostPaise).toBeUndefined();
    expect(raw.buyPricePaise).toBeUndefined();
  });

  it("suppresses total rupee amounts if holdingCount is less than 3, even if showRupeeTotals is true", () => {
    // 2 holdings
    const projected = projectPublicShareView({
      portfolioName: "Duo Holdings",
      mode: "live",
      showRupeeTotals: true, // Owner requested rupee total
      constituents: [
        {
          symbol: "INFY",
          companyName: "Infosys Limited",
          sector: "IT and Technology",
          quantity: 20,
          totalCostPaise: 3000000n,
          closePricePaise: 160000n,
          pricingAsOf: "2026-11-04",
        },
        {
          symbol: "TCS",
          companyName: "Tata Consultancy Services",
          sector: "IT and Technology",
          quantity: 10,
          totalCostPaise: 3500000n,
          closePricePaise: 380000n,
          pricingAsOf: "2026-11-04",
        },
      ],
    });

    // Suppressed to prevent algebraic equation solving
    expect(projected.totalRupeesFormatted).toBeNull();
  });

  it("exposes quantized total rupee amounts when holdingCount is 3 or more and showRupeeTotals is true", () => {
    const projected = projectPublicShareView({
      portfolioName: "Trio Holdings",
      mode: "live",
      showRupeeTotals: true,
      constituents: [
        {
          symbol: "INFY",
          companyName: "Infosys Limited",
          sector: "IT and Technology",
          quantity: 20,
          totalCostPaise: 3000000n,
          closePricePaise: 160000n, // 20 * 1600 = ₹32,000
          pricingAsOf: "2026-11-03",
        },
        {
          symbol: "TCS",
          companyName: "Tata Consultancy Services",
          sector: "IT and Technology",
          quantity: 10,
          totalCostPaise: 3500000n,
          closePricePaise: 380000n, // 10 * 3800 = ₹38,000
          pricingAsOf: "2026-11-04",
        },
        {
          symbol: "HDFCBANK",
          companyName: "HDFC Bank Limited",
          sector: "Banks and Financial Services",
          quantity: 50,
          totalCostPaise: 8000000n,
          closePricePaise: 175000n, // 50 * 1750 = ₹87,500
          pricingAsOf: "2026-11-04",
        },
      ],
    });

    // Total = 32,000 + 38,000 + 87,500 = ₹1,57,500 -> quantized to nearest 1,000 = ₹1,58,000
    expect(projected.totalRupeesFormatted).toBe("₹1,58,000");
    expect(projected.pricingAsOf).toBe("2026-11-04");
    expect(projected.oldestPricingAsOf).toBe("2026-11-03");
  });
});
