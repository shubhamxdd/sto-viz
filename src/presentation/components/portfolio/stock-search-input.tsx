"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type CatalogListing,
  type CatalogSecurity,
  searchSecurities,
} from "../../data/securities-catalog";

interface StockSearchInputProps {
  selectedSecurity: CatalogSecurity | null;
  selectedExchange: "NSE" | "BSE";
  onSelect: (security: CatalogSecurity, exchange: "NSE" | "BSE") => void;
  disabled?: boolean;
}

export function StockSearchInput({
  selectedSecurity,
  selectedExchange,
  onSelect,
  disabled = false,
}: StockSearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = searchSecurities(query);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSecurity = (sec: CatalogSecurity) => {
    // Determine primary listing exchange, default to NSE (AC-2)
    const primaryListing =
      sec.listings.find((l) => l.isPrimary) ?? sec.listings[0];
    onSelect(sec, primaryListing.exchange);
    setQuery("");
    setIsOpen(false);
  };

  const handleToggleExchange = (
    e: React.MouseEvent,
    exchange: "NSE" | "BSE",
  ) => {
    e.stopPropagation();
    if (!selectedSecurity) return;
    onSelect(selectedSecurity, exchange);
  };

  const primaryListing = selectedSecurity?.listings.find(
    (l) => l.exchange === selectedExchange,
  );

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      <label
        htmlFor="stock-search-input"
        className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider"
      >
        Select Stock
      </label>

      {/* Selected Security Display Card (when chosen) */}
      {selectedSecurity && !isOpen ? (
        <div className="flex items-center justify-between rounded-lg border border-cyan-500/40 bg-slate-900/90 p-3 shadow-inner">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-cyan-300">
                {primaryListing?.symbol ?? selectedSecurity.listings[0].symbol}
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                {selectedSecurity.sector}
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate max-w-[220px]">
              {selectedSecurity.companyName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Dual listing exchange switcher (AC-2) */}
            <fieldset
              className="inline-flex rounded-md border border-slate-700/80 bg-slate-950 p-0.5"
              aria-label="Exchange Listing"
            >
              <legend className="sr-only">Exchange Listing</legend>
              {selectedSecurity.listings.map((l: CatalogListing) => {
                const isSelected = selectedExchange === l.exchange;
                return (
                  <button
                    key={l.exchange}
                    type="button"
                    onClick={(e) => handleToggleExchange(e, l.exchange)}
                    className={`px-2 py-0.5 font-mono text-[11px] font-medium rounded transition-colors ${
                      isSelected
                        ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {l.exchange}
                  </button>
                );
              })}
            </fieldset>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsOpen(true)}
              className="rounded p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 cursor-pointer"
              title="Change stock"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Search Text Input Field */
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>

          <input
            id="stock-search-input"
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search by ticker, company, or ISIN..."
            className="block w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2.5 pl-9 pr-3 font-mono text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
          />

          {/* Autocomplete Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/95 py-1 shadow-2xl backdrop-blur-xl">
              {results.length === 0 ? (
                <div className="p-3 text-center font-mono text-xs text-slate-500">
                  No listed stocks match "{query}"
                </div>
              ) : (
                results.map((sec) => {
                  const nseListing = sec.listings.find(
                    (l) => l.exchange === "NSE",
                  );
                  const isSelected = selectedSecurity?.isin === sec.isin;

                  return (
                    <button
                      key={sec.isin}
                      type="button"
                      onClick={() => handleSelectSecurity(sec)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-900/80 transition-colors border-b border-slate-900 last:border-0 cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">
                            {nseListing?.symbol ?? sec.listings[0].symbol}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {sec.isin}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 truncate max-w-[240px]">
                          {sec.companyName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                          {sec.sector.split(" ")[0]}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-cyan-400" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
