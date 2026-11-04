import { InvalidIsinError } from "@/domain/errors/domain-error";

export const SECTORS = [
  "IT and Technology",
  "Banks and Financial Services",
  "Oil, Gas and Energy",
  "Pharma and Healthcare",
  "Automobiles and Manufacturing",
  "FMCG and Consumer Goods",
  "Metals and Mining",
  "Real Estate and Infrastructure",
  "Telecom and Media",
  "Other",
] as const;

export type Sector = (typeof SECTORS)[number];

export const EXCHANGES = ["NSE", "BSE"] as const;
export type Exchange = (typeof EXCHANGES)[number];

export const ISIN_REGEX = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

export function validateIsin(isin: string): string {
  const normalized = isin.trim().toUpperCase();
  if (!ISIN_REGEX.test(normalized)) {
    throw new InvalidIsinError(isin);
  }
  return normalized;
}

export interface Security {
  id: string;
  isin: string;
  companyName: string;
  sector: Sector;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  securityId: string;
  exchange: Exchange;
  symbol: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
