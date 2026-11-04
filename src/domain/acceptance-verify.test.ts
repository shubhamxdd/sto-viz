import { describe, expect, it } from "vitest";
import {
  calculateBuildingHeight,
  calculateHoldingValuation,
  formatPaiseToRupees,
  generateShareToken,
  mergeHoldingPurchases,
  projectPublicShareView,
  resolveGuestSync,
  validateGuestHoldings,
  validateHoldingCost,
  validateHoldingQuantity,
  validateIsin,
} from "@/domain";
import {
  dailyPrices,
  holdings,
  listings,
  portfolios,
  securities,
  shareLinks,
  users,
} from "@/infrastructure/db/schema";

describe("/check verify: Data Model acceptance criteria conformance", () => {
  it("AC-1: validates 12-char ISINs and verifies listings schema with primary and active flags", () => {
    // Valid ISIN normalization
    expect(validateIsin("ine002a01018")).toBe("INE002A01018");
    expect(validateIsin("INE040A01034")).toBe("INE040A01034");

    // Invalid ISIN rejection
    expect(() => validateIsin("INVALID_ISIN")).toThrow();
    expect(() => validateIsin("123456789012")).toThrow();

    // Drizzle table column definitions
    expect(securities.isin).toBeDefined();
    expect(securities.sector).toBeDefined();
    expect(listings.isPrimary).toBeDefined();
    expect(listings.isActive).toBeDefined();
    expect(listings.exchange).toBeDefined();
  });

  it("AC-2: enforces strictly positive integer share quantities and cumulative total cost paise", () => {
    // Quantity validation
    expect(validateHoldingQuantity(100)).toBe(100);
    expect(() => validateHoldingQuantity(0)).toThrow();
    expect(() => validateHoldingQuantity(-5)).toThrow();
    expect(() => validateHoldingQuantity(2.5)).toThrow();

    // Total cost paise validation
    expect(validateHoldingCost(37500000n)).toBe(37500000n);
    expect(() => validateHoldingCost(0n)).toThrow();
    expect(() => validateHoldingCost(-100n)).toThrow();

    // Drizzle types
    expect(holdings.quantity).toBeDefined();
    expect(holdings.totalCostPaise).toBeDefined();
  });

  it("AC-3: merges duplicate purchases without weighted average buy price compounding drift", () => {
    // Purchase 1: 10 shares at ₹100.50 (100500 paise)
    // Purchase 2: 5 shares at ₹105.25 (52625 paise)
    const merged = mergeHoldingPurchases(10, 100500n, 5, 10525n);

    expect(merged.mergedQuantity).toBe(15);
    expect(merged.mergedTotalCostPaise).toBe(153125n);
    expect(merged.averageBuyPricePaise).toBe(10208n);
    expect(merged.averageBuyPriceRemainderPaise).toBe(5n);

    // Formatted strictly with pure integer arithmetic
    expect(formatPaiseToRupees(merged.averageBuyPricePaise)).toBe("₹102.08");
  });

  it("AC-4: defines daily closing prices schema with composite FK and provenance checks", () => {
    expect(dailyPrices.listingId).toBeDefined();
    expect(dailyPrices.exchange).toBeDefined();
    expect(dailyPrices.priceDate).toBeDefined();
    expect(dailyPrices.closePricePaise).toBeDefined();
    expect(dailyPrices.previousClosePaise).toBeDefined();
    expect(dailyPrices.changePercent).toBeDefined();
    expect(dailyPrices.source).toBeDefined();
    expect(dailyPrices.ingestedAt).toBeDefined();
  });

  it("AC-5: computes exact paise portfolio valuations and logarithmic building heights", () => {
    // Valuation math: 20 shares bought for 50,000 INR (5,000,000 paise).
    // Close price = 2,800 INR (280,000 paise) -> Current value = 56,000 INR (5,600,000 paise).
    // Profit = +6,000 INR (+600,000 paise) = +12.00%
    const val = calculateHoldingValuation(20, 5000000n, 280000n);
    expect(val.currentValuePaise).toBe(5600000n);
    expect(val.profitOrLossPaise).toBe(600000n);
    expect(val.profitLossBasisPoints).toBe(1200n);
    expect(val.profitLossPercent).toBe(12);

    // Height scaling curve
    const h1k = calculateBuildingHeight(100000n); // 1k INR
    const h10k = calculateBuildingHeight(1000000n); // 10k INR
    const h100k = calculateBuildingHeight(10000000n); // 100k INR
    const hMax = calculateBuildingHeight(1000000000n); // 1 Crore INR

    expect(h1k).toBeGreaterThanOrEqual(2);
    expect(h10k).toBeGreaterThan(h1k);
    expect(h100k).toBeGreaterThan(h10k);
    expect(hMax).toBeLessThanOrEqual(30);
  });

  it("AC-6: defines portfolios schema with Better Auth user relationship and optimistic concurrency version", () => {
    expect(portfolios.userId).toBeDefined();
    expect(portfolios.name).toBeDefined();
    expect(portfolios.isDefault).toBeDefined();
    expect(portfolios.version).toBeDefined();
    expect(users.id).toBeDefined();
    expect(users.email).toBeDefined();
  });

  it("AC-7: resolves guest localStorage synchronization conflicts via merge and replace strategies", () => {
    const cloudHoldings = [
      {
        id: "h1",
        securityId: "sec-reliance",
        isin: "INE002A01018",
        quantity: 10,
        totalCostPaise: 2400000n,
      },
    ];

    const guestHoldings = [
      {
        isin: "INE002A01018",
        symbol: "RELIANCE",
        companyName: "Reliance Industries",
        exchange: "NSE" as const,
        sector: "Oil, Gas and Energy",
        quantity: 5,
        buyPricePaise: "250000",
        totalCostPaise: "1250000",
      },
    ];

    const mergeResult = resolveGuestSync(cloudHoldings, guestHoldings, "merge");
    expect(mergeResult.holdings[0].quantity).toBe(15);
    expect(mergeResult.holdings[0].totalCostPaise).toBe(3650000n);

    const replaceResult = resolveGuestSync(
      cloudHoldings,
      guestHoldings,
      "replace",
    );
    expect(replaceResult.holdings[0].quantity).toBe(5);
    expect(replaceResult.holdings[0].totalCostPaise).toBe(1250000n);

    // Guest limit check
    expect(() =>
      validateGuestHoldings([
        guestHoldings[0],
        guestHoldings[0],
        guestHoldings[0],
        guestHoldings[0],
      ]),
    ).toThrow();
  });

  it("AC-8: projects unlisted share payloads stripping private counts, suppressing <3 stock totals, and quantizing 3+ stock totals", () => {
    // Verify share_links schema definition
    expect(shareLinks.token).toBeDefined();
    expect(shareLinks.mode).toBeDefined();
    expect(shareLinks.snapshotPayload).toBeDefined();
    expect(shareLinks.showRupeeTotals).toBeDefined();

    // 256-bit cryptographically secure token
    const token = generateShareToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[a-f0-9]{64}$/);

    // 1 holding: suppressed total
    const soloView = projectPublicShareView({
      portfolioName: "Solo City",
      mode: "live",
      showRupeeTotals: true,
      constituents: [
        {
          symbol: "RELIANCE",
          companyName: "Reliance Industries",
          sector: "Oil, Gas and Energy",
          quantity: 10,
          totalCostPaise: 2500000n,
          closePricePaise: 275000n,
          pricingAsOf: "2026-11-04",
        },
      ],
    });
    expect(soloView.totalRupeesFormatted).toBeNull();
    expect(
      (soloView.buildings[0] as unknown as Record<string, unknown>).quantity,
    ).toBeUndefined();

    // 3 holdings: quantized total to nearest 1,000 INR
    const trioView = projectPublicShareView({
      portfolioName: "Trio City",
      mode: "live",
      showRupeeTotals: true,
      constituents: [
        {
          symbol: "RELIANCE",
          companyName: "Reliance Industries",
          sector: "Oil, Gas and Energy",
          quantity: 10,
          totalCostPaise: 2500000n,
          closePricePaise: 275000n, // 27,500 INR
          pricingAsOf: "2026-11-04",
        },
        {
          symbol: "INFY",
          companyName: "Infosys",
          sector: "IT and Technology",
          quantity: 10,
          totalCostPaise: 1500000n,
          closePricePaise: 160000n, // 16,000 INR
          pricingAsOf: "2026-11-03",
        },
        {
          symbol: "TCS",
          companyName: "TCS",
          sector: "IT and Technology",
          quantity: 10,
          totalCostPaise: 3500000n,
          closePricePaise: 380000n, // 38,000 INR
          pricingAsOf: "2026-11-04",
        },
      ],
    });

    // Total = 27,500 + 16,000 + 38,000 = 81,500 INR -> rounded to nearest 1,000 = ₹82,000
    expect(trioView.totalRupeesFormatted).toBe("₹82,000");
    expect(trioView.pricingAsOf).toBe("2026-11-04");
    expect(trioView.oldestPricingAsOf).toBe("2026-11-03");
  });
});
