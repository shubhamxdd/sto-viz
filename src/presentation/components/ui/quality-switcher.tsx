"use client";

import { Sparkles, Zap } from "lucide-react";
import {
  type QualityPreset,
  useCanvasStore,
} from "../../stores/use-canvas-store";

const PRESETS: {
  id: QualityPreset;
  label: string;
  description: string;
  icon: typeof Sparkles;
}[] = [
  {
    id: "high",
    label: "High",
    description: "Bloom + Shadows (Desktop)",
    icon: Sparkles,
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Bloom (Laptops)",
    icon: Sparkles,
  },
  {
    id: "low",
    label: "Low",
    description: "Battery Saving (Mobile)",
    icon: Zap,
  },
];

export function QualitySwitcher() {
  const qualityPreset = useCanvasStore((state) => state.qualityPreset);
  const setQualityPreset = useCanvasStore((state) => state.setQualityPreset);

  return (
    <fieldset
      className="pointer-events-auto inline-flex items-center gap-1 rounded-lg border border-slate-800/80 bg-slate-950/70 p-1 backdrop-blur-md"
      aria-label="Graphics Quality"
    >
      <legend className="sr-only">Graphics Quality</legend>
      {PRESETS.map((item) => {
        const isActive = qualityPreset === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setQualityPreset(item.id)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
            title={item.description}
            aria-pressed={isActive}
          >
            <Icon
              className={`h-3.5 w-3.5 ${
                isActive ? "text-cyan-400" : "text-slate-500"
              }`}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </fieldset>
  );
}
