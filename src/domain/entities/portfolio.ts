export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestHoldingItem {
  isin: string;
  symbol: string;
  companyName: string;
  exchange: "NSE" | "BSE";
  sector: string;
  quantity: number;
  buyPricePaise: string; // Stored as lossless string in localStorage
  totalCostPaise: string; // Stored as lossless string in localStorage
}
