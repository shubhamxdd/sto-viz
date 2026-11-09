import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { QUALITY_CONFIGS, useCanvasStore } from "./use-canvas-store";

describe("useCanvasStore", () => {
  beforeEach(() => {
    act(() => {
      useCanvasStore.setState({
        qualityPreset: "balanced",
        isAutoRotating: true,
        cameraResetSignal: 0,
        isCanvasReady: false,
        selectedHoldingId: null,
      });
    });
  });

  it("initializes with balanced preset and auto-rotate enabled", () => {
    const state = useCanvasStore.getState();
    expect(state.qualityPreset).toBe("balanced");
    expect(state.isAutoRotating).toBe(true);
    expect(state.cameraResetSignal).toBe(0);
    expect(state.isCanvasReady).toBe(false);
  });

  it("updates quality preset and satisfies tier configurations", () => {
    act(() => {
      useCanvasStore.getState().setQualityPreset("high");
    });
    expect(useCanvasStore.getState().qualityPreset).toBe("high");

    const highConfig = QUALITY_CONFIGS.high;
    expect(highConfig.shadows).toBe(true);
    expect(highConfig.bloom).toBe(true);
    expect(highConfig.smaa).toBe(true);
    expect(highConfig.dpr[1]).toBe(2);

    act(() => {
      useCanvasStore.getState().setQualityPreset("low");
    });
    expect(useCanvasStore.getState().qualityPreset).toBe("low");

    const lowConfig = QUALITY_CONFIGS.low;
    // Invariant: low tier disables bloom to preserve mobile battery
    expect(lowConfig.bloom).toBe(false);
    expect(lowConfig.shadows).toBe(false);
    expect(lowConfig.smaa).toBe(false);
    expect(lowConfig.dpr[1]).toBe(1);
  });

  it("toggles auto-rotation on and off", () => {
    expect(useCanvasStore.getState().isAutoRotating).toBe(true);

    act(() => {
      useCanvasStore.getState().toggleAutoRotate();
    });
    expect(useCanvasStore.getState().isAutoRotating).toBe(false);

    act(() => {
      useCanvasStore.getState().toggleAutoRotate();
    });
    expect(useCanvasStore.getState().isAutoRotating).toBe(true);
  });

  it("increments camera reset signal on trigger", () => {
    expect(useCanvasStore.getState().cameraResetSignal).toBe(0);

    act(() => {
      useCanvasStore.getState().triggerCameraReset();
    });
    expect(useCanvasStore.getState().cameraResetSignal).toBe(1);

    act(() => {
      useCanvasStore.getState().triggerCameraReset();
    });
    expect(useCanvasStore.getState().cameraResetSignal).toBe(2);
  });

  it("updates canvas readiness state", () => {
    expect(useCanvasStore.getState().isCanvasReady).toBe(false);

    act(() => {
      useCanvasStore.getState().setCanvasReady(true);
    });
    expect(useCanvasStore.getState().isCanvasReady).toBe(true);
  });

  it("sets and clears selected holding identifier", () => {
    expect(useCanvasStore.getState().selectedHoldingId).toBeNull();

    act(() => {
      useCanvasStore
        .getState()
        .setSelectedHoldingId("holding_123", [10, 5, -8]);
    });
    expect(useCanvasStore.getState().selectedHoldingId).toBe("holding_123");
    expect(useCanvasStore.getState().selectedPlotPosition).toEqual([10, 5, -8]);
    expect(useCanvasStore.getState().isAutoRotating).toBe(false);

    act(() => {
      useCanvasStore.getState().setSelectedHoldingId(null);
    });
    expect(useCanvasStore.getState().selectedHoldingId).toBeNull();
    expect(useCanvasStore.getState().selectedPlotPosition).toBeNull();
  });

  it("manages valuation display mode toggle between currency and percentage", () => {
    expect(useCanvasStore.getState().displayMode).toBe("currency");

    act(() => {
      useCanvasStore.getState().toggleDisplayMode();
    });
    expect(useCanvasStore.getState().displayMode).toBe("percentage");

    act(() => {
      useCanvasStore.getState().setDisplayMode("currency");
    });
    expect(useCanvasStore.getState().displayMode).toBe("currency");
  });
});
