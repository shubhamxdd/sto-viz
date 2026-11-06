"use client";

import { AlertTriangle } from "lucide-react";
import type { PortfolioHolding } from "../../stores/use-portfolio-store";

interface DeleteHoldingDialogProps {
  holding: PortfolioHolding | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteHoldingDialog({
  holding,
  isOpen,
  onConfirm,
  onCancel,
}: DeleteHoldingDialogProps) {
  if (!isOpen || !holding) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-rose-500/30 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-950/30 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">
              Delete {holding.symbol}?
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-[220px]">
              {holding.companyName}
            </p>
          </div>
        </div>

        <p className="font-mono text-xs text-slate-300 leading-relaxed">
          Are you sure you want to remove this stock from your portfolio? This
          will remove {holding.quantity} shares from your 3D city visualization.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-3 py-1.5 font-mono text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow-md shadow-rose-900/30 cursor-pointer"
          >
            Delete Holding
          </button>
        </div>
      </div>
    </div>
  );
}
