import { AppError } from "@/shared/errors/app-error";

export class InvalidCurrencyFormatError extends AppError {
  constructor(input: string) {
    super(
      `Invalid rupee currency format: "${input}". Expected positive number with up to 2 decimal places.`,
      400,
      "INVALID_CURRENCY_FORMAT",
    );
  }
}

export class CurrencyOutOfBoundsError extends AppError {
  constructor(message: string) {
    super(message, 400, "CURRENCY_OUT_OF_BOUNDS");
  }
}

export class InvalidIsinError extends AppError {
  constructor(isin: string) {
    super(
      `Invalid ISIN format: "${isin}". Expected 12 character alphanumeric string with standard country prefix and numeric check digit.`,
      400,
      "INVALID_ISIN",
    );
  }
}

export class InvalidQuantityError extends AppError {
  constructor(quantity: number) {
    super(
      `Invalid holding quantity: ${quantity}. Expected whole positive integer greater than zero.`,
      400,
      "INVALID_QUANTITY",
    );
  }
}

export class InvalidHoldingCostError extends AppError {
  constructor(costPaise: bigint) {
    super(
      `Invalid holding total cost: ${costPaise.toString()} paise. Expected positive value greater than zero.`,
      400,
      "INVALID_HOLDING_COST",
    );
  }
}
