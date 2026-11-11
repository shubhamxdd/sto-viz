import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { usePortfolioStore } from "../../stores/use-portfolio-store";
import { DemoCitiesDialog } from "./demo-cities-dialog";
import { EmptyCityOverlay } from "./empty-city-overlay";
import { HoldingDrawer } from "./holding-drawer";
import { HoldingsList } from "./holdings-list";

describe("Curated Demo Cities (Spec 0007)", () => {
  beforeEach(() => {
    act(() => {
      usePortfolioStore.getState().clearHoldings();
      usePortfolioStore.getState().closeDrawer();
      useCanvasStore.setState({
        selectedHoldingId: null,
        selectedPlotPosition: null,
      });
    });
  });

  describe("EmptyCityOverlay Component (AC-1, AC-2)", () => {
    it("renders 3 curated sample cards on an empty portfolio", () => {
      render(<EmptyCityOverlay />);

      expect(screen.getByText("Or Tour a Curated Demo City")).toBeDefined();
      expect(screen.getByText("Nifty Titans")).toBeDefined();
      expect(screen.getByText("Tech Frontier")).toBeDefined();
      expect(screen.getByText("Green Horizon")).toBeDefined();

      const cards = screen.getAllByRole("button", {
        name: /load .* demo city/i,
      });
      expect(cards).toHaveLength(3);
    });

    it("renders null when portfolio already contains holdings", () => {
      act(() => {
        usePortfolioStore.getState().addHolding({
          securityId: "sec_reliance",
          isin: "INE002A01018",
          symbol: "RELIANCE",
          exchange: "NSE",
          companyName: "Reliance Industries Limited",
          sector: "Oil, Gas and Energy",
          quantity: 10,
          buyPricePaise: "295000",
        });
      });

      const { container } = render(<EmptyCityOverlay />);
      expect(container.firstChild).toBeNull();
    });

    it("loads demo portfolio immediately when clicked on an empty portfolio (AC-2)", () => {
      const handleNotify = vi.fn();
      render(<EmptyCityOverlay onNotify={handleNotify} />);

      const niftyButton = screen.getByRole("button", {
        name: /load nifty titans demo city/i,
      });
      fireEvent.click(niftyButton);

      const holdings = usePortfolioStore.getState().holdings;
      expect(holdings).toHaveLength(5);
      expect(holdings.map((h) => h.symbol)).toEqual([
        "RELIANCE",
        "TCS",
        "HDFCBANK",
        "LT",
        "ITC",
      ]);
      expect(usePortfolioStore.getState().activeDemoId).toBe("nifty-titans");
      expect(handleNotify).toHaveBeenCalledWith(
        "Loaded Nifty Titans demo city",
      );
    });
  });

  describe("DemoCitiesDialog Component (AC-3, AC-5)", () => {
    it("renders dialog with 3 portfolio options and shows active tag for current demo", () => {
      act(() => {
        usePortfolioStore.getState().loadDemoPortfolio("tech-frontier");
      });

      render(<DemoCitiesDialog isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText("Explore Curated Demo Cities")).toBeDefined();
      expect(screen.getByText("Nifty Titans")).toBeDefined();
      expect(screen.getByText("Tech Frontier")).toBeDefined();
      expect(screen.getByText("Green Horizon")).toBeDefined();
      expect(screen.getByText("Active")).toBeDefined();
    });

    it("prompts for replacement confirmation when portfolio has active holdings (AC-3)", () => {
      act(() => {
        usePortfolioStore.getState().addHolding({
          securityId: "sec_infosys",
          isin: "INE009A01021",
          symbol: "INFY",
          exchange: "NSE",
          companyName: "Infosys Limited",
          sector: "IT and Technology",
          quantity: 20,
          buyPricePaise: "178000",
        });
      });

      render(<DemoCitiesDialog isOpen={true} onClose={vi.fn()} />);

      // Click on Green Horizon option
      const greenHorizonBtn = screen.getByRole("button", {
        name: /select green horizon portfolio/i,
      });
      fireEvent.click(greenHorizonBtn);

      // Should prompt with replacement confirmation modal
      expect(screen.getByText("Replace Active Holdings?")).toBeDefined();
      expect(screen.getByText(/your portfolio currently has/i)).toBeDefined();

      // Cancel should return to selection
      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelBtn);

      expect(screen.getByText("Explore Curated Demo Cities")).toBeDefined();
      expect(usePortfolioStore.getState().holdings).toHaveLength(1);
    });

    it("executes replacement when user confirms prompt (AC-3)", () => {
      const handleNotify = vi.fn();
      const handleClose = vi.fn();

      act(() => {
        usePortfolioStore.getState().addHolding({
          securityId: "sec_infosys",
          isin: "INE009A01021",
          symbol: "INFY",
          exchange: "NSE",
          companyName: "Infosys Limited",
          sector: "IT and Technology",
          quantity: 20,
          buyPricePaise: "178000",
        });
      });

      render(
        <DemoCitiesDialog
          isOpen={true}
          onClose={handleClose}
          onNotify={handleNotify}
        />,
      );

      // Select Green Horizon
      fireEvent.click(
        screen.getByRole("button", {
          name: /select green horizon portfolio/i,
        }),
      );

      // Confirm replacement
      const confirmBtn = screen.getByRole("button", {
        name: /replace with demo/i,
      });
      fireEvent.click(confirmBtn);

      const holdings = usePortfolioStore.getState().holdings;
      expect(holdings).toHaveLength(5);
      expect(holdings.map((h) => h.symbol)).toEqual([
        "TATAPOWER",
        "ADANIGREEN",
        "NTPC",
        "SUZLON",
        "LT",
      ]);
      expect(handleNotify).toHaveBeenCalledWith(
        "Loaded Green Horizon demo city",
      );
      expect(handleClose).toHaveBeenCalled();
    });

    it("closes on Escape key press", () => {
      const handleClose = vi.fn();
      render(<DemoCitiesDialog isOpen={true} onClose={handleClose} />);

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe("HoldingDrawer Integration (AC-5, AC-6)", () => {
    it("opens demo cities dialog when 'Explore Demo Cities' button is clicked", () => {
      act(() => {
        usePortfolioStore.getState().openDrawer();
      });

      render(<HoldingDrawer />);

      const exploreBtn = screen.getByRole("button", {
        name: /explore demo cities/i,
      });
      expect(exploreBtn).toBeDefined();

      fireEvent.click(exploreBtn);
      expect(screen.getByText("Explore Curated Demo Cities")).toBeDefined();
    });

    it("displays 'Clear City' button when holdings exist and clears on confirmation (AC-6)", () => {
      act(() => {
        usePortfolioStore.getState().loadDemoPortfolio("nifty-titans");
        useCanvasStore.setState({ selectedHoldingId: "some_id" });
        usePortfolioStore.getState().openDrawer();
      });

      const handleNotify = vi.fn();
      render(<HoldingDrawer onNotify={handleNotify} />);

      const clearBtn = screen.getByRole("button", {
        name: /clear city/i,
      });
      expect(clearBtn).toBeDefined();

      fireEvent.click(clearBtn);

      // Confirmation modal appears
      expect(screen.getByText("Clear Entire Metropolis?")).toBeDefined();

      // Click confirm clear
      const confirmClearBtn = screen.getByRole("button", {
        name: /clear all holdings/i,
      });
      fireEvent.click(confirmClearBtn);

      expect(usePortfolioStore.getState().holdings).toHaveLength(0);
      expect(usePortfolioStore.getState().activeDemoId).toBeNull();
      expect(useCanvasStore.getState().selectedHoldingId).toBeNull();
      expect(handleNotify).toHaveBeenCalledWith(
        "Cleared all portfolio holdings",
      );
    });
  });

  describe("HoldingsList Integration (AC-1)", () => {
    it("renders empty state overlay cards inside HoldingsList when portfolio is empty", () => {
      render(<HoldingsList />);

      expect(screen.getByText("Your metropolis is empty")).toBeDefined();
      expect(screen.getByText("Or Tour a Curated Demo City")).toBeDefined();
      expect(screen.getByText("Nifty Titans")).toBeDefined();
    });
  });
});
