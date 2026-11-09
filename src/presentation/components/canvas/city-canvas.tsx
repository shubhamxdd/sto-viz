"use client";

import { Canvas } from "@react-three/fiber";
import { type ReactNode, Suspense, useEffect } from "react";
import { QUALITY_CONFIGS, useCanvasStore } from "../../stores/use-canvas-store";
import { CityScene } from "./city-scene";

interface CityCanvasProps {
  children?: ReactNode;
  className?: string;
}

function CanvasFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#030712]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest animate-pulse">
          Initializing Metropolis
        </span>
      </div>
    </div>
  );
}

export function CityCanvas({ children, className }: CityCanvasProps) {
  const qualityPreset = useCanvasStore((state) => state.qualityPreset);
  const selectedHoldingId = useCanvasStore((state) => state.selectedHoldingId);
  const setSelectedHoldingId = useCanvasStore(
    (state) => state.setSelectedHoldingId,
  );
  const config = QUALITY_CONFIGS[qualityPreset];

  // Global Escape key listener to clear holding selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedHoldingId) {
        setSelectedHoldingId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedHoldingId, setSelectedHoldingId]);

  const handlePointerMissed = () => {
    if (selectedHoldingId) {
      setSelectedHoldingId(null);
    }
  };

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      <Suspense fallback={<CanvasFallback />}>
        <Canvas
          camera={{ position: [25, 20, 25], fov: 45 }}
          dpr={config.dpr}
          shadows={config.shadows ? "percentage" : false}
          onPointerMissed={handlePointerMissed}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
        >
          <CityScene>{children}</CityScene>
        </Canvas>
      </Suspense>
    </div>
  );
}
