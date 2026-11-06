import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { usePortfolioStore } from "./use-portfolio-store";

describe("usePortfolioStore", () => {
  beforeEach(() => {
    act(() => {
      usePortfolioStore.getState().clearHoldings();
      usePortfolioStore.getState().closeDrawer();
    });
  });

  it("initializes with empty holdings and closed drawer", () => {
    const state = usePortfolioStore.getState();
    expect(state.holdings).toEqual([]);
    expect(state.isDrawerOpen).toBe(false);
    expect(state.editingHoldingId).toBeNull();
  });

  // covers: AC-5 (adding duplicate stock auto-merges with weighted average buy price)
  it("adds new holding and auto-merges duplicate purchases using weighted average", () => {
    // 1. Add 10 shares of RELIANCE at ₹2,000 (200000 paise) -> cost ₹20,000
    act(() => {
      const res = usePortfolioStore.getState().addHolding({
        securityId: "sec_reliance",
        isin: "INE002A01018",
        symbol: "RELIANCE",
        exchange: "NSE",
        companyName: "Reliance Industries Limited",
        sector: "Oil, Gas and Energy",
        quantity: 10,
        buyPricePaise: "200000",
      });
      expect(res.isMerged).toBe(false);
    });

    let state = usePortfolioStore.getState();
    expect(state.holdings.length).toBe(1);
    expect(state.holdings[0].quantity).toBe(10);
    expect(state.holdings[0].buyPricePaise).toBe("200000");
    expect(state.holdings[0].totalCostPaise).toBe("2000000"); // ₹20,000 in paise

    // 2. Add 10 more shares of RELIANCE at ₹3,000 (300000 paise) -> cost ₹30,000
    // Expected: 20 shares, total cost ₹50,000 (5000000 paise), weighted avg ₹2,500 (250000 paise)
    act(() => {
      const res = usePortfolioStore.getState().addHolding({
        securityId: "sec_reliance",
        isin: "INE002A01018",
        symbol: "RELIANCE",
        exchange: "NSE",
        companyName: "Reliance Industries Limited",
        sector: "Oil, Gas and Energy",
        quantity: 10,
        buyPricePaise: "300000",
      });
      expect(res.isMerged).toBe(true);
    });

    state = usePortfolioStore.getState();
    expect(state.holdings.length).toBe(1);
    expect(state.holdings[0].quantity).toBe(20);
    expect(state.holdings[0].buyPricePaise).toBe("250000");
    expect(state.holdings[0].totalCostPaise).toBe("5000000");
  });

  // covers: AC-6 (edit and delete holdings)
  it("updates existing holding details and removes holding cleanly", () => {
    act(() => {
      usePortfolioStore.getState().addHolding({
        securityId: "sec_tcs",
        isin: "INE467B01029",
        symbol: "TCS",
        exchange: "NSE",
        companyName: "Tata Consultancy Services Limited",
        sector: "IT and Technology",
        quantity: 5,
        buyPricePaise: "350000",
      });
    });

    const holdingId = usePortfolioStore.getState().holdings[0].id;

    act(() => {
      usePortfolioStore.getState().updateHolding(holdingId, {
        quantity: 15,
        buyPricePaise: "320000",
      });
    });

    let state = usePortfolioStore.getState();
    expect(state.holdings[0].quantity).toBe(15);
    expect(state.holdings[0].buyPricePaise).toBe("320000");
    expect(state.holdings[0].totalCostPaise).toBe("4800000"); // 15 * 320000 = 4800000

    act(() => {
      usePortfolioStore.getState().removeHolding(holdingId);
    });

    state = usePortfolioStore.getState();
    expect(state.holdings.length).toBe(0);
  });

  // covers: AC-8 (computes total portfolio valuation and sector distribution)
  it("computes total invested capital and sector distribution accurately", () => {
    act(() => {
      usePortfolioStore.getState().addHolding({
        securityId: "sec_hdfc",
        isin: "INE040A01034",
        symbol: "HDFCBANK",
        exchange: "NSE",
        companyName: "HDFC Bank Limited",
        sector: "Banks and Financial Services",
        quantity: 10,
        buyPricePaise: "150000", // ₹15,000
      });
      usePortfolioStore.getState().addHolding({
        securityId: "sec_infy",
        isin: "INE009A01021",
        symbol: "INFY",
        exchange: "NSE",
        companyName: "Infosys Limited",
        sector: "IT and Technology",
        quantity: 10,
        buyPricePaise: "150000", // ₹15,000
      });
    });

    const state = usePortfolioStore.getState();
    expect(state.getTotalInvestedPaise()).toBe(3000000n); // ₹30,000 in paise
    expect(state.getTotalQuantity()).toBe(20);

    const sectors = state.getSectorBreakdown();
    expect(sectors.length).toBe(2);
    expect(
      sectors.find((s) => s.sector === "IT and Technology")?.percentage,
    ).toBe(50);
    expect(
      sectors.find((s) => s.sector === "Banks and Financial Services")
        ?.percentage,
    ).toBe(50);
  });

  it("manages drawer open and close states", () => {
    expect(usePortfolioStore.getState().isDrawerOpen).toBe(false);

    act(() => {
      usePortfolioStore.getState().openDrawer("hold_123");
    });
    expect(usePortfolioStore.getState().isDrawerOpen).toBe(true);
    expect(usePortfolioStore.getState().editingHoldingId).toBe("hold_123");

    act(() => {
      usePortfolioStore.getState().closeDrawer();
    });
    expect(usePortfolioStore.getState().isDrawerOpen).toBe(false);
    expect(usePortfolioStore.getState().editingHoldingId).toBeNull();
  });
});
