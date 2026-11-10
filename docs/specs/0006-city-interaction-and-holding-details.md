# 0006. City Interaction and Holding Details

**Date**: 2026-11-10
**Status**: Accepted

## Summary

This specification defines building selection, holding inspection, and the privacy display toggle for FolioCity. When visitors click any 3D skyscraper in the city visualizer, the camera smoothly pans to center the building while preserving viewing elevation and azimuth, auto rotation pauses, the building neon trim brightens, and a floating glassmorphic inspection card displays performance metrics, share counts, portfolio allocation, and edit or delete controls. A global privacy toggle switch in the top summary bar masks all rupee figures across the header, holding card, and portfolio drawer as `₹ ••••••` while keeping percentage return badges visible, allowing investors to showcase and screenshot their cyberpunk portfolio without exposing personal net worth.

## Context

FolioCity transforms Indian stock portfolios into a 3D cyberpunk metropolis. In Feature 6, we implemented procedural 3D building generation where building height scales logarithmically with invested capital, rooftop crowns reflect company sectors, and neon trims glow with profit and loss states.

However, the city visualizer is currently passive. Visitors cannot inspect individual stock metrics directly from the 3D scene, and clicking a building does not open holding details or allow quick edits. Furthermore, users who want to share their 3D city or post screenshots on social media currently cannot hide sensitive rupee amounts or overall portfolio size.

To complete Release 1 of the skateboard roadmap, visitors need an intuitive way to interact with their buildings, inspect holding performance, and toggle privacy masks across the user interface.

## Requirements

**User stories**:
- As an investor exploring my 3D city, I want to click any skyscraper to inspect that company's allocation, buy price, current valuation, and returns so that I can evaluate individual investments visually.
- As an investor inspecting a building, I want a quick action to edit or delete that holding so that I can update my portfolio without leaving the visualizer view.
- As an investor sharing screenshots of my portfolio city, I want to switch between rupee amounts and percentage only mode so that I can celebrate my returns without revealing my personal wealth.
- As an investor navigating the 3D viewport, I want smooth camera centering and simple keyboard or click dismissal so that viewing details feels natural and non-intrusive.

**Acceptance criteria**:
- **AC-1**: Clicking any 3D building mesh selects that holding, raising its neon edge trim emission to selected intensity (3.5), while clicking empty canvas space via `onPointerMissed` or pressing the Escape key deselects it.
- **AC-2**: Selecting a building smoothly pans the camera orbit target coordinate toward the selected building plot position while translating camera position by the identical delta to strictly preserve user elevation angle, azimuth orientation, and orbit distance. Auto rotation pauses while a building is selected.
- **AC-3**: Selecting a building displays a floating glassmorphism inspection card docked at the bottom right (bottom sheet on mobile viewports) containing security symbol, company name, exchange, sector badge, total share quantity, average buy price, invested capital, simulated current valuation, unrealized profit or loss in paise and percentage, and portfolio allocation percentage.
- **AC-4**: The inspection card includes an "Edit Holding" action that opens the slide over portfolio drawer pre-populated for that holding, a "Delete Holding" action triggering confirmation, and a close button that dismisses the selection.
- **AC-5**: If a holding is edited or deleted while selected, the visualizer updates immediately, resetting the selection to null, closing the card without error, and returning the camera target to city center `[0, 2, 0]` if deleted.
- **AC-6**: The HUD header contains a global valuation display mode toggle switching between exact currency mode and percentage privacy mode, persisted in local storage with hydration safety.
- **AC-7**: In percentage privacy mode, rupee amounts across the top portfolio summary bar, the holding inspection card, and the holdings list drawer are masked as `₹ ••••••` (and signed `+₹ ••••••` / `-₹ ••••••` for P&L) in both rendered text and accessible attributes, while percentage return badges remain prominently visible.
- **AC-8**: Clicking outside the inspection card, clicking empty canvas space via `onPointerMissed` (ignoring drag releases), or pressing the Escape key dismisses the card and returns camera focus to the central skyline.

## Options considered

### Option 1: Floating glassmorphic HUD card with synchronized camera pivot damping (Recommended)

