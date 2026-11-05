"use client";

import dynamic from "next/dynamic";
import { CameraToolbar } from "../presentation/components/ui/camera-toolbar";
import { GlassCard } from "../presentation/components/ui/glass-card";
import { QualitySwitcher } from "../presentation/components/ui/quality-switcher";

const CityCanvas = dynamic(
  () =>
    import("../presentation/components/canvas").then((mod) => mod.CityCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest animate-pulse">
            Booting 3D Viewport
          </span>
        </div>
      </div>
    ),
  },
);

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#030712] text-slate-100">
      {/* 3D WebGL Canvas Layer fixed behind HUD */}
      <div className="fixed inset-0 -z-10 h-full w-full">
        <CityCanvas />
      </div>

      {/* Transparent HUD Overlay (pointer-events-none permits orbiting through empty areas) */}
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-between p-4 sm:p-6">
        {/* Top Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="pointer-events-auto flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-slate-950/70 px-3.5 py-2 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
              </span>
              <span className="font-mono text-sm font-bold tracking-wider text-cyan-400">
                FOLIOCITY
              </span>
              <span className="text-slate-600">/</span>
              <span className="font-mono text-xs text-slate-400">
                METROPOLIS
              </span>
            </div>
          </div>

          {/* Interactive Toolbars */}
          <div className="flex flex-wrap items-center gap-2">
            <CameraToolbar />
            <QualitySwitcher />
          </div>
        </header>

        {/* Center / Welcome Glass Card */}
        <div className="my-auto max-w-md sm:max-w-lg">
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
                Viewport Canvas Active
              </span>
              <span className="rounded bg-cyan-950/60 px-2 py-0.5 font-mono text-[10px] text-cyan-300 border border-cyan-500/20">
                FOUNDATION
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Cyberpunk 3D Skyline
              </h1>
              <p className="text-sm leading-relaxed text-slate-300">
                Your Indian stock portfolio reimagined as a glowing cyberpunk
                cityscape. Building heights mirror invested capital, while
                selective neon ribbons signal profit and loss.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">
                <span className="block text-[10px] uppercase text-slate-400">
                  Orbit Limit
                </span>
                <span className="font-medium text-slate-200">
                  30° to 72° Elevation
                </span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">
                <span className="block text-[10px] uppercase text-slate-400">
                  Neon Threshold
                </span>
                <span className="font-medium text-cyan-300">
                  0.85 Luminance
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Bottom HUD Bar */}
        <footer className="flex flex-wrap items-center justify-between gap-2 pt-4">
          <div className="pointer-events-auto rounded-lg border border-slate-800/60 bg-slate-950/60 px-3 py-1.5 backdrop-blur-md">
            <p className="font-mono text-xs text-slate-400">
              Drag to orbit · Scroll to zoom · Bounded camera
            </p>
          </div>

          <div className="pointer-events-auto rounded-lg border border-slate-800/60 bg-slate-950/60 px-3 py-1.5 backdrop-blur-md">
            <span className="font-mono text-xs text-cyan-400">
              FolioCity v0.1 · Clean Architecture
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
