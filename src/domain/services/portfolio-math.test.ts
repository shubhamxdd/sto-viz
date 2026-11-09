import { describe, expect, it } from "vitest";
import {
  calculateBuildingHeight,
  calculateHoldingValuation,
  calculatePortfolioValuationSummary,
  calculateSimulatedValuation,
  mergeHoldingPurchases,
} from "./portfolio-math";

describe("portfolio-math", () => {
  describe("calculateHoldingValuation", () => {
    it("calculates exact current value, profit or loss, and basis points", () => {
      // 10 shares bought at total cost of 10,000 paise (₹100)
      // Current close price is 1,200 paise (₹12 per share) -> current value 12,000 paise (₹120)
      const result = calculateHoldingValuation(10, 10000n, 1200n);

      expect(result.quantity).toBe(10);
      expect(result.totalCostPaise).toBe(10000n);
      expect(result.currentValuePaise).toBe(12000n);
      expect(result.profitOrLossPaise).toBe(2000n);
      // (2000 * 10000) / 10000 = 2000 basis points = 20.00%
      expect(result.profitLossBasisPoints).toBe(2000n);
      expect(result.profitLossPercent).toBe(20);
      expect(result.averageBuyPricePaise).toBe(1000n);
      expect(result.averageBuyPriceRemainderPaise).toBe(0n);
    });

    it("calculates loss percentage correctly", () => {
      // 10 shares bought at total cost of 10,000 paise (₹100)
      // Current close price is 800 paise (₹8 per share) -> current value 8,000 paise (₹80)
      const result = calculateHoldingValuation(10, 10000n, 800n);

      expect(result.profitOrLossPaise).toBe(-2000n);
      expect(result.profitLossBasisPoints).toBe(-2000n);
      expect(result.profitLossPercent).toBe(-20);
    });
  });

  describe("mergeHoldingPurchases", () => {
    it("combines quantities and sums total cost in paise without weighted average rounding drift", () => {
      // Existing: 10 shares at ₹100.50 (100500 paise total)
      // Added: 5 shares at ₹105.25 (52625 paise total)
      const existingQty = 10;
      const existingCostPaise = 100500n;
      const addedQty = 5;
      const addedBuyPricePaise = 10525n;

      const merged = mergeHoldingPurchases(
        existingQty,
        existingCostPaise,
        addedQty,
        addedBuyPricePaise,
      );

      expect(merged.mergedQuantity).toBe(15);
      // 100500 + (5 * 10525) = 100500 + 52625 = 153125n
      expect(merged.mergedTotalCostPaise).toBe(153125n);
      // 153125 / 15 = 10208 paise (₹102.08) with 5 paise remainder
      expect(merged.averageBuyPricePaise).toBe(10208n);
      expect(merged.averageBuyPriceRemainderPaise).toBe(5n);
    });
  });

  describe("calculatePortfolioValuationSummary", () => {
    it("aggregates portfolio holdings and computes portfolio level returns", () => {
      const holdings = [
        {
          quantity: 10,
          totalCostPaise: 100000n, // ₹1,000
          closePricePaise: 12000n, // Current: 10 * ₹120 = ₹1,200 (120000 paise)
        },
        {
          quantity: 5,
          totalCostPaise: 50000n, // ₹500
          closePricePaise: 8000n, // Current: 5 * ₹80 = ₹400 (40000 paise)
        },
      ];

      const summary = calculatePortfolioValuationSummary(holdings);

      expect(summary.totalCostPaise).toBe(150000n); // ₹1,500
      expect(summary.totalCurrentValuePaise).toBe(160000n); // ₹1,600
      expect(summary.totalProfitOrLossPaise).toBe(10000n); // ₹100 profit
      // 10000 * 10000 / 150000 = 666 basis points = 6.66%
      expect(summary.totalProfitLossBasisPoints).toBe(666n);
      expect(summary.totalProfitLossPercent).toBe(6.66);
      expect(summary.holdingCount).toBe(2);
    });
  });

  describe("calculateBuildingHeight", () => {
    it("scales logarithmic heights between min and max bounds", () => {
      // 0 investment returns min height (2)
      expect(calculateBuildingHeight(0n)).toBe(2);

      // 10,000 rupees (1,000,000 paise)
      const h10k = calculateBuildingHeight(1000000n);
      expect(h10k).toBeGreaterThan(2);
      expect(h10k).toBeLessThan(30);

      // 1,00,000 rupees (10,000,000 paise) is higher than 10k
      const h100k = calculateBuildingHeight(10000000n);
      expect(h100k).toBeGreaterThan(h10k);

      // Max benchmark (1 Crore = 1,00,00,000 INR = 1,000,000,000 paise) approaches max height (30)
      const hMax = calculateBuildingHeight(1000000000n);
      expect(hMax).toBeCloseTo(30, 0);

      // Values above max cap out at maxHeight (30)
      const hAbove = calculateBuildingHeight(5000000000n);
      expect(hAbove).toBe(30);
    });
  });

  describe("calculateSimulatedValuation", () => {
    it("calculates current valuation and profit with positive returns", () => {
      // ₹1,000 cost (100,000 paise) with +15% return -> ₹1,150 (115,000 paise)
      const res = calculateSimulatedValuation(100000n, 15);
      expect(res.currentValuationPaise).toBe(115000n);
      expect(res.unrealizedPnlPaise).toBe(15000n);
      expect(res.returnPercentage).toBe(15);
    });

    it("calculates current valuation and loss with negative returns", () => {
      // ₹1,000 cost (100,000 paise) with -10% return -> ₹900 (90,000 paise)
      const res = calculateSimulatedValuation(100000n, -10);
      expect(res.currentValuationPaise).toBe(90000n);
      expect(res.unrealizedPnlPaise).toBe(-10000n);
      expect(res.returnPercentage).toBe(-10);
    });

    it("handles zero cost basis safely", () => {
      const res = calculateSimulatedValuation(0n, 12.5);
      expect(res.currentValuationPaise).toBe(0n);
      expect(res.unrealizedPnlPaise).toBe(0n);
    });
  });
});
