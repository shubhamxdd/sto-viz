import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  QUALITY_CONFIGS,
  type QualityPreset,
} from "../../stores/use-canvas-store";

describe("City 3D Rendering & Pipeline Configurations", () => {
  // covers: AC-4 (night atmosphere, lights, and fog)
  it("configures night atmosphere, fog, and lighting correctly", () => {
    const envFile = fs.readFileSync(
      path.resolve(__dirname, "city-environment.tsx"),
      "utf-8",
    );

    expect(envFile).toContain('"#030712"');
    expect(envFile).toContain('args={["#030712", 25, 80]}');
    expect(envFile).toContain('color="#1e293b"');
    expect(envFile).toContain('color="#38bdf8"');
    expect(envFile).toContain('color="#f43f5e"');
  });

  // covers: AC-4 (cyberpunk ground grid)
  it("configures ground grid and reflective floor geometry", () => {
    const gridFile = fs.readFileSync(
      path.resolve(__dirname, "city-ground-grid.tsx"),
      "utf-8",
    );

    expect(gridFile).toContain("args={[120, 120]}");
    expect(gridFile).toContain('color="#030712"');
    expect(gridFile).toContain("fadeDistance={45}");
    expect(gridFile).toContain('sectionColor="#0284c7"');
  });

  // covers: AC-5, AC-6 (postprocessing effects and quality tier tiers)
  it("configures selective bloom threshold and quality tiers", () => {
    const effectsFile = fs.readFileSync(
      path.resolve(__dirname, "city-effects.tsx"),
      "utf-8",
    );

    expect(effectsFile).toContain("luminanceThreshold={0.85}");
    expect(effectsFile).toContain("luminanceSmoothing={0.1}");
    expect(effectsFile).toContain("!config.bloom");

    const presets: QualityPreset[] = ["high", "balanced", "low"];
    for (const preset of presets) {
      const cfg = QUALITY_CONFIGS[preset];
      expect(cfg).toBeDefined();
      expect(Array.isArray(cfg.dpr)).toBe(true);
      expect(typeof cfg.shadows).toBe("boolean");
      expect(typeof cfg.bloom).toBe("boolean");
      expect(typeof cfg.smaa).toBe("boolean");
    }

    // Invariant: low tier must have bloom false to unmount EffectComposer on mobile
    expect(QUALITY_CONFIGS.low.bloom).toBe(false);
    expect(QUALITY_CONFIGS.low.shadows).toBe(false);
  });
});
