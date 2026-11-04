import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  foreignKey,
  index,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { listings } from "./listings";

export const dailyPrices = pgTable(
  "daily_prices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id").notNull(),
    exchange: varchar("exchange", { length: 10 }).notNull(),
    priceDate: date("price_date").notNull(),
    closePricePaise: bigint("close_price_paise", { mode: "bigint" }).notNull(),
    previousClosePaise: bigint("previous_close_paise", {
      mode: "bigint",
    }).notNull(),
    changePercent: numeric("change_percent", {
      precision: 8,
      scale: 4,
    }).notNull(),
    volume: bigint("volume", { mode: "bigint" }),
    source: varchar("source", { length: 30 }).notNull().default("NSE_BHAVCOPY"),
    ingestedAt: timestamp("ingested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.listingId, table.exchange],
      foreignColumns: [listings.id, listings.exchange],
    }).onDelete("cascade"),
    uniqueIndex("daily_prices_listing_date_idx").on(
      table.listingId,
      table.priceDate,
    ),
    index("daily_prices_price_date_idx").on(table.priceDate),
    index("daily_prices_exchange_date_idx").on(table.exchange, table.priceDate),
    check(
      "daily_prices_provenance_check",
      sql`(${table.exchange} = 'NSE' AND ${table.source} = 'NSE_BHAVCOPY') OR
          (${table.exchange} = 'BSE' AND ${table.source} = 'BSE_BHAVCOPY') OR
          (${table.source} = 'MANUAL')`,
    ),
    check(
      "daily_prices_positive_prices_check",
      sql`${table.closePricePaise} > 0 AND ${table.previousClosePaise} > 0`,
    ),
  ],
);

export const dailyPricesRelations = relations(dailyPrices, ({ one }) => ({
  listing: one(listings, {
    fields: [dailyPrices.listingId],
    references: [listings.id],
  }),
}));
