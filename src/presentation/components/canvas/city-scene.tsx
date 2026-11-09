"use client";

import { type ReactNode, useEffect } from "react";
import { QUALITY_CONFIGS, useCanvasStore } from "../../stores/use-canvas-store";
import { CityBuildings } from "./city-buildings";
import { CityCamera } from "./city-camera";
import { CityEffects } from "./city-effects";
import { CityEnvironment } from "./city-environment";
import { CityGroundGrid } from "./city-ground-grid";

interface CitySceneProps {
  children?: ReactNode;
}

export function CityScene({ children }: CitySceneProps) {
  const qualityPreset = useCanvasStore((state) => state.qualityPreset);
  const setCanvasReady = useCanvasStore((state) => state.setCanvasReady);
  const config = QUALITY_CONFIGS[qualityPreset];

  useEffect(() => {
    setCanvasReady(true);
    return () => setCanvasReady(false);
  }, [setCanvasReady]);

  return (
    <>
      <CityEnvironment enableShadows={config.shadows} />
      <CityGroundGrid receiveShadow={config.shadows} />
      <CityCamera />

      {/* Render scene children or dynamic procedural city buildings */}
      {children ?? <CityBuildings />}

      <CityEffects preset={qualityPreset} />
    </>
  );
}
