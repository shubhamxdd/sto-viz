import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCanvasStore } from "../presentation/stores/use-canvas-store";
import { usePortfolioStore } from "../presentation/stores/use-portfolio-store";
import HomePage from "./page";

describe("HomePage Component", () => {
  beforeEach(() => {
    act(() => {
      usePortfolioStore.getState().clearHoldings();
      useCanvasStore.setState({
        displayMode: "currency",
        selectedHoldingId: null,
        selectedPlotPosition: null,
      });
    });
  });

  it("renders the primary FolioCity brand and metropolis status badge", () => {
    render(<HomePage />);

    expect(screen.getByText("FOLIOCITY")).toBeDefined();
    expect(screen.getByText("METROPOLIS")).toBeDefined();
  });

  it("renders camera toolbar with reset and orbit toggle buttons", () => {
    render(<HomePage />);

    const resetButton = screen.getByRole("button", {
      name: /reset camera view/i,
    });
    expect(resetButton).toBeDefined();

    const orbitButton = screen.getByRole("button", {
      name: /toggle auto orbit/i,
    });
    expect(orbitButton).toBeDefined();
  });

  it("renders quality switcher with High, Balanced, and Low options", () => {
    render(<HomePage />);

    expect(screen.getByRole("button", { name: /high/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /balanced/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /low/i })).toBeDefined();
  });

  it("displays the active holdings panel with Add Stock button", () => {
    render(<HomePage />);

    expect(screen.getByText(/active holdings/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /add stock/i })).toBeDefined();
    expect(
      screen.getByText(/drag to orbit · scroll to zoom · bounded camera/i),
    ).toBeDefined();
  });

  // covers: AC-6, AC-7 (SummaryBar rendered in page header when holdings exist)
  it("renders SummaryBar in header when portfolio contains active holdings", () => {
    act(() => {
      usePortfolioStore.getState().addHolding({
        securityId: "sec_tcs",
        isin: "INE467B01029",
        symbol: "TCS",
        exchange: "NSE",
        companyName: "Tata Consultancy Services Limited",
        sector: "IT and Technology",
        quantity: 10,
        buyPricePaise: "350000",
        purchasedAt: "2026-11-10",
      });
    });

    render(<HomePage />);

    expect(screen.getByText("Portfolio Value")).toBeDefined();
    expect(screen.getByLabelText("Hide Rupee Values")).toBeDefined();
  });

  // covers: AC-1, AC-3 (HoldingDetailsCard rendered in page overlay when selected)
  it("renders HoldingDetailsCard in overlay when a holding is selected", () => {
    let holdingId = "";
    act(() => {
      const res = usePortfolioStore.getState().addHolding({
        securityId: "sec_tcs",
        isin: "INE467B01029",
        symbol: "TCS",
        exchange: "NSE",
        companyName: "Tata Consultancy Services Limited",
        sector: "IT and Technology",
        quantity: 10,
        buyPricePaise: "350000",
        purchasedAt: "2026-11-10",
      });
      holdingId = res.holding.id;
      useCanvasStore.getState().setSelectedHoldingId(holdingId, [10, 5, 10]);
    });

    render(<HomePage />);

    expect(screen.getAllByText("TCS").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Portfolio Weight: 100.0%")).toBeDefined();
    expect(screen.getByRole("button", { name: /edit holding/i })).toBeDefined();
  });

  // covers: AC-1 (HomePage renders curated demo city options when portfolio is empty)
  it("renders curated demo city options on HomePage when portfolio is empty", () => {
    render(<HomePage />);

    expect(screen.getByText("Or Tour a Curated Demo City")).toBeDefined();
    expect(screen.getByText("Nifty Titans")).toBeDefined();
    expect(screen.getByText("Tech Frontier")).toBeDefined();
    expect(screen.getByText("Green Horizon")).toBeDefined();
  });
});
