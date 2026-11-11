# 0007. Curated Demo Cities

**Date**: 2026-11-11
**Status**: Proposed

## Summary

This specification defines curated sample portfolios that let first time visitors explore the 3D cyberpunk city immediately without typing their own stocks. Visitors choose from three realistic Indian market portfolios (Nifty Titans, Tech Frontier, and Green Horizon) directly on the empty city screen or through an explore action in the holdings drawer. Loading a sample city populates the portfolio store with realistic Indian equities, animates the procedural 3D skyscrapers, and prompts for confirmation if active holdings already exist so personal data is never lost by accident.

## Context

FolioCity transforms Indian stock portfolios into a 3D cyberpunk metropolis. In previous features, we built manual stock entry, procedural building generation based on invested capital and sector crowns, and interactive holding cards with privacy toggles.

When a new visitor arrives at FolioCity, the canvas is currently an empty grid plane with a holographic construction beacon. To see the 3D visualizer in action, visitors must manually search for securities, type quantities, and enter purchase prices. Many users want to tour the application, experience the 3D graphics, and test camera controls before taking the time to enter their personal financial data.

Without curated demo cities, initial user engagement suffers because the visualizer requires upfront effort before delivering its primary value. We need instant sample cities representing recognizable Indian equity themes while keeping clean architecture boundaries, safe state management, and explicit confirmation before overwriting active user portfolios.

## Requirements

**User stories**:
- As a first time visitor arriving at an empty city, I want to choose from curated Indian stock portfolios with one click so that I can explore the 3D metropolis immediately.
- As an investor with existing stocks, I want an explore demo cities action in the portfolio drawer so that I can preview sample skylines without losing my own data unless I confirm.
- As a visitor inspecting a demo city, I want a simple clear city action so that I can wipe the sample data and start fresh with my own holdings.

**Acceptance criteria**:
- **AC-1**: When the portfolio contains zero holdings and client hydration is complete, the empty city screen displays three curated sample cards (Nifty Titans, Tech Frontier, and Green Horizon) showing portfolio title, investment theme, stock count, and total capital badge.
- **AC-2**: Clicking any sample city card on an empty portfolio populates the portfolio store with all constituent holdings immediately, resets camera target and selection, and triggers 3D procedural skyline generation.
- **AC-3**: When a user already has active holdings in the store, selecting a demo city presents a confirmation dialog warning that current holdings will be replaced, requiring explicit confirmation before loading.
- **AC-4**: Each curated demo portfolio contains five realistic Indian equities with valid ISINs, symbols, exchange codes, realistic buy prices in paise, quantities, purchase dates, and performance profiles that yield varied building heights and neon trim colors.
- **AC-5**: An "Explore Demo Cities" button in the holdings drawer opens a glass dialog allowing users to switch sample portfolios at any time.
- **AC-6**: A "Clear City" button in the holdings drawer provides a two step confirmation dialog that empties all holdings, clears active building selection, resets the camera, and returns the canvas back to the empty city state.

## Options considered

### Option 1: Multi theme curated catalog with safe replacement confirmation

Provide three distinct Indian equity portfolios (large cap blue chips, technology leaders, and green energy infrastructure) stored as immutable domain fixtures. On an empty city, cards appear directly over the viewport. In the holdings drawer, an explore button opens a selection modal. If active holdings exist, a modal asks the user to confirm replacing their data before proceeding.

**Pros**:
- Offers varied aesthetic skylines with diverse sector crowns and neon trim colors.
- Protects user data with explicit confirmation before overwriting active holdings.
- Follows existing Zustand store architecture without adding extra backend services.

**Cons**:
- Requires creating and maintaining realistic static catalog fixtures for three portfolios.

### Option 2: Single default sample portfolio preloaded automatically

Automatically populate the portfolio store with a single sample portfolio on first visit so the canvas is never empty.

**Pros**:
- Zero clicks required to see buildings on first visit.

**Cons**:
- Visitors may confuse sample data with real holdings.
- Users who want to enter their own stocks must delete the preloaded holdings first.
- Lacks theme variety across different Indian market sectors.

### Option 3: Procedural random portfolio generator

Generate synthetic ticker symbols, random share counts, and random buy prices dynamically whenever the user clicks an explore button.

**Pros**:
- Infinite variety of building heights and counts.

**Cons**:
- Fails Indian market authenticity because tickers and company names would be synthetic or arbitrary.
- Harder to write predictable regression tests for known visual outcomes.

## Decision

