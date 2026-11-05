"use client";

import { Compass, Pause, Play } from "lucide-react";
import { useCanvasStore } from "../../stores/use-canvas-store";

export function CameraToolbar() {
  const isAutoRotating = useCanvasStore((state) => state.isAutoRotating);
  const toggleAutoRotate = useCanvasStore((state) => state.toggleAutoRotate);
  const triggerCameraReset = useCanvasStore(
    (state) => state.triggerCameraReset,
  );

  return (
    <div
      className="pointer-events-auto inline-flex items-center gap-1 rounded-lg border border-slate-800/80 bg-slate-950/70 p-1 backdrop-blur-md"
      role="toolbar"
      aria-label="Camera Controls"
    >
      <button
        type="button"
        onClick={triggerCameraReset}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700/50"
        title="Reset camera to default view"
        aria-label="Reset Camera View"
      >
        <Compass className="h-3.5 w-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Reset View</span>
      </button>

      <div className="h-4 w-px bg-slate-800" />

      <button
        type="button"
        onClick={toggleAutoRotate}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
          isAutoRotating
            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
        }`}
        title={isAutoRotating ? "Pause auto rotation" : "Start auto rotation"}
        aria-pressed={isAutoRotating}
        aria-label="Toggle Auto Orbit"
      >
        {isAutoRotating ? (
          <Pause className="h-3.5 w-3.5 text-cyan-400" />
        ) : (
          <Play className="h-3.5 w-3.5 text-slate-400" />
        )}
        <span className="hidden sm:inline">
          {isAutoRotating ? "Orbiting" : "Orbit"}
        </span>
      </button>
    </div>
  );
}
