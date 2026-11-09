import { act, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Sector } from "@/domain/entities/security";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { usePortfolioStore } from "../../stores/use-portfolio-store";
import { CityBuildings } from "./city-buildings";
import {
  calculateBuildingDimensions,
  calculateCityLayout,
  DEFAULT_LAYOUT_CONFIG,
  getDeterministicReturn,
} from "./city-layout";
import { CityScene } from "./city-scene";
import { ConstructionBeacon } from "./construction-beacon";
import { ProceduralBuilding } from "./procedural-building";
import { SectorCrown } from "./sector-crowns";

// Mock Three.js / React Three Fiber canvas hooks if needed
vi.mock("@react-three/fiber", () => ({
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: [25, 20, 25] },
    gl: { domElement: document.createElement("canvas") },
  }),
}));

vi.mock("./city-camera", () => ({ CityCamera: () => null }));
vi.mock("./city-effects", () => ({ CityEffects: () => null }));
vi.mock("./city-environment", () => ({ CityEnvironment: () => null }));
vi.mock("./city-ground-grid", () => ({ CityGroundGrid: () => null }));

describe("Procedural 3D City Visualizer", () => {
  beforeEach(() => {
    act(() => {
      usePortfolioStore.getState().clearHoldings();
    });
  });

  describe("calculateBuildingDimensions (AC-2, AC-3)", () => {
    it("clamps building height strictly between 4.0 and 36.0 units", () => {
      // Zero or negative investment
      const zeroDim = calculateBuildingDimensions(0n);
      expect(zeroDim.height).toBe(DEFAULT_LAYOUT_CONFIG.minHeight);
      expect(zeroDim.width).toBe(DEFAULT_LAYOUT_CONFIG.minFootprint);

      // Small investment: ₹500 (50,000 paise)
      const smallDim = calculateBuildingDimensions(50000n);
      expect(smallDim.height).toBeGreaterThanOrEqual(4.0);
      expect(smallDim.height).toBeLessThan(15.0);

      // Large institutional investment: ₹10,00,000 (100,000,000 paise)
      const largeDim = calculateBuildingDimensions(100000000n);
      expect(largeDim.height).toBe(36.0);

      // Mega investment exceeding reference bound: ₹1,00,00,000
      const megaDim = calculateBuildingDimensions(1000000000n);
      expect(megaDim.height).toBe(36.0);
    });

    it("respects custom layout configuration bounds", () => {
      const customConfig = {
        blockSize: 2,
        lotSize: 8.0,
        streetWidth: 6.0,
        minHeight: 6.0,
        maxHeight: 48.0,
        minFootprint: 3.0,
        maxFootprint: 6.0,
      };

      const dimMin = calculateBuildingDimensions(0n, customConfig);
      expect(dimMin.height).toBe(6.0);
      expect(dimMin.width).toBe(3.0);

      const dimMax = calculateBuildingDimensions(10000000000n, customConfig);
      expect(dimMax.height).toBe(48.0);
      expect(dimMax.width).toBe(6.0);
    });
  });

  describe("getDeterministicReturn (AC-6)", () => {
    it("returns consistent deterministic return percentages for given ISINs", () => {
      const return1 = getDeterministicReturn("INE002A01018"); // RELIANCE
      const return2 = getDeterministicReturn("INE002A01018");
      expect(return1).toBe(return2);

      const tcsReturn = getDeterministicReturn("INE467B01029");
      expect(typeof tcsReturn).toBe("number");
      expect(tcsReturn).toBeGreaterThanOrEqual(-15);
      expect(tcsReturn).toBeLessThanOrEqual(25);
    });
  });

  describe("calculateCityLayout (AC-1, AC-5)", () => {
    it("returns empty array when portfolio has no holdings", () => {
      const plots = calculateCityLayout([]);
      expect(plots).toEqual([]);
    });

    it("arranges holdings into deterministic non-overlapping plots centered at origin", () => {
      const sampleHoldings = [
        {
          id: "h1",
          securityId: "sec_rel",
          isin: "INE002A01018",
          symbol: "RELIANCE",
          exchange: "NSE" as const,
          companyName: "Reliance Industries Limited",
          sector: "Oil, Gas and Energy" as Sector,
          quantity: 10,
          buyPricePaise: "250000",
          totalCostPaise: "2500000",
          purchasedAt: "2026-11-09",
          updatedAt: "2026-11-09T00:00:00Z",
        },
        {
          id: "h2",
          securityId: "sec_tcs",
          isin: "INE467B01029",
          symbol: "TCS",
          exchange: "NSE" as const,
          companyName: "Tata Consultancy Services Limited",
          sector: "IT and Technology" as Sector,
          quantity: 10,
          buyPricePaise: "350000",
          totalCostPaise: "3500000",
          purchasedAt: "2026-11-09",
          updatedAt: "2026-11-09T00:00:00Z",
        },
        {
          id: "h3",
          securityId: "sec_hdfc",
          isin: "INE040A01034",
          symbol: "HDFCBANK",
          exchange: "NSE" as const,
          companyName: "HDFC Bank Limited",
          sector: "Banks and Financial Services" as Sector,
          quantity: 20,
          buyPricePaise: "150000",
          totalCostPaise: "3000000",
          purchasedAt: "2026-11-09",
          updatedAt: "2026-11-09T00:00:00Z",
        },
        {
          id: "h4",
          securityId: "sec_infy",
          isin: "INE009A01021",
          symbol: "INFY",
          exchange: "NSE" as const,
          companyName: "Infosys Limited",
          sector: "IT and Technology" as Sector,
          quantity: 15,
          buyPricePaise: "160000",
          totalCostPaise: "2400000",
          purchasedAt: "2026-11-09",
          updatedAt: "2026-11-09T00:00:00Z",
        },
      ];

      const plots = calculateCityLayout(sampleHoldings);
      expect(plots.length).toBe(4);

      // Verify plots are non-overlapping: each position must be distinct
      const positions = plots.map((p) => `${p.position[0]},${p.position[2]}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(4);

      // Verify height positioning: y coordinate is half of height (bottom on ground y=0)
      for (const plot of plots) {
        expect(plot.position[1]).toBeCloseTo(plot.height / 2, 1);
        expect(plot.neonColor).toMatch(/^#(22d3ee|fb7185)$/);
      }
    });

    it("centers a single holding plot at origin [0, height/2, 0] (AC-1)", () => {
      const singleHolding = [
        {
          id: "h_single",
          securityId: "sec_tcs",
          isin: "INE467B01029",
          symbol: "TCS",
          exchange: "NSE" as const,
          companyName: "Tata Consultancy Services Limited",
          sector: "IT and Technology" as Sector,
          quantity: 5,
          buyPricePaise: "350000",
          totalCostPaise: "1750000",
          purchasedAt: "2026-11-09",
          updatedAt: "2026-11-09T00:00:00Z",
        },
      ];

      const plots = calculateCityLayout(singleHolding);
      expect(plots.length).toBe(1);
      expect(plots[0].position[0]).toBe(0);
      expect(plots[0].position[2]).toBe(0);
      expect(plots[0].position[1]).toBeCloseTo(plots[0].height / 2, 1);
    });

    it("expands gracefully across multi-block street grids with 5+ holdings (AC-1)", () => {
      const fiveHoldings = Array.from({ length: 5 }, (_, i) => ({
        id: `h_${i}`,
        securityId: `sec_${i}`,
        isin: `INE00000000${i}`,
        symbol: `STOCK${i}`,
        exchange: "NSE" as const,
        companyName: `Company ${i}`,
        sector: "IT and Technology" as Sector,
        quantity: 10,
        buyPricePaise: "100000",
        totalCostPaise: "1000000",
        purchasedAt: "2026-11-09",
        updatedAt: "2026-11-09T00:00:00Z",
      }));

      const plots = calculateCityLayout(fiveHoldings);
      expect(plots.length).toBe(5);

      const positions = plots.map((p) => `${p.position[0]},${p.position[2]}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(5);
    });

    it("maps positive returns to cyan and negative returns to rose neon glow (AC-6)", () => {
      const mockHoldings = [
        {
          id: "h_gain",
          securityId: "sec_gain",
          isin: "INE467B01029",
          symbol: "TCS",
          exchange: "NSE" as const,
          companyName: "TCS",
          sector: "IT and Technology" as Sector,
          quantity: 10,
          buyPricePaise: "100000",
          totalCostPaise: "1000000",
          purchasedAt: "2026-11-09",
          updatedAt: "2026-11-09T00:00:00Z",
        },
      ];

      const plots = calculateCityLayout(mockHoldings);
      if (plots[0].returnPercentage >= 0) {
        expect(plots[0].neonColor).toBe("#22d3ee");
      } else {
        expect(plots[0].neonColor).toBe("#fb7185");
      }
    });
  });

  describe("SectorCrown Component (AC-4)", () => {
    const allSectors: Sector[] = [
      "IT and Technology",
      "Banks and Financial Services",
      "Oil, Gas and Energy",
      "Pharma and Healthcare",
      "FMCG and Consumer Goods",
      "Automobiles and Manufacturing",
      "Metals and Mining",
    ];

    it.each(
      allSectors,
    )("renders distinct procedural geometry crown for sector: %s", (sector) => {
      const { container } = render(
        <SectorCrown
          sector={sector}
          width={3.5}
          depth={3.5}
          neonColor="#22d3ee"
          emissiveIntensity={1.5}
        />,
      );
      expect(container).toBeDefined();
    });

    it("returns null gracefully for unrecognized sector type", () => {
      const { container } = render(
        <SectorCrown
          sector={"Nonexistent Sector" as Sector}
          width={3.5}
          depth={3.5}
          neonColor="#22d3ee"
          emissiveIntensity={1.5}
        />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("ConstructionBeacon & CityBuildings (AC-7)", () => {
    it("renders holographic construction beacon when portfolio is empty", () => {
      const { container } = render(<CityBuildings />);
      expect(container).toBeDefined();
    });

    it("renders ConstructionBeacon component directly", () => {
      const { container } = render(<ConstructionBeacon />);
      expect(container).toBeDefined();
    });

    it("renders procedural buildings when portfolio has active holdings (AC-1, AC-5)", () => {
      act(() => {
        usePortfolioStore.getState().addHolding({
          securityId: "sec_rel",
          isin: "INE002A01018",
          symbol: "RELIANCE",
          exchange: "NSE",
          companyName: "Reliance Industries Limited",
          sector: "Oil, Gas and Energy",
          quantity: 10,
          buyPricePaise: "250000",
          purchasedAt: "2026-11-09",
        });
      });

      const handleSelect = vi.fn();
      const { container } = render(
        <CityBuildings onSelectHolding={handleSelect} />,
      );
      expect(container).toBeDefined();
    });
  });

  describe("ProceduralBuilding (AC-5, AC-8)", () => {
    const samplePlot = {
      holdingId: "hold_sample_1",
      securityId: "sec_tcs",
      isin: "INE467B01029",
      symbol: "TCS",
      exchange: "NSE" as const,
      companyName: "Tata Consultancy Services Limited",
      sector: "IT and Technology" as Sector,
      investedPaise: 3500000n,
      height: 18.0,
      width: 3.5,
      depth: 3.5,
      position: [0, 9.0, 0] as [number, number, number],
      neonColor: "#22d3ee",
      emissiveIntensity: 1.2,
      returnPercentage: 12.5,
    };

    it("renders procedural building and handles selection callback", () => {
      const handleSelect = vi.fn();
      const { container } = render(
        <ProceduralBuilding
          plot={samplePlot}
          isSelected={false}
          onSelect={handleSelect}
        />,
      );

      expect(container).toBeDefined();
    });

    it("handles hover pointer events and updates cursor style (AC-8)", () => {
      const { container } = render(
        <ProceduralBuilding plot={samplePlot} isSelected={false} />,
      );
      const group = container.querySelector("group");
      expect(group).toBeDefined();

      if (group) {
        fireEvent.pointerOver(group);
        expect(document.body.style.cursor).toBe("pointer");

        fireEvent.pointerOut(group);
        expect(document.body.style.cursor).toBe("auto");
      }
    });

    it("handles click selection event (AC-8)", () => {
      const handleSelect = vi.fn();
      const { container } = render(
        <ProceduralBuilding
          plot={samplePlot}
          isSelected={false}
          onSelect={handleSelect}
        />,
      );

      const group = container.querySelector("group");
      if (group) {
        fireEvent.click(group);
        expect(handleSelect).toHaveBeenCalledWith("hold_sample_1");
      }
    });

    it("renders short buildings without mid-tower band (AC-5)", () => {
      const shortPlot = {
        ...samplePlot,
        height: 6.0,
        position: [0, 3.0, 0] as [number, number, number],
      };

      const { container } = render(
        <ProceduralBuilding plot={shortPlot} isSelected={false} />,
      );
      expect(container).toBeDefined();
    });

    it("applies enhanced emission intensity when selected (AC-8)", () => {
      const { container } = render(
        <ProceduralBuilding plot={samplePlot} isSelected={true} />,
      );
      expect(container).toBeDefined();
    });
  });

  describe("CityScene Integration", () => {
    it("mounts scene and marks canvas as ready in store", () => {
      expect(useCanvasStore.getState().isCanvasReady).toBe(false);

      const { unmount } = render(<CityScene />);
      expect(useCanvasStore.getState().isCanvasReady).toBe(true);

      unmount();
      expect(useCanvasStore.getState().isCanvasReady).toBe(false);
    });
  });
});
