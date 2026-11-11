"use client";

import { AlertTriangle, Building2, Check, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  calculateDemoPortfolioTotalInvestedPaise,
  DEMO_PORTFOLIOS,
  type DemoPortfolioDefinition,
} from "@/domain/entities/demo-portfolio";
import { formatPaiseToRupees } from "@/domain/services/currency-parser";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { usePortfolioStore } from "../../stores/use-portfolio-store";

interface DemoCitiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (message: string) => void;
}

export function DemoCitiesDialog({
  isOpen,
  onClose,
  onNotify,
}: DemoCitiesDialogProps) {
  const holdings = usePortfolioStore((state) => state.holdings);
  const activeDemoId = usePortfolioStore((state) => state.activeDemoId);
  const loadDemoPortfolio = usePortfolioStore(
    (state) => state.loadDemoPortfolio,
  );

  const [pendingDemo, setPendingDemo] =
    useState<DemoPortfolioDefinition | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pendingDemo) {
          setPendingDemo(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, pendingDemo, onClose]);

  if (!isOpen) return null;

  const handleSelectDemo = (demo: DemoPortfolioDefinition) => {
    if (holdings.length > 0) {
      // Require confirmation when active holdings exist
      setPendingDemo(demo);
    } else {
      executeLoad(demo);
    }
  };

  const executeLoad = (demo: DemoPortfolioDefinition) => {
    const success = loadDemoPortfolio(demo.id);
    if (success) {
      useCanvasStore.getState().setSelectedHoldingId(null, null);
      useCanvasStore.getState().triggerCameraReset();
      onNotify?.(`Loaded ${demo.name} demo city`);
      setPendingDemo(null);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
        {pendingDemo ? (
          /* Confirmation View when replacing existing holdings */
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3
                  id="demo-dialog-title"
                  className="font-mono text-sm font-bold text-white"
                >
                  Replace Active Holdings?
                </h3>
                <p className="font-mono text-xs text-slate-400">
                  Switching to {pendingDemo.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your portfolio currently has{" "}
              <strong className="text-white font-mono">
                {holdings.length} active{" "}
                {holdings.length === 1 ? "holding" : "holdings"}
              </strong>
              . Loading the{" "}
              <span className="text-cyan-400 font-mono">
                {pendingDemo.name}
              </span>{" "}
              demo city will replace your current holdings with sample data.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingDemo(null)}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 font-mono text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeLoad(pendingDemo)}
                className="rounded-lg bg-cyan-500 px-4 py-2 font-mono text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Replace with Demo
              </button>
            </div>
          </div>
        ) : (
          /* Demo City Selection View */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3
                    id="demo-dialog-title"
                    className="font-mono text-sm font-bold text-white"
                  >
                    Explore Curated Demo Cities
                  </h3>
                  <p className="font-mono text-xs text-slate-400">
                    Tour pre-built Indian equity skylines
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                aria-label="Close demo cities dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {DEMO_PORTFOLIOS.map((demo) => {
                const isCurrent = activeDemoId === demo.id;
                const totalCapital = formatPaiseToRupees(
                  calculateDemoPortfolioTotalInvestedPaise(demo),
                );

                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className={`group w-full flex flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                      isCurrent
                        ? "border-cyan-500 bg-cyan-950/30 shadow-md shadow-cyan-500/10"
                        : "border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900/90"
                    }`}
                    aria-label={`Select ${demo.name} portfolio`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-950/50 text-cyan-400">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {demo.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {demo.tagline}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-cyan-400">
                          {totalCapital}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-1 rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300 border border-cyan-500/30">
                            <Check className="h-2.5 w-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
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
        )}
      </div>
    </div>
  );
}
