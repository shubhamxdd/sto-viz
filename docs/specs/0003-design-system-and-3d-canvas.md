# 0003. Design System and 3D Viewport Canvas

**Date**: 2026-11-05
**Status**: Proposed

## Summary

This document establishes the cyberpunk visual design system, dark design tokens, and responsive 3D viewport canvas for FolioCity. The presentation layer renders a Three.js and React Three Fiber scene fixed behind a semi transparent user interface overlay, featuring atmospheric moonlight, distance fog, and selective neon bloom. A three tier quality preset system (High, Balanced, and Low) adapts postprocessing and pixel density across desktop graphics cards and mobile battery saving modes, coordinated through a persistent client side Zustand store.

## Context

FolioCity translates personal Indian equity portfolios into a cyberpunk 3D cityscape where building height reflects invested capital and neon glow conveys financial performance. Delivering an immersive visualization requires solving several technical and visual challenges simultaneously.

First, standard 3D web applications often degrade severely on mobile devices or lower power laptops. Complex screen space postprocessing passes like bloom, high dynamic range rendering, and real time shadow cascades can quickly exhaust battery life or cause stuttering frame rates. The 3D canvas must incorporate explicit performance tiers so mobile visitors enjoy smooth sixty frame per second interaction while high performance desktop rigs display crisp neon glows.

