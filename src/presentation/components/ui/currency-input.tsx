"use client";

import { useEffect, useState } from "react";
import { parseRupeesToPaise } from "@/domain/services/currency-parser";

interface CurrencyInputProps {
  id?: string;
  label?: string;
  valuePaise: bigint;
  onChangePaise: (paise: bigint) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  id = "currency-input",
  label = "Buy Price (₹)",
  valuePaise,
  onChangePaise,
  error: externalError,
  placeholder = "0.00",
  disabled = false,
}: CurrencyInputProps) {
  // Convert initial paise to readable decimal string (e.g. 245000n -> "2450.00")
  const initialText =
    valuePaise > 0n
      ? `${(valuePaise / 100n).toString()}.${(valuePaise % 100n)
          .toString()
          .padStart(2, "0")}`
      : "";

  const [textValue, setTextValue] = useState(initialText);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Sync internal text when external valuePaise changes programmatically
  useEffect(() => {
    if (valuePaise > 0n) {
      const whole = (valuePaise / 100n).toString();
      const frac = (valuePaise % 100n).toString().padStart(2, "0");
      setTextValue(`${whole}.${frac}`);
    } else if (valuePaise === 0n && textValue !== "") {
      setTextValue("");
    }
  }, [valuePaise, textValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits and up to one decimal point
    if (!/^\d*(\.\d{0,2})?$/.test(raw)) {
      return;
    }

    setTextValue(raw);

    if (!raw || raw === ".") {
      setInternalError(null);
      onChangePaise(0n);
      return;
    }

    try {
      const paise = parseRupeesToPaise(raw);
      setInternalError(null);
      onChangePaise(paise);
    } catch {
      setInternalError("Enter a valid price greater than ₹0.00");
    }
  };

  const activeError = externalError ?? internalError;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="font-mono text-sm font-semibold text-cyan-400">
            ₹
          </span>
        </div>

        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={textValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!activeError}
          aria-describedby={activeError ? `${id}-error` : undefined}
          className={`block w-full rounded-lg border bg-slate-900/80 py-2.5 pl-8 pr-3 font-mono text-sm text-slate-100 placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 ${
            activeError
              ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/40"
              : "border-slate-800 focus:border-cyan-400 focus:ring-cyan-400/40"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        />
      </div>

      {activeError && (
        <p id={`${id}-error`} className="text-[11px] font-mono text-rose-400">
          {activeError}
        </p>
      )}
    </div>
  );
}
