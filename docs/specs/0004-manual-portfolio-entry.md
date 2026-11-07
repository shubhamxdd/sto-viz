# 0004. Manual Portfolio Entry

**Date**: 2026-11-06
**Status**: Accepted

## Summary

This specification defines the manual portfolio entry system for FolioCity. The feature enables visitors to search listed Indian equities across NSE and BSE, specify purchase quantity, buy price in rupees, and transaction date via a glassmorphism slide-over drawer, and persist their portfolio in browser local storage. Duplicate purchases of the same stock automatically merge using weighted average purchase pricing via the domain mathematics service, updating portfolio valuation in real time without blocking the background 3D cityscape view.

## Context

FolioCity transforms Indian stock portfolios into a 3D cyberpunk metropolis. In earlier foundation milestones, the project established clean architecture domain entities, mathematical valuation services, Drizzle PostgreSQL schemas, and a responsive 3D viewport canvas. However, visitors currently view a static preview monolith in the viewport.

To realize the core product vision, users need an effortless, friction-free way to input their real stock holdings. In this skateboard release, visitors should not be forced to register an account, configure cloud databases, or upload sensitive broker CSV exports just to explore their portfolio in 3D. 

Key technical and user experience requirements for manual portfolio entry include:

First, search performance must feel instant. Investors expect rapid autocomplete when searching ticker symbols like `RELIANCE`, `TCS`, or `INFY`. Waiting for server network roundtrips on every keystroke introduces noticeable lag that degrades the cyberpunk terminal experience.

Second, the input interface must coexist harmoniously with the 3D viewport canvas. A full screen form or opaque modal obscures the glowing metropolis beneath. A right-side slide-over glass drawer preserves spatial immersion, allowing users to watch their city update live as stocks are added.

Third, purchase price math must maintain integer paise precision. Floating point arithmetic in JavaScript (such as `0.1 + 0.2 = 0.30000000000000004`) causes rounding errors in financial balances. All rupee inputs must validate and convert directly into native integer paise (`BigInt`) via the domain `CurrencyParser`.

Fourth, duplicate stock purchases must merge cleanly. Investors frequently accumulate shares of the same stock over multiple dates at different prices. Adding duplicate stocks should not clutter the city with multiple identical buildings; instead, purchases must automatically consolidate into a single holding with a weighted average purchase price.

## Requirements

**User stories**:
- As a guest investor, I want to search Indian stocks by ticker or company name so that I can quickly find my holdings without looking up exchange codes.
- As an investor holding dual-listed stocks, I want the system to default to the primary NSE listing while allowing a BSE toggle if needed.
- As an investor entering purchases, I want a clean rupee input field that formats prices naturally with comma separators and currency symbols.
- As an investor adding multiple purchases of the same stock, I want the application to automatically combine them into one holding with a weighted average buy price so that my portfolio reflects accurate cost basis.
- As a user managing my portfolio, I want to edit holding quantities or delete stocks with confirmation so that I can correct mistakes safely.
- As a returning visitor, I want my holdings to persist across browser reloads without requiring an account.

**Acceptance criteria**:
- **AC-1**: Searchable stock catalog allows filtering Indian listed equities across NSE and BSE by company name, ticker symbol, or ISIN with instant client-side substring matching.
- **AC-2**: Selecting a stock automatically chooses its primary exchange listing (NSE by default) while allowing the user to toggle to BSE if the company is dual-listed.
- **AC-3**: Manual entry drawer allows specifying transaction quantity (positive integer) and buy price with real-time rupee formatting (₹ prefix, comma separators), validating input and parsing to integer paise without floating-point precision loss.
- **AC-4**: Optional purchase date field captures transaction timing, defaulting to today's date in YYYY-MM-DD format.
- **AC-5**: Adding a stock that already exists in the portfolio automatically merges the purchase using weighted average purchase price and updates total quantity via `Holding.merge()`, accompanied by a clear summary toast.
- **AC-6**: Existing holdings list allows editing quantity or buy price via the drawer and deleting a holding with explicit user confirmation dialog.
- **AC-7**: Portfolio holdings persist across page reloads in browser `localStorage` (`foliocity_guest_holdings`) with schema validation on hydration.
- **AC-8**: Portfolio summary panel computes total invested value in paise, stock count, and sector distribution in real time as holdings are added, edited, or removed.

