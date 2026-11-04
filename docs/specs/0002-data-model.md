# 0002. Data Model and Domain Contracts for FolioCity

**Date**: 2026-11-04
**Status**: Proposed

## Summary

This document establishes the canonical data model, domain entities, and persistence contracts for FolioCity. The data architecture stores Indian equities, exchange listings, daily closing Bhavcopy records, user portfolios, and unlisted share links in PostgreSQL using Drizzle ORM. Clean Architecture contracts isolate domain formulas from database schemas, supporting both browser local storage for guest visitors and cloud synchronization with conflict resolution for signed in users.

## Context

FolioCity visualizes Indian stock portfolios as a cyberpunk 3D cityscape where each building represents one company holding. To create a dependable visualization without paper trading or live streaming noise, the system requires a clean foundational data model that unifies several distinct operational concerns.

First, Indian equities trade across two major exchanges, the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE). A single company shares one unique International Securities Identification Number (ISIN) across both exchanges while carrying different ticker symbols. The data model decouples canonical securities from exchange listings, selecting the primary NSE listing as the authoritative valuation benchmark while indexing BSE tickers for seamless search.

Second, the product starts with zero friction. First time visitors enter up to three stocks stored solely in browser local storage. When adding a fourth stock, the application prompts them to sign in, which synchronizes their holdings to cloud storage in PostgreSQL. If the cloud account already holds stock records from another device, the system handles the conflict gracefully by letting the user choose between merging holdings with weighted average buy prices or transactionally replacing them.

Third, unlisted share links allow users to showcase their cyberpunk skyline publicly without compromising financial privacy. The privacy boundary guarantees that share quantities, invested amounts, and individual stock rupee valuations are never projected over the public network. Public viewers see building neon glow colors, percentage moves, and sector styles, which conceals net worth and share counts. When the owner opts in to show total rupee amounts, only the aggregate portfolio total is exposed, with automatic suppression if the portfolio contains only one stock to prevent individual capital deduction.

Finally, equity valuation calculations must remain deterministic and avoid floating point inaccuracies or accumulated drift. Rather than repeatedly rounding unit buy prices, holdings store total invested cost alongside share quantity, computing weighted average buy prices on demand. In domain logic, exact integer paise arithmetic handles money values, converting to JavaScript numbers only when setting Three.js building geometry heights and shader parameters.

## Requirements

**User stories**:
- As a retail investor, I want to add my stock holdings by symbol or company name so that my investments render as distinct buildings in my 3D city.
- As a retail investor, I want multiple purchases of the same stock merged into one holding with a weighted average buy price so that each stock corresponds to exactly one building.
- As a visitor, I want to explore the application without signing in, storing up to three stocks in browser storage, so that I can experience the 3D visualization immediately.
- As a signed in user, I want my holdings stored securely in the cloud and synced across devices so that I never lose my city configuration.
- As a signed in user, I want to create an unlisted share link to my city so that I can share my visual achievements with friends while keeping my sensitive share quantities private.

**Acceptance criteria**:
- **AC-1**: Securities store uppercase 12 character ISINs matching standard format, official company names, and sector classifications. Listings link securities to NSE and BSE tickers with a partial unique index ensuring at most one primary listing per security, enforced transactionally on listing creation.
- **AC-2**: Holdings store positive integer share quantities and cumulative invested cost with 2 decimal places, enforcing check constraints at database and entity layers.
- **AC-3**: Duplicate entries of the same stock merge automatically within an atomic transaction by summing quantities and invested costs, calculating weighted average buy price on demand without compounding rounding drift.
- **AC-4**: Daily closing prices record historical exchange closing prices indexed by listing ID and date, preventing duplicate daily records through compound unique constraints.
- **AC-5**: Portfolio valuation formulas compute invested capital, current market value, profit or loss in rupees, and profit or loss percentage using exact integer paise arithmetic without floating point drift. Building height scales using a capped logarithmic curve.
- **AC-6**: Portfolios associate directly with Better Auth user accounts while maintaining isolated holdings and enforcing a single default portfolio per user via partial unique indexing.
- **AC-7**: Account synchronization handles conflicts between browser local storage and cloud records using stable ISIN identifiers, prompting the user to either merge holdings or transactionally replace cloud holdings.
- **AC-8**: Unlisted share links use cryptographically random 256 bit tokens, support live or frozen snapshot modes with explicit cross column validity checks, and project public payloads that omit share quantities, buy prices, and individual stock market values. If a portfolio has only one holding, total rupee amounts are suppressed to protect privacy.

