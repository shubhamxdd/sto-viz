"use client";

import { type ReactNode, useEffect } from "react";
import { QUALITY_CONFIGS, useCanvasStore } from "../../stores/use-canvas-store";
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

      {/* Render scene children or default preview landmark */}
      {children ?? (
        <group position={[0, 0, 0]}>
          {/* Cyberpunk central tower landmark with profit cyan and loss rose ribbons */}
          <mesh castShadow={config.shadows} position={[0, 3, 0]}>
            <boxGeometry args={[2, 6, 2]} />
            <meshStandardMaterial
              color="#090d16"
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Electric cyan profit glowing crown */}
          <mesh position={[0, 6.1, 0]}>
            <boxGeometry args={[1.9, 0.2, 1.9]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={3.0}
              toneMapped={false}
            />
          </mesh>

          {/* Rose magenta glowing accent ring */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[2.05, 0.15, 2.05]} />
            <meshStandardMaterial
              color="#fb7185"
              emissive="#fb7185"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>

          {/* Rooftop antenna beacon */}
          <mesh position={[0, 7.0, 0]}>
            <cylinderGeometry args={[0.04, 0.08, 1.6, 8]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={4.0}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}

      <CityEffects preset={qualityPreset} />
    </>
  );
}
