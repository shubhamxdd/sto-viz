# 0005. Procedural 3D City Visualizer

**Date**: 2026-11-08
**Status**: Proposed

## Summary

This specification defines the procedural 3D city visualizer for FolioCity. The feature transforms stock holdings saved in browser storage into an interactive cyberpunk metropolis where each investment renders as a distinct 3D skyscraper. Building height scales logarithmically with invested capital, rooftop architectural crowns reflect industry sectors, and neon edge trims glow electric cyan for profits and magenta crimson for losses. When the portfolio is empty, the visualizer renders a glowing holographic construction foundation inviting visitors to add their first stock.

## Context

FolioCity turns Indian equity portfolios into a 3D cyberpunk metropolis. In earlier milestones, the project established clean architecture domain entities, mathematical valuation models, Drizzle schemas, a responsive 3D viewport canvas with camera orbit controls, and manual portfolio entry with local storage persistence. However, the 3D canvas currently displays only a static preview monolith in the center of the grid.

To achieve the core visualization experience of the skateboard release, portfolio holdings must be mapped directly into a procedural 3D urban landscape. Each holding must be instantly recognizable by its height, architectural style, and glowing neon trim without requiring complex pre baked 3D model downloads or slow server rendering.

The system must run smoothly at 60 frames per second on modern browsers and mobile devices. Building heights must stay balanced so small investments remain visible while massive positions do not pierce the camera bounds.

## Requirements

**User stories**:
- As an investor, I want my stock holdings displayed as distinct 3D buildings on an urban street grid so that I can visually comprehend my portfolio composition at a glance.
- As an investor, I want building heights to scale with my invested money so that my largest allocations stand out as prominent skyscrapers.
- As an investor, I want building neon edges to reflect profit or loss so that I can spot winning and losing positions immediately.
- As an investor, I want different market sectors to feature unique architectural rooftops so that technology, banking, and energy companies look visually distinct.
- As a first time visitor with no holdings, I want to see a holographic construction beacon so that I understand where my city will grow when I add stocks.

**Acceptance criteria**:
- **AC-1**: When holdings exist, the layout engine arranges buildings deterministically into rectangular city blocks separated by street corridors centered around `[0, 0]`.
- **AC-2**: Building height scales logarithmically with total invested capital in paise, clamped strictly between a minimum of 4 units and a maximum of 36 units.
- **AC-3**: Building footprints scale proportionally with investment between 2.5 and 5.0 horizontal units with beveled corner accents.
- **AC-4**: Each building renders a procedural rooftop geometry crown matching its sector (antennas and spires for IT and Technology, stepped ziggurat crowns for Banks and Financial Services, industrial tanks and vents for Oil, Gas and Energy, cylindrical domes for Pharma and Healthcare, terraced slabs for FMCG and Consumer Goods, truss roofs for Automobiles and Manufacturing, and angular monolithic crowns for Metals and Mining).
- **AC-5**: Buildings feature emissive neon edge trims and rooftop beacons that glow electric cyan (`#22d3ee`) for positive returns and magenta crimson (`#fb7185`) for negative returns, triggering selective postprocessing bloom at threshold 0.85 without washing out dark facade walls.
- **AC-6**: For holdings in the skateboard phase prior to daily Bhavcopy price feeds, visual returns default to neutral slate with subtle deterministic pulse variance derived from security ISIN seeds.
- **AC-7**: When portfolio holdings count is zero, the visualizer renders a pulsing holographic construction zone with wireframe foundation lines and a central glowing marker.
- **AC-8**: Building meshes support pointer events (`onClick`, `onPointerOver`, `onPointerOut`) highlighting the building contour on hover and emitting the holding ID for selection.

## Options considered

### Option 1: InstancedMesh with uniform geometry and custom GPU buffer attributes

Render all building cuboids in a single GPU draw call using Three.js `InstancedMesh`. Height, position, and neon colors are passed as custom instance attributes to a custom vertex and fragment shader.

**Pros**:
- Exceptional rendering performance with a single draw call for hundreds of buildings.
- Minimal CPU overhead and memory footprint.

**Cons**:
- Restricts all buildings to identical primitive geometry boxes, making distinct sector architectural crowns, spires, and cooling towers difficult to construct.
- Increases shader complexity for raycast picking and hover interactions on mobile devices.

### Option 2: Component based modular procedural buildings (Recommended)