## Options considered

### Option 1: Normalized relational model separating securities and exchange listings with exact cost accounting

A relational schema modeled in Drizzle ORM separating canonical securities (by ISIN) from exchange listings (NSE and BSE tickers), storing cumulative invested costs to eliminate weighted average drift, and isolating public share projections.

**Pros**:
- Full relational integrity: supports companies trading on both NSE and BSE under different symbols without duplicating underlying holdings
- Zero rounding drift: storing cumulative invested cost preserves exact mathematical precision across unlimited purchase merges
- Privacy safety: share links project an allow listed public data transfer object, keeping private share counts concealed
- Clean Architecture boundaries: plain TypeScript domain entities run identically in browser local storage and server runtimes

**Cons**:
- Slightly more tables than a flat single table stock model
- Requires joining securities with listings during symbol search

### Option 2: Flat single stock table with rounded average buy prices

A simplified schema storing ISIN, ticker, and exchange on a single stock table, and updating a rounded average buy price on each holding.

**Pros**:
- Fewer tables and simpler initial queries

**Cons**:
- Cannot cleanly model an ISIN listed under different ticker symbols on NSE and BSE
- Successive purchase merges compound rounding errors in the average buy price
- Risk of leaking quantities on public shares if individual market values are exposed alongside public closing prices

### Option 3: Event sourced ledger storing raw buy orders

An append only transaction ledger storing every individual buy ticket and deriving holdings dynamically.

**Pros**:
- Full historical audit trail of individual buy dates and quantities

**Cons**:
- Overkill for version 1 visualization scope which explicitly tracks current holdings only
- Increases query latency during 3D scene rendering

## Decision

**Chosen option**: Option 1: Normalized relational model separating securities and exchange listings with exact cost accounting

FolioCity will implement a normalized relational schema in PostgreSQL using Drizzle ORM. Canonical securities decouple from exchange listings, holdings store cumulative costs to guarantee exact weighted average math, and unlisted share links use strict server projected data transfer objects.

**Implementation skills**: `drizzle-best-practices` (`honra-io/drizzle-best-practices`, `.agents/skills/drizzle-best-practices/`)

## Rationale

Option 1 resolves the core challenges raised during architectural review.

Separating `securities` (identified by ISIN) from `listings` (exchange tickers) allows companies listed on both NSE and BSE to resolve to a single canonical holding. Valuation queries default to the primary NSE listing price while still supporting BSE ticker search.

Storing `total_cost` (quantity multiplied by buy price) in holdings rather than a rounded unit price eliminates compounding drift. The average buy price is computed dynamically as `total_cost / quantity`, preserving financial precision across repeated merges.

For public sharing, individual holding rupee values and share counts are completely excluded from public endpoints. Viewers see company name, sector style, and percentage move, which powers the visual 3D building height and neon glow without exposing personal wealth.

## Feature design

### Data model sketch

#### 1. `securities`
Canonical company identity across exchanges.
- `id`: `uuid`, primary key, default `gen_random_uuid()`
- `isin`: `varchar(12)`, not null, check `(isin ~ '^[A-Z]{2}[A-Z0-9]{9}[0-9]$')`
- `company_name`: `varchar(255)`, not null
- `sector`: `varchar(50)`, not null, default 'Other', check `(sector in ('IT and Technology', 'Banks and Financial Services', 'Oil, Gas and Energy', 'Pharma and Healthcare', 'Automobiles and Manufacturing', 'FMCG and Consumer Goods', 'Metals and Mining', 'Real Estate and Infrastructure', 'Telecom and Media', 'Other'))`
- `created_at`: `timestamptz`, not null, default `now()`
- `updated_at`: `timestamptz`, not null, default `now()`
- Indexes: `unique(isin)`, `index(sector)`

