import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { portfolios } from "./portfolios";
import { securities } from "./securities";

export const holdings = pgTable(
  "holdings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    portfolioId: uuid("portfolio_id")
      .notNull()
      .references(() => portfolios.id, { onDelete: "cascade" }),
    securityId: uuid("security_id")
      .notNull()
      .references(() => securities.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    totalCostPaise: bigint("total_cost_paise", { mode: "bigint" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("holdings_portfolio_security_idx").on(
      table.portfolioId,
      table.securityId,
    ),
    index("holdings_portfolio_id_idx").on(table.portfolioId),
    check("holdings_positive_quantity_check", sql`${table.quantity} > 0`),
    check(
      "holdings_positive_total_cost_check",
      sql`${table.totalCostPaise} > 0`,
    ),
  ],
);

export const holdingsRelations = relations(holdings, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [holdings.portfolioId],
    references: [portfolios.id],
  }),
  security: one(securities, {
    fields: [holdings.securityId],
    references: [securities.id],
  }),
}));
