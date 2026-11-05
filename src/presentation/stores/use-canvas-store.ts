import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type QualityPreset = "high" | "balanced" | "low";

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
  isAutoRotating: boolean;
  cameraResetSignal: number;
  isCanvasReady: boolean;
  selectedHoldingId: string | null;

  setQualityPreset: (preset: QualityPreset) => void;
  toggleAutoRotate: () => void;
  setAutoRotate: (enabled: boolean) => void;
  triggerCameraReset: () => void;
  setCanvasReady: (ready: boolean) => void;
  setSelectedHoldingId: (id: string | null) => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      qualityPreset: "balanced",
      isAutoRotating: true,
      cameraResetSignal: 0,
      isCanvasReady: false,
      selectedHoldingId: null,

      setQualityPreset: (preset) => set({ qualityPreset: preset }),
      toggleAutoRotate: () =>
        set((state) => ({ isAutoRotating: !state.isAutoRotating })),
      setAutoRotate: (enabled) => set({ isAutoRotating: enabled }),
      triggerCameraReset: () =>
        set((state) => ({ cameraResetSignal: state.cameraResetSignal + 1 })),
      setCanvasReady: (ready) => set({ isCanvasReady: ready }),
      setSelectedHoldingId: (id) => set({ selectedHoldingId: id }),
    }),
    {
      name: "foliocity_quality_preset",
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
        ({ qualityPreset: state.qualityPreset }) as CanvasState,
    },
  ),
);