## Options considered

### Option 1: Slide-over Glass Drawer with Client Search Index and Auto-merge

A right-side slide-over drawer (`<HoldingDrawer />`) rendered with glassmorphism styling (`backdrop-blur-md`, semi transparent dark slate surface). The search catalog is pre-indexed in memory on client boot from seeded securities, providing zero latency autocomplete. Adding an existing stock automatically merges lots using weighted average buy price. State is managed by a Zustand store with localStorage persistence.

**Pros**:
- Preserves 3D spatial immersion: users see the cityscape while adding holdings
- Instant, zero latency search without server network requests
- Clean mathematical consolidation prevents duplicate building clutter in 3D scene
- Guest friendly: zero account friction for initial exploration

**Cons**:
- Client search index bundle size grows as stock catalog expands beyond top 500 equities (mitigated via future lazy-loaded index chunks)
- Merging lots loses individual historical tax lot breakdown (acceptable for skateboard visualization scope)

### Option 2: Centered Modal Dialog with Server Search Route

A centered modal dialog overlaying the entire viewport, issuing server requests to `/api/securities/search?q=` on each debounced keystroke.

**Pros**:
- Server manages catalog indexing; client bundle stays smaller
- Familiar traditional modal interaction pattern

**Cons**:
- Obscures the 3D city canvas completely with dark modal backdrop
- Keystroke network latency creates stutter during typing on slower mobile connections
- Increases server load and requires database network availability for basic client catalog browsing

### Option 3: Spreadsheet Style Inline Table with Multi-lot Tracking

An inline editable data grid displaying individual purchase lots separately without merging.

**Pros**:
- Preserves granular tax lots and separate purchase dates

**Cons**:
- High visual complexity: dense spreadsheet grid clashes with cyberpunk visual design language
- Renders multiple duplicate buildings for the same stock in the upcoming 3D city generator, degrading scene layout
- Requires much more complex edit and delete flows on mobile viewports

## Decision

**Chosen option**: Option 1: Slide-over Glass Drawer with Client Search Index and Auto-merge

FolioCity will implement a right-side slide-over glass drawer with an in-memory client search index over listed Indian securities, real-time rupee validation parsing into integer paise, automatic weighted average lot merging via `Holding.merge()`, and persistent client-side state in `localStorage`.

**Implementation skills**: `shadcn` (`shadcn/ui`, `.agents/skills/shadcn/`) · `drizzle-best-practices` (`honra-io/drizzle-best-practices`, `.agents/skills/drizzle-best-practices/`)

## Rationale

Option 1 provides the highest fidelity user experience for FolioCity.

By selecting a slide-over drawer rather than an intrusive centered modal, the 3D viewport canvas remains active and visible in the background. The user can view the city skyline while entering transactions.

Pre-indexing the seeded securities catalog on the client delivers zero latency autocomplete as the user types ticker symbols or company names. Because the seeded Indian equity catalog contains the top high volume securities across major sectors, bundling the catalog client side provides instantaneous response without server roundtrips.

Leveraging the existing domain entity `Holding.merge()` guarantees mathematical precision. When an investor buys more shares of a company they already own, the new lot is consolidated into the existing holding with an exact weighted average cost basis, preventing redundant buildings in the upcoming 3D procedural generator.

## Feature design

### Component architecture

```
src/
├── presentation/
│   ├── components/
│   │   ├── portfolio/
│   │   │   ├── holding-drawer.tsx         # Slide-over glass sheet for adding and editing holdings
│   │   │   ├── stock-search-input.tsx     # Autocomplete search input with instant catalog filtering
│   │   │   ├── holding-form.tsx           # Quantity, price, date inputs with CurrencyParser validation
│   │   │   ├── holdings-list.tsx          # Summary list card with edit and delete actions
│   │   │   └── delete-holding-dialog.tsx  # Confirmation dialog for holding deletion
│   │   └── ui/
│   │       ├── currency-input.tsx         # Reusable formatted rupee input with ₹ prefix
│   │       └── toast.tsx                  # Subtle cyberpunk toast notification
│   └── stores/
│       └── use-portfolio-store.ts         # Zustand store for guest holdings with localStorage persistence
└── domain/
    └── entities/
        └── holding.ts                     # Pre-existing Holding entity with merge() method
```

