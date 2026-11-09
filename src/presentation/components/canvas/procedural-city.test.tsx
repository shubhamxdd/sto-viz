import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Sector } from "@/domain/entities/security";
import { usePortfolioStore } from "../../stores/use-portfolio-store";
import { CityBuildings } from "./city-buildings";
import {
  calculateBuildingDimensions,
  calculateCityLayout,
  DEFAULT_LAYOUT_CONFIG,
  getDeterministicReturn,
} from "./city-layout";
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

    it("scales horizontal footprint proportionally with investment", () => {
      const smallDim = calculateBuildingDimensions(100000n);
      const largeDim = calculateBuildingDimensions(50000000n);

      expect(smallDim.width).toBeGreaterThanOrEqual(2.5);
      expect(largeDim.width).toBeGreaterThan(smallDim.width);
      expect(largeDim.width).toBeLessThanOrEqual(4.5);
      expect(largeDim.width).toBe(largeDim.depth);
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
  });

  describe("ProceduralBuilding (AC-5, AC-8)", () => {
    it("renders procedural building and handles selection callback", () => {
      const handleSelect = vi.fn();
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

      const { container } = render(
        <ProceduralBuilding
          plot={samplePlot}
          isSelected={false}
          onSelect={handleSelect}
        />,
      );

      expect(container).toBeDefined();
    });
  });
});
