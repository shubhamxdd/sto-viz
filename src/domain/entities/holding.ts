import {
  InvalidHoldingCostError,
  InvalidQuantityError,
} from "@/domain/errors/domain-error";
import type { Exchange } from "./security";

export function validateHoldingQuantity(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(quantity);
  }
  return quantity;
}

export function validateHoldingCost(totalCostPaise: bigint): bigint {
  if (totalCostPaise <= 0n) {
    throw new InvalidHoldingCostError(totalCostPaise);
  }
  return totalCostPaise;
}

export interface Holding {
  id: string;
  portfolioId: string;
  securityId: string;
  quantity: number;
  totalCostPaise: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export interface HoldingDto {
  id: string;
  portfolioId: string;
  securityId: string;
  quantity: number;
  totalCostPaise: string; // Lossless numeric string for JSON boundary
  createdAt: string;
  updatedAt: string;
}

export const DAILY_PRICE_SOURCES = [
  "NSE_BHAVCOPY",
  "BSE_BHAVCOPY",
  "MANUAL",
] as const;

export type DailyPriceSource = (typeof DAILY_PRICE_SOURCES)[number];

export interface DailyPrice {
  id: string;
  listingId: string;
  exchange: Exchange;
  priceDate: string; // ISO 8601 date string YYYY-MM-DD
  closePricePaise: bigint;
  previousClosePaise: bigint;
  changePercent: number;
  volume: bigint | null;
  source: DailyPriceSource;
  ingestedAt: Date;
  createdAt: Date;
}