Render each building as an isolated React Three Fiber component using memoized procedural geometries (`BoxGeometry`, `CylinderGeometry`, `ConeGeometry`) and shared standard materials. Each building combines a structural facade base with a modular sector rooftop crown.

**Pros**:
- Rich architectural variety with customized procedural crowns for every sector.
- Straightforward pointer event handling and individual state animations.
- Perfectly sized for typical retail portfolios (5 to 100 holdings) running smoothly at 60 frames per second.
- Follows React Three Fiber compositional patterns and clean component boundaries.

**Cons**:
- Higher draw call count than instancing (roughly 2 to 4 draw calls per building).
- Requires geometry memoization to prevent garbage collection frame drops during camera rotation.

### Option 3: Pre authored GLTF 3D model asset library

Load pre modeled 3D skyscraper assets from external GLTF files for each sector and scale them dynamically.

**Pros**:
- Highly detailed handcrafted 3D models with pre baked ambient occlusion textures.

**Cons**:
- Heavy asset payload requiring megabytes of network downloads before the city can render.
- Scaling pre modeled GLTF buildings distorts window proportions, doorways, and rooftop antennas unnaturally.
- Violates the skateboard build philosophy of zero external asset bloat.

## Decision

**Chosen option**: Option 2: Component based modular procedural buildings

Render each portfolio holding as a modular procedural 3D building component with memoized geometries, custom sector rooftop crowns, logarithmic height scaling, and neon emission shaders.

**Implementation skills**: `r3f-fundamentals` (`EnzeD/r3f-skills`, `.agents/skills/r3f-fundamentals/`) · `r3f-geometry` (`EnzeD/r3f-skills`, `.agents/skills/r3f-geometry/`) · `r3f-materials` (`EnzeD/r3f-skills`, `.agents/skills/r3f-materials/`)

## Rationale

Option 2 delivers the ideal balance between visual distinctiveness and runtime performance for the skateboard milestone. Retail Indian stock portfolios contain between 5 and 50 holdings on average. At this scale, modern GPUs easily handle 100 to 200 draw calls at 60 frames per second without requiring instanced batching complexity.

Procedural geometric construction allows building heights and footprints to adapt fluidly to exact rupee amounts while preserving proper architectural proportions. Custom rooftop crowns immediately telegraph company sectors without requiring bulky GLTF asset downloads.

## Feature design

**Data model sketch**:

This feature operates in the presentation layer using existing domain entities and portfolio store holdings. It introduces two transient visual data structures:

```typescript
export interface BuildingPlot {
  holdingId: string;
  securityId: string;
  symbol: string;
  companyName: string;
  sector: Sector;
  investedPaise: bigint;
  height: number;
  width: number;
  depth: number;
  position: [number, number, number];
  neonColor: string;
  emissiveIntensity: number;
  returnPercentage: number;
}

export interface CityLayoutConfig {
  blockSize: number; // Holdings per block (default 4)
  lotSize: number; // Base footprint size (default 6 units)
  streetWidth: number; // Corridor spacing (default 4 units)
  minHeight: number; // Lowest building height (4 units)
  maxHeight: number; // Skyscraper height cap (36 units)
}
```

**State transitions**:

Building visual state machine:
- Default: Normal neon edge trim emission (intensity 1.2)
- Hovered: Amplified neon beacon glow and contour outline (intensity 2.5)
- Selected: Camera focus target with active HUD detail card (intensity 3.0)

**API surface**:

Client side 3D presentation components (zero external HTTP endpoints):
- `<CityScene />`: Top level Three.js canvas scene composing ground grid, environment, and city buildings
- `<CityBuildings />`: Layout manager mapping store holdings to `<ProceduralBuilding />` instances
- `<ProceduralBuilding />`: Individual 3D building mesh with facade, windows, and sector crown
- `<SectorCrown />`: Modular rooftop geometry component tailored by sector enum
- `<ConstructionBeacon />`: Empty state holographic foundation mesh when holdings length is 0

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Compute building height | Height in 3D units [4, 36] | Logarithmic calculation from `holding.totalCostPaise` |
| Compute plot position | 3D coordinate `[x, 0, z]` | Deterministic city block grid calculation from holding index |
| Select rooftop crown | Procedural crown geometry | `holding.sector` enum mapped to sector component |
| Select neon glow color | Hex color string (`#22d3ee` or `#fb7185`) | P&L calculation from `holding.buyPricePaise` and simulated price seed |
| Highlight on hover | Amplified emissive glow intensity | Component local hover state (`onPointerOver` / `onPointerOut`) |
| Render empty city | Holographic foundation wireframe | Triggered when `usePortfolioStore.holdings.length === 0` |

