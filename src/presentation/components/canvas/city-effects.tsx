"use client";

import {
  Bloom,
  EffectComposer,
  SMAA,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import {
  QUALITY_CONFIGS,
  type QualityPreset,
} from "../../stores/use-canvas-store";

interface CityEffectsProps {
  preset: QualityPreset;
}

export function CityEffects({ preset }: CityEffectsProps) {
  const config = QUALITY_CONFIGS[preset];

  // Completely unmount postprocessing passes in low quality mode for battery saving
  if (!config.bloom) {
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      {/* High luminance threshold ensures only emissive neons glow */}
      <Bloom
        luminanceThreshold={0.85}
        luminanceSmoothing={0.1}
        intensity={preset === "high" ? 1.4 : 1.1}
        radius={0.4}
        mipmapBlur
      />
      {config.smaa && <SMAA />}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
