"use client";

import { Edit2, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatPaiseWithPrivacy } from "@/domain/services/currency-parser";
import { calculateSimulatedValuation } from "@/domain/services/portfolio-math";
import { useCanvasStore } from "../../stores/use-canvas-store";
import { usePortfolioStore } from "../../stores/use-portfolio-store";
import { getDeterministicReturn } from "../canvas/city-layout";
import { GlassCard } from "../ui/glass-card";
import { DeleteHoldingDialog } from "./delete-holding-dialog";

interface HoldingDetailsCardProps {
  onNotify?: (message: string) => void;
}

export function HoldingDetailsCard({ onNotify }: HoldingDetailsCardProps) {
  const selectedHoldingId = useCanvasStore((state) => state.selectedHoldingId);
  const setSelectedHoldingId = useCanvasStore(
    (state) => state.setSelectedHoldingId,
  );
  const displayMode = useCanvasStore((state) => state.displayMode);

  const holdings = usePortfolioStore((state) => state.holdings);
  const openDrawer = usePortfolioStore((state) => state.openDrawer);
  const removeHolding = usePortfolioStore((state) => state.removeHolding);
  const getTotalInvestedPaise = usePortfolioStore(
    (state) => state.getTotalInvestedPaise,
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Locate the selected holding from the store
  const holding = useMemo(() => {
    if (!selectedHoldingId || !holdings) return null;
    return holdings.find((h) => h.id === selectedHoldingId) ?? null;
  }, [selectedHoldingId, holdings]);

  // Synchronize: if holding is deleted or missing, reset selection cleanly
  useEffect(() => {
    if (selectedHoldingId && !holding) {
      setSelectedHoldingId(null);
    }
  }, [selectedHoldingId, holding, setSelectedHoldingId]);

  if (!selectedHoldingId || !holding) {
    return null;
  }

  const isPrivacyMode = displayMode === "percentage";
  const totalPortfolioInvested = getTotalInvestedPaise();

  const costBasisPaise = BigInt(holding.totalCostPaise || "0");
  const buyPricePaise = BigInt(holding.buyPricePaise || "0");
  const returnPct = getDeterministicReturn(holding.isin);
  const valuation = calculateSimulatedValuation(costBasisPaise, returnPct);

  const isPositive = valuation.unrealizedPnlPaise >= 0n;
  const returnBadgeColor = isPositive
    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
    : "border-rose-500/30 bg-rose-500/10 text-rose-300";

  const allocationPct =
    totalPortfolioInvested > 0n
      ? Number((costBasisPaise * 10000n) / totalPortfolioInvested) / 100
      : 0;

  const handleEdit = () => {
    openDrawer(holding.id);
  };

  const handleConfirmDelete = () => {
    removeHolding(holding.id);
    setSelectedHoldingId(null);
    setIsDeleteDialogOpen(false);
    onNotify?.(`Removed ${holding.symbol} from portfolio`);
  };

  return (
    <>
      <GlassCard className="pointer-events-auto space-y-3.5 border-cyan-500/30 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Card Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">
                {holding.symbol}
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-cyan-400">
                {holding.exchange}
              </span>
              <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
                {holding.sector}
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400 truncate max-w-[240px]">
              {holding.companyName}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedHoldingId(null)}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close holding details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Valuation & Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-slate-800/60 bg-slate-950/50 p-2.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
              Current Value
            </span>
            <div className="font-mono text-sm font-bold text-white mt-0.5">
              {formatPaiseWithPrivacy(
                valuation.currentValuationPaise,
                isPrivacyMode,
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 font-mono text-[10px]">
              <span className={isPositive ? "text-cyan-400" : "text-rose-400"}>
                {formatPaiseWithPrivacy(
                  valuation.unrealizedPnlPaise,
                  isPrivacyMode,
                  { showSign: true },
                )}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/60 bg-slate-950/50 p-2.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
              Net Return
            </span>
            <div className="mt-1">
              <div
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${returnBadgeColor}`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-cyan-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-400" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {returnPct.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-1">
              Portfolio Weight: {allocationPct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Secondary Holding Details Row */}
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-900 bg-slate-950/40 p-2 text-center font-mono">
          <div>
            <span className="text-[9px] uppercase text-slate-500 block">
              Shares
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {holding.quantity}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-500 block">
              Avg Price
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {formatPaiseWithPrivacy(buyPricePaise, isPrivacyMode)}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-500 block">
              Invested
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {formatPaiseWithPrivacy(costBasisPaise, isPrivacyMode)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
          <button
            type="button"
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 font-mono text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors shadow-sm cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Holding</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center justify-center rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-900/40 transition-colors cursor-pointer"
            title="Delete holding"
            aria-label={`Delete ${holding.symbol}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </GlassCard>

      {/* Delete Confirmation Modal */}
      <DeleteHoldingDialog
        holding={holding}
        isOpen={isDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}
