# Rationale: 0003. Design System and 3D Viewport Canvas

## Context

FolioCity translates personal Indian equity portfolios into a cyberpunk 3D cityscape where building height reflects invested capital and neon glow conveys financial performance. Delivering an immersive visualization requires solving several technical and visual challenges simultaneously.

First, standard 3D web applications often degrade severely on mobile devices or lower power laptops. Complex screen space postprocessing passes like bloom, high dynamic range rendering, and real time shadow cascades can quickly exhaust battery life or cause stuttering frame rates. The 3D canvas must incorporate explicit performance tiers so mobile visitors enjoy smooth sixty frame per second interaction while high performance desktop rigs display crisp neon glows.

Second, the visual design system must balance intense cyberpunk aesthetics with financial legibility. Pure black backgrounds (#000000) create harsh contrast that strains eyes during portfolio review, while bright neon glows can bleed into numbers and distort information. The interface requires calibrated color tokens: deep night blue background tones (#030712), dark glassmorphism cards with backdrop blur, high contrast monospace typography for ticker symbols and percentage moves, and selective neon luminance thresholds so only accent trims glow.

Third, camera navigation must remain intuitive across desktop mouse clicks and mobile touchscreen gestures. Unrestricted free orbit cameras frequently flip upside down or clip into the ground grid, causing disorientation. The camera requires constrained elevation angles, smooth momentum damping, bounded zoom distances, touch gesture handling, and automated idle rotation that gently showcases the skyline when users pause.

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

## Rationale

Option 1 provides the exact balance of cyberpunk visual impact and multi device reliability required by FolioCity.

Placing the 3D canvas across the fullscreen viewport creates an immersive skyline that makes portfolios exciting to explore and showcase. Glassmorphism interface overlays keep financial metrics and actions accessible while allowing the user to look through and manipulate the city underneath.

The selective bloom pipeline solves the classic WebGL glow problem. By configuring the bloom pass with a high luminance threshold (0.85), only building rooftop antennas, neon signs, and window ribbons glow, while building facades and UI elements remain sharp and legible.

The three tier quality architecture directly addresses mobile constraints. Desktop users on dedicated graphics cards get crisp antialiasing, dynamic shadows, and high pixel ratios. Mobile users can switch to the Low preset (or have it default on mobile), which strips heavy screen space shaders and shadows, preserving battery and guaranteeing smooth touch orbit interaction.

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
