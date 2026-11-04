import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { dailyPrices } from "./daily-prices";
import { securities } from "./securities";

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    securityId: uuid("security_id")
      .notNull()
      .references(() => securities.id, { onDelete: "cascade" }),
    exchange: varchar("exchange", { length: 10 }).notNull().default("NSE"),
    symbol: varchar("symbol", { length: 30 }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("listings_exchange_symbol_idx").on(
      table.exchange,
      table.symbol,
    ),
    uniqueIndex("listings_id_exchange_idx").on(table.id, table.exchange),
    index("listings_symbol_idx").on(table.symbol),
    index("listings_security_id_idx").on(table.securityId),
    uniqueIndex("listings_security_primary_idx")
      .on(table.securityId)
      .where(sql`${table.isPrimary} = true`),
    check("listings_exchange_check", sql`${table.exchange} IN ('NSE', 'BSE')`),
    check(
      "listings_active_primary_check",
      sql`NOT ${table.isPrimary} OR ${table.isActive}`,
    ),
  ],
);

export const listingsRelations = relations(listings, ({ one, many }) => ({
  security: one(securities, {
    fields: [listings.securityId],
    references: [securities.id],
  }),
  dailyPrices: many(dailyPrices),
}));