#### 2. `listings`
Exchange specific trading ticker symbol.
- `id`: `uuid`, primary key, default `gen_random_uuid()`
- `security_id`: `uuid`, not null, references `securities(id)` on delete cascade
- `exchange`: `varchar(10)`, not null, default 'NSE', check `(exchange in ('NSE', 'BSE'))`
- `symbol`: `varchar(30)`, not null (e.g. 'RELIANCE')
- `is_primary`: `boolean`, not null, default false
- `is_active`: `boolean`, not null, default true
- `created_at`: `timestamptz`, not null, default `now()`
- `updated_at`: `timestamptz`, not null, default `now()`
- Indexes: `unique(exchange, symbol)`, `index(symbol)`, `index(security_id)`, `unique(security_id) where is_primary = true`

#### 3. `daily_prices`
Daily closing prices ingested from official exchange Bhavcopy files.
- `id`: `uuid`, primary key, default `gen_random_uuid()`
- `listing_id`: `uuid`, not null, references `listings(id)` on delete cascade
- `price_date`: `date`, not null
- `close_price`: `numeric(12, 2)`, not null, check `(close_price > 0)`
- `previous_close`: `numeric(12, 2)`, not null, check `(previous_close > 0)`
- `change_percent`: `numeric(8, 4)`, not null
- `volume`: `bigint`
- `source`: `varchar(30)`, not null, default 'NSE_BHAVCOPY', check `(source in ('NSE_BHAVCOPY', 'BSE_BHAVCOPY'))`
- `created_at`: `timestamptz`, not null, default `now()`
- Indexes: `unique(listing_id, price_date)`, `index(price_date)`

#### 4. `portfolios`
Represents an investor city collection.
- `id`: `uuid`, primary key, default `gen_random_uuid()`
- `user_id`: `text`, not null, references Better Auth `user(id)` on delete cascade
- `name`: `varchar(100)`, not null, default 'My City'
- `is_default`: `boolean`, not null, default true
- `version`: `integer`, not null, default 1
- `created_at`: `timestamptz`, not null, default `now()`
- `updated_at`: `timestamptz`, not null, default `now()`
- Indexes: `index(user_id)`, `unique(user_id) where is_default = true`

#### 5. `holdings`
Stock holding within a portfolio.
- `id`: `uuid`, primary key, default `gen_random_uuid()`
- `portfolio_id`: `uuid`, not null, references `portfolios(id)` on delete cascade
- `security_id`: `uuid`, not null, references `securities(id)` on delete restrict
- `quantity`: `integer`, not null, check `(quantity > 0)`
- `total_cost`: `numeric(14, 2)`, not null, check `(total_cost > 0)`
- `created_at`: `timestamptz`, not null, default `now()`
- `updated_at`: `timestamptz`, not null, default `now()`
- Indexes: `unique(portfolio_id, security_id)`, `index(portfolio_id)`

#### 6. `share_links`
Unlisted share links with public projection.
- `id`: `uuid`, primary key, default `gen_random_uuid()`
- `portfolio_id`: `uuid`, not null, references `portfolios(id)` on delete cascade
- `token`: `varchar(64)`, not null, unique index, check `(token ~ '^[a-f0-9]{64}$')`
- `mode`: `varchar(20)`, not null, default 'live', check `(mode in ('live', 'snapshot'))`
- `snapshot_payload`: `jsonb`
- `snapshot_as_of`: `timestamptz`
- `show_rupee_totals`: `boolean`, not null, default false
- `is_active`: `boolean`, not null, default true
- `revoked_at`: `timestamptz`
- `created_at`: `timestamptz`, not null, default `now()`
- Checks: `((mode = 'snapshot' and snapshot_payload is not null and snapshot_as_of is not null) or (mode = 'live' and snapshot_payload is null and snapshot_as_of is null))`
- Indexes: `unique(token)`, `index(portfolio_id)`

### Sector classification mapping

