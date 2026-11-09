"use client";

import { Eye, EyeOff, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { formatPaiseWithPrivacy } from "@/domain/services/currency-parser";
import { calculateSimulatedValuation } from "@/domain/services/portfolio-math";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { usePortfolioStore } from "../../stores/use-portfolio-store";
import { getDeterministicReturn } from "../canvas/city-layout";

export function SummaryBar() {
  const holdings = usePortfolioStore((state) => state.holdings);
  const displayMode = useCanvasStore((state) => state.displayMode);
  const toggleDisplayMode = useCanvasStore((state) => state.toggleDisplayMode);

  const isPrivacyMode = displayMode === "percentage";

  const summary = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return {
        totalCostPaise: 0n,
        totalValuationPaise: 0n,
        totalPnlPaise: 0n,
        overallReturnPct: 0,
      };
    }

    let totalCostPaise = 0n;
    let totalValuationPaise = 0n;

    for (const h of holdings) {
      const cost = BigInt(h.totalCostPaise || "0");
      const ret = getDeterministicReturn(h.isin);
      const val = calculateSimulatedValuation(cost, ret);
      totalCostPaise += cost;
      totalValuationPaise += val.currentValuationPaise;
    }

    const totalPnlPaise = totalValuationPaise - totalCostPaise;
    const overallReturnPct =
      totalCostPaise > 0n
        ? Number((totalPnlPaise * 10000n) / totalCostPaise) / 100
        : 0;

    return {
      totalCostPaise,
      totalValuationPaise,
      totalPnlPaise,
      overallReturnPct,
    };
  }, [holdings]);

  if (!holdings || holdings.length === 0) {
    return null;
  }

  const isPositive = summary.totalPnlPaise >= 0n;
  const returnBadgeColor = isPositive
    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
    : "border-rose-500/30 bg-rose-500/10 text-rose-300";

  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/70 px-3.5 py-1.5 backdrop-blur-md">
      {/* Portfolio Total Valuation */}
      <div className="flex flex-col">
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
          Portfolio Value
        </span>
        <div className="font-mono text-xs sm:text-sm font-bold text-white">
          {formatPaiseWithPrivacy(summary.totalValuationPaise, isPrivacyMode)}
        </div>
      </div>

      <div className="h-6 w-px bg-slate-800" />

      {/* Net P&L / Returns */}
      <div className="flex items-center gap-1.5">
        <div
          className={`flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${returnBadgeColor}`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-cyan-400" />
          ) : (
            <TrendingDown className="h-3 w-3 text-rose-400" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {summary.overallReturnPct.toFixed(1)}%
          </span>
        </div>

        <span className="font-mono text-[11px] text-slate-400 hidden md:inline">
          (
          {formatPaiseWithPrivacy(summary.totalPnlPaise, isPrivacyMode, {
            showSign: true,
          })}
          )
        </span>
      </div>

      <div className="h-6 w-px bg-slate-800" />

      {/* Privacy Mode Toggle Button */}
      <button
        type="button"
        onClick={toggleDisplayMode}
        title={
          isPrivacyMode
            ? "Show Rupee Values"
            : "Hide Rupee Values (Privacy Mode)"
        }
        aria-label={isPrivacyMode ? "Show Rupee Values" : "Hide Rupee Values"}
        className={`flex items-center gap-1 rounded-lg border px-2 py-1 font-mono text-xs transition-colors cursor-pointer ${
          isPrivacyMode
            ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
            : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        }`}
      >
        {isPrivacyMode ? (
          <>
            <EyeOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Private</span>
          </>
        ) : (
          <>
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">INR</span>
          </>
        )}
      </button>
    </div>
  );
}