Second, the visual design system must balance intense cyberpunk aesthetics with financial legibility. Pure black backgrounds (#000000) create harsh contrast that strains eyes during portfolio review, while bright neon glows can bleed into numbers and distort information. The interface requires calibrated color tokens: deep night blue background tones (#030712), dark glassmorphism cards with backdrop blur, high contrast monospace typography for ticker symbols and percentage moves, and selective neon luminance thresholds so only accent trims glow.

Third, camera navigation must remain intuitive across desktop mouse clicks and mobile touchscreen gestures. Unrestricted free orbit cameras frequently flip upside down or clip into the ground grid, causing disorientation. The camera requires constrained elevation angles, smooth momentum damping, bounded zoom distances, touch gesture handling, and automated idle rotation that gently showcases the skyline when users pause.

## Requirements

**User stories**:
- As an investor, I want to explore my 3D cityscape using fluid touch or mouse orbit controls so that I can inspect my investments from different angles without getting disoriented.
- As a mobile visitor, I want the 3D scene to run smoothly without draining my battery so that I can use the application on any device.
- As an investor with a desktop computer, I want rich visual effects including neon bloom and shadows so that my city looks cinematic.
- As a user reviewing financial figures, I want clear typography and dark interface cards overlaid cleanly on top of the 3D scene so that text remains legible against the moving 3D background.

**Acceptance criteria**:
- **AC-1**: Dark cyberpunk design system defines Tailwind CSS utility tokens, including deep night background (#030712), electric cyan for profit (#22d3ee), magenta crimson for loss (#fb7185), neutral blue (#3b82f6), and crisp monospace font pairing for currency numbers.
- **AC-2**: Fullscreen 3D canvas mounts reliably in Next.js App Router using React Three Fiber, providing a responsive Three.js WebGL viewport that resizes dynamically with window dimensions.
- **AC-3**: Orbit controls enforce elevation constraints between 30 degrees and 72 degrees, distance bounds between 10 and 60 units, smooth damping glide, and touch pinch to zoom gestures without clipping through the ground grid.
- **AC-4**: Night environment renders cool ambient light, directional moonlight, linear distance fog fading into darkness, and an infinite floor grid with subtle reflective lines.
- **AC-5**: Selective bloom postprocessing passes glow exclusively through emissive neon highlights using a high luminance threshold (0.85) without blurring dark building walls or text overlays.
- **AC-6**: Three tier graphics presets (High, Balanced, Low) adjust postprocessing passes, shadows, and device pixel ratio capping, persisting user selection in browser local storage.
- **AC-7**: Glassmorphism user interface HUD overlays cleanly on top of the 3D canvas using non blocking pointer events, allowing transparent touch and click pass through to camera orbit controls.

## Options considered

### Option 1: Fullscreen Cyberpunk 3D Canvas with Selective Bloom and Three Tier Quality Presets

A React Three Fiber canvas positioned fixed across the browser viewport behind transparent HTML/Tailwind HUD cards. The scene implements selective luminance bloom postprocessing with three switchable quality tiers (High, Balanced, Low), OrbitControls with polar elevation constraints, and atmospheric night fog.

**Pros**:
- Immersive visual presentation: the city serves as a living, glowing environment behind clean navigation overlays
- Broad device compatibility: low power tier disables postprocessing and shadows, guaranteeing sixty frames per second on mobile
- Focused neon glow: selective bloom threshold prevents text and facade washing
- Reusable state store: Zustand coordinates graphics quality, camera reset triggers, and idle rotation smoothly

**Cons**:
- Slightly higher initial bundle size due to Three.js and postprocessing libraries (mitigated via Next.js dynamic client component loading)
- Requires careful CSS pointer event management to allow 3D orbiting through empty overlay areas

### Option 2: Embedded Viewport Card with Single Fixed Postprocessing Tier

The 3D canvas is embedded inside a fixed size rectangular card in a traditional scrolling page, running fixed bloom and shadow effects at all times.

**Pros**:
- Simpler layout structure without fullscreen pointer event pass through
- Familiar traditional dashboard card arrangement

**Cons**:
- Severely diminishes the visual immersion and emotional impact of viewing a city
- Fixed postprocessing causes severe thermal throttling and battery drain on mobile phones
- Narrow viewport restricts camera orbit exploration

### Option 3: Lightweight CSS 3D Transforms with Flat SVG Overlays

Rendering buildings as isometric CSS 3D boxes or flat SVG graphics instead of a WebGL Three.js canvas.

**Pros**:
- Negligible bundle size and very low battery consumption
- Native HTML text rendering on building faces

**Cons**:
- Cannot achieve cyberpunk neon bloom, atmospheric fog, dynamic lighting, or realistic shadows
- Inflexible camera orbit: CSS 3D transforms become glitchy and slow when managing hundreds of complex building meshes
- Blocks future procedural shader animations and procedural sector meshes

## Decision

**Chosen option**: Option 1: Fullscreen Cyberpunk 3D Canvas with Selective Bloom and Three Tier Quality Presets

FolioCity will implement a fullscreen React Three Fiber canvas fixed behind glassmorphism HUD interface overlays. The scene uses constrained OrbitControls, cyberpunk night fog, directional moonlight, and selective luminance bloom across three distinct quality presets (High, Balanced, Low) persisted via Zustand.

**Implementation skills**: `r3f-fundamentals` (`EnzeD/r3f-skills`, `.agents/skills/r3f-fundamentals/`) · `r3f-lighting` (`EnzeD/r3f-skills`, `.agents/skills/r3f-lighting/`) · `r3f-postprocessing` (`EnzeD/r3f-skills`, `.agents/skills/r3f-postprocessing/`) · `shadcn` (`shadcn/ui`, `.agents/skills/shadcn/`)

## Rationale

Option 1 provides the exact balance of cyberpunk visual impact and multi device reliability required by FolioCity.

Placing the 3D canvas across the fullscreen viewport creates an immersive skyline that makes portfolios exciting to explore and showcase. Glassmorphism interface overlays keep financial metrics and actions accessible while allowing the user to look through and manipulate the city underneath.

The selective bloom pipeline solves the classic WebGL glow problem. By configuring the bloom pass with a high luminance threshold (0.85), only building rooftop antennas, neon signs, and window ribbons glow, while building facades and UI elements remain sharp and legible.

The three tier quality architecture directly addresses mobile constraints. Desktop users on dedicated graphics cards get crisp antialiasing, dynamic shadows, and high pixel ratios. Mobile users can switch to the Low preset (or have it default on mobile), which strips heavy screen space shaders and shadows, preserving battery and guaranteeing smooth touch orbit interaction.

## Feature design

### Component architecture

```
src/
├── presentation/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── city-canvas.tsx         # Top level client canvas wrapper with suspense fallback
│   │   │   ├── city-scene.tsx          # R3F scene: lighting, fog, ground grid, camera controls
│   │   │   ├── city-camera.tsx         # OrbitControls with elevation limits and damping
│   │   │   ├── city-environment.tsx   # Atmospheric moonlight, cool ambient, and distance fog
│   │   │   ├── city-effects.tsx       # EffectComposer with selective Bloom & SMAA based on preset
│   │   │   └── city-ground-grid.tsx    # Cyberpunk floor grid with distance fade
│   │   └── ui/
│   │       ├── quality-switcher.tsx    # UI pill button toggle between High, Balanced, Low
│   │       ├── camera-toolbar.tsx      # Reset camera and toggle auto rotate actions
│   │       └── glass-card.tsx          # Reusable glassmorphism panel with backdrop blur
│   └── stores/
│       └── use-canvas-store.ts         # Zustand store for graphics presets and camera state
└── app/
    ├── globals.css                     # Cyberpunk color tokens and utility styles
    └── page.tsx                        # Root page integrating CityCanvas with HUD overlay
```

### State transitions

#### Quality preset states
- `high`: DPR [1, 2], Shadows enabled (PCFSoft), EffectComposer enabled with Bloom and SMAA. Default on desktop devices with high performance GPUs.
- `balanced`: DPR [1, 1.5], Shadows disabled, EffectComposer enabled with Bloom, SMAA disabled. Ideal for laptops.
- `low`: DPR 1.0, Shadows disabled, EffectComposer completely disabled, standard hardware antialiasing. Default on mobile devices to preserve battery.

#### Camera interaction modes
- `idle-orbit`: Automated slow horizontal rotation (`autoRotateSpeed = 0.5`) when the user is not actively interacting.
- `user-manipulated`: OrbitControls actively being pinched, dragged, or zoomed by the user. Idle rotation pauses automatically.
- `resetting`: Animated return to default isometric camera coordinates `[25, 20, 25]` focused at `[0, 2, 0]`.

### Interface surface (Components and Actions)

| Component / Function | Role | Key props / inputs | Key outputs | Invariant |
|---|---|---|---|---|
| `<CityCanvas>` | Root 3D viewport | `children?: ReactNode` | R3F Canvas instance with WebGL context | Always fills parent container (`w-full h-full`) |
| `<CityScene>` | Scene graph setup | `preset: QualityPreset` | Composed lighting, environment, grid, and effects | Synchronized with active quality preset |
| `<CityCamera>` | Orbit navigation | `autoRotate: boolean`, `resetSignal: number` | Camera orientation and position | Polar angle clamped between 30° and 72° |
| `<CityEffects>` | Postprocessing pipeline | `preset: QualityPreset` | Screen space bloom composite | Omitted entirely when `preset === 'low'` |
| `useCanvasStore` | Client state store | Action dispatches | Reactive quality preset and camera triggers | Presets persist in localStorage |

### Value sourcing

| Action | Value produced / displayed | Source |
|---|---|---|
| Initialize canvas | Quality preset tier | Read from `localStorage` ('foliocity_quality_preset'), defaulting to device capability detection |
| Render atmosphere | Background color | Token `#030712` defined in design system |
| Render atmosphere | Distance fog | Color `#030712`, near distance 30 units, far distance 80 units |
| Render camera | Initial coordinates | Default perspective coordinates `[25, 20, 25]`, target `[0, 2, 0]` |
| Render camera | Polar elevation limits | Minimum angle `Math.PI / 6` (30°), maximum angle `Math.PI / 2.5` (72°) |
| Render neon bloom | Glow intensity and threshold | Selective bloom threshold 0.85, smoothing 0.1, intensity 1.4 |
| Toggle preset | Applied graphics tier | User selects 'high', 'balanced', or 'low' in `<QualitySwitcher>` |

### Key invariants

- The 3D canvas must never throw WebGL context loss errors when quality presets change dynamically at runtime.
- The camera must never dip below ground level; the maximum polar elevation angle is strictly clamped at 72 degrees (`Math.PI / 2.5`).
- In the `low` quality preset, the postprocessing `<EffectComposer>` is completely unmounted from the React Three Fiber tree to prevent render loop overhead on mobile devices.
- User interface HUD containers use `pointer-events-none` on outer wrappers and `pointer-events-auto` on clickable cards so touch orbit controls work through transparent areas.
- Design system colors must meet WCAG AA contrast standards for financial text over dark card backgrounds.

### Security and authorization model

- **Client side presentation feature**: The design system, 3D viewport canvas, and quality switcher execute entirely on the client browser. No new backend API endpoints or private secrets are required.
- **Privacy protection**: The 3D viewport canvas renders building heights and colors based on sanitized client states without exposing private database records.

### Configuration required

No new external environment variables are required. Graphics quality preferences persist locally in browser `localStorage`.

### Critical test scenarios

- **Happy path canvas boot**: `<CityCanvas>` mounts cleanly without WebGL shader compilation errors, providing responsive canvas dimensions (verifies AC-2).
- **Orbit controls bounds**: Orbit controls clamp vertical elevation angles so the camera cannot flip inverted or look upward through the floor (verifies AC-3).
- **Quality preset switching**: Changing preset from High to Low cleanly unmounts postprocessing passes without breaking the WebGL context (verifies AC-6).
- **Atmospheric fog and lighting**: Scene renders directional light and distance fog blending seamlessly into the background color (verifies AC-4).
- **HUD pointer event pass through**: Clicking or dragging on empty areas passes through to orbit the 3D scene, while clicking UI buttons triggers button handlers (verifies AC-7).

## Build plan

Ordered per the Skateboard build approach:

1. **Design system tokens and typography**: Configure Tailwind CSS color tokens in `globals.css` for deep night background, profit cyan, loss magenta, dark glass panels, and monospace font families (satisfies AC-1).
2. **Canvas state store**: Implement `useCanvasStore` with Zustand managing quality presets, camera reset triggers, auto rotate toggles, and localStorage persistence (satisfies AC-6).
3. **Core 3D Canvas and Scene graph**: Create `<CityCanvas>` and `<CityScene>` in `src/presentation/components/canvas/` with WebGL context configuration, responsive resize handling, and suspense loading fallback (satisfies AC-2).
4. **Camera controls and atmosphere**: Implement `<CityCamera>` with bounded polar angles, damping, touch pinch support, and `<CityEnvironment>` with directional moonlight, dark ambient light, and distance fog (satisfies AC-3, AC-4).
5. **Cyberpunk ground grid and effects**: Build `<CityGroundGrid>` and `<CityEffects>` with selective luminance bloom conditional on quality preset (satisfies AC-4, AC-5).
6. **HUD overlay and Quality switcher**: Build `<QualitySwitcher>`, `<CameraToolbar>`, and `<GlassCard>` components with transparent pointer event layout pass through (satisfies AC-6, AC-7).
7. **Smoke integration and testing**: Mount the 3D viewport onto the landing page `src/app/page.tsx` and write unit tests for the store and components (satisfies AC-2, AC-6).

## Consequences

**Positive**:
- Establishes a distinct, polished cyberpunk aesthetic tailored specifically for financial visualization
- Enables smooth 60fps operation on low power mobile devices through explicit quality presets
- Constrained camera orbit prevents user disorientation and ground clipping
- Non blocking HUD layout permits full screen 3D immersion while maintaining clean financial data review

**Negative / tradeoffs**:
- Initial page bundle includes Three.js and React Three Fiber libraries (approximately 150KB gzipped)
- Postprocessing bloom requires WebGL2 support, gracefully bypassed in low quality mode

**Neutral**:
- Quality preference is stored per device in browser localStorage rather than synced to user cloud accounts

## Follow-up

- [ ] Add cyberpunk color tokens to `src/app/globals.css`
- [ ] Implement `src/presentation/stores/use-canvas-store.ts`
- [ ] Build 3D canvas components in `src/presentation/components/canvas/`
- [ ] Build HUD overlay and quality switcher in `src/presentation/components/ui/`
- [ ] Integrate into `src/app/page.tsx` and verify with Vitest
