import { describe, expect, it } from "vitest";
import { GuestLimitExceededError } from "../services/guest-sync";
import {
  CurrencyOutOfBoundsError,
  InvalidCurrencyFormatError,
  InvalidHoldingCostError,
  InvalidIsinError,
  InvalidQuantityError,
} from "./domain-error";

describe("domain-error classes", () => {
  it("creates InvalidCurrencyFormatError with 400 statusCode and custom message", () => {
    const error = new InvalidCurrencyFormatError("xyz");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("INVALID_CURRENCY_FORMAT");
    expect(error.message).toContain("xyz");
    expect(error.name).toBe("InvalidCurrencyFormatError");
  });

  it("creates CurrencyOutOfBoundsError with 400 statusCode and custom message", () => {
    const error = new CurrencyOutOfBoundsError("Price exceeds bounds");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("CURRENCY_OUT_OF_BOUNDS");
    expect(error.message).toBe("Price exceeds bounds");
  });

  it("creates InvalidIsinError with 400 statusCode and custom message", () => {
    const error = new InvalidIsinError("BAD123");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("INVALID_ISIN");
    expect(error.message).toContain("BAD123");
  });

  it("creates InvalidQuantityError with 400 statusCode and custom message", () => {
    const error = new InvalidQuantityError(-2);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("INVALID_QUANTITY");
    expect(error.message).toContain("-2");
  });

  it("creates InvalidHoldingCostError with 400 statusCode and custom message", () => {
    const error = new InvalidHoldingCostError(0n);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("INVALID_HOLDING_COST");
    expect(error.message).toContain("0 paise");
  });

  it("creates GuestLimitExceededError with 400 statusCode and custom message", () => {
    const error = new GuestLimitExceededError(4);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("GUEST_LIMIT_EXCEEDED");
    expect(error.message).toContain("Received 4");
  });
});