Render a responsive floating glass card docked at the bottom right of the viewport when a building is selected, while smoothly lerping OrbitControls target and camera position in `useFrame` toward the selected building plot center.

**Pros**:
- Preserves full visibility of the central 3D skyline without cluttering the canvas.
- Synchronized target and position damping keeps the building centered while strictly preserving the user's chosen viewing angle and distance.
- Uses `Canvas onPointerMissed` to cleanly distinguish background clicks from camera orbit drag releases.
- Reuses existing Tailwind glassmorphism design tokens and HUD styling.

**Cons**:
- Requires coordinating camera pivot damping between React state and Three.js animation frames.

### Option 2: 3D HTML billboard attached above building rooftop

Use `@react-three/drei` `<Html />` component to attach a floating billboard card directly over the rooftop antenna of the selected building in 3D canvas coordinates.

**Pros**:
- Directly connects the visual data to the physical 3D mesh in world space.

**Cons**:
- Taller skyscrapers push the billboard off screen or cause it to clip through the top camera boundary.
- Rotating the camera can invert or occlude the billboard behind neighbouring buildings.
- High layout thrashing on low power mobile devices during camera orbit.

### Option 3: Full height slide-over drawer replacing portfolio list

Open the existing slide over drawer on the right edge whenever a building is clicked, populating it with holding details.

**Pros**:
- Reuses the existing drawer container without adding a new card component.

**Cons**:
- Heavy drawer panel completely obscures 40 percent of the 3D viewport, breaking the immersive visual experience.
- Clashes with the main portfolio management drawer flow.

## Decision

**Chosen option**: Option 1: Floating glassmorphic HUD card with synchronized camera pivot damping

Implement an interactive HUD inspection card docked at the bottom right, paired with synchronized OrbitControls target and camera position damping in `useFrame`, and a global privacy toggle across HUD components.

**Implementation skills**: `r3f-interaction` (`EnzeD/r3f-skills`, `.agents/skills/r3f-interaction/`) · `r3f-fundamentals` (`EnzeD/r3f-skills`, `.agents/skills/r3f-fundamentals/`) · `shadcn` (`shadcn/ui`, `.agents/skills/shadcn/`)

## Rationale

Option 1 provides the highest quality user experience for 3D portfolio exploration. Docking the inspection card in the lower right HUD area leaves the central skyscraper cluster unobstructed while keeping key metrics immediately legible.

Translating camera position alongside target damping prevents the jarring shift in perspective that occurs when only OrbitControls target is moved. The global privacy toggle gives users confidence to share screenshots and recordings publicly without leaking private net worth.

## Feature design

**Data model sketch**:

This feature introduces no backend database migrations. It enhances client side presentation state in Zustand and provides a canonical valuation helper:

```typescript
export type ValuationDisplayMode = "currency" | "percentage";

// Additions to CanvasState in src/presentation/stores/use-canvas-store.ts:
export interface CanvasState {
  // Existing state: qualityPreset, isAutoRotating, isCanvasReady, cameraResetSignal
  displayMode: ValuationDisplayMode; // Persisted under "foliocity_display_mode", default "currency"
  selectedHoldingId: string | null;
  selectedPlotPosition: [number, number, number] | null;
  setDisplayMode: (mode: ValuationDisplayMode) => void;
  toggleDisplayMode: () => void;
  setSelectedHoldingId: (id: string | null, position?: [number, number, number] | null) => void;
}

// Canonical valuation helper in presentation/services:
export interface ValuationCalculation {
  currentValuationPaise: bigint;
  unrealizedPnlPaise: bigint;
  returnPercentage: number;
}

export function calculateSimulatedValuation(
  costBasisPaise: bigint,
  returnPercentage: number,
): ValuationCalculation {
  const currentValuationPaise = BigInt(
    Math.round(Number(costBasisPaise) * (1 + returnPercentage / 100))
  );
  const unrealizedPnlPaise = currentValuationPaise - costBasisPaise;
  return { currentValuationPaise, unrealizedPnlPaise, returnPercentage };
}
```

