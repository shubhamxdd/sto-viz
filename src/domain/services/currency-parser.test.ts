import { describe, expect, it } from "vitest";
import {
  CurrencyOutOfBoundsError,
  InvalidCurrencyFormatError,
} from "@/domain/errors/domain-error";
import {
  formatPaiseToRupees,
  formatPaiseWithPrivacy,
  parseRupeesToPaise,
  quantizePaiseToThousandRupees,
} from "./currency-parser";

describe("currency-parser", () => {
  describe("parseRupeesToPaise", () => {
    it("parses whole integer rupee strings accurately", () => {
      expect(parseRupeesToPaise("100")).toBe(10000n);
      expect(parseRupeesToPaise("2500")).toBe(250000n);
    });

    it("parses single decimal digit strings accurately", () => {
      expect(parseRupeesToPaise("10.5")).toBe(1050n);
      expect(parseRupeesToPaise("0.5")).toBe(50n);
    });

    it("parses two decimal digit strings accurately", () => {
      expect(parseRupeesToPaise("2450.75")).toBe(245075n);
      expect(parseRupeesToPaise("0.05")).toBe(5n);
    });

    it("rejects zero or negative inputs", () => {
      expect(() => parseRupeesToPaise("0")).toThrow(CurrencyOutOfBoundsError);
      expect(() => parseRupeesToPaise("0.00")).toThrow(
        CurrencyOutOfBoundsError,
      );
      expect(() => parseRupeesToPaise("-50")).toThrow(
        InvalidCurrencyFormatError,
      );
    });

    it("rejects inputs with more than 2 decimal places", () => {
      expect(() => parseRupeesToPaise("100.125")).toThrow(
        InvalidCurrencyFormatError,
      );
    });

    it("rejects malformed characters and multiple decimal points", () => {
      expect(() => parseRupeesToPaise("abc")).toThrow(
        InvalidCurrencyFormatError,
      );
      expect(() => parseRupeesToPaise("10.20.30")).toThrow(
        InvalidCurrencyFormatError,
      );
      expect(() => parseRupeesToPaise(".")).toThrow(InvalidCurrencyFormatError);
      expect(() => parseRupeesToPaise("")).toThrow(InvalidCurrencyFormatError);
    });
  });

  describe("formatPaiseToRupees", () => {
    it("formats paise to Indian rupee notation with two decimal places", () => {
      expect(formatPaiseToRupees(10000n)).toBe("₹100.00");
      expect(formatPaiseToRupees(250075n)).toBe("₹2,500.75");
      expect(formatPaiseToRupees(10000000n)).toBe("₹1,00,000.00");
      expect(formatPaiseToRupees(123456789n)).toBe("₹12,34,567.89");
    });

    it("handles negative paise properly", () => {
      expect(formatPaiseToRupees(-50025n)).toBe("-₹500.25");
    });
  });

  describe("quantizePaiseToThousandRupees", () => {
    it("quantizes paise to the nearest thousand rupees", () => {
      // 2,45,200 rupees (24520000 paise) rounds to ₹2,45,000
      expect(quantizePaiseToThousandRupees(24520000n)).toBe("₹2,45,000");

      // 2,45,600 rupees (24560000 paise) rounds to ₹2,46,000
      expect(quantizePaiseToThousandRupees(24560000n)).toBe("₹2,46,000");

      // 1,000 rupees exactly
      expect(quantizePaiseToThousandRupees(100000n)).toBe("₹1,000");
    });
  });

  describe("formatPaiseWithPrivacy", () => {
    it("returns masked rupee string when privacy mode is active", () => {
      expect(formatPaiseWithPrivacy(250000n, true)).toBe("₹ ••••••");
      expect(formatPaiseWithPrivacy(250000n, true, { showSign: true })).toBe(
        "+₹ ••••••",
      );
      expect(formatPaiseWithPrivacy(-150000n, true, { showSign: true })).toBe(
        "-₹ ••••••",
      );
      expect(formatPaiseWithPrivacy(0n, true, { showSign: true })).toBe(
        "₹ ••••••",
      );
    });

    it("returns formatted rupee string when privacy mode is inactive", () => {
      expect(formatPaiseWithPrivacy(250000n, false)).toBe("₹2,500.00");
      expect(formatPaiseWithPrivacy(250000n, false, { showSign: true })).toBe(
        "+₹2,500.00",
      );
      expect(formatPaiseWithPrivacy(-150000n, false, { showSign: true })).toBe(
        "-₹1,500.00",
      );
    });
  });
});
