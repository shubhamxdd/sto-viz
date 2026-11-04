import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { portfolios } from "./portfolios";

export const shareLinks = pgTable(
  "share_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    portfolioId: uuid("portfolio_id")
      .notNull()
      .references(() => portfolios.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 64 }).notNull(),
    mode: varchar("mode", { length: 20 }).notNull().default("live"),
    snapshotPayload: jsonb("snapshot_payload"),
    snapshotAsOf: timestamp("snapshot_as_of", { withTimezone: true }),
    showRupeeTotals: boolean("show_rupee_totals").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("share_links_token_idx").on(table.token),
    index("share_links_portfolio_id_idx").on(table.portfolioId),
    check(
      "share_links_token_format_check",
      sql`${table.token} ~ '^[a-f0-9]{64}$'`,
    ),
    check("share_links_mode_check", sql`${table.mode} IN ('live', 'snapshot')`),
    check(
      "share_links_snapshot_mode_check",
      sql`(${table.mode} = 'snapshot' AND ${table.snapshotPayload} IS NOT NULL AND ${table.snapshotAsOf} IS NOT NULL) OR
          (${table.mode} = 'live' AND ${table.snapshotPayload} IS NULL AND ${table.snapshotAsOf} IS NULL)`,
    ),
    check(
      "share_links_revocation_consistency_check",
      sql`(${table.isActive} = true AND ${table.revokedAt} IS NULL) OR
          (${table.isActive} = false AND ${table.revokedAt} IS NOT NULL)`,
    ),
  ],
);

export const shareLinksRelations = relations(shareLinks, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [shareLinks.portfolioId],
    references: [portfolios.id],
  }),
}));
