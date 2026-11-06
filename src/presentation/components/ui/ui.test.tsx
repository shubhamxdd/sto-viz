import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { CameraToolbar } from "./camera-toolbar";
import { GlassCard } from "./glass-card";
import { QualitySwitcher } from "./quality-switcher";

describe("HUD UI Components", () => {
  describe("GlassCard", () => {
    // covers: AC-7 (glassmorphism card layout and pointer event pass through)
    it("renders children inside a glass panel container with non-blocking pointer events pass through override", () => {
      render(
        <GlassCard>
          <span>Panel Content</span>
        </GlassCard>,
      );

      const element = screen.getByText("Panel Content").parentElement;
      expect(element).toBeDefined();
      expect(element?.className).toContain("pointer-events-auto");
      expect(element?.className).toContain("glass-panel");
    });

    it("applies variant classes correctly", () => {
      const { rerender } = render(
        <GlassCard variant="subtle">
          <span>Subtle</span>
        </GlassCard>,
      );
      expect(screen.getByText("Subtle").parentElement?.className).toContain(
        "glass-panel-subtle",
      );

      rerender(
        <GlassCard variant="interactive">
          <span>Interactive</span>
        </GlassCard>,
      );
      expect(
        screen.getByText("Interactive").parentElement?.className,
      ).toContain("glass-panel-interactive");
    });

    it("merges custom className and forwards native div attributes", () => {
      render(
        <GlassCard className="custom-shadow mt-4" aria-label="Summary Card">
          <span>Card Body</span>
        </GlassCard>,
      );

      const card = screen.getByLabelText("Summary Card");
      expect(card).toBeDefined();
      expect(card.className).toContain("custom-shadow");
      expect(card.className).toContain("mt-4");
    });
  });

  describe("QualitySwitcher", () => {
    // covers: AC-6 (graphics quality presets switching and ARIA pressed states)
    it("switches quality preset when pill buttons are clicked", () => {
      useCanvasStore.setState({ qualityPreset: "balanced" });
      render(<QualitySwitcher />);

      const highBtn = screen.getByRole("button", { name: /high/i });
      fireEvent.click(highBtn);
      expect(useCanvasStore.getState().qualityPreset).toBe("high");

      const lowBtn = screen.getByRole("button", { name: /low/i });
      fireEvent.click(lowBtn);
      expect(useCanvasStore.getState().qualityPreset).toBe("low");
    });

    it("sets aria-pressed accurately on active and inactive preset buttons", () => {
      useCanvasStore.setState({ qualityPreset: "high" });
      render(<QualitySwitcher />);

      const highBtn = screen.getByRole("button", { name: /high/i });
      const lowBtn = screen.getByRole("button", { name: /low/i });
      const balancedBtn = screen.getByRole("button", { name: /balanced/i });

      expect(highBtn.getAttribute("aria-pressed")).toBe("true");
      expect(lowBtn.getAttribute("aria-pressed")).toBe("false");
      expect(balancedBtn.getAttribute("aria-pressed")).toBe("false");
    });
  });

  describe("CameraToolbar", () => {
    // covers: AC-3 (camera reset and auto-orbit action controls)
    it("triggers camera reset signal when reset button is clicked", () => {
      useCanvasStore.setState({ cameraResetSignal: 0 });
      render(<CameraToolbar />);

      const resetBtn = screen.getByRole("button", {
        name: /reset camera view/i,
      });
      fireEvent.click(resetBtn);
      expect(useCanvasStore.getState().cameraResetSignal).toBe(1);
    });

    it("toggles auto-rotate state when orbit button is clicked", () => {
      useCanvasStore.setState({ isAutoRotating: true });
      render(<CameraToolbar />);

      const orbitBtn = screen.getByRole("button", {
        name: /toggle auto orbit/i,
      });
      expect(orbitBtn.getAttribute("aria-pressed")).toBe("true");

      fireEvent.click(orbitBtn);
      expect(useCanvasStore.getState().isAutoRotating).toBe(false);
      expect(orbitBtn.getAttribute("aria-pressed")).toBe("false");

      fireEvent.click(orbitBtn);
      expect(useCanvasStore.getState().isAutoRotating).toBe(true);
      expect(orbitBtn.getAttribute("aria-pressed")).toBe("true");
    });
  });
});
