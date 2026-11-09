import type { Sector } from "@/domain/entities/security";
import type { PortfolioHolding } from "../../stores/use-portfolio-store";

export interface BuildingPlot {
  holdingId: string;
  securityId: string;
  isin: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  companyName: string;
  sector: Sector;
  investedPaise: bigint;
  height: number;
  width: number;
  depth: number;
  position: [number, number, number];
  neonColor: string;
  emissiveIntensity: number;
  returnPercentage: number;
}

export interface CityLayoutConfig {
  lotSize: number; // Base lot cell width and depth (default 7.0 units)
  streetWidth: number; // Width of street corridors between blocks (default 4.0 units)
  minHeight: number; // Minimum building height cap (default 4.0 units)
  maxHeight: number; // Maximum skyscraper height cap (default 36.0 units)
  minFootprint: number; // Minimum horizontal footprint (default 2.5 units)
  maxFootprint: number; // Maximum horizontal footprint (default 4.5 units)
}

export const DEFAULT_LAYOUT_CONFIG: CityLayoutConfig = {
  lotSize: 7.0,
  streetWidth: 4.0,
  minHeight: 4.0,
  maxHeight: 36.0,
  minFootprint: 2.5,
  maxFootprint: 4.5,
};

/**
 * Calculates building vertical height and footprint dimensions from invested capital.
 * Employs a logarithmic curve so small retail positions remain clearly visible
 * while institutional scale positions do not clip the sky or camera bounds.
 */
export function calculateBuildingDimensions(
  investedPaise: bigint,
  config: CityLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): { height: number; width: number; depth: number } {
  const rupees = Number(investedPaise) / 100;

  if (rupees <= 0) {
    return {
      height: config.minHeight,
      width: config.minFootprint,
      depth: config.minFootprint,
    };
  }

  // Reference bounds: ₹1,000 (min benchmark) to ₹10,00,000 (max benchmark)
  const logMin = Math.log10(1000); // 3.0
  const logMax = Math.log10(1000000); // 6.0

  const safeRupees = Math.max(100, rupees);
  const logVal = Math.log10(safeRupees);
  const clampedLog = Math.max(logMin, Math.min(logMax, logVal));
  const t = (clampedLog - logMin) / (logMax - logMin); // Normalized in [0, 1]

  const rawHeight =
    config.minHeight + t * (config.maxHeight - config.minHeight);
  const clampedHeight = Math.max(
    config.minHeight,
    Math.min(config.maxHeight, rawHeight),
  );

  const rawWidth =
    config.minFootprint + t * (config.maxFootprint - config.minFootprint);
  const clampedWidth = Math.max(
    config.minFootprint,
    Math.min(config.maxFootprint, rawWidth),
  );

  return {
    height: Number(clampedHeight.toFixed(2)),
    width: Number(clampedWidth.toFixed(2)),
    depth: Number(clampedWidth.toFixed(2)),
  };
}

/**
 * Computes deterministic simulated returns for the skateboard phase
 * prior to the live daily Bhavcopy price pipeline in Release 3.
 */
export function getDeterministicReturn(isin: string): number {
  let hash = 0;
  for (let i = 0; i < isin.length; i++) {
    hash = (hash * 31 + isin.charCodeAt(i)) & 0xffffffff;
  }
  // Yields deterministic return between -12.5% and +22.5%
  const normalized = ((Math.abs(hash) % 350) - 125) / 10;
  return Number(normalized.toFixed(2));
}

/**
 * Calculates deterministic non-overlapping urban block plot positions for all holdings.
 * Organizes buildings into urban blocks separated by street corridors and centers
 * the overall city layout around [0, 0, 0].
 */
export function calculateCityLayout(
  holdings: PortfolioHolding[],
  customConfig?: Partial<CityLayoutConfig>,
): BuildingPlot[] {
  if (!holdings || holdings.length === 0) {
    return [];
  }

  const config: CityLayoutConfig = {
    ...DEFAULT_LAYOUT_CONFIG,
    ...customConfig,
  };

  const count = holdings.length;

  // Determine grid dimensions: roughly square aspect ratio
  const cols = Math.ceil(Math.sqrt(count));

  // Group into 2x2 blocks separated by streets
  // Pre-calculate raw lot coordinates
  const rawPlots: Array<{
    x: number;
    z: number;
    holding: PortfolioHolding;
  }> = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const blockX = Math.floor(col / 2);
    const inBlockX = col % 2;

    const blockZ = Math.floor(row / 2);
    const inBlockZ = row % 2;

    // Coordinate calculation incorporating street corridors
    const x =
      blockX * (2 * config.lotSize + config.streetWidth) +
      inBlockX * config.lotSize;

    const z =
      blockZ * (2 * config.lotSize + config.streetWidth) +
      inBlockZ * config.lotSize;

    rawPlots.push({ x, z, holding: holdings[i] });
  }

  // Calculate bounding center to re-center the entire city around [0, 0]
  const minX = Math.min(...rawPlots.map((p) => p.x));
  const maxX = Math.max(...rawPlots.map((p) => p.x));
  const minZ = Math.min(...rawPlots.map((p) => p.z));
  const maxZ = Math.max(...rawPlots.map((p) => p.z));

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  return rawPlots.map(({ x, z, holding }) => {
    const investedPaise = BigInt(holding.totalCostPaise);
    const { height, width, depth } = calculateBuildingDimensions(
      investedPaise,
      config,
    );

    const returnPercentage = getDeterministicReturn(holding.isin);
    const isProfitable = returnPercentage >= 0;

    // Electric cyan for gains (#22d3ee), Magenta crimson for losses (#fb7185)
    const neonColor = isProfitable ? "#22d3ee" : "#fb7185";
    const emissiveIntensity = 1.2;

    const centeredX = Number((x - centerX).toFixed(2));
    const centeredZ = Number((z - centerZ).toFixed(2));
    const centerY = Number((height / 2).toFixed(2));

    return {
      holdingId: holding.id,
      securityId: holding.securityId,
      isin: holding.isin,
      symbol: holding.symbol,
      exchange: holding.exchange,
      companyName: holding.companyName,
      sector: holding.sector,
      investedPaise,
      height,
      width,
      depth,
      position: [centeredX, centerY, centeredZ],
      neonColor,
      emissiveIntensity,
      returnPercentage,
    };
  });
}
