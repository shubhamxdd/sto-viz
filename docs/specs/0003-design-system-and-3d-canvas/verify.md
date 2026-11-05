# Verify: Design System and 3D Viewport Canvas · spec 0003 · updated 2026-11-05
_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Load the root page `/` in the browser → expect dark night background `#030712`, electric cyan branding, and transparent HUD layout → AC-1, AC-2, AC-7
- [ ] Inspect the 3D viewport canvas → expect WebGL canvas to fill parent viewport and resize responsively with window size → AC-2
- [ ] Click and drag on empty canvas background → expect camera to orbit smoothly with momentum damping without clicking through HUD cards → AC-3, AC-7
- [ ] Pinch or scroll to zoom → expect camera distance clamped between 10 and 60 units, and polar elevation angle clamped between 30° and 72° to prevent floor clipping → AC-3
- [ ] Inspect scene atmosphere and lighting → expect cool ambient light, directional moonlight, linear distance fog fading into darkness, and cyberpunk ground grid with reflective lines → AC-4
- [ ] Switch graphics quality preset to High in `<QualitySwitcher>` → expect selective bloom glow on emissive neon accents with threshold 0.85 without blurring UI or dark walls → AC-5, AC-6
- [ ] Switch graphics quality preset to Low in `<QualitySwitcher>` → expect EffectComposer to cleanly unmount for mobile battery preservation with no WebGL context errors → AC-6
- [ ] Reload browser page → expect selected quality preset to persist from localStorage (`foliocity_quality_preset`) → AC-6
- [ ] Click camera toolbar Reset View button → expect camera to return to default coordinates `[25, 20, 25]` looking at `[0, 2, 0]` → AC-3
- [ ] Click camera toolbar Orbit button → expect automated horizontal idle rotation to toggle on and off → AC-3

## Commands
- [ ] `npm run check` → expect 0 errors from Biome lint/format and TypeScript type check → AC-1, AC-2, AC-6
- [ ] `npm test` → expect all 71 unit and component tests to pass → AC-1, AC-2, AC-3, AC-5, AC-6, AC-7
- [ ] `npm run build` → expect Next.js App Router production build to compile static pages without SSR errors → AC-2

## Acceptance criteria coverage
- AC-1 (Cyberpunk design system tokens and typography) · covered by step 1, 11, 12
- AC-2 (Fullscreen responsive 3D WebGL canvas) · covered by step 2, 11, 12, 13
- AC-3 (Constrained camera orbit and damping) · covered by step 3, 4, 9, 10, 12
- AC-4 (Atmosphere, moonlight, fog, and ground grid) · covered by step 5, 12
- AC-5 (Selective bloom with high threshold 0.85) · covered by step 6, 12
- AC-6 (Three-tier graphics presets and persistence) · covered by step 6, 7, 8, 11, 12
- AC-7 (Non-blocking HUD pointer event pass through) · covered by step 1, 3, 12
