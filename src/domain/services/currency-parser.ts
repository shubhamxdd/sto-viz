import {
  CurrencyOutOfBoundsError,
  InvalidCurrencyFormatError,
} from "@/domain/errors/domain-error";

export const PG_BIGINT_MAX = 9223372036854775807n;

/**
 * Parses user input rupee string to integer paise (1 Rupee = 100 Paise)
 * Uses string manipulation to avoid JavaScript floating point errors.
 */
export function parseRupeesToPaise(input: string): bigint {
  const clean = input.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) {
    throw new InvalidCurrencyFormatError(input);
  }

  const [whole, fraction = ""] = clean.split(".");
  const paiseFraction = fraction.padEnd(2, "0");
  const parsedPaise = BigInt(whole) * 100n + BigInt(paiseFraction);

  if (parsedPaise <= 0n) {
    throw new CurrencyOutOfBoundsError(
      "Monetary amount must be strictly positive",
    );
  }

  if (parsedPaise > PG_BIGINT_MAX) {
    throw new CurrencyOutOfBoundsError(
      "Monetary amount exceeds maximum supported storage limit",
    );
  }

  return parsedPaise;
}

/**
 * Formats an integer paise value into standard rupee format (e.g. ₹1,250.50)
 * Uses integer math to eliminate floating point issues.
 */
export function formatPaiseToRupees(paise: bigint): string {
  const isNegative = paise < 0n;
  const absPaise = isNegative ? -paise : paise;
  const wholeRupees = absPaise / 100n;
  const fractionPaise = absPaise % 100n;
  const prefix = isNegative ? "-" : "";

  // Indian number formatting for whole rupees
  const wholeStr = wholeRupees.toString();
  const formattedWhole = formatIndianNumber(wholeStr);

  return `${prefix}₹${formattedWhole}.${fractionPaise.toString().padStart(2, "0")}`;
}

/**
 * Quantizes integer paise to the nearest thousand rupees for public share views.
 * Eliminates algebraic deduction of individual holdings.
 */
export function quantizePaiseToThousandRupees(paise: bigint): string {
  // Convert paise to rupees by integer rounding to nearest 1,000 rupees (100,000 paise)
  const roundingThreshold = 50000n; // 500 rupees in paise
  const thousandUnits = (paise + roundingThreshold) / 100000n;
  const quantizedRupees = thousandUnits * 1000n;
  const formatted = formatIndianNumber(quantizedRupees.toString());
  return `₹${formatted}`;
}

/**
 * Formats integer string according to Indian numbering system (e.g. 12,34,567)
 */
function formatIndianNumber(val: string): string {
  if (val.length <= 3) return val;
  const lastThree = val.slice(-3);
  const remaining = val.slice(0, -3);
  const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${formattedRemaining},${lastThree}`;
}
