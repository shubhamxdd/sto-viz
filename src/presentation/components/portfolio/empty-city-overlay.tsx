"use client";

import { Building2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import {
  calculateDemoPortfolioTotalInvestedPaise,
  DEMO_PORTFOLIOS,
  type DemoPortfolioDefinition,
} from "@/domain/entities/demo-portfolio";
import { formatPaiseToRupees } from "@/domain/services/currency-parser";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { usePortfolioStore } from "../../stores/use-portfolio-store";

interface EmptyCityOverlayProps {
  onNotify?: (message: string) => void;
}

export function EmptyCityOverlay({ onNotify }: EmptyCityOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const holdings = usePortfolioStore((state) => state.holdings);
  const loadDemoPortfolio = usePortfolioStore(
    (state) => state.loadDemoPortfolio,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || holdings.length > 0) {
    return null;
  }

  const handleSelectDemo = (demo: DemoPortfolioDefinition) => {
    const success = loadDemoPortfolio(demo.id);
    if (success) {
      useCanvasStore.getState().setSelectedHoldingId(null, null);
      useCanvasStore.getState().triggerCameraReset();
      onNotify?.(`Loaded ${demo.name} demo city`);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">
          Or Tour a Curated Demo City
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {DEMO_PORTFOLIOS.map((demo) => {
          const totalCapital = formatPaiseToRupees(
            calculateDemoPortfolioTotalInvestedPaise(demo),
          );

          return (
            <button
              key={demo.id}
              type="button"
              onClick={() => handleSelectDemo(demo)}
              className="group flex flex-col gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
              aria-label={`Load ${demo.name} demo city`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 group-hover:border-cyan-400">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {demo.name}
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-slate-400">
                      {demo.tagline}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-semibold text-cyan-400">
                  {totalCapital}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-1">
                {demo.description}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                  {demo.holdings.length} Stocks
                </span>
                {demo.holdings.map((h) => (
                  <span
                    key={h.symbol}
                    className="rounded border border-slate-800 bg-slate-950/60 px-1.5 py-0.5 font-mono text-[9px] text-slate-400"
                  >
                    {h.symbol}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
