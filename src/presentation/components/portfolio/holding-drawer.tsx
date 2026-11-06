"use client";

import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPaiseToRupees } from "@/domain/services/currency-parser";
import {
  type CatalogSecurity,
  SECURITIES_CATALOG,
} from "../../data/securities-catalog";
import {
  type CreateHoldingInput,
  usePortfolioStore,
} from "../../stores/use-portfolio-store";
import { CurrencyInput } from "../ui/currency-input";
import { StockSearchInput } from "./stock-search-input";

interface HoldingDrawerProps {
  onNotify?: (message: string) => void;
}

export function HoldingDrawer({ onNotify }: HoldingDrawerProps) {
  const isDrawerOpen = usePortfolioStore((state) => state.isDrawerOpen);
  const editingHoldingId = usePortfolioStore((state) => state.editingHoldingId);
  const holdings = usePortfolioStore((state) => state.holdings);
  const closeDrawer = usePortfolioStore((state) => state.closeDrawer);
  const addHolding = usePortfolioStore((state) => state.addHolding);
  const updateHolding = usePortfolioStore((state) => state.updateHolding);

  const editingHolding = editingHoldingId
    ? holdings.find((h) => h.id === editingHoldingId)
    : null;

  // Form states
  const [selectedSecurity, setSelectedSecurity] =
    useState<CatalogSecurity | null>(null);
  const [selectedExchange, setSelectedExchange] = useState<"NSE" | "BSE">(
    "NSE",
  );
  const [quantity, setQuantity] = useState<number>(10);
  const [buyPricePaise, setBuyPricePaise] = useState<bigint>(0n);
  const [purchasedAt, setPurchasedAt] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Synchronize form when editing holding changes or drawer opens
  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    if (editingHolding) {
      const match = SECURITIES_CATALOG.find(
        (s) => s.isin === editingHolding.isin,
      );
      setSelectedSecurity(
        match ?? {
          id: editingHolding.securityId,
          isin: editingHolding.isin,
          companyName: editingHolding.companyName,
          sector: editingHolding.sector,
          listings: [
            {
              exchange: editingHolding.exchange,
              symbol: editingHolding.symbol,
              isPrimary: true,
            },
          ],
        },
      );
      setSelectedExchange(editingHolding.exchange);
      setQuantity(editingHolding.quantity);
      setBuyPricePaise(BigInt(editingHolding.buyPricePaise));
      setPurchasedAt(editingHolding.purchasedAt || today);
      setFormError(null);
    } else {
      setSelectedSecurity(null);
      setSelectedExchange("NSE");
      setQuantity(10);
      setBuyPricePaise(0n);
      setPurchasedAt(today);
      setFormError(null);
    }
  }, [editingHolding]);

  if (!isDrawerOpen) {
    return null;
  }

  const handleStockSelect = (sec: CatalogSecurity, ex: "NSE" | "BSE") => {
    setSelectedSecurity(sec);
    setSelectedExchange(ex);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSecurity) {
      setFormError("Please select a listed Indian stock");
      return;
    }

    if (!quantity || quantity <= 0) {
      setFormError("Quantity must be a positive integer");
      return;
    }

    if (buyPricePaise <= 0n) {
      setFormError("Buy price must be greater than ₹0.00");
      return;
    }

    const listing = selectedSecurity.listings.find(
      (l) => l.exchange === selectedExchange,
    );
    const symbol = listing?.symbol ?? selectedSecurity.listings[0].symbol;

    if (editingHolding) {
      updateHolding(editingHolding.id, {
        quantity,
        buyPricePaise: buyPricePaise.toString(),
        exchange: selectedExchange,
        purchasedAt,
      });
      onNotify?.(`Updated ${symbol} holding`);
    } else {
      const input: CreateHoldingInput = {
        securityId: selectedSecurity.id,
        isin: selectedSecurity.isin,
        symbol,
        exchange: selectedExchange,
        companyName: selectedSecurity.companyName,
        sector: selectedSecurity.sector,
        quantity,
        buyPricePaise: buyPricePaise.toString(),
        purchasedAt,
      };

      const result = addHolding(input);
      if (result.isMerged) {
        const avgRupees = formatPaiseToRupees(
          BigInt(result.holding.buyPricePaise),
        );
        onNotify?.(
          `Merged with existing ${symbol} holding (${result.holding.quantity} shares at ${avgRupees} avg)`,
        );
      } else {
        onNotify?.(`Added ${quantity} shares of ${symbol} to portfolio`);
      }
    }
  };

  const calculatedTotal =
    buyPricePaise > 0n && quantity > 0
      ? formatPaiseToRupees(BigInt(quantity) * buyPricePaise)
      : "₹0.00";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      {/* Slide-over sheet */}
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="space-y-0.5">
            <h2 className="font-mono text-base font-bold text-white">
              {editingHolding ? "Edit Stock Holding" : "Add Stock to Portfolio"}
            </h2>
            <p className="font-mono text-xs text-slate-400">
              {editingHolding
                ? "Update transaction details"
                : "Search Indian listed equities"}
            </p>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 py-5 overflow-y-auto"
        >
          {/* Stock Search Input */}
          <StockSearchInput
            selectedSecurity={selectedSecurity}
            selectedExchange={selectedExchange}
            onSelect={handleStockSelect}
            disabled={!!editingHolding}
          />

          {/* Quantity Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="quantity-input"
              className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider"
            >
              Number of Shares
            </label>
            <input
              id="quantity-input"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Number.parseInt(e.target.value, 10) || 0)
              }
              className="block w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2.5 px-3 font-mono text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
              placeholder="e.g. 10"
            />
          </div>

          {/* Formatted Rupee Currency Input */}
          <CurrencyInput
            id="buy-price-input"
            label="Buy Price per Share"
            valuePaise={buyPricePaise}
            onChangePaise={setBuyPricePaise}
          />

          {/* Optional Purchase Date Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="purchase-date-input"
              className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider"
            >
              Purchase Date (Optional)
            </label>
            <input
              id="purchase-date-input"
              type="date"
              value={purchasedAt}
              onChange={(e) => setPurchasedAt(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2.5 px-3 font-mono text-sm text-slate-100 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
            />
          </div>

          {/* Live Calculated Investment Cost Preview */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 space-y-1">
            <div className="flex items-center justify-between font-mono text-xs text-slate-400">
              <span>Total Investment</span>
              <span>
                {quantity} ×{" "}
                {buyPricePaise > 0n
                  ? formatPaiseToRupees(buyPricePaise)
                  : "₹0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs text-slate-400">Amount</span>
              <span className="text-sm font-bold text-cyan-300">
                {calculatedTotal}
              </span>
            </div>
          </div>

          {formError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-2.5 text-xs font-mono text-rose-400">
              {formError}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 font-mono text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>
                {editingHolding ? "Save Changes" : "Add to Portfolio"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
