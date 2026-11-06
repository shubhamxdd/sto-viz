import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SECURITIES_CATALOG } from "../../data/securities-catalog";
import { usePortfolioStore } from "../../stores/use-portfolio-store";
import { DeleteHoldingDialog } from "./delete-holding-dialog";
import { HoldingDrawer } from "./holding-drawer";
import { HoldingsList } from "./holdings-list";
import { StockSearchInput } from "./stock-search-input";

describe("Portfolio Components", () => {
  beforeEach(() => {
    usePortfolioStore.getState().clearHoldings();
    usePortfolioStore.setState({
      isDrawerOpen: false,
      editingHoldingId: null,
    });
  });
  describe("StockSearchInput", () => {
    // covers: AC-1, AC-2 (instant stock search and dual-listing exchange toggle)
    it("renders search input, displays matching options, and selects security", () => {
      const handleSelect = vi.fn();
      render(
        <StockSearchInput
          selectedSecurity={null}
          selectedExchange="NSE"
          onSelect={handleSelect}
        />,
      );

      const input = screen.getByPlaceholderText(
        /search by ticker, company, or isin/i,
      );
      fireEvent.change(input, { target: { value: "Reliance" } });

      const option = screen.getByText("Reliance Industries Limited");
      expect(option).toBeDefined();

      fireEvent.click(option);
      expect(handleSelect).toHaveBeenCalledWith(
        expect.objectContaining({ isin: "INE002A01018" }),
        "NSE",
      );
    });

    it("displays selected security card with BSE and NSE exchange toggle options", () => {
      const handleSelect = vi.fn();
      const reliance = SECURITIES_CATALOG[0];

      render(
        <StockSearchInput
          selectedSecurity={reliance}
          selectedExchange="NSE"
          onSelect={handleSelect}
        />,
      );

      expect(screen.getByText("Reliance Industries Limited")).toBeDefined();
      const bseButton = screen.getByRole("button", { name: "BSE" });
      fireEvent.click(bseButton);
      expect(handleSelect).toHaveBeenCalledWith(reliance, "BSE");
    });
  });

  describe("HoldingsList", () => {
    // covers: AC-6 (existing holdings list with edit and delete actions)
    it("renders empty state when portfolio has no holdings", () => {
      usePortfolioStore.setState({ holdings: [] });
      render(<HoldingsList />);

      expect(screen.getByText(/your metropolis is empty/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /add stock/i })).toBeDefined();
    });

    it("renders active holdings list with formatted rupee prices and edit button", () => {
      usePortfolioStore.setState({
        holdings: [
          {
            id: "hold_test_1",
            securityId: "sec_tcs",
            isin: "INE467B01029",
            symbol: "TCS",
            exchange: "NSE",
            companyName: "Tata Consultancy Services Limited",
            sector: "IT and Technology",
            quantity: 10,
            buyPricePaise: "350000",
            totalCostPaise: "3500000",
            purchasedAt: "2026-11-06",
            updatedAt: "2026-11-06T12:00:00Z",
          },
        ],
      });

      render(<HoldingsList />);

      expect(screen.getByText("TCS")).toBeDefined();
      expect(screen.getAllByText("₹35,000.00").length).toBeGreaterThan(0);
      expect(screen.getByText(/10 shares/)).toBeDefined();

      const editBtn = screen.getByRole("button", { name: /edit tcs/i });
      fireEvent.click(editBtn);

      expect(usePortfolioStore.getState().isDrawerOpen).toBe(true);
      expect(usePortfolioStore.getState().editingHoldingId).toBe("hold_test_1");
    });
  });

  describe("DeleteHoldingDialog", () => {
    it("prompts user with confirmation dialog and invokes handlers", () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      const sampleHolding = {
        id: "hold_test_1",
        securityId: "sec_tcs",
        isin: "INE467B01029",
        symbol: "TCS",
        exchange: "NSE" as const,
        companyName: "Tata Consultancy Services Limited",
        sector: "IT and Technology" as const,
        quantity: 10,
        buyPricePaise: "350000",
        totalCostPaise: "3500000",
        purchasedAt: "2026-11-06",
        updatedAt: "2026-11-06T12:00:00Z",
      };

      const { rerender } = render(
        <DeleteHoldingDialog
          holding={sampleHolding}
          isOpen={true}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
      );

      expect(screen.getByText(/delete tcs\?/i)).toBeDefined();

      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);

      const deleteBtn = screen.getByRole("button", {
        name: /delete holding/i,
      });
      fireEvent.click(deleteBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);

      rerender(
        <DeleteHoldingDialog
          holding={sampleHolding}
          isOpen={false}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
      );
      expect(screen.queryByText(/delete tcs\?/i)).toBeNull();
    });
  });

  describe("HoldingDrawer", () => {
    it("renders drawer when open and submits valid entry", () => {
      usePortfolioStore.setState({
        isDrawerOpen: true,
        editingHoldingId: null,
      });
      const handleNotify = vi.fn();

      render(<HoldingDrawer onNotify={handleNotify} />);

      expect(screen.getByText("Add Stock to Portfolio")).toBeDefined();

      const searchInput = screen.getByPlaceholderText(
        /search by ticker, company, or isin/i,
      );
      fireEvent.change(searchInput, { target: { value: "Infosys" } });
      const option = screen.getByText("Infosys Limited");
      fireEvent.click(option);

      const priceInput = screen.getByLabelText(/buy price/i);
      fireEvent.change(priceInput, { target: { value: "1500" } });

      const submitBtn = screen.getByRole("button", {
        name: /add to portfolio/i,
      });
      fireEvent.click(submitBtn);

      expect(handleNotify).toHaveBeenCalledWith(
        expect.stringContaining("Added 10 shares of INFY to portfolio"),
      );
      expect(usePortfolioStore.getState().holdings.length).toBe(1);
    });
  });
});
