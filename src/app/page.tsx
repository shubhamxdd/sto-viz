"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  HoldingDetailsCard,
  HoldingDrawer,
  HoldingsList,
  SummaryBar,
} from "../presentation/components/portfolio";
import { CameraToolbar } from "../presentation/components/ui/camera-toolbar";
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
  const [notification, setNotification] = useState<string | null>(null);

  const handleNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((current) => (current === msg ? null : current));
    }, 4000);
  };

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
          <div className="pointer-events-auto flex flex-wrap items-center gap-3">
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

            <SummaryBar />
          </div>

          {/* Interactive Toolbars */}
          <div className="flex flex-wrap items-center gap-2">
            <CameraToolbar />
            <QualitySwitcher />
          </div>
        </header>

        {/* Center / Left Active Holdings Panel */}
        <div className="my-auto max-w-md sm:max-w-lg">
          <HoldingsList onNotify={handleNotify} />
        </div>

        {/* Floating Holding Details Card in bottom right (pointer-events-auto) */}
        <div className="pointer-events-auto fixed bottom-14 right-4 sm:bottom-16 sm:right-6 z-20 max-w-sm sm:max-w-md w-full">
          <HoldingDetailsCard onNotify={handleNotify} />
        </div>

        {/* Bottom HUD Bar & Notification Toast */}
        <footer className="flex flex-wrap items-center justify-between gap-2 pt-4">
          <div className="pointer-events-auto rounded-lg border border-slate-800/60 bg-slate-950/60 px-3 py-1.5 backdrop-blur-md">
            <p className="font-mono text-xs text-slate-400">
              Drag to orbit · Scroll to zoom · Bounded camera
            </p>
          </div>

          {notification && (
            <div className="pointer-events-auto rounded-lg border border-cyan-500/40 bg-slate-950/90 px-3 py-1.5 font-mono text-xs text-cyan-300 shadow-xl backdrop-blur-md animate-in fade-in duration-150">
              {notification}
            </div>
          )}

          <div className="pointer-events-auto rounded-lg border border-slate-800/60 bg-slate-950/60 px-3 py-1.5 backdrop-blur-md">
            <span className="font-mono text-xs text-cyan-400">
              FolioCity v0.1 · Clean Architecture
            </span>
          </div>
        </footer>
      </div>

      {/* Slide-over manual holding entry drawer */}
      <HoldingDrawer onNotify={handleNotify} />
    </main>
  );
}
