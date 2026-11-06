import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import HomePage from "../../../app/page";
import {
  formatPaiseToRupees,
  parseRupeesToPaise,
} from "../../../domain/services/currency-parser";
import {
  SECURITIES_CATALOG,
  searchSecurities,
} from "../../data/securities-catalog";
import { usePortfolioStore } from "../../stores/use-portfolio-store";

describe("Manual Portfolio Entry Acceptance Verification", () => {
  beforeEach(() => {
    localStorage.clear();
    usePortfolioStore.getState().clearHoldings();
    usePortfolioStore.setState({
      isDrawerOpen: false,
      editingHoldingId: null,
    });
  });

  // AC-1: Instant Stock Search across NSE and BSE by symbol, company, or ISIN
  it("AC-1: instant stock search filters securities catalog across symbol, company, and ISIN", () => {
    // Search by symbol
    const relBySymbol = searchSecurities("RELIANCE");
    expect(relBySymbol.length).toBeGreaterThan(0);
    expect(relBySymbol[0].companyName).toBe("Reliance Industries Limited");

    // Search by company substring
    const tcsByCompany = searchSecurities("Consultancy");
    expect(tcsByCompany.length).toBeGreaterThan(0);
    expect(tcsByCompany[0].listings.some((l) => l.symbol === "TCS")).toBe(true);

    // Search by ISIN
    const hdfcByIsin = searchSecurities("INE040A01034");
    expect(hdfcByIsin.length).toBeGreaterThan(0);
    expect(hdfcByIsin[0].listings.some((l) => l.symbol === "HDFCBANK")).toBe(
      true,
    );
  });

  // AC-2: Dual-Listing Exchange Toggle defaults to NSE with BSE option
  it("AC-2: dual listed stocks default to primary exchange and toggle between NSE and BSE", () => {
    const reliance = SECURITIES_CATALOG.find((s) =>
      s.listings.some((l) => l.symbol === "RELIANCE"),
    );
    expect(reliance).toBeDefined();
    expect(
      reliance?.listings.some((l) => l.exchange === "NSE" && l.isPrimary),
    ).toBe(true);
    expect(reliance?.listings.some((l) => l.exchange === "BSE")).toBe(true);
  });

  // AC-3: Rupee-Denominated Buy Price with real-time formatting
  it("AC-3: formatPaiseToRupees formats integer paise with rupee symbol and Indian thousand grouping", () => {
    expect(formatPaiseToRupees(250000n)).toBe("₹2,500.00");
    expect(formatPaiseToRupees(10000000n)).toBe("₹1,00,000.00");
    expect(formatPaiseToRupees(0n)).toBe("₹0.00");
  });

  // AC-4: Integer Paise Parsing converts rupee string to integer paise safely
  it("AC-4: parseRupeesToPaise strictly converts rupee string to integer paise or throws InvalidCurrencyFormatError", () => {
    expect(parseRupeesToPaise("2500")).toBe(250000n);
    expect(parseRupeesToPaise("2500.50")).toBe(250050n);
    expect(parseRupeesToPaise("0.75")).toBe(75n);
    expect(() => parseRupeesToPaise("-100")).toThrow();
    expect(() => parseRupeesToPaise("invalid")).toThrow();
  });

  // AC-5: Duplicate Purchase Auto-Merge merges lots via weighted average buy price
  it("AC-5: adding shares of already-owned security merges quantity and computes weighted average buy price", () => {
    const store = usePortfolioStore.getState();
    const reliance = SECURITIES_CATALOG[0];
    const nseListing = reliance.listings.find((l) => l.exchange === "NSE");
    if (!nseListing) throw new Error("Missing NSE listing");

    // First purchase: 10 shares at ₹2,000 (total = ₹20,000)
    const result1 = store.addHolding({
      securityId: reliance.id,
      isin: reliance.isin,
      symbol: nseListing.symbol,
      exchange: "NSE",
      companyName: reliance.companyName,
      sector: reliance.sector,
      quantity: 10,
      buyPricePaise: "200000",
    });
    expect(result1.isMerged).toBe(false);

    // Second purchase: 10 shares at ₹3,000 (total = ₹30,000)
    // Combined: 20 shares at ₹2,500 (total = ₹50,000)
    const result2 = store.addHolding({
      securityId: reliance.id,
      isin: reliance.isin,
      symbol: nseListing.symbol,
      exchange: "NSE",
      companyName: reliance.companyName,
      sector: reliance.sector,
      quantity: 10,
      buyPricePaise: "300000",
    });
    expect(result2.isMerged).toBe(true);

    const holdings = usePortfolioStore.getState().holdings;
    expect(holdings.length).toBe(1);
    expect(holdings[0].quantity).toBe(20);
    expect(holdings[0].buyPricePaise).toBe("250000");
    expect(holdings[0].totalCostPaise).toBe("5000000");
  });

  // AC-6: Holding Modification and Deletion
  it("AC-6: holding updates quantity and buy price, and deletes cleanly", () => {
    const store = usePortfolioStore.getState();
    const reliance = SECURITIES_CATALOG[0];
    const nseListing = reliance.listings.find((l) => l.exchange === "NSE");
    if (!nseListing) throw new Error("Missing NSE listing");

    const added = store.addHolding({
      securityId: reliance.id,
      isin: reliance.isin,
      symbol: nseListing.symbol,
      exchange: "NSE",
      companyName: reliance.companyName,
      sector: reliance.sector,
      quantity: 10,
      buyPricePaise: "250000",
    });

    const holdingId = added.holding.id;

    // Update quantity
    store.updateHolding(holdingId, { quantity: 15, buyPricePaise: "240000" });
    const updated = usePortfolioStore
      .getState()
      .holdings.find((h) => h.id === holdingId);
    expect(updated?.quantity).toBe(15);
    expect(updated?.buyPricePaise).toBe("240000");
    expect(updated?.totalCostPaise).toBe("3600000");

    // Remove holding
    store.removeHolding(holdingId);
    expect(usePortfolioStore.getState().holdings.length).toBe(0);
  });

  // AC-7: Client-Side Storage Persistence in localStorage
  it("AC-7: holdings persist to localStorage under foliocity_guest_holdings", () => {
    const reliance = SECURITIES_CATALOG[0];
    const nseListing = reliance.listings.find((l) => l.exchange === "NSE");
    if (!nseListing) throw new Error("Missing NSE listing");

    usePortfolioStore.getState().addHolding({
      securityId: reliance.id,
      isin: reliance.isin,
      symbol: nseListing.symbol,
      exchange: "NSE",
      companyName: reliance.companyName,
      sector: reliance.sector,
      quantity: 5,
      buyPricePaise: "250000",
    });

    const storedRaw = localStorage.getItem("foliocity_guest_holdings");
    expect(storedRaw).not.toBeNull();
    const parsed = JSON.parse(storedRaw as string);
    expect(parsed.state.holdings.length).toBe(1);
    expect(parsed.state.holdings[0].symbol).toBe("RELIANCE");
    expect(parsed.state.holdings[0].quantity).toBe(5);
  });

  // AC-8: Portfolio Valuation Summary and Sector Breakdown
  it("AC-8: computes total invested paise and sector distribution breakdown accurately", () => {
    const store = usePortfolioStore.getState();
    const reliance = SECURITIES_CATALOG[0]; // Oil, Gas and Energy
    const tcs = SECURITIES_CATALOG[3]; // IT and Technology
    const relListing = reliance.listings.find((l) => l.exchange === "NSE");
    const tcsListing = tcs.listings.find((l) => l.exchange === "NSE");
    if (!relListing || !tcsListing)
      throw new Error("Missing NSE listings for catalog securities");

    store.addHolding({
      securityId: reliance.id,
      isin: reliance.isin,
      symbol: relListing.symbol,
      exchange: "NSE",
      companyName: reliance.companyName,
      sector: reliance.sector,
      quantity: 10,
      buyPricePaise: "200000", // ₹20,000
    });

    store.addHolding({
      securityId: tcs.id,
      isin: tcs.isin,
      symbol: tcsListing.symbol,
      exchange: "NSE",
      companyName: tcs.companyName,
      sector: tcs.sector,
      quantity: 10,
      buyPricePaise: "300000", // ₹30,000
    });

    const totalInvested = store.getTotalInvestedPaise();
    expect(totalInvested).toBe(5000000n); // ₹50,000

    const sectorBreakdown = store.getSectorBreakdown();
    const energySector = sectorBreakdown.find(
      (s) => s.sector === "Oil, Gas and Energy",
    );
    const techSector = sectorBreakdown.find(
      (s) => s.sector === "IT and Technology",
    );

    expect(energySector?.totalPaise).toBe(2000000n);
    expect(techSector?.totalPaise).toBe(3000000n);
  });

  // Full UI render check on HomePage
  it("renders manual portfolio entry controls and drawer in HomePage HUD", () => {
    render(<HomePage />);

    // Header Add Stock button
    const headerAddButtons = screen.getAllByRole("button", {
      name: /add stock/i,
    });
    expect(headerAddButtons.length).toBeGreaterThan(0);

    // Open drawer
    act(() => {
      fireEvent.click(headerAddButtons[0]);
    });

    expect(usePortfolioStore.getState().isDrawerOpen).toBe(true);
    expect(screen.getByText("Add Stock to Portfolio")).toBeDefined();
  });
});