### State transitions

#### Drawer states
- `closed`: Drawer hidden off screen; 3D viewport fully interactive.
- `adding`: Drawer open in create mode with blank search input and defaulted purchase date (today).
- `editing`: Drawer open in edit mode prefilled with existing holding data (stock locked, quantity and price editable).

#### Duplicate holding addition
- `new-stock`: Stock is added as a new holding item in `usePortfolioStore`.
- `existing-stock`: System invokes `existingHolding.merge(addedHolding)`, updating quantity and weighted average buy price, and emitting a toast: `"Merged with existing holding at ₹X.XX avg price"`.

### Interface surface (Components and Actions)

| Component / Function | Role | Key props / inputs | Key outputs | Invariant |
|---|---|---|---|---|
| `<HoldingDrawer>` | Slide-over drawer container | `isOpen: boolean`, `holdingToEdit?: Holding \| null` | Form submission triggers | Closes cleanly on escape or backdrop click |
| `<StockSearchInput>` | Security search & select | `onSelect: (security: Security, listing: Listing) => void` | Filtered securities dropdown | Matches on symbol, name, or ISIN |
| `<CurrencyInput>` | Rupee price input | `valuePaise: bigint`, `onChange: (paise: bigint) => void` | Formatted rupee text & parsed paise | Zero float rounding errors |
| `<HoldingsList>` | Active holdings summary card | None (connects to store) | Renders holding cards, edit & delete buttons | Shows formatted ₹ values and sector tags |
| `usePortfolioStore` | Portfolio client store | Actions: `addHolding`, `updateHolding`, `removeHolding` | Active holdings array & portfolio metrics | Persists to `localStorage` under `foliocity_guest_holdings` |

### Value sourcing

| Action | Value produced / displayed | Source |
|---|---|---|
| Search stock catalog | Filtered equity results | Seeded securities catalog (`scripts/seed-securities.ts` / bundled catalog JSON) |
| Select stock listing | Primary exchange badge | Listing marked with `isPrimary === true` (NSE default) |
| Parse buy price | Integer paise value | `CurrencyParser.parseRupeesToPaise(inputString)` |
| Merge duplicate stock | Weighted average purchase price | `Holding.merge(existing, added).buyPricePaise` |
| Render total value | Total invested portfolio capital | Sum of `holding.quantity * holding.buyPricePaise` |
| Hydrate portfolio | Restored holdings on page load | Read from `localStorage.getItem('foliocity_guest_holdings')` |

### Key invariants

- Quantity must always be a positive integer greater than zero (`quantity >= 1`).
- Buy price must always be a non negative integer in paise (`buyPricePaise >= 0n`).
- Duplicate stock purchases for the same `securityId` must always merge via weighted average price without creating duplicate holding items.
- The drawer layout must not block interaction when closed; outer overlay elements must use `pointer-events-none`.
- Local storage hydration must validate stored JSON against holding entity invariants, discarding or repairing corrupted items safely.

### Security and authorization model

- **Client side guest mode**: Portfolio data is stored in the user's browser `localStorage`. No private account credentials or financial tokens are transmitted across external networks.
- **Input sanitization**: All user inputs (ticker query, quantity, buy price string) are strictly validated and sanitized before inclusion in the store state.

### Configuration required

No new external environment variables are required. Holdings persist locally in browser `localStorage`.

### Critical test scenarios

- **Happy path holding creation**: User searches `RELIANCE`, enters quantity `10`, price `2500`, saves, and sees holding in list with total invested ₹25,000 (verifies AC-1, AC-3, AC-8).
- **Dual-listing toggle**: Dual-listed stock defaults to NSE and switches to BSE when user toggles the exchange pill (verifies AC-2).
- **Duplicate purchase merge**: Adding 10 shares of `TCS` at ₹3,000 to an existing holding of 10 shares at ₹4,000 results in 20 shares at ₹3,500 average price (verifies AC-5).
- **Holding edit and delete**: Editing quantity updates portfolio totals; deleting with confirmation removes the holding cleanly (verifies AC-6).
- **Local storage persistence**: Refreshing the browser preserves entered holdings without data corruption (verifies AC-7).

