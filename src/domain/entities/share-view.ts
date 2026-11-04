export type ShareLinkMode = "live" | "snapshot";

export interface PublicBuildingViewDto {
  symbol: string;
  companyName: string;
  sector: string;
  profitOrLossPercent: number;
  pricingAsOf: string;
  isPriceStale: boolean;
}

export interface PublicShareViewDto {
  portfolioName: string;
  mode: ShareLinkMode;
  snapshotAsOf: string | null;
  pricingAsOf: string;
  oldestPricingAsOf: string;
  totalProfitOrLossPercent: number;
  totalRupeesFormatted: string | null;
  isStale: boolean;
  buildings: PublicBuildingViewDto[];
}

export interface ShareLink {
  id: string;
  portfolioId: string;
  token: string;
  mode: ShareLinkMode;
  snapshotPayload: PublicShareViewDto | null;
  snapshotAsOf: Date | null;
  showRupeeTotals: boolean;
  isActive: boolean;
  revokedAt: Date | null;
  createdAt: Date;
}
