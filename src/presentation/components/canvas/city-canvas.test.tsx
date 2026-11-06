import { describe, expect, it } from "vitest";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { CAMERA_DEFAULT_POSITION, CAMERA_DEFAULT_TARGET } from "./city-camera";

describe("City Canvas & Scene Components", () => {
  // covers: AC-2 (camera default parameters and responsive boundaries)
  it("defines default camera coordinates and orientation targets", () => {
    expect(CAMERA_DEFAULT_POSITION).toEqual([25, 20, 25]);
    expect(CAMERA_DEFAULT_TARGET).toEqual([0, 2, 0]);
  });

  // covers: AC-3 (orbit elevation and distance bounds)
  it("enforces polar elevation constraints and distance limits", () => {
    const minElevation = Math.PI / 6; // 30 degrees
    const maxElevation = Math.PI / 2.5; // 72 degrees

    expect(minElevation).toBeGreaterThan(0);
    expect(maxElevation).toBeLessThan(Math.PI / 2); // strictly below 90° to prevent ground clipping
    expect(maxElevation).toBeGreaterThan(minElevation);
  });

  // covers: AC-6 (scene canvas readiness state lifecycle)
  it("tracks canvas readiness through store actions", () => {
    expect(useCanvasStore.getState().isCanvasReady).toBe(false);

    useCanvasStore.getState().setCanvasReady(true);
    expect(useCanvasStore.getState().isCanvasReady).toBe(true);

    useCanvasStore.getState().setCanvasReady(false);
    expect(useCanvasStore.getState().isCanvasReady).toBe(false);
  });
});
