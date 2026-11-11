# Verify: Curated Demo Cities · spec 0007 · updated 2026-11-11
_Steps derived from spec 0007 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Visit home page with an empty portfolio → Three curated demo cards (Nifty Titans, Tech Frontier, Green Horizon) render over the canvas with stock count, capital total, and sector badges → AC-1
- [ ] Click "Nifty Titans" on empty city → 5 constituent holdings are added to store, canvas selection resets, camera resets to center, and 5 procedural buildings render immediately → AC-2
- [ ] Open holding drawer while holdings exist, click "Explore Demo Cities", select "Green Horizon" → A confirmation modal appears warning that active holdings will be replaced → AC-3
- [ ] Click "Cancel" in the replacement confirmation modal → Active holdings remain untouched and selection dialog re-appears → AC-3
- [ ] Click "Replace with Demo" → Previous holdings are replaced with Green Horizon holdings, camera target resets, and new buildings render → AC-3, AC-4
- [ ] Open holding drawer, click "Clear City" button → A confirmation modal appears warning that all holdings will be wiped → AC-6
- [ ] Confirm "Clear All Holdings" → Holdings store empties, building selection resets to null, camera resets to center, and empty city overlay re-appears with the 3 sample cards → AC-6

## Commands
- [ ] `npm test` → All 26 test files and 186 unit and integration tests pass cleanly → AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
- [ ] `npm run check` → Biome formatting, linting, and TypeScript compiler pass with zero errors → AC-4

## Acceptance-criteria coverage
- AC-1 covered by empty city card render step and vitest EmptyCityOverlay tests
- AC-2 covered by one click loading step and usePortfolioStore tests
- AC-3 covered by replacement prompt and confirmation steps and DemoCitiesDialog tests
- AC-4 covered by Indian equity catalog definitions and securities catalog tests
- AC-5 covered by holding drawer Explore Demo Cities button and dialog opening step
- AC-6 covered by holding drawer Clear City two step confirmation and reset steps
