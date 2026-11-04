export interface HoldingValuation {
  quantity: number;
  totalCostPaise: bigint;
  currentValuePaise: bigint;
  profitOrLossPaise: bigint;
  profitLossBasisPoints: bigint;
  profitLossPercent: number;
  averageBuyPricePaise: bigint;
  averageBuyPriceRemainderPaise: bigint;
}

export interface MergedHoldingResult {
  mergedQuantity: number;
  mergedTotalCostPaise: bigint;
  averageBuyPricePaise: bigint;
  averageBuyPriceRemainderPaise: bigint;
}

export interface PortfolioValuationSummary {
  totalCostPaise: bigint;
  totalCurrentValuePaise: bigint;
  totalProfitOrLossPaise: bigint;
  totalProfitLossBasisPoints: bigint;
  totalProfitLossPercent: number;
  holdingCount: number;
}

/**
 * Calculates current market value, profit or loss, and return percentage for a single holding.
 * Uses integer paise arithmetic throughout.
 */
export function calculateHoldingValuation(
  quantity: number,
  totalCostPaise: bigint,
  closePricePaise: bigint,
): HoldingValuation {
  const qtyBigInt = BigInt(quantity);
  const currentValuePaise = qtyBigInt * closePricePaise;
  const profitOrLossPaise = currentValuePaise - totalCostPaise;
  const profitLossBasisPoints =
    totalCostPaise === 0n ? 0n : (profitOrLossPaise * 10000n) / totalCostPaise;
  const profitLossPercent = Number(profitLossBasisPoints) / 100;

  const averageBuyPricePaise = totalCostPaise / qtyBigInt;
  const averageBuyPriceRemainderPaise = totalCostPaise % qtyBigInt;

  return {
    quantity,
    totalCostPaise,
    currentValuePaise,
    profitOrLossPaise,
    profitLossBasisPoints,
    profitLossPercent,
    averageBuyPricePaise,
    averageBuyPriceRemainderPaise,
  };
}

/**
 * Merges duplicate purchases of a stock into a unified holding.
 * Preserves exact cumulative cost in paise without weighted average rounding drift.
 */
export function mergeHoldingPurchases(
  existingQuantity: number,
  existingTotalCostPaise: bigint,
  addedQuantity: number,
  addedBuyPricePaise: bigint,
): MergedHoldingResult {
  const mergedQuantity = existingQuantity + addedQuantity;
  const addedCost = BigInt(addedQuantity) * addedBuyPricePaise;
  const mergedTotalCostPaise = existingTotalCostPaise + addedCost;

  const mergedQtyBigInt = BigInt(mergedQuantity);
  const averageBuyPricePaise = mergedTotalCostPaise / mergedQtyBigInt;
  const averageBuyPriceRemainderPaise = mergedTotalCostPaise % mergedQtyBigInt;

  return {
    mergedQuantity,
    mergedTotalCostPaise,
    averageBuyPricePaise,
    averageBuyPriceRemainderPaise,
  };
}

/**
 * Calculates total portfolio summary across multiple holdings.
 */
export function calculatePortfolioValuationSummary(
  holdings: Array<{
    quantity: number;
    totalCostPaise: bigint;
    closePricePaise: bigint;
  }>,
): PortfolioValuationSummary {
  let totalCostPaise = 0n;
  let totalCurrentValuePaise = 0n;

  for (const h of holdings) {
    totalCostPaise += h.totalCostPaise;
    totalCurrentValuePaise += BigInt(h.quantity) * h.closePricePaise;
  }

  const totalProfitOrLossPaise = totalCurrentValuePaise - totalCostPaise;
  const totalProfitLossBasisPoints =
    totalCostPaise === 0n
      ? 0n
      : (totalProfitOrLossPaise * 10000n) / totalCostPaise;
  const totalProfitLossPercent = Number(totalProfitLossBasisPoints) / 100;

  return {
    totalCostPaise,
    totalCurrentValuePaise,
    totalProfitOrLossPaise,
    totalProfitLossBasisPoints,
    totalProfitLossPercent,
    holdingCount: holdings.length,
  };
}

export interface HeightScalingOptions {
  minHeight?: number;
  maxHeight?: number;
  maxInvestmentRupees?: number;
}

/**
 * Maps total invested capital in paise to a procedural 3D building height.
 * Uses a logarithmic scale to ensure both small retail investments and large holdings
 * remain aesthetically proportional and distinguishable.
 */
export function calculateBuildingHeight(
  totalCostPaise: bigint,
  options: HeightScalingOptions = {},
): number {
  const minHeight = options.minHeight ?? 2;
  const maxHeight = options.maxHeight ?? 30;
  const maxInvestment = options.maxInvestmentRupees ?? 10_000_000; // 1 Crore INR default benchmark

  const totalCostRupees = Number(totalCostPaise) / 100;
  if (totalCostRupees <= 0) return minHeight;

  // Logarithmic scaling formula from spec
  const logNumerator = Math.log10(totalCostRupees / 1000 + 1);
  const logDenominator = Math.log10(maxInvestment / 1000 + 1);

  const normalizedFraction = Math.min(
    Math.max(logNumerator / logDenominator, 0),
    1,
  );
  const calculatedHeight =
    minHeight + (maxHeight - minHeight) * normalizedFraction;

  return Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
}
