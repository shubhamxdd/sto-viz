---
name: foliocity-cyberpunk-design-system
source: derived
character: "Dark cyberpunk financial terminal. Deep night backdrop (#030712) with electric cyan profit glows and magenta crimson loss ribbons. High precision typography with crisp monospace numbers for rupee values."
tokens: "real values live in src/app/globals.css; read them there, never duplicated here"
contrast: "ink 18.2:1 on canvas; secondary 7.5:1 on canvas; cyan accent 10.8:1 on canvas; magenta accent 6.9:1 on canvas"
---

## Build mandate
You are a senior product designer. Every page ships as a complete, professional product surface: brand, real product specific copy, a considered layout with visual hierarchy, all states (empty, loading, error), supporting content, and a footer where the page warrants one. Maximalist, never a lone form on an empty page. Full disqualifier list: the UI guide's bar.

## Character & direction
FolioCity visualizes Indian stock investments as a 3D cyberpunk metropolis. The interface sits as a transparent, high precision heads up display floating above a 3D city scene.
Deep night tones (#030712) form an infinite canvas. Electric cyan (#22d3ee) signals capital appreciation, while neon magenta crimson (#fb7185) signals unrealized losses. Glass cards employ subtle backdrop blurs with hairline borders (border-slate-800/60) so the glowing city skyline remains visible beneath financial panels.

## Composition patterns
- Fullscreen Canvas Layer: Fixed behind all UI overlays (z-index -10), rendering the Three.js React Three Fiber scene.
- Transparent Heads Up Display (HUD): Non blocking outer layout container (pointer-events-none) allowing mouse and touch orbit controls to pass through to the 3D canvas.
- Interactive Cards & Floating Toolbars: Glassmorphic cards with pointer-events-auto, backdrop-blur-md, and semi transparent dark backgrounds.
- Monospace Number Readouts: Monospace font family for all stock tickers, percentage gains, share counts, and currency metrics.

## Component & usage rules (dos and donts)
- Primary actions use subtle cyan glows or high contrast pill buttons.
- Never use solid opaque black or white backgrounds for floating HUD cards. Always use semi transparent glass surfaces.
- Outer HUD wrappers must always set pointer-events-none; only interactive buttons, inputs, and clickable panels set pointer-events-auto.
- Glowing effects should use selective bloom thresholds rather than excessive CSS box shadows that bleed over text readability.
- Maintain high contrast readability for all financial figures.

## Responsive & accessibility direction
- Touch friendly controls: minimum touch target of 44px by 44px for camera toolbars and quality toggles.
- Camera controls support touch gestures (one finger drag to orbit, two finger pinch to zoom).
- Mobile devices default to Balanced or Low quality presets to preserve battery life and prevent GPU thermal throttling.
