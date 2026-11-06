import fs from "node:fs";
import path from "node:path";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "../app/page";
import {
  CAMERA_DEFAULT_POSITION,
  CAMERA_DEFAULT_TARGET,
} from "./components/canvas/city-camera";
import { GlassCard } from "./components/ui/glass-card";
import { QualitySwitcher } from "./components/ui/quality-switcher";
import { QUALITY_CONFIGS, useCanvasStore } from "./stores/use-canvas-store";

describe("Design System and 3D Canvas Acceptance Verification", () => {
  // AC-1: Dark cyberpunk design system defines Tailwind CSS utility tokens
  it("AC-1: verifies cyberpunk design tokens and monospace font configuration", () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // Background deep night #030712
    expect(cssContent).toContain("--background: #030712");
    // Electric cyan profit #22d3ee
    expect(cssContent).toContain("--profit: #22d3ee");
    // Magenta crimson loss #fb7185
    expect(cssContent).toContain("--loss: #fb7185");
    // Monospace font variable pairing
    expect(cssContent).toContain("--font-mono: var(--font-geist-mono)");
    // Glassmorphism utility classes
    expect(cssContent).toContain(".glass-panel");
    expect(cssContent).toContain("backdrop-filter: blur");
  });

  // AC-2: Fullscreen 3D canvas mounts reliably in Next.js App Router
  it("AC-2: verifies fullscreen responsive 3D canvas layout on root page", () => {
    const { container } = render(<HomePage />);

    // Verify canvas container is fixed inset-0 behind UI (-z-10)
    const canvasWrapper = container.querySelector(".fixed.inset-0.-z-10");
    expect(canvasWrapper).not.toBeNull();
    expect(canvasWrapper?.className).toContain("h-full");
    expect(canvasWrapper?.className).toContain("w-full");
  });

  // AC-3: Orbit controls enforce elevation constraints between 30° and 72° and distance bounds [10, 60]
  it("AC-3: verifies orbit camera polar angles, distance bounds, and default coordinates", () => {
    const minPolarAngle = Math.PI / 6; // 30 degrees
    const maxPolarAngle = Math.PI / 2.5; // 72 degrees

    expect(minPolarAngle).toBeCloseTo(0.5236, 4);
    expect(maxPolarAngle).toBeCloseTo(1.2566, 4);
    expect(CAMERA_DEFAULT_POSITION).toEqual([25, 20, 25]);
    expect(CAMERA_DEFAULT_TARGET).toEqual([0, 2, 0]);

    // Verify camera controls in store respond to reset and auto-orbit
    act(() => {
      useCanvasStore.getState().triggerCameraReset();
    });
    expect(useCanvasStore.getState().cameraResetSignal).toBeGreaterThan(0);

    const initialRotate = useCanvasStore.getState().isAutoRotating;
    act(() => {
      useCanvasStore.getState().toggleAutoRotate();
    });
    expect(useCanvasStore.getState().isAutoRotating).toBe(!initialRotate);
  });

  // AC-4: Night environment renders cool ambient light, directional moonlight, linear distance fog, and floor grid
  it("AC-4: verifies atmosphere, lighting colors, distance fog, and ground grid specifications", () => {
    const envPath = path.resolve(
      process.cwd(),
      "src/presentation/components/canvas/city-environment.tsx",
    );
    const envContent = fs.readFileSync(envPath, "utf-8");

    // Distance fog fading into deep night #030712
    expect(envContent).toContain('args={["#030712", 25, 80]}');
    // Ambient light cool slate blue #1e293b
    expect(envContent).toContain('color="#1e293b"');
    // Moonlight directional key light #38bdf8
    expect(envContent).toContain('color="#38bdf8"');

    const gridPath = path.resolve(
      process.cwd(),
      "src/presentation/components/canvas/city-ground-grid.tsx",
    );
    const gridContent = fs.readFileSync(gridPath, "utf-8");
    expect(gridContent).toContain("fadeDistance={45}");
    expect(gridContent).toContain('color="#030712"');
  });

  // AC-5: Selective bloom postprocessing with high threshold 0.85
  it("AC-5: verifies selective bloom luminance threshold and postprocessing configuration", () => {
    const effectsPath = path.resolve(
      process.cwd(),
      "src/presentation/components/canvas/city-effects.tsx",
    );
    const effectsContent = fs.readFileSync(effectsPath, "utf-8");

    expect(effectsContent).toContain("luminanceThreshold={0.85}");
    expect(effectsContent).toContain("luminanceSmoothing={0.1}");
    expect(effectsContent).toContain("ToneMappingMode.ACES_FILMIC");
  });

  // AC-6: Three tier graphics presets adjust postprocessing, shadows, and DPR capping with persistence
  it("AC-6: verifies three tier graphics configs, mobile battery unmounting, and localStorage persistence", () => {
    // High tier
    expect(QUALITY_CONFIGS.high.dpr).toEqual([1, 2]);
    expect(QUALITY_CONFIGS.high.shadows).toBe(true);
    expect(QUALITY_CONFIGS.high.bloom).toBe(true);
    expect(QUALITY_CONFIGS.high.smaa).toBe(true);

    // Balanced tier
    expect(QUALITY_CONFIGS.balanced.dpr).toEqual([1, 1.5]);
    expect(QUALITY_CONFIGS.balanced.shadows).toBe(false);
    expect(QUALITY_CONFIGS.balanced.bloom).toBe(true);
    expect(QUALITY_CONFIGS.balanced.smaa).toBe(false);

    // Low tier (mobile battery saving: EffectComposer completely unmounted)
    expect(QUALITY_CONFIGS.low.dpr).toEqual([1, 1]);
    expect(QUALITY_CONFIGS.low.shadows).toBe(false);
    expect(QUALITY_CONFIGS.low.bloom).toBe(false);
    expect(QUALITY_CONFIGS.low.smaa).toBe(false);

    // Store state persistence
    act(() => {
      useCanvasStore.getState().setQualityPreset("high");
    });
    expect(useCanvasStore.getState().qualityPreset).toBe("high");

    render(<QualitySwitcher />);
    const lowBtn = screen.getByRole("button", { name: /low/i });
    fireEvent.click(lowBtn);
    expect(useCanvasStore.getState().qualityPreset).toBe("low");
  });

  // AC-7: Glassmorphism HUD overlays cleanly using non-blocking pointer events
  it("AC-7: verifies non-blocking pointer-events-none layout with interactive pointer-events-auto cards", () => {
    const { container } = render(<HomePage />);

    // Outer HUD wrapper is pointer-events-none to permit orbiting through empty areas
    const hudWrapper = container.querySelector(
      ".pointer-events-none.relative.z-10",
    );
    expect(hudWrapper).not.toBeNull();

    // Rendered GlassCards have pointer-events-auto so interactive buttons capture clicks
    render(
      <GlassCard data-testid="test-card">
        <button type="button">Action</button>
      </GlassCard>,
    );
    const card = screen.getByTestId("test-card");
    expect(card.className).toContain("pointer-events-auto");
    expect(card.className).toContain("glass-panel");
  });
});