**Key invariants**:

- Building height must always stay within bounds: `4.0 <= height <= 36.0` units.
- Plots must never overlap: each building receives a dedicated plot coordinate separated by at least `streetWidth` spacing.
- Procedural geometries must be memoized or shared across renders to prevent WebGL memory leaks and garbage collection stutters.
- Dark facade materials must maintain low specular reflectivity (`roughness >= 0.7`) to prevent washing out the scene background.
- When holdings are empty, no building meshes may render, and the holographic construction beacon must mount cleanly.

**Security model**:

- Client side procedural rendering only: no user financial data leaves the local browser context.
- Sanitized ticker symbols and company names used for 3D label projections.

**Configuration required**:

No external environment variables or third party API keys required. The visualizer runs purely client side via Three.js and React Three Fiber.

**Critical test scenarios**:

- Happy path: Rendering 10 diverse stock holdings produces 10 non overlapping 3D buildings with heights scaled to investment, matching sector crowns, and neon edge trims (verifies AC-1, AC-2, AC-3, AC-4, AC-5).
- Empty state: Portfolio with zero holdings renders the glowing holographic construction beacon without console warnings or runtime crashes (verifies AC-7).
- Logarithmic height bounds: An extreme portfolio with a ₹100 holding and a ₹1,00,00,000 holding renders both cleanly clamped between 4 and 36 units without sky clipping (verifies AC-2).
- Sector styling variety: Securities from all 7 sectors render distinct rooftop geometries without geometry errors (verifies AC-4).
- Interactive hover: Hovering over a building triggers pointer events and raises neon emissive intensity without UI lag (verifies AC-8).

## Build plan

Ordered per the Skateboard build approach:

1. **City Layout and Math Services**: Build mathematical layout generator `calculateCityLayout()` mapping portfolio holdings to deterministic grid coordinates `[x, z]`, and `calculateBuildingDimensions()` scaling heights logarithmically (satisfies AC-1, AC-2, AC-3).
2. **Procedural Rooftop Crowns**: Construct modular sector rooftop geometries for all 7 industry sectors (`<SectorCrown />`) with tech antennas, financial stepped ziggurats, and energy cooling towers (satisfies AC-4).
3. **Procedural Building Component**: Build `<ProceduralBuilding />` combining chamfered facade cuboid, window grid shader texture, neon edge trim, and sector crown with pointer hover interactions (satisfies AC-3, AC-5, AC-6, AC-8).
4. **Holographic Construction Beacon**: Build `<ConstructionBeacon />` with pulsing wireframe foundation lines and cyber marker for the empty portfolio state (satisfies AC-7).
5. **Canvas Scene Integration**: Wire `<CityBuildings />` into `src/presentation/components/canvas/city-scene.tsx`, replacing the temporary static monolith with the live procedural cityscape (satisfies AC-1, AC-7).
6. **Automated Test Suite**: Write unit and component tests verifying layout algorithms, height clamp bounds, sector crown mapping, and hover interactions (satisfies AC-1 through AC-8).

## Consequences

**Positive**:
- Transforms abstract financial holdings into an immediately intuitive, visually striking 3D cyberpunk cityscape
- Zero external 3D asset downloads keeps page load instantaneous
- Modular procedural construction allows seamless expansion for new sectors and building styles
- Non overlapping block layout creates an authentic urban feeling that naturally expands as users add stocks

**Negative / tradeoffs**:
- Component based rendering yields more draw calls than instancing, though easily within 60fps budget for retail portfolio sizes
- Real time Bhavcopy market price feeds are deferred to Release 3, using deterministic seed variance for initial skateboard visuals

**Neutral**:
- Camera distance and orbit angles configured in Feature 4 comfortably encompass the maximum building height of 36 units

## Follow-up

- [ ] Implement `src/presentation/components/canvas/city-layout.ts` layout and height math
- [ ] Implement `src/presentation/components/canvas/sector-crowns.tsx` with 7 sector rooftop styles
- [ ] Implement `src/presentation/components/canvas/procedural-building.tsx` with neon trims and pointer handlers
- [ ] Implement `src/presentation/components/canvas/construction-beacon.tsx` for zero holding state
- [ ] Integrate into `src/presentation/components/canvas/city-scene.tsx`
- [ ] Write Vitest test suite covering city layout, scaling math, and building components
