import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  dailyPrices,
  dailyPricesRelations,
  holdings,
  holdingsRelations,
  listings,
  listingsRelations,
  portfolios,
  portfoliosRelations,
  securities,
  securitiesRelations,
  shareLinks,
  shareLinksRelations,
  users,
  usersRelations,
} from "./index";

describe("drizzle schema definitions and relations", () => {
  it("defines exact PostgreSQL table names matching the data model specification", () => {
    expect(getTableName(users)).toBe("user");
    expect(getTableName(securities)).toBe("securities");
    expect(getTableName(listings)).toBe("listings");
    expect(getTableName(dailyPrices)).toBe("daily_prices");
    expect(getTableName(portfolios)).toBe("portfolios");
    expect(getTableName(holdings)).toBe("holdings");
    expect(getTableName(shareLinks)).toBe("share_links");
  });

  it("exports active relations for all entities using Drizzle 0.45.x relations API", () => {
    expect(usersRelations).toBeDefined();
    expect(securitiesRelations).toBeDefined();
    expect(listingsRelations).toBeDefined();
    expect(dailyPricesRelations).toBeDefined();
    expect(portfoliosRelations).toBeDefined();
    expect(holdingsRelations).toBeDefined();
    expect(shareLinksRelations).toBeDefined();
  });

  it("configures securities columns with uppercase 12 character ISIN and sector defaults", () => {
    expect(securities.id.primary).toBe(true);
    expect(securities.isin.name).toBe("isin");
    expect(securities.companyName.name).toBe("company_name");
    expect(securities.sector.name).toBe("sector");
  });

  it("configures listings with composite identifier and primary/active flags", () => {
    expect(listings.id.primary).toBe(true);
    expect(listings.exchange.name).toBe("exchange");
    expect(listings.symbol.name).toBe("symbol");
    expect(listings.isPrimary.name).toBe("is_primary");
    expect(listings.isActive.name).toBe("is_active");
  });

  it("configures daily_prices with mode bigint for exact paise currency accounting", () => {
    expect(dailyPrices.closePricePaise.name).toBe("close_price_paise");
    expect(dailyPrices.previousClosePaise.name).toBe("previous_close_paise");
    expect(dailyPrices.changePercent.name).toBe("change_percent");
    expect(dailyPrices.source.name).toBe("source");
  });

  it("configures portfolios with optimistic concurrency version tracking", () => {
    expect(portfolios.userId.name).toBe("user_id");
    expect(portfolios.isDefault.name).toBe("is_default");
    expect(portfolios.version.name).toBe("version");
  });

  it("configures holdings with positive constraints and integer paise storage", () => {
    expect(holdings.quantity.name).toBe("quantity");
    expect(holdings.totalCostPaise.name).toBe("total_cost_paise");
  });

  it("configures share_links with mode, snapshot payload, and token columns", () => {
    expect(shareLinks.token.name).toBe("token");
    expect(shareLinks.mode.name).toBe("mode");
    expect(shareLinks.snapshotPayload.name).toBe("snapshot_payload");
    expect(shareLinks.showRupeeTotals.name).toBe("show_rupee_totals");
    expect(shareLinks.isActive.name).toBe("is_active");
  });
});