**Chosen option**: Option 1: Multi theme curated catalog with safe replacement confirmation.

We will provide three curated Indian equity portfolios with realistic securities, prominent empty state cards, a drawer selector modal, and confirmation dialogs for replacing or clearing holdings.

**Implementation skills**: `r3f-fundamentals` (`EnzeD/r3f-skills`, `.agents/skills/r3f-fundamentals/`)

## Rationale

Option 1 provides immediate visual payoff while respecting user intent. Indian retail investors identify strongly with well known market themes such as Nifty Titans, IT exporters, and renewable energy. Presenting these as intentional choices on the empty screen lets visitors explore distinct cyberpunk aesthetics without confusing sample stocks for personal investments. Protecting existing user holdings with a replacement confirmation ensures that visitors who have already entered real holdings can experiment with demo skylines safely.

## Feature design

**Data model sketch**:

```typescript
export interface DemoPortfolioHoldingDefinition {
  securityId: string;
  isin: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  companyName: string;
  sector: StockSector;
  quantity: number;
  buyPricePaise: string; // Integer paise string
  purchasedAt: string; // ISO date YYYY-MM-DD
}

export interface DemoPortfolioDefinition {
  id: "nifty-titans" | "tech-frontier" | "green-horizon";
  name: string;
  tagline: string;
  description: string;
  holdings: DemoPortfolioHoldingDefinition[];
}
```

**Curated portfolios catalog (as of November 2026)**:
1. `nifty-titans` (Nifty Titans):
   - Reliance Industries (`INE002A01018`, RELIANCE, Oil, Gas and Energy, 35 shares at ₹2,950.00 = ₹1,03,250.00)
   - Tata Consultancy Services (`INE467B01029`, TCS, IT and Technology, 25 shares at ₹3,820.00 = ₹95,500.00)
   - HDFC Bank (`INE040A01034`, HDFCBANK, Banks and Financial Services, 60 shares at ₹1,640.00 = ₹98,400.00)
   - Larsen and Toubro (`INE018A01030`, LT, Capital Goods and Manufacturing, 15 shares at ₹3,560.00 = ₹53,400.00)
   - ITC (`INE154A01025`, ITC, Fast Moving Consumer Goods, 80 shares at ₹430.00 = ₹34,400.00)
2. `tech-frontier` (Tech Frontier):
   - Tata Consultancy Services (`INE467B01029`, TCS, IT and Technology, 30 shares at ₹3,820.00 = ₹1,14,600.00)
   - Infosys (`INE009A01021`, INFY, IT and Technology, 50 shares at ₹1,780.00 = ₹89,000.00)
   - Tech Mahindra (`INE669C01036`, TECHM, IT and Technology, 45 shares at ₹1,450.00 = ₹65,250.00)
   - L&T Technology Services (`INE214T01019`, LTTS, IT and Technology, 12 shares at ₹5,120.00 = ₹61,440.00)
   - Zomato (`INE758T01015`, ZOMATO, Consumer Services, 200 shares at ₹260.00 = ₹52,000.00)
3. `green-horizon` (Green Horizon):
   - Tata Power (`INE245A01021`, TATAPOWER, Utilities and Power, 180 shares at ₹410.00 = ₹73,800.00)
   - Adani Green Energy (`INE364U01010`, ADANIGREEN, Utilities and Power, 45 shares at ₹1,820.00 = ₹81,900.00)
   - NTPC (`INE733E01010`, NTPC, Utilities and Power, 160 shares at ₹380.00 = ₹60,800.00)
   - Suzlon Energy (`INE040H01021`, SUZLON, Capital Goods and Manufacturing, 450 shares at ₹65.00 = ₹29,250.00)
   - Larsen and Toubro (`INE018A01030`, LT, Capital Goods and Manufacturing, 20 shares at ₹3,560.00 = ₹71,200.00)

**Securities catalog expansion**:
The existing securities catalog in `src/presentation/data/securities-catalog.ts` will be updated to include all constituent equities (TECHM, LTTS, ZOMATO, TATAPOWER, ADANIGREEN, NTPC, SUZLON) with valid ISINs and official NSE company names so manual search and demo cities share a single source of truth.

**State transitions**:
- Empty city view → User clicks demo card → Store loads holdings → Selection resets → Camera resets to center → City renders populated.
- Populated city view → User clicks Explore Demo in drawer → Selector dialog opens → User chooses theme → Replace confirmation dialog opens → User confirms → Store replaces holdings → Camera resets → City renders new theme.
- Populated city view → User clicks Clear City → Clear confirmation dialog opens → User confirms → Store empties holdings → Selection resets → Camera resets → Empty city view displays.

