import type { Sector } from "./security";

export type DemoPortfolioId =
  | "nifty-titans"
  | "tech-frontier"
  | "green-horizon";

export interface DemoPortfolioHoldingDefinition {
  securityId: string;
  isin: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  companyName: string;
  sector: Sector;
  quantity: number;
  buyPricePaise: string; // Lossless integer paise string
  purchasedAt: string; // ISO date YYYY-MM-DD
}

export interface DemoPortfolioDefinition {
  id: DemoPortfolioId;
  name: string;
  tagline: string;
  description: string;
  holdings: DemoPortfolioHoldingDefinition[];
}

export const DEMO_PORTFOLIOS: DemoPortfolioDefinition[] = [
  {
    id: "nifty-titans",
    name: "Nifty Titans",
    tagline: "Blue Chip Giants",
    description:
      "India's foundational industrial, financial, and technology market titans.",
    holdings: [
      {
        securityId: "sec_reliance",
        isin: "INE002A01018",
        symbol: "RELIANCE",
        exchange: "NSE",
        companyName: "Reliance Industries Limited",
        sector: "Oil, Gas and Energy",
        quantity: 35,
        buyPricePaise: "295000",
        purchasedAt: "2026-03-15",
      },
      {
        securityId: "sec_tcs",
        isin: "INE467B01029",
        symbol: "TCS",
        exchange: "NSE",
        companyName: "Tata Consultancy Services Limited",
        sector: "IT and Technology",
        quantity: 25,
        buyPricePaise: "382000",
        purchasedAt: "2026-04-10",
      },
      {
        securityId: "sec_hdfcbank",
        isin: "INE040A01034",
        symbol: "HDFCBANK",
        exchange: "NSE",
        companyName: "HDFC Bank Limited",
        sector: "Banks and Financial Services",
        quantity: 60,
        buyPricePaise: "164000",
        purchasedAt: "2026-02-20",
      },
      {
        securityId: "sec_lt",
        isin: "INE018A01030",
        symbol: "LT",
        exchange: "NSE",
        companyName: "Larsen & Toubro Limited",
        sector: "Real Estate and Infrastructure",
        quantity: 15,
        buyPricePaise: "356000",
        purchasedAt: "2026-05-18",
      },
      {
        securityId: "sec_itc",
        isin: "INE154A01025",
        symbol: "ITC",
        exchange: "NSE",
        companyName: "ITC Limited",
        sector: "FMCG and Consumer Goods",
        quantity: 80,
        buyPricePaise: "43000",
        purchasedAt: "2026-01-25",
      },
    ],
  },
  {
    id: "tech-frontier",
    name: "Tech Frontier",
    tagline: "Software & Digital Leaders",
    description:
      "High tech IT exporters, engineering research leaders, and digital commerce pioneers.",
    holdings: [
      {
        securityId: "sec_tcs",
        isin: "INE467B01029",
        symbol: "TCS",
        exchange: "NSE",
        companyName: "Tata Consultancy Services Limited",
        sector: "IT and Technology",
        quantity: 30,
        buyPricePaise: "382000",
        purchasedAt: "2026-02-14",
      },
      {
        securityId: "sec_infosys",
        isin: "INE009A01021",
        symbol: "INFY",
        exchange: "NSE",
        companyName: "Infosys Limited",
        sector: "IT and Technology",
        quantity: 50,
        buyPricePaise: "178000",
        purchasedAt: "2026-03-22",
      },
      {
        securityId: "sec_techm",
        isin: "INE669C01036",
        symbol: "TECHM",
        exchange: "NSE",
        companyName: "Tech Mahindra Limited",
        sector: "IT and Technology",
        quantity: 45,
        buyPricePaise: "145000",
        purchasedAt: "2026-04-05",
      },
      {
        securityId: "sec_ltts",
        isin: "INE214T01019",
        symbol: "LTTS",
        exchange: "NSE",
        companyName: "L&T Technology Services Limited",
        sector: "IT and Technology",
        quantity: 12,
        buyPricePaise: "512000",
        purchasedAt: "2026-01-30",
      },
      {
        securityId: "sec_zomato",
        isin: "INE758T01015",
        symbol: "ZOMATO",
        exchange: "NSE",
        companyName: "Zomato Limited",
        sector: "IT and Technology",
        quantity: 200,
        buyPricePaise: "26000",
        purchasedAt: "2026-06-12",
      },
    ],
  },
  {
    id: "green-horizon",
    name: "Green Horizon",
    tagline: "Energy & Infrastructure",
    description:
      "Renewable generation, power transmission, clean energy, and heavy engineering.",
    holdings: [
      {
        securityId: "sec_tatapower",
        isin: "INE245A01021",
        symbol: "TATAPOWER",
        exchange: "NSE",
        companyName: "Tata Power Company Limited",
        sector: "Oil, Gas and Energy",
        quantity: 180,
        buyPricePaise: "41000",
        purchasedAt: "2026-02-18",
      },
      {
        securityId: "sec_adanigreen",
        isin: "INE364U01010",
        symbol: "ADANIGREEN",
        exchange: "NSE",
        companyName: "Adani Green Energy Limited",
        sector: "Oil, Gas and Energy",
        quantity: 45,
        buyPricePaise: "182000",
        purchasedAt: "2026-03-10",
      },
      {
        securityId: "sec_ntpc",
        isin: "INE733E01010",
        symbol: "NTPC",
        exchange: "NSE",
        companyName: "NTPC Limited",
        sector: "Oil, Gas and Energy",
        quantity: 160,
        buyPricePaise: "38000",
        purchasedAt: "2026-04-15",
      },
      {
        securityId: "sec_suzlon",
        isin: "INE040H01021",
        symbol: "SUZLON",
        exchange: "NSE",
        companyName: "Suzlon Energy Limited",
        sector: "Automobiles and Manufacturing",
        quantity: 450,
        buyPricePaise: "6500",
        purchasedAt: "2026-05-02",
      },
      {
        securityId: "sec_lt",
        isin: "INE018A01030",
        symbol: "LT",
        exchange: "NSE",
        companyName: "Larsen & Toubro Limited",
        sector: "Real Estate and Infrastructure",
        quantity: 20,
        buyPricePaise: "356000",
        purchasedAt: "2026-01-14",
      },
    ],
  },
];

export function calculateDemoPortfolioTotalInvestedPaise(
  demo: DemoPortfolioDefinition,
): bigint {
  return demo.holdings.reduce((sum, h) => {
    return sum + BigInt(h.quantity) * BigInt(h.buyPricePaise);
  }, 0n);
}

export function getDemoPortfolioById(
  id: string,
): DemoPortfolioDefinition | undefined {
  return DEMO_PORTFOLIOS.find((p) => p.id === id);
}