**State transitions**:

Selection state lifecycle:
- Unselected: `selectedHoldingId = null`, camera target dampens to `[0, 2, 0]`, `<HoldingDetailsCard />` unmounted.
- Selected: User clicks building, `selectedHoldingId = id`, `selectedPlotPosition = plot.position`, auto rotation pauses, camera target dampens toward `plot.position` while translating camera position by identical delta, `<HoldingDetailsCard />` mounts.
- Deselection: User clicks empty canvas via `onPointerMissed`, clicks card close button, or presses Escape; `selectedHoldingId = null`, `selectedPlotPosition = null`, camera target dampens back to `[0, 2, 0]`, auto rotation resumes if previously active, card unmounts.
- Deletion while selected: Holding removed in portfolio store; `<HoldingDetailsCard />` guards with `if (!holding) return null;`, selection state resets cleanly to null.

**API surface**:

Client side presentation components and actions:
- `<SummaryBar />` (`src/presentation/components/portfolio/summary-bar.tsx`): Mounted in header in `src/app/page.tsx`, displaying Total Invested, Total Current Valuation, Net Return %, and privacy toggle switch.
- `<HoldingDetailsCard />` (`src/presentation/components/portfolio/holding-details-card.tsx`): Floating glassmorphic card mounted in `src/app/page.tsx` overlay, displaying selected holding metrics, allocation %, edit trigger, and delete trigger.
- `<HoldingsList />` (`src/presentation/components/portfolio/holdings-list.tsx`): Updated to respect `displayMode` and mask rupee amounts when in percentage mode.
- `<CityBuildings />` (`src/presentation/components/canvas/city-buildings.tsx`): Bound directly to `useCanvasStore.selectedHoldingId`.
- `<CityCamera />` (`src/presentation/components/canvas/city-camera.tsx`): Enhanced with target and position delta lerping toward active building position.
- `<CityCanvas />` (`src/presentation/components/canvas/city-canvas.tsx`): Bound with `onPointerMissed` to clear selection state without catching drag releases.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Display holding metrics | Company name, ticker, sector, quantity | `holding` record from `usePortfolioStore` |
| Display invested capital | Exact paise formatted or `₹ ••••••` | `holding.totalCostPaise` parsed with privacy mask |
| Display simulated market value | Current value in paise or `₹ ••••••` | `calculateSimulatedValuation(costPaise, returnPct).currentValuationPaise` |
| Display unrealized P&L | Signed rupee string or `+₹ ••••••` / `-₹ ••••••` | `calculateSimulatedValuation(costPaise, returnPct).unrealizedPnlPaise` |
| Display return percentage | `+14.2%` or `-6.8%` | Deterministic ISIN seed return from `getDeterministicReturn()` |
| Display portfolio allocation | `14.2%` | `Number(holdingCost * 10000n / totalInvestedPaise) / 100` |
| Compute camera pivot target | 3D coordinate vector `[x, y, z]` | `selectedPlotPosition` in `useCanvasStore` from `plot.position` |
| Toggle valuation privacy | Switch between `currency` and `percentage` | Action on `useCanvasStore` |

**Key invariants**:

- Camera target damping must translate `camera.position` by the identical delta as `controls.target` to preserve viewing elevation, azimuth, and orbit radius.
- If the currently selected holding is deleted from the portfolio store, `<HoldingDetailsCard />` must immediately return null and clear selection without throwing undefined access errors.
- In percentage privacy mode, exact rupee numbers must never leak into the DOM, including `aria-label`, `title`, and child text nodes.
- Canvas background deselection must use `onPointerMissed` on `<Canvas>` so orbit drag releases never trigger accidental deselection.
- `CityBuildings` must eliminate local component state and bind directly to `useCanvasStore.selectedHoldingId` to prevent visual desynchronization.

**Security model**:

- Client side only state; privacy preference is stored locally in user browser storage.
- No sensitive user equity data is sent across the network.

**Configuration required**:

No external environment variables or third party API keys required.

**Critical test scenarios**:

