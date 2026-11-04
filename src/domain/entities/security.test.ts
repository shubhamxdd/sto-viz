import { describe, expect, it } from "vitest";
import { InvalidIsinError } from "@/domain/errors/domain-error";
import { validateIsin } from "./security";

describe("security entity", () => {
  it("accepts valid Indian and international ISINs", () => {
    expect(validateIsin("INE002A01018")).toBe("INE002A01018"); // Reliance Industries
    expect(validateIsin("INE009A01021")).toBe("INE009A01021"); // Infosys
    expect(validateIsin("US0378331005")).toBe("US0378331005"); // Apple
  });

  it("normalizes lowercase and trimmed ISIN strings", () => {
    expect(validateIsin("  ine002a01018  ")).toBe("INE002A01018");
  });

  it("rejects ISINs with incorrect length or format", () => {
    expect(() => validateIsin("INE002A0101")).toThrow(InvalidIsinError); // 11 chars
    expect(() => validateIsin("INE002A010189")).toThrow(InvalidIsinError); // 13 chars
    expect(() => validateIsin("12E002A01018")).toThrow(InvalidIsinError); // Non-country code start
    expect(() => validateIsin("INE002A0101A")).toThrow(InvalidIsinError); // Non-digit check digit
  });
});
