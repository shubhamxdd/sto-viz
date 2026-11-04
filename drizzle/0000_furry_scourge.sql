CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "daily_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"exchange" varchar(10) NOT NULL,
	"price_date" date NOT NULL,
	"close_price_paise" bigint NOT NULL,
	"previous_close_paise" bigint NOT NULL,
	"change_percent" numeric(8, 4) NOT NULL,
	"volume" bigint,
	"source" varchar(30) DEFAULT 'NSE_BHAVCOPY' NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_prices_provenance_check" CHECK (("daily_prices"."exchange" = 'NSE' AND "daily_prices"."source" = 'NSE_BHAVCOPY') OR
          ("daily_prices"."exchange" = 'BSE' AND "daily_prices"."source" = 'BSE_BHAVCOPY') OR
          ("daily_prices"."source" = 'MANUAL')),
	CONSTRAINT "daily_prices_positive_prices_check" CHECK ("daily_prices"."close_price_paise" > 0 AND "daily_prices"."previous_close_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "holdings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"security_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"total_cost_paise" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "holdings_positive_quantity_check" CHECK ("holdings"."quantity" > 0),
	CONSTRAINT "holdings_positive_total_cost_check" CHECK ("holdings"."total_cost_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"security_id" uuid NOT NULL,
	"exchange" varchar(10) DEFAULT 'NSE' NOT NULL,
	"symbol" varchar(30) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listings_exchange_check" CHECK ("listings"."exchange" IN ('NSE', 'BSE')),
	CONSTRAINT "listings_active_primary_check" CHECK (NOT "listings"."is_primary" OR "listings"."is_active")
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(100) DEFAULT 'My City' NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "securities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"isin" varchar(12) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"sector" varchar(50) DEFAULT 'Other' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "securities_isin_format_check" CHECK ("securities"."isin" ~ '^[A-Z]{2}[A-Z0-9]{9}[0-9]$'),
	CONSTRAINT "securities_sector_check" CHECK ("securities"."sector" IN (
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
      ))
);
--> statement-breakpoint
CREATE TABLE "share_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"token" varchar(64) NOT NULL,
	"mode" varchar(20) DEFAULT 'live' NOT NULL,
	"snapshot_payload" jsonb,
	"snapshot_as_of" timestamp with time zone,
	"show_rupee_totals" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "share_links_token_format_check" CHECK ("share_links"."token" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "share_links_mode_check" CHECK ("share_links"."mode" IN ('live', 'snapshot')),
	CONSTRAINT "share_links_snapshot_mode_check" CHECK (("share_links"."mode" = 'snapshot' AND "share_links"."snapshot_payload" IS NOT NULL AND "share_links"."snapshot_as_of" IS NOT NULL) OR
          ("share_links"."mode" = 'live' AND "share_links"."snapshot_payload" IS NULL AND "share_links"."snapshot_as_of" IS NULL)),
	CONSTRAINT "share_links_revocation_consistency_check" CHECK (("share_links"."is_active" = true AND "share_links"."revoked_at" IS NULL) OR
          ("share_links"."is_active" = false AND "share_links"."revoked_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "daily_prices" ADD CONSTRAINT "daily_prices_listing_id_exchange_listings_id_exchange_fk" FOREIGN KEY ("listing_id","exchange") REFERENCES "public"."listings"("id","exchange") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_security_id_securities_id_fk" FOREIGN KEY ("security_id") REFERENCES "public"."securities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_security_id_securities_id_fk" FOREIGN KEY ("security_id") REFERENCES "public"."securities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_prices_listing_date_idx" ON "daily_prices" USING btree ("listing_id","price_date");--> statement-breakpoint
CREATE INDEX "daily_prices_price_date_idx" ON "daily_prices" USING btree ("price_date");--> statement-breakpoint
CREATE INDEX "daily_prices_exchange_date_idx" ON "daily_prices" USING btree ("exchange","price_date");--> statement-breakpoint
CREATE UNIQUE INDEX "holdings_portfolio_security_idx" ON "holdings" USING btree ("portfolio_id","security_id");--> statement-breakpoint
CREATE INDEX "holdings_portfolio_id_idx" ON "holdings" USING btree ("portfolio_id");--> statement-breakpoint
CREATE UNIQUE INDEX "listings_exchange_symbol_idx" ON "listings" USING btree ("exchange","symbol");--> statement-breakpoint
CREATE UNIQUE INDEX "listings_id_exchange_idx" ON "listings" USING btree ("id","exchange");--> statement-breakpoint
CREATE INDEX "listings_symbol_idx" ON "listings" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "listings_security_id_idx" ON "listings" USING btree ("security_id");--> statement-breakpoint
CREATE UNIQUE INDEX "listings_security_primary_idx" ON "listings" USING btree ("security_id") WHERE "listings"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "portfolios_user_id_idx" ON "portfolios" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolios_user_default_idx" ON "portfolios" USING btree ("user_id") WHERE "portfolios"."is_default" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "securities_isin_idx" ON "securities" USING btree ("isin");--> statement-breakpoint
CREATE INDEX "securities_sector_idx" ON "securities" USING btree ("sector");--> statement-breakpoint
CREATE UNIQUE INDEX "share_links_token_idx" ON "share_links" USING btree ("token");--> statement-breakpoint
CREATE INDEX "share_links_portfolio_id_idx" ON "share_links" USING btree ("portfolio_id");