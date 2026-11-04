import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { holdings } from "./holdings";
import { listings } from "./listings";

export const securities = pgTable(
  "securities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    isin: varchar("isin", { length: 12 }).notNull(),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    sector: varchar("sector", { length: 50 }).notNull().default("Other"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("securities_isin_idx").on(table.isin),
    index("securities_sector_idx").on(table.sector),
    check(
      "securities_isin_format_check",
      sql`${table.isin} ~ '^[A-Z]{2}[A-Z0-9]{9}[0-9]$'`,
    ),
    check(
      "securities_sector_check",
      sql`${table.sector} IN (
        'IT and Technology',
        'Banks and Financial Services',
        'Oil, Gas and Energy',
        'Pharma and Healthcare',
        'Automobiles and Manufacturing',
        'FMCG and Consumer Goods',
        'Metals and Mining',
        'Real Estate and Infrastructure',
        'Telecom and Media',
        'Other'
      )`,
    ),
  ],
);

export const securitiesRelations = relations(securities, ({ many }) => ({
  listings: many(listings),
  holdings: many(holdings),
}));