Securities map into 10 distinct architectural styles:
1. `IT and Technology`: Glass towers with digital displays
2. `Banks and Financial Services`: Stone and steel classical towers
3. `Oil, Gas and Energy`: Industrial refinery cylinders and chimneys
4. `Pharma and Healthcare`: Clean white monolithic clinics with cross illuminations
5. `Automobiles and Manufacturing`: Wide industrial hangar structures
6. `FMCG and Consumer Goods`: Multi level market and retail blocks
7. `Metals and Mining`: Heavy raw industrial smelters
8. `Real Estate and Infrastructure`: Skeletal concrete frameworks with cranes
9. `Telecom and Media`: Sleek towers with communications antennas
10. `Other`: Generic futuristic neon cuboid

### Mathematical invariants and domain representation

Financial arithmetic inside domain entities uses integer paise (`bigint`) to guarantee exact math with zero external libraries:
- 1 Rupee = 100 Paise
- `total_cost_paise = BigInt(Math.round(Number(total_cost) * 100))`
- `close_price_paise = BigInt(Math.round(Number(close_price) * 100))`
- `current_value_paise = BigInt(quantity) * close_price_paise`
- `profit_or_loss_paise = current_value_paise - total_cost_paise`
- `profit_loss_basis_points = (profit_or_loss_paise * 10000n) / total_cost_paise`
- `profit_loss_percent = Number(profit_loss_basis_points) / 100`

**Duplicate purchase merge**:
- `merged_quantity = existing_quantity + added_quantity`
- `merged_total_cost_paise = existing_total_cost_paise + (BigInt(added_quantity) * added_buy_price_paise)`
- `derived_average_buy_price = Number(merged_total_cost_paise) / (Number(merged_quantity) * 100)`

**Building height scaling curve**:
- `normalized_height = min_height + (max_height - min_height) * (log10(invested_amount / 1000 + 1) / log10(max_investment / 1000 + 1))`
Where `min_height = 2`, `max_height = 30`, and values are clamped within bounds. Floating point conversion occurs solely at this final visual projection step.

### Value sourcing

| Action | Value produced / displayed | Source |
|---|---|---|
| Enter holding | Security and listing | User selects from `listings` joined to `securities` |
| Enter holding | Quantity | User input, whole positive integer |
| Enter holding | Buy price | User input, rupees up to 2 decimal places |
| Merge holdings | Total cost | Sum of existing `total_cost` and added `quantity * buy_price` |
| Render building | Height | Computed via logarithmic scaling curve from `total_cost` |
| Render building | Glow color | Derived from `profit_loss_percent` (cyan profit, red loss, blue neutral) |
| Render building | Architectural mesh style | Mapped directly from `security.sector` |
| View shared city | Building percentage move | Calculated from `latest_close_price` and derived `average_buy_price` |
| View shared city | Total portfolio profit % | Sum of position gains divided by total portfolio cost multiplied by 100 |
| View shared city | Share quantity and buy price | Excluded from public query projections |

### Key invariants

- Every listing points to exactly one canonical security by foreign key.
- A security has at most one primary listing (`is_primary = true`), and the primary listing defaults to NSE for NSE traded equities.
- A portfolio cannot contain duplicate holdings for the same security; duplicate inputs merge cumulative cost and quantity within an atomic transaction.
- Holding quantity and total cost must be strictly positive (`quantity > 0`, `total_cost > 0`).
- A user can possess at most one portfolio where `is_default` is true.
- Public share endpoints must never return `quantity`, `total_cost`, or individual holding rupee values.
- Unlisted share tokens must contain 256 bits of cryptographically random entropy (stored as 64 hex characters).

### Security and authorization model

- **Guest mode**: Up to 3 holdings stored in browser `localStorage` using ISIN locators. Zero server database rows are created.
- **Authenticated users**: Can create, read, update, and delete their own portfolios and holdings. Application services enforce that `portfolio.user_id` equals the authenticated Better Auth `session.user.id`.
- **Public share access**: Unauthenticated viewers access shared cities via unlisted token lookup. Inactive or revoked tokens return 404.
- **Privacy projection**: Public responses serialize to an allow listed Data Transfer Object that strips quantities, buy prices, and individual stock market values.
- **Drizzle version convention**: As detected in `package.json`, Drizzle ORM version is 0.45.x, so relational queries use the `relations()` helper API.

