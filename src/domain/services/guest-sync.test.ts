import { describe, expect, it } from "vitest";
import {
  GuestLimitExceededError,
  resolveGuestSync,
  validateGuestHoldings,
} from "./guest-sync";

describe("guest-sync", () => {
  const sampleGuest = [
    {
      isin: "INE002A01018",
      symbol: "RELIANCE",
      companyName: "Reliance Industries",
      exchange: "NSE" as const,
      sector: "Oil, Gas and Energy",
      quantity: 10,
      buyPricePaise: "250000",
      totalCostPaise: "2500000",
    },
    {
      isin: "INE009A01021",
      symbol: "INFY",
      companyName: "Infosys",
      exchange: "NSE" as const,
      sector: "IT and Technology",
      quantity: 5,
      buyPricePaise: "150000",
      totalCostPaise: "750000",
    },
  ];

  describe("validateGuestHoldings", () => {
    it("validates up to 3 guest holdings", () => {
      const validated = validateGuestHoldings(sampleGuest);
      expect(validated).toHaveLength(2);
    });

    it("rejects more than 3 guest holdings", () => {
      const fourItems = [
        ...sampleGuest,
        {
          isin: "INE040A01034",
          symbol: "HDFCBANK",
          companyName: "HDFC Bank",
          exchange: "NSE" as const,
          sector: "Banks and Financial Services",
          quantity: 2,
          buyPricePaise: "160000",
          totalCostPaise: "320000",
        },
        {
          isin: "INE467B01029",
          symbol: "TCS",
          companyName: "TCS",
          exchange: "NSE" as const,
          sector: "IT and Technology",
          quantity: 1,
          buyPricePaise: "350000",
          totalCostPaise: "350000",
        },
      ];

      expect(() => validateGuestHoldings(fourItems)).toThrow(
        GuestLimitExceededError,
      );
    });
  });

  describe("resolveGuestSync", () => {
    it("merges quantities and costs for matching ISINs, and adds new ISINs", () => {
      const existingCloud = [
        {
          id: "cloud-1",
          securityId: "sec-reliance",
          isin: "INE002A01018",
          quantity: 20,
          totalCostPaise: 4800000n, // Existing: 20 shares at ₹2,400
        },
        {
          id: "cloud-2",
          securityId: "sec-tcs",
          isin: "INE467B01029",
          quantity: 10,
          totalCostPaise: 3500000n,
        },
      ];

      const result = resolveGuestSync(existingCloud, sampleGuest, "merge");

      expect(result.strategy).toBe("merge");
      expect(result.holdings).toHaveLength(3);

      // RELIANCE merged: 20 + 10 = 30 shares; 4,800,000 + 2,500,000 = 7,300,000 paise
      const reliance = result.holdings.find((h) => h.isin === "INE002A01018");
      expect(reliance).toBeDefined();
      expect(reliance?.quantity).toBe(30);
      expect(reliance?.totalCostPaise).toBe(7300000n);
      expect(reliance?.isNew).toBe(false);

      // INFY added as new holding: 5 shares, 750,000 paise
      const infy = result.holdings.find((h) => h.isin === "INE009A01021");
      expect(infy).toBeDefined();
      expect(infy?.quantity).toBe(5);
      expect(infy?.totalCostPaise).toBe(750000n);
      expect(infy?.isNew).toBe(true);

      // TCS preserved from cloud: 10 shares, 3,500,000 paise
      const tcs = result.holdings.find((h) => h.isin === "INE467B01029");
      expect(tcs).toBeDefined();
      expect(tcs?.quantity).toBe(10);
      expect(tcs?.totalCostPaise).toBe(3500000n);
      expect(tcs?.isNew).toBe(false);
    });

    it("replaces cloud holdings entirely when strategy is replace", () => {
      const existingCloud = [
        {
          id: "cloud-1",
          securityId: "sec-reliance",
          isin: "INE002A01018",
          quantity: 20,
          totalCostPaise: 4800000n,
        },
      ];

      const result = resolveGuestSync(existingCloud, sampleGuest, "replace");

      expect(result.strategy).toBe("replace");
      expect(result.holdings).toHaveLength(2);
      expect(result.holdings.map((h) => h.isin)).toEqual([
        "INE002A01018",
        "INE009A01021",
      ]);
      expect(result.holdings[0].quantity).toBe(10);
      expect(result.holdings[0].totalCostPaise).toBe(2500000n);
    });
  });
});
