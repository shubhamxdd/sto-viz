import type { Sector } from "@/domain/entities/security";

export interface CatalogListing {
  exchange: "NSE" | "BSE";
  symbol: string;
  isPrimary: boolean;
}

export interface CatalogSecurity {
  id: string;
  isin: string;
  companyName: string;
  sector: Sector;
  listings: CatalogListing[];
}

export const SECURITIES_CATALOG: CatalogSecurity[] = [
  {
    id: "sec_reliance",
    isin: "INE002A01018",
    companyName: "Reliance Industries Limited",
    sector: "Oil, Gas and Energy",
    listings: [
      { exchange: "NSE", symbol: "RELIANCE", isPrimary: true },
      { exchange: "BSE", symbol: "500325", isPrimary: false },
    ],
  },
  {
    id: "sec_hdfcbank",
    isin: "INE040A01034",
    companyName: "HDFC Bank Limited",
    sector: "Banks and Financial Services",
    listings: [
      { exchange: "NSE", symbol: "HDFCBANK", isPrimary: true },
      { exchange: "BSE", symbol: "500180", isPrimary: false },
    ],
  },
  {
    id: "sec_infosys",
    isin: "INE009A01021",
    companyName: "Infosys Limited",
    sector: "IT and Technology",
    listings: [
      { exchange: "NSE", symbol: "INFY", isPrimary: true },
      { exchange: "BSE", symbol: "500209", isPrimary: false },
    ],
  },
  {
    id: "sec_tcs",
    isin: "INE467B01029",
    companyName: "Tata Consultancy Services Limited",
    sector: "IT and Technology",
    listings: [
      { exchange: "NSE", symbol: "TCS", isPrimary: true },
      { exchange: "BSE", symbol: "532540", isPrimary: false },
    ],
  },
  {
    id: "sec_icicibank",
    isin: "INE090A01021",
    companyName: "ICICI Bank Limited",
    sector: "Banks and Financial Services",
    listings: [
      { exchange: "NSE", symbol: "ICICIBANK", isPrimary: true },
      { exchange: "BSE", symbol: "532174", isPrimary: false },
    ],
  },
  {
    id: "sec_lt",
    isin: "INE018A01030",
    companyName: "Larsen & Toubro Limited",
    sector: "Real Estate and Infrastructure",
    listings: [
      { exchange: "NSE", symbol: "LT", isPrimary: true },
      { exchange: "BSE", symbol: "500510", isPrimary: false },
    ],
  },
  {
    id: "sec_itc",
    isin: "INE154A01025",
    companyName: "ITC Limited",
    sector: "FMCG and Consumer Goods",
    listings: [
      { exchange: "NSE", symbol: "ITC", isPrimary: true },
      { exchange: "BSE", symbol: "500875", isPrimary: false },
    ],
  },
  {
    id: "sec_bhartiartl",
    isin: "INE397D01024",
    companyName: "Bharti Airtel Limited",
    sector: "Telecom and Media",
    listings: [
      { exchange: "NSE", symbol: "BHARTIARTL", isPrimary: true },
      { exchange: "BSE", symbol: "532454", isPrimary: false },
    ],
  },
  {
    id: "sec_hindunilvr",
    isin: "INE030A01027",
    companyName: "Hindustan Unilever Limited",
    sector: "FMCG and Consumer Goods",
    listings: [
      { exchange: "NSE", symbol: "HINDUNILVR", isPrimary: true },
      { exchange: "BSE", symbol: "500696", isPrimary: false },
    ],
  },
  {
    id: "sec_sbin",
    isin: "INE062A01020",
    companyName: "State Bank of India",
    sector: "Banks and Financial Services",
    listings: [
      { exchange: "NSE", symbol: "SBIN", isPrimary: true },
      { exchange: "BSE", symbol: "500112", isPrimary: false },
    ],
  },
  {
    id: "sec_tatamotors",
    isin: "INE155A01022",
    companyName: "Tata Motors Limited",
    sector: "Automobiles and Manufacturing",
    listings: [
      { exchange: "NSE", symbol: "TATAMOTORS", isPrimary: true },
      { exchange: "BSE", symbol: "500570", isPrimary: false },
    ],
  },
  {
    id: "sec_tatasteel",
    isin: "INE081A01012",
    companyName: "Tata Steel Limited",
    sector: "Metals and Mining",
    listings: [
      { exchange: "NSE", symbol: "TATASTEEL", isPrimary: true },
      { exchange: "BSE", symbol: "500470", isPrimary: false },
    ],
  },
  {
    id: "sec_sunpharma",
    isin: "INE044A01036",
    companyName: "Sun Pharmaceutical Industries Limited",
    sector: "Pharma and Healthcare",
    listings: [
      { exchange: "NSE", symbol: "SUNPHARMA", isPrimary: true },
      { exchange: "BSE", symbol: "524715", isPrimary: false },
    ],
  },
  {
    id: "sec_cipla",
    isin: "INE216A01030",
    companyName: "Cipla Limited",
    sector: "Pharma and Healthcare",
    listings: [
      { exchange: "NSE", symbol: "CIPLA", isPrimary: true },
      { exchange: "BSE", symbol: "500087", isPrimary: false },
    ],
  },
];

/**
 * Instant client-side search across ticker symbols, company names, and ISIN numbers.
 */
export function searchSecurities(query: string): CatalogSecurity[] {
  const normalized = query.trim().toUpperCase();
  if (!normalized) {
    return SECURITIES_CATALOG;
  }

  return SECURITIES_CATALOG.filter((sec) => {
    // Check ticker symbols across all listings
    const symbolMatch = sec.listings.some((l) =>
      l.symbol.toUpperCase().includes(normalized),
    );
    if (symbolMatch) return true;

    // Check company name
    if (sec.companyName.toUpperCase().includes(normalized)) {
      return true;
    }

    // Check ISIN
    if (sec.isin.toUpperCase().includes(normalized)) {
      return true;
    }

    // Check sector
    if (sec.sector.toUpperCase().includes(normalized)) {
      return true;
    }

    return false;
  });
}
