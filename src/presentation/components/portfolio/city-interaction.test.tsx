import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { usePortfolioStore } from "../../stores/use-portfolio-store";
import { HoldingDetailsCard } from "./holding-details-card";
import { HoldingsList } from "./holdings-list";
import { SummaryBar } from "./summary-bar";

describe("City Interaction and Holding Details (Spec 0006)", () => {
  const sampleHolding = {
    securityId: "sec_tcs",
    isin: "INE467B01029",
    symbol: "TCS",
    exchange: "NSE" as const,
    companyName: "Tata Consultancy Services Limited",
    sector: "IT and Technology" as const,
    quantity: 10,
    buyPricePaise: "350000",
    purchasedAt: "2026-11-10",
  };

  const sampleHolding2 = {
    securityId: "sec_rel",
    isin: "INE002A01018",
    symbol: "RELIANCE",
    exchange: "NSE" as const,
    companyName: "Reliance Industries Limited",
    sector: "Oil, Gas and Energy" as const,
    quantity: 10,
    buyPricePaise: "250000",
    purchasedAt: "2026-11-10",
  };

  beforeEach(() => {
    act(() => {
      usePortfolioStore.getState().clearHoldings();
      useCanvasStore.setState({
        displayMode: "currency",
        selectedHoldingId: null,
        selectedPlotPosition: null,
        isAutoRotating: true,
      });
    });
  });

  describe("SummaryBar Component (AC-6, AC-7)", () => {
    it("renders null when portfolio has no holdings", () => {
      const { container } = render(<SummaryBar />);
      expect(container.firstChild).toBeNull();
    });

    it("displays portfolio valuation, return percentage badge, and privacy toggle switch", () => {
      act(() => {
        usePortfolioStore.getState().addHolding(sampleHolding);
      });

      render(<SummaryBar />);

      expect(screen.getByText("Portfolio Value")).toBeDefined();
      expect(screen.getByLabelText("Hide Rupee Values")).toBeDefined();
    });

    it("toggles privacy mode and masks rupee figures to '₹ ••••••' (AC-7)", () => {
      act(() => {
        usePortfolioStore.getState().addHolding(sampleHolding);
      });

      render(<SummaryBar />);

      const toggleBtn = screen.getByLabelText("Hide Rupee Values");
      fireEvent.click(toggleBtn);

      expect(useCanvasStore.getState().displayMode).toBe("percentage");
      expect(screen.getAllByText("₹ ••••••").length).toBeGreaterThan(0);
      expect(screen.getByLabelText("Show Rupee Values")).toBeDefined();

      // Click again to return to currency mode
      fireEvent.click(screen.getByLabelText("Show Rupee Values"));
      expect(useCanvasStore.getState().displayMode).toBe("currency");
    });
  });

  describe("HoldingDetailsCard Component (AC-3, AC-4, AC-5, AC-7, AC-8)", () => {
    it("renders null when no holding is selected", () => {
      const { container } = render(<HoldingDetailsCard />);
      expect(container.firstChild).toBeNull();
    });

    it("displays holding details, sector badge, and allocation percentage (AC-3)", () => {
      let holdingId = "";
      act(() => {
        const res = usePortfolioStore.getState().addHolding(sampleHolding);
        holdingId = res.holding.id;
        useCanvasStore.getState().setSelectedHoldingId(holdingId, [10, 5, 10]);
      });

      render(<HoldingDetailsCard />);

      expect(screen.getByText("TCS")).toBeDefined();
      expect(
        screen.getByText("Tata Consultancy Services Limited"),
      ).toBeDefined();
      expect(screen.getByText("IT and Technology")).toBeDefined();
      expect(screen.getByText("10")).toBeDefined(); // quantity
      expect(screen.getByText("Portfolio Weight: 100.0%")).toBeDefined();
    });

    it("calculates multi-stock allocation weights accurately", () => {
      let tcsId = "";
      act(() => {
        const res1 = usePortfolioStore.getState().addHolding(sampleHolding); // ₹35,000 (3,500,000 paise)
        usePortfolioStore.getState().addHolding(sampleHolding2); // ₹25,000 (2,500,000 paise)
        tcsId = res1.holding.id;
        // Total invested = ₹60,000. TCS allocation = 35000 / 60000 = 58.33%
        useCanvasStore.getState().setSelectedHoldingId(tcsId, [0, 9, 0]);
      });

      render(<HoldingDetailsCard />);
      expect(screen.getByText("Portfolio Weight: 58.3%")).toBeDefined();
    });

    it("masks rupee amounts in percentage privacy mode (AC-7)", () => {
      act(() => {
        const res = usePortfolioStore.getState().addHolding(sampleHolding);
        useCanvasStore
          .getState()
          .setSelectedHoldingId(res.holding.id, [0, 9, 0]);
        useCanvasStore.getState().setDisplayMode("percentage");
      });

      render(<HoldingDetailsCard />);
      const maskedElements = screen.getAllByText("₹ ••••••");
      expect(maskedElements.length).toBeGreaterThanOrEqual(3);
    });

    it("opens edit drawer when 'Edit Holding' button is clicked (AC-4)", () => {
      let holdingId = "";
      act(() => {
        const res = usePortfolioStore.getState().addHolding(sampleHolding);
        holdingId = res.holding.id;
        useCanvasStore.getState().setSelectedHoldingId(holdingId, [0, 9, 0]);
      });

      render(<HoldingDetailsCard />);

      const editBtn = screen.getByText("Edit Holding");
      fireEvent.click(editBtn);

      expect(usePortfolioStore.getState().isDrawerOpen).toBe(true);
      expect(usePortfolioStore.getState().editingHoldingId).toBe(holdingId);
    });

    it("closes card and deselects holding when close button is clicked (AC-8)", () => {
      act(() => {
        const res = usePortfolioStore.getState().addHolding(sampleHolding);
        useCanvasStore
          .getState()
          .setSelectedHoldingId(res.holding.id, [0, 9, 0]);
      });

      render(<HoldingDetailsCard />);

      const closeBtn = screen.getByLabelText("Close holding details");
      fireEvent.click(closeBtn);

      expect(useCanvasStore.getState().selectedHoldingId).toBeNull();
    });

    it("handles delete confirmation and removes holding from store (AC-4, AC-5)", () => {
      const handleNotify = vi.fn();
      let holdingId = "";

      act(() => {
        const res = usePortfolioStore.getState().addHolding(sampleHolding);
        holdingId = res.holding.id;
        useCanvasStore.getState().setSelectedHoldingId(holdingId, [0, 9, 0]);
      });

      render(<HoldingDetailsCard onNotify={handleNotify} />);

      const deleteIconBtn = screen.getByLabelText("Delete TCS");
      fireEvent.click(deleteIconBtn);

      // Confirmation modal appears
      expect(screen.getByText("Delete TCS?")).toBeDefined();

      const confirmBtn = screen.getByText("Delete Holding");
      fireEvent.click(confirmBtn);

      expect(usePortfolioStore.getState().holdings.length).toBe(0);
      expect(useCanvasStore.getState().selectedHoldingId).toBeNull();
      expect(handleNotify).toHaveBeenCalledWith("Removed TCS from portfolio");
    });

    it("safely resets selection when holding is deleted externally (AC-5)", () => {
      let holdingId = "";
      act(() => {
        const res = usePortfolioStore.getState().addHolding(sampleHolding);
        holdingId = res.holding.id;
        useCanvasStore.getState().setSelectedHoldingId(holdingId, [0, 9, 0]);
      });

      const { container } = render(<HoldingDetailsCard />);
      expect(container.firstChild).not.toBeNull();

      act(() => {
        usePortfolioStore.getState().removeHolding(holdingId);
      });

      expect(useCanvasStore.getState().selectedHoldingId).toBeNull();
    });
  });

  describe("HoldingsList Privacy Integration (AC-7)", () => {
    it("masks holding costs in HoldingsList when percentage privacy mode is enabled", () => {
      act(() => {
        usePortfolioStore.getState().addHolding(sampleHolding);
        useCanvasStore.getState().setDisplayMode("percentage");
      });

      render(<HoldingsList />);

      const maskedItems = screen.getAllByText("₹ ••••••");
      expect(maskedItems.length).toBeGreaterThanOrEqual(1);
    });
  });
});
