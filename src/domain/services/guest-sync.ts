import type { GuestHoldingItem } from "@/domain/entities/portfolio";
import { validateIsin } from "@/domain/entities/security";
import {
  InvalidHoldingCostError,
  InvalidQuantityError,
} from "@/domain/errors/domain-error";
import { AppError } from "@/shared/errors/app-error";

export class GuestLimitExceededError extends AppError {
  constructor(count: number) {
    super(
      `Guest mode permits at most 3 holdings. Received ${count}. Please sign in to save additional stocks.`,
      400,
      "GUEST_LIMIT_EXCEEDED",
    );
  }
}

export interface ExistingCloudHolding {
  id: string;
  securityId: string;
  isin: string;
  quantity: number;
  totalCostPaise: bigint;
}

export interface ResolvedHolding {
  securityId?: string; // Present if already known
  isin: string;
  quantity: number;
  totalCostPaise: bigint;
  isNew: boolean;
}

export interface SyncResolutionResult {
  strategy: "merge" | "replace";
  holdings: ResolvedHolding[];
}

/**
 * Validates guest holdings from browser localStorage.
 * Enforces the 3-stock guest limit and data format invariants.
 */
export function validateGuestHoldings(
  items: GuestHoldingItem[],
): GuestHoldingItem[] {
  if (items.length > 3) {
    throw new GuestLimitExceededError(items.length);
  }

  return items.map((item) => {
    const isin = validateIsin(item.isin);

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new InvalidQuantityError(item.quantity);
    }

    const buyPrice = BigInt(item.buyPricePaise);
    if (buyPrice <= 0n) {
      throw new InvalidHoldingCostError(buyPrice);
    }

    const totalCost = BigInt(item.totalCostPaise);
    if (totalCost <= 0n) {
      throw new InvalidHoldingCostError(totalCost);
    }

    return {
      ...item,
      isin,
    };
  });
}

/**
 * Resolves synchronization between guest local storage holdings and cloud holdings.
 * Supports "merge" (combine quantities and sum cumulative paise costs) and "replace" strategies.
 */
export function resolveGuestSync(
  existingCloudHoldings: ExistingCloudHolding[],
  guestHoldings: GuestHoldingItem[],
  strategy: "merge" | "replace",
): SyncResolutionResult {
  const validatedGuest = validateGuestHoldings(guestHoldings);

  if (strategy === "replace") {
    const resolved: ResolvedHolding[] = validatedGuest.map((g) => ({
      isin: g.isin,
      quantity: g.quantity,
      totalCostPaise: BigInt(g.totalCostPaise),
      isNew: true,
    }));

    return { strategy: "replace", holdings: resolved };
  }

  // Strategy: Merge
  const holdingsMap = new Map<string, ResolvedHolding>();

  // Populate map with existing cloud holdings
  for (const cloud of existingCloudHoldings) {
    holdingsMap.set(cloud.isin, {
      securityId: cloud.securityId,
      isin: cloud.isin,
      quantity: cloud.quantity,
      totalCostPaise: cloud.totalCostPaise,
      isNew: false,
    });
  }

  // Merge incoming guest holdings
  for (const guest of validatedGuest) {
    const existing = holdingsMap.get(guest.isin);
    const guestCost = BigInt(guest.totalCostPaise);

    if (existing) {
      existing.quantity += guest.quantity;
      existing.totalCostPaise += guestCost;
    } else {
      holdingsMap.set(guest.isin, {
        isin: guest.isin,
        quantity: guest.quantity,
        totalCostPaise: guestCost,
        isNew: true,
      });
    }
  }

  return {
    strategy: "merge",
    holdings: Array.from(holdingsMap.values()),
  };
}
