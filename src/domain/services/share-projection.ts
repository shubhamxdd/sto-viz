import { randomBytes } from "node:crypto";
import type {
  PublicBuildingViewDto,
  PublicShareViewDto,
  ShareLinkMode,
} from "@/domain/entities/share-view";
import { quantizePaiseToThousandRupees } from "./currency-parser";
import { calculateHoldingValuation } from "./portfolio-math";

export interface ConstituentHoldingInput {
  symbol: string;
  companyName: string;
  sector: string;
  quantity: number;
  totalCostPaise: bigint;
  closePricePaise: bigint;
  pricingAsOf: string; // ISO 8601 date YYYY-MM-DD
  isPriceStale?: boolean;
}

export interface ShareProjectionOptions {
  portfolioName: string;
  mode: ShareLinkMode;
  snapshotAsOf?: string | null;
  showRupeeTotals: boolean;
  constituents: ConstituentHoldingInput[];
}

/**
 * Generates a cryptographically random 256-bit unlisted token (64 hex characters).
 */
export function generateShareToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Projects a portfolio's internal holdings into a sanitized PublicShareViewDto.
 *
 * Privacy Guarantees:
 * 1. Share quantities, total costs, and individual rupee amounts are completely excluded.
 * 2. If holdingCount < 3, totalRupeesFormatted is ALWAYS null to prevent algebraic deduction.
 * 3. If holdingCount >= 3 and showRupeeTotals is true, total is quantized to nearest ₹1,000.
 */
export function projectPublicShareView(
  options: ShareProjectionOptions,
): PublicShareViewDto {
  const { portfolioName, mode, snapshotAsOf, showRupeeTotals, constituents } =
    options;

  let totalCostPaise = 0n;
  let totalCurrentValuePaise = 0n;
  let hasStalePrice = false;

  const dates: string[] = [];
  const buildings: PublicBuildingViewDto[] = [];

  for (const item of constituents) {
    const valuation = calculateHoldingValuation(
      item.quantity,
      item.totalCostPaise,
      item.closePricePaise,
    );

    totalCostPaise += item.totalCostPaise;
    totalCurrentValuePaise += valuation.currentValuePaise;

    if (item.isPriceStale) {
      hasStalePrice = true;
    }

    dates.push(item.pricingAsOf);

    buildings.push({
      symbol: item.symbol,
      companyName: item.companyName,
      sector: item.sector,
      profitOrLossPercent: valuation.profitLossPercent,
      pricingAsOf: item.pricingAsOf,
      isPriceStale: Boolean(item.isPriceStale),
    });
  }

  // Determine newest and oldest constituent Bhavcopy pricing dates
  dates.sort();
  const pricingAsOf = dates.length > 0 ? dates[dates.length - 1] : "";
  const oldestPricingAsOf = dates.length > 0 ? dates[0] : "";

  // Compute aggregate profit or loss percentage
  const totalProfitOrLossPaise = totalCurrentValuePaise - totalCostPaise;
  const totalBasisPoints =
    totalCostPaise === 0n
      ? 0n
      : (totalProfitOrLossPaise * 10000n) / totalCostPaise;
  const totalProfitOrLossPercent = Number(totalBasisPoints) / 100;

  // Privacy gate: Never expose total rupees if fewer than 3 holdings
  let totalRupeesFormatted: string | null = null;
  if (showRupeeTotals && constituents.length >= 3) {
    totalRupeesFormatted = quantizePaiseToThousandRupees(
      totalCurrentValuePaise,
    );
  }

  return {
    portfolioName,
    mode,
    snapshotAsOf: mode === "snapshot" ? (snapshotAsOf ?? null) : null,
    pricingAsOf,
    oldestPricingAsOf,
    totalProfitOrLossPercent,
    totalRupeesFormatted,
    isStale: hasStalePrice,
    buildings,
  };
}