**API surface**:
Client store actions on `usePortfolioStore`:
- `loadDemoPortfolio(demoId: string): void`: Replaces current holdings with the selected demo portfolio holdings, calculating `totalCostPaise = (BigInt(quantity) * BigInt(buyPricePaise)).toString()`, and sets `updatedAt`.
- `clearHoldings(): void`: Empties all holdings and resets canvas selection.
Canvas store coordination on `useCanvasStore`:
- Upon `loadDemoPortfolio` or `clearHoldings`, callers invoke `setSelectedHoldingId(null, null)` and `triggerCameraReset()`.

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| View empty city | Demo card title, description, and tagline | Static catalog fixture in demo portfolio domain definitions |
| View empty city | Demo card estimated capital outlay | Derived by summing quantity × buyPricePaise in demo holdings |
| View empty city | Demo card stock count | Derived from demo holdings array length |
| Click demo card | New holding records | Created from demo portfolio holding definitions with generated unique IDs |
| Click demo card | Camera reset and view centering | Triggered via useCanvasStore triggerCameraReset and setSelectedHoldingId(null, null) |
| Replace confirmation | Active holding count warning | Derived from current holdings array length in portfolio store |
| Clear city action | Empty portfolio state | Executed by store clearHoldings action |

**Key invariants**:
- Demo holdings are regular `Holding` domain objects; rendering, canvas math, and summary bar treat them identically to manually entered stocks.
- Loading or clearing a portfolio always resets `selectedHoldingId` and `selectedPlotPosition` in `useCanvasStore` to prevent ghost selection highlights.
- Demo holdings persist to localStorage via the portfolio store persist middleware so page reloads do not vanish unexpectedly.
- Empty city cards only render after hydration (`hasHydrated` is true) to prevent layout flashes during initial client mount.

**Security model**:
All portfolio data and demo catalogs reside in client memory and browser localStorage. No authentication, cookies, or remote server endpoints are involved in this slice.

**Configuration required**:
None. No environment variables or external credentials are required.

**Critical test scenarios**:
- Happy path: Clicking Nifty Titans on an empty canvas populates 5 holdings and generates 5 buildings, verifies **AC-1**, **AC-2**, **AC-4**.
- Confirmation prompt: Clicking a demo city when holdings already exist displays the replacement warning and does not alter holdings if cancelled, verifies **AC-3**.
- Replacement execution: Confirming replacement wipes previous holdings and populates the chosen demo stocks cleanly, verifies **AC-3**, **AC-4**.
- Drawer exploration: Opening the demo dialog from the holdings drawer and selecting Tech Frontier loads the new theme, verifies **AC-5**.
- Clear city: Clicking Clear City in the holdings drawer and confirming resets holdings to empty, deselects any building, resets camera, and displays the empty state cards, verifies **AC-6**.

## Build plan

1. Expand `src/presentation/data/securities-catalog.ts` with all demo constituent equities, and define demo portfolio definitions and catalog fixtures in `src/domain/entities/demo-portfolio.ts`, satisfies **AC-4**.
2. Add atomic `loadDemoPortfolio` store action to `usePortfolioStore` that maps demo definitions into full `PortfolioHolding` records and persists them, satisfies **AC-2**, **AC-3**.
3. Create empty city overlay component `src/presentation/components/portfolio/empty-city-overlay.tsx` displaying the three curated demo cards with stock count, capital size, and theme badges over the 3D viewport, with hydration safety, satisfies **AC-1**, **AC-2**.
4. Create demo cities selector dialog and confirmation modal in `src/presentation/components/portfolio/demo-cities-dialog.tsx`, satisfying replacement warnings and drawer switching, satisfies **AC-3**, **AC-5**.
5. Add "Explore Demo Cities" and "Clear City" buttons with confirmation flow to `src/presentation/components/portfolio/holding-drawer.tsx`, satisfies **AC-5**, **AC-6**.

## Consequences

**Positive**:
- First time visitors experience an immediate populated 3D city without manual data entry.
- Showcases the visualizer across multiple Indian stock market sectors and themes with diverse building heights (ranging from ₹29,000 to ₹1,14,000+).
- Existing user data remains protected through confirmation prompts before replacing.

**Negative**:
- Static buy prices will deviate from real live prices until the Bhavcopy price pipeline in Release 3 is built.
- Three static demo portfolios add minor fixture bundle size (under 5 kilobytes).
