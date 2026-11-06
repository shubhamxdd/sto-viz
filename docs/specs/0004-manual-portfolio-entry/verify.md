# Verify: Manual Portfolio Entry (Spec 0004)

Steps derived from spec 0004 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones.

## UI and manual checks

- [x] Load root page `/` in browser: expect HUD layout with portfolio header, camera toolbar, and Add Stock buttons (AC-1, AC-7)
- [x] Click Add Stock button: expect glass slide over drawer to open with search input and empty holdings state (AC-1, AC-6)
- [x] Type search query `Reliance` or `INE002A01018` in stock search input: expect instant dropdown displaying Reliance Industries Limited (AC-1)
- [x] Select Reliance and toggle between NSE and BSE pills: expect exchange badge and stock details to update cleanly (AC-2)
- [x] Enter quantity `10` and buy price `2500`: expect currency input to format as `₹2,500.00` in real time with integer paise conversion (AC-3, AC-4)
- [x] Click Add to Portfolio button: expect toast notification, drawer to close, and holding card to appear in holdings list with total invested ₹25,000 (AC-3, AC-8)
- [x] Click Add Stock, select Reliance on NSE, enter quantity `10` and buy price `3500`: expect automatic lot merging with weighted average buy price of ₹3,000 and total 20 shares for total ₹60,000 (AC-5)
- [x] Click edit button on holding card: expect drawer to open prefilled with existing holding values; update quantity to `25`: expect holding and portfolio valuation to update cleanly (AC-6, AC-8)
- [x] Click delete button on holding card: expect delete confirmation dialog; confirm deletion: expect holding to be removed cleanly (AC-6)
- [x] Reload browser page: expect saved holdings to persist across reloads from browser storage (`foliocity_guest_holdings`) (AC-7)

## Commands

- [x] `npm run check`: expect 0 errors from Biome lint and format and TypeScript type check (AC-1 through AC-8)
- [x] `npm test`: expect all 22 test suites and 114 unit and acceptance tests to pass (AC-1 through AC-8)
- [x] `npm run build`: expect Next.js App Router production build to compile static pages without SSR errors (AC-1 through AC-8)

## Acceptance criteria coverage

- AC-1 (Instant Stock Search across NSE and BSE by symbol, company, or ISIN): verified by search filter tests, catalog index, and UI dropdown
- AC-2 (Dual listing exchange toggle with NSE default and BSE toggle): verified by catalog listing specs and exchange button toggle
- AC-3 (Rupee denominated buy price with real time formatting): verified by currency input component and paise formatting tests
- AC-4 (Integer paise parsing and strict validation): verified by CurrencyParser suite with negative and invalid decimal rejections
- AC-5 (Duplicate purchase auto merge via weighted average buy price): verified by store addHolding consolidation logic
- AC-6 (Holding modification and deletion with confirmation): verified by updateHolding, removeHolding, and delete confirmation dialog
- AC-7 (Client side storage persistence in localStorage): verified by Zustand persist hydration under foliocity_guest_holdings
- AC-8 (Portfolio valuation summary and sector breakdown): verified by total invested paise aggregation and sector breakdown mapping
