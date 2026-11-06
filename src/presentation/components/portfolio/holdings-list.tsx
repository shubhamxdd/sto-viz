"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatPaiseToRupees } from "@/domain/services/currency-parser";
import {
  type PortfolioHolding,
  usePortfolioStore,
} from "../../stores/use-portfolio-store";
import { GlassCard } from "../ui/glass-card";
import { DeleteHoldingDialog } from "./delete-holding-dialog";

interface HoldingsListProps {
  onNotify?: (message: string) => void;
}

export function HoldingsList({ onNotify }: HoldingsListProps) {
  const holdings = usePortfolioStore((state) => state.holdings);
  const openDrawer = usePortfolioStore((state) => state.openDrawer);
  const removeHolding = usePortfolioStore((state) => state.removeHolding);
  const getTotalInvestedPaise = usePortfolioStore(
    (state) => state.getTotalInvestedPaise,
  );

  const [deletingHolding, setDeletingHolding] =
    useState<PortfolioHolding | null>(null);

  const totalInvested = getTotalInvestedPaise();

  const handleConfirmDelete = () => {
    if (deletingHolding) {
      removeHolding(deletingHolding.id);
      onNotify?.(`Removed ${deletingHolding.symbol} from portfolio`);
      setDeletingHolding(null);
    }
  };

  return (
    <>
      <GlassCard className="space-y-4 max-w-md sm:max-w-lg">
        {/* Card Header & Actions */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">
              Active Holdings ({holdings.length})
            </span>
            <div className="font-mono text-lg font-bold text-white">
              {formatPaiseToRupees(totalInvested)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => openDrawer()}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 font-mono text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Stock</span>
          </button>
        </div>

        {/* Holdings List */}
        {holdings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="h-10 w-10 rounded-full border border-slate-800 bg-slate-900/60 flex items-center justify-center text-slate-500">
              <Plus className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-xs text-slate-300">
                Your metropolis is empty
              </p>
              <p className="text-[11px] text-slate-500 max-w-[240px]">
                Add your Indian equity holdings to raise 3D cyberpunk towers in
                the city.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {holdings.map((holding) => {
              const holdingCost = formatPaiseToRupees(
                BigInt(holding.totalCostPaise),
              );
              const unitPrice = formatPaiseToRupees(
                BigInt(holding.buyPricePaise),
              );

              return (
                <div
                  key={holding.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 hover:border-slate-700/80 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        {holding.symbol}
                      </span>
                      <span className="rounded bg-slate-800 px-1 py-0.2 font-mono text-[9px] text-slate-400">
                        {holding.exchange}
                      </span>
                      <span className="truncate font-mono text-[10px] text-slate-500">
                        {holding.sector.split(" ")[0]}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      <span>{holding.quantity} shares</span>
                      <span className="mx-1.5 text-slate-600">·</span>
                      <span>avg {unitPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3">
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      {holdingCost}
                    </span>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => openDrawer(holding.id)}
                      className="rounded p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={`Edit ${holding.symbol}`}
                      aria-label={`Edit ${holding.symbol}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeletingHolding(holding)}
                      className="rounded p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={`Delete ${holding.symbol}`}
                      aria-label={`Delete ${holding.symbol}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Delete Confirmation Dialog */}
      <DeleteHoldingDialog
        holding={deletingHolding}
        isOpen={!!deletingHolding}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingHolding(null)}
      />
    </>
  );
}