- Selection happy path: Clicking a building highlights its neon glow, opens `<HoldingDetailsCard />`, pauses auto rotation, and smoothly shifts camera target (verifies AC-1, AC-2, AC-3).
- Privacy toggle: Toggling to percentage mode masks all rupee values across summary bar, inspection card, and holdings drawer with `₹ ••••••` while keeping return percentages visible (verifies AC-6, AC-7).
- Deselection handling: Pressing Escape key, clicking close button, or clicking empty canvas via `onPointerMissed` dismisses the card and returns camera target to `[0, 2, 0]` (verifies AC-1, AC-8).
- Edit and delete integration: Clicking "Edit Holding" opens the portfolio drawer; clicking "Delete Holding" triggers `<DeleteHoldingDialog />` (verifies AC-4).
- Safe deletion handling: Deleting a holding while its card is open clears the card and selection state without runtime crashes (verifies AC-5).

## Build plan

Ordered per the Skateboard build approach:

1. **Canvas Store Privacy State & Plot Coordinates**: Extend `useCanvasStore` with `displayMode: "currency" | "percentage"`, `selectedPlotPosition`, persistence under `foliocity_display_mode`, and unit tests (satisfies AC-6).
2. **Canonical Simulated Valuation Helper**: Implement `calculateSimulatedValuation()` in domain/presentation math service with bigint arithmetic, signed formatting, and test suite (satisfies AC-3, AC-7).
3. **Summary Bar Component**: Create `<SummaryBar />` in `src/presentation/components/portfolio/summary-bar.tsx` displaying portfolio totals, return badge, and privacy toggle switch, mounted in `src/app/page.tsx` header (satisfies AC-6, AC-7).
4. **Camera Target & Position Delta Damping**: Update `<CityCamera />` with `useFrame` lerp damping for both target and camera position, plus auto rotation pause and resume (satisfies AC-2, AC-8).
5. **Canvas Deselection & Buildings Store Binding**: Wire `onPointerMissed` in `<CityCanvas />` for background clicks, bind `<CityBuildings />` directly to store `selectedHoldingId`, and wire Escape key listener (satisfies AC-1, AC-8).
6. **Holding Details Card Component**: Build `<HoldingDetailsCard />` with glassmorphic styling, holding metrics, allocation %, edit action, delete action, and close handler (satisfies AC-3, AC-4, AC-5).
7. **HoldingsList Privacy Masking & Page Mount**: Update `<HoldingsList />` to mask rupee amounts when in percentage mode, and mount `<HoldingDetailsCard />` in `src/app/page.tsx` overlay (satisfies AC-3, AC-7).
8. **Automated Test Suite**: Author Vitest unit and component tests verifying privacy switching, valuation math, camera damping, and modal/keyboard lifecycles (satisfies AC-1 through AC-8).

## Consequences

**Positive**:
- Direct 3D building interaction completes the core loop of the skateboard visualizer.
- Privacy mode allows investors to share screenshots and video tours without exposing net worth across all UI surfaces.
- Synchronized camera position damping prevents perspective distortion when focusing on buildings.
- Clean separation between store state, canvas scene, and overlay components.

**Negative / tradeoffs**:
- Camera lerping requires active `useFrame` updates when transitioning between buildings.

**Neutral**:
- Reuses existing deterministic returns until live Bhavcopy market feeds land in Release 3.

## Follow-up

- [x] Implement `displayMode` and `selectedPlotPosition` in `src/presentation/stores/use-canvas-store.ts`
- [x] Implement `calculateSimulatedValuation()` helper with tests
- [x] Build `src/presentation/components/portfolio/summary-bar.tsx` and mount in `src/app/page.tsx`
- [x] Implement synchronized camera orbit target and position damping in `src/presentation/components/canvas/city-camera.tsx`
- [x] Wire `onPointerMissed` in `src/presentation/components/canvas/city-canvas.tsx` and bind `CityBuildings`
- [x] Build `src/presentation/components/portfolio/holding-details-card.tsx`
- [x] Update `src/presentation/components/portfolio/holdings-list.tsx` with privacy masking
- [x] Add comprehensive test coverage in Vitest