### Configuration required

No new external API secrets are required. The data model uses existing `DATABASE_URL` and `BETTER_AUTH_SECRET`.

### Critical test scenarios

- **Happy path**: Adding a stock holding saves valid quantity and cost, and adding duplicate purchases merges quantity and cost without rounding drift (verifies AC-2, AC-3).
- **Valuation accuracy**: Holdings with known closing prices compute correct current valuation and percentage returns matching exact decimal math (verifies AC-5).
- **Guest migration choice**: Signing in with local storage holdings into an account with existing data provides merge and replace resolution paths using stable ISIN locators (verifies AC-7).
- **Public privacy enforcement**: Accessing an unlisted share link returns building performance percentages without exposing share quantities or individual stock rupee valuations (verifies AC-8).
- **Relational integrity**: Inserting negative quantities, zero costs, or duplicate default portfolios fails with database check and unique constraint violations (verifies AC-1, AC-2, AC-6).

## Build plan

Ordered per the Skateboard build approach:

1. **Domain core types and error invariants**: Define plain TypeScript domain entities (`Security`, `Holding`, `Portfolio`, `ShareView`) and valuation formulas in `src/domain/` with zero external dependencies (satisfies AC-2, AC-5).
2. **Drizzle schema definitions**: Implement PostgreSQL tables for `securities`, `listings`, `daily_prices`, `portfolios`, `holdings`, and `share_links` in `src/infrastructure/db/schema/` with foreign keys, check constraints, and unique indexes using Drizzle 0.45.x `relations()` syntax (satisfies AC-1, AC-2, AC-4, AC-6, AC-8).
3. **Database migration**: Generate versioned SQL migration using `drizzle-kit generate` and apply to database using `drizzle-kit migrate` (satisfies AC-1, AC-6).
4. **Domain math services**: Implement calculation functions for cumulative cost merges, portfolio valuation summaries, and logarithmic building height scaling (satisfies AC-3, AC-5).
5. **Guest synchronization service**: Create local storage schemas and synchronization logic supporting both merge and replace strategies via ISIN mapping (satisfies AC-7).
6. **Share link projection service**: Implement token generation and public projection filtering that removes sensitive quantities and buy prices (satisfies AC-8).

## Consequences

**Positive**:
- Normalized separation of securities and listings cleanly models dual listed equities on NSE and BSE
- Cumulative cost accounting eliminates compounding rounding errors across repeated purchases
- Public share privacy projection makes quantity deduction mathematically impossible
- Clean Architecture separation allows domain entities to run identically in browser local storage and server database handlers

**Negative / tradeoffs**:
- Merging duplicate buys aggregates purchase lots into a single holding (consistent with version 1 scope)
- Search queries require joining securities and listings tables

**Neutral**:
- Requires initial seed data for listed Indian companies and sector classifications

## Follow-up

- [ ] Implement domain entity models in `src/domain/entities/`
- [ ] Define Drizzle schemas in `src/infrastructure/db/schema/`
- [ ] Generate and apply database migration
- [ ] Create seed script for top NSE securities and sector taxonomy

## References

### Project sources
- `FolioCity Product Spec.md`: Product requirements for Indian equity scope, weighted average duplicate buys, 3 stock guest limit, and unlisted share links
- `docs/specs/0001-stack-and-architecture/index.md`: Foundational architecture establishing Next.js App Router, PostgreSQL 16, and Drizzle ORM
- `AGENTS.md`: Clean Architecture layers and TypeScript strictness standards

### Practices and standards
- Clean Architecture domain entity isolation: keeping business rules and formulas free of database and framework decorators
- Cumulative cost accounting: storing total invested amount to prevent compounding rounding drift in financial portfolio records
- Unlisted public projection: stripping private financial quantities from public serialization payloads
