import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getDemoPortfolioById } from "@/domain/entities/demo-portfolio";
import type { Sector } from "@/domain/entities/security";

export interface PortfolioHolding {
  id: string;
  securityId: string;
  isin: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  companyName: string;
  sector: Sector;
  quantity: number;
  buyPricePaise: string; // Lossless numeric string for localStorage
  totalCostPaise: string; // Lossless numeric string for localStorage
  purchasedAt: string; // ISO date string YYYY-MM-DD
  updatedAt: string; // ISO date string
}

export interface CreateHoldingInput {
  securityId: string;
  isin: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  companyName: string;
  sector: Sector;
  quantity: number;
  buyPricePaise: string;
  purchasedAt?: string;
}

export interface PortfolioState {
  holdings: PortfolioHolding[];
  activeDemoId: string | null;
  isDrawerOpen: boolean;
  editingHoldingId: string | null;

  // Actions
  openDrawer: (holdingId?: string | null) => void;
  closeDrawer: () => void;
  loadDemoPortfolio: (demoId: string) => boolean;
  addHolding: (input: CreateHoldingInput) => {
    isMerged: boolean;
    holding: PortfolioHolding;
  };
  updateHolding: (
    id: string,
    updates: {
      quantity: number;
      buyPricePaise: string;
      exchange?: "NSE" | "BSE";
      purchasedAt?: string;
    },
  ) => void;
  removeHolding: (id: string) => void;
  clearHoldings: () => void;

  // Computed metrics
  getTotalInvestedPaise: () => bigint;
  getTotalQuantity: () => number;
  getSectorBreakdown: () => Array<{
    sector: Sector;
    totalPaise: bigint;
    percentage: number;
  }>;
}

function generateId(): string {
  return `hold_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      holdings: [],
      activeDemoId: null,
      isDrawerOpen: false,
      editingHoldingId: null,

      openDrawer: (holdingId = null) => {
        set({ isDrawerOpen: true, editingHoldingId: holdingId });
      },

      closeDrawer: () => {
        set({ isDrawerOpen: false, editingHoldingId: null });
      },

      loadDemoPortfolio: (demoId) => {
        const demo = getDemoPortfolioById(demoId);
        if (!demo) return false;

        const nowIso = new Date().toISOString();
        const demoHoldings: PortfolioHolding[] = demo.holdings.map((h, idx) => {
          const buyPrice = BigInt(h.buyPricePaise);
          const totalCost = BigInt(h.quantity) * buyPrice;
          return {
            id: `demo_${demo.id}_${h.symbol.toLowerCase()}_${idx}`,
            securityId: h.securityId,
            isin: h.isin,
            symbol: h.symbol,
            exchange: h.exchange,
            companyName: h.companyName,
            sector: h.sector,
            quantity: h.quantity,
            buyPricePaise: buyPrice.toString(),
            totalCostPaise: totalCost.toString(),
            purchasedAt: h.purchasedAt,
            updatedAt: nowIso,
          };
        });

        set({
          holdings: demoHoldings,
          activeDemoId: demo.id,
          isDrawerOpen: false,
          editingHoldingId: null,
        });
        return true;
      },

      addHolding: (input) => {
        const currentHoldings = get().holdings;
        const existingIndex = currentHoldings.findIndex(
          (h) => h.isin === input.isin || h.securityId === input.securityId,
        );

        const addedQuantity = Math.max(1, Math.floor(input.quantity));
        const addedBuyPrice = BigInt(input.buyPricePaise);
        const addedCost = BigInt(addedQuantity) * addedBuyPrice;
        const nowIso = new Date().toISOString();
        const purchaseDate = input.purchasedAt ?? nowIso.substring(0, 10);

        if (existingIndex >= 0) {
          // Invariant: Automatic weighted average consolidation (AC-5)
          const existing = currentHoldings[existingIndex];
          const existingQty = existing.quantity;
          const existingCost = BigInt(existing.totalCostPaise);

          const newQuantity = existingQty + addedQuantity;
          const newTotalCost = existingCost + addedCost;
          // Weighted average price calculation in paise without floating point inaccuracy
          const newAvgPrice = newTotalCost / BigInt(newQuantity);

          const updatedHolding: PortfolioHolding = {
            ...existing,
            quantity: newQuantity,
            buyPricePaise: newAvgPrice.toString(),
            totalCostPaise: newTotalCost.toString(),
            updatedAt: nowIso,
          };

          const newHoldings = [...currentHoldings];
          newHoldings[existingIndex] = updatedHolding;

          set({
            holdings: newHoldings,
            isDrawerOpen: false,
            editingHoldingId: null,
          });
          return { isMerged: true, holding: updatedHolding };
        }

        // New holding creation
        const newHolding: PortfolioHolding = {
          id: generateId(),
          securityId: input.securityId,
          isin: input.isin,
          symbol: input.symbol,
          exchange: input.exchange,
          companyName: input.companyName,
          sector: input.sector,
          quantity: addedQuantity,
          buyPricePaise: addedBuyPrice.toString(),
          totalCostPaise: addedCost.toString(),
          purchasedAt: purchaseDate,
          updatedAt: nowIso,
        };

        set({
          holdings: [...currentHoldings, newHolding],
          isDrawerOpen: false,
          editingHoldingId: null,
        });

        return { isMerged: false, holding: newHolding };
      },

      updateHolding: (id, updates) => {
        const quantity = Math.max(1, Math.floor(updates.quantity));
        const buyPrice = BigInt(updates.buyPricePaise);
        const totalCost = BigInt(quantity) * buyPrice;

        set((state) => ({
          holdings: state.holdings.map((h) => {
            if (h.id !== id) return h;
            return {
              ...h,
              quantity,
              buyPricePaise: buyPrice.toString(),
              totalCostPaise: totalCost.toString(),
              exchange: updates.exchange ?? h.exchange,
              purchasedAt: updates.purchasedAt ?? h.purchasedAt,
              updatedAt: new Date().toISOString(),
            };
          }),
          isDrawerOpen: false,
          editingHoldingId: null,
        }));
      },

      removeHolding: (id) => {
        set((state) => ({
          holdings: state.holdings.filter((h) => h.id !== id),
        }));
      },

      clearHoldings: () => {
        set({
          holdings: [],
          activeDemoId: null,
          isDrawerOpen: false,
          editingHoldingId: null,
        });
      },

      getTotalInvestedPaise: () => {
        return get().holdings.reduce(
          (acc, h) => acc + BigInt(h.totalCostPaise),
          0n,
        );
      },

      getTotalQuantity: () => {
        return get().holdings.reduce((acc, h) => acc + h.quantity, 0);
      },

      getSectorBreakdown: () => {
        const holdings = get().holdings;
        const totalInvested = get().getTotalInvestedPaise();
        if (totalInvested === 0n || holdings.length === 0) {
          return [];
        }

        const map = new Map<Sector, bigint>();
        for (const h of holdings) {
          const cost = BigInt(h.totalCostPaise);
          map.set(h.sector, (map.get(h.sector) ?? 0n) + cost);
        }

        return Array.from(map.entries()).map(([sector, totalPaise]) => {
          const percentage =
            Number((totalPaise * 10000n) / totalInvested) / 100;
          return { sector, totalPaise, percentage };
        });
      },
    }),
    {
      name: "foliocity_guest_holdings",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) =>
        ({
          holdings: state.holdings,
          activeDemoId: state.activeDemoId,
        }) as PortfolioState,
    },
  ),
);