## Build plan

Ordered per the Skateboard build approach:

1. **Securities Catalog & Client Search Index**: Bundle seeded Indian equity catalog with fast substring search across ticker symbol, company name, and ISIN, supporting dual NSE/BSE listings (satisfies AC-1, AC-2).
2. **Portfolio State Store**: Implement `usePortfolioStore` with Zustand managing guest holdings in `localStorage`, integrating `Holding.merge()` for duplicate purchases, and calculating portfolio valuation summaries (satisfies AC-5, AC-7, AC-8).
3. **Currency & Transaction Form Components**: Build `<CurrencyInput />` with real-time rupee formatting and integer paise parsing, alongside quantity and date input fields (satisfies AC-3, AC-4).
4. **Slide-over Drawer & Holding List**: Build `<HoldingDrawer />`, `<HoldingsList />`, and `<DeleteHoldingDialog />` with glassmorphic styling, edit prefill, and delete confirmation (satisfies AC-6, AC-7).
5. **HUD Integration**: Mount the holding drawer toggle and holdings summary card into `src/app/page.tsx` HUD layout with non-blocking pointer events (satisfies AC-7, AC-8).
6. **Automated Test Suite**: Write unit and component tests verifying catalog search, currency input parsing, lot merging math, and storage persistence (satisfies AC-1, AC-3, AC-5, AC-6, AC-7).

## Consequences

**Positive**:
- Allows immediate exploration of 3D city without requiring sign-up or broker credentials
- Seamless mathematical merging prevents clutter and maintains cost basis accuracy
- Glassmorphism slide-over drawer keeps the cyberpunk city visible throughout interaction
- Integer paise arithmetic prevents financial rounding inaccuracies

**Negative / tradeoffs**:
- Local storage data is tied to the specific browser and device until cloud sync is implemented in Release 2
- Merging transactions consolidates purchase lots without retaining separate buy tax lots

**Neutral**:
- Catalog initially covers top Indian listed equities; full exchange catalog is seeded in database

## Follow-up

- [x] Bundle securities catalog for client search in `src/presentation/data/securities-catalog.ts`
- [x] Implement `src/presentation/stores/use-portfolio-store.ts` with Zustand and localStorage persistence
- [x] Build `<CurrencyInput />` component in `src/presentation/components/ui/currency-input.tsx`
- [x] Build holding drawer and list components in `src/presentation/components/portfolio/`
- [x] Integrate into `src/app/page.tsx` HUD
- [x] Write Vitest test suite for portfolio store and components

## Verification steps

To verify manual portfolio entry:

1. Run the development server with `npm run dev` and open `http://localhost:3000` in your browser.
2. In the HUD overlay, click the `Add Stock` button in the left holdings card or the top navigation bar.
3. In the search input, type `Reliance` or `INE002A01018`. Verify that Reliance Industries Limited appears in the search dropdown (verifies AC-1).
4. Select Reliance Industries Limited and toggle between `NSE` and `BSE` pills. Verify the exchange badge toggles cleanly (verifies AC-2).
5. Enter a quantity of `10` and a buy price of `2500`. Verify that the currency input formats automatically with the rupee symbol (verifies AC-3, AC-4).
6. Click `Add to Portfolio`. Verify that a toast notification appears and the new holding renders in the holdings list with total invested capital of ₹25,000 (verifies AC-3, AC-8).
7. Click `Add Stock` again, select Reliance Industries Limited on the same exchange, enter quantity `10` and buy price `3500`, then click `Add to Portfolio`. Verify that the duplicate holding is merged automatically into 20 shares at an average price of ₹3,000 (verifies AC-5).
8. Click the edit button on the holding card, change the quantity to `25`, and save. Verify the holding updates cleanly. Click the delete button, confirm the dialog, and verify the holding is removed (verifies AC-6).
9. Refresh the browser page and verify that the portfolio state persists cleanly from browser storage (verifies AC-7).
