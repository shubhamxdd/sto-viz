import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type QualityPreset = "high" | "balanced" | "low";
export type ValuationDisplayMode = "currency" | "percentage";

export interface QualityConfig {
  dpr: [number, number];
  shadows: boolean;
  bloom: boolean;
  smaa: boolean;
}

export const QUALITY_CONFIGS: Record<QualityPreset, QualityConfig> = {
  high: {
    dpr: [1, 2],
    shadows: true,
    bloom: true,
    smaa: true,
  },
  balanced: {
    dpr: [1, 1.5],
    shadows: false,
    bloom: true,
    smaa: false,
  },
  low: {
    dpr: [1, 1],
    shadows: false,
    bloom: false,
    smaa: false,
  },
};

export interface CanvasState {
  qualityPreset: QualityPreset;
  displayMode: ValuationDisplayMode;
  isAutoRotating: boolean;
  cameraResetSignal: number;
  isCanvasReady: boolean;
  selectedHoldingId: string | null;
  selectedPlotPosition: [number, number, number] | null;

  setQualityPreset: (preset: QualityPreset) => void;
  setDisplayMode: (mode: ValuationDisplayMode) => void;
  toggleDisplayMode: () => void;
  toggleAutoRotate: () => void;
  setAutoRotate: (enabled: boolean) => void;
  triggerCameraReset: () => void;
  setCanvasReady: (ready: boolean) => void;
  setSelectedHoldingId: (
    id: string | null,
    position?: [number, number, number] | null,
  ) => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      qualityPreset: "balanced",
      displayMode: "currency",
      isAutoRotating: true,
      cameraResetSignal: 0,
      isCanvasReady: false,
      selectedHoldingId: null,
      selectedPlotPosition: null,

      setQualityPreset: (preset) => set({ qualityPreset: preset }),
      setDisplayMode: (mode) => set({ displayMode: mode }),
      toggleDisplayMode: () =>
        set((state) => ({
          displayMode:
            state.displayMode === "currency" ? "percentage" : "currency",
        })),
      toggleAutoRotate: () =>
        set((state) => ({ isAutoRotating: !state.isAutoRotating })),
      setAutoRotate: (enabled) => set({ isAutoRotating: enabled }),
      triggerCameraReset: () =>
        set((state) => ({ cameraResetSignal: state.cameraResetSignal + 1 })),
      setCanvasReady: (ready) => set({ isCanvasReady: ready }),
      setSelectedHoldingId: (id, position = null) =>
        set({
          selectedHoldingId: id,
          selectedPlotPosition: id ? position : null,
          ...(id ? { isAutoRotating: false } : {}),
        }),
    }),
    {
      name: "foliocity_display_settings",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) =>
        ({
          qualityPreset: state.qualityPreset,
          displayMode: state.displayMode,
        }) as CanvasState,
    },
  ),
);
