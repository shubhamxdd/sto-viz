import type { Sector } from "../src/domain/entities/security";
import { db } from "../src/infrastructure/db/client";
import { listings, securities } from "../src/infrastructure/db/schema";

interface SeedSecurity {
  isin: string;
  companyName: string;
  sector: Sector;
  listings: Array<{
    exchange: "NSE" | "BSE";
    symbol: string;
    isPrimary: boolean;
  }>;
}

const SEED_DATA: SeedSecurity[] = [
  {
    isin: "INE002A01018",
    companyName: "Reliance Industries Limited",
    sector: "Oil, Gas and Energy",
    listings: [
      { exchange: "NSE", symbol: "RELIANCE", isPrimary: true },
      { exchange: "BSE", symbol: "500325", isPrimary: false },
    ],
  },
  {
    isin: "INE040A01034",
    companyName: "HDFC Bank Limited",
    sector: "Banks and Financial Services",
    listings: [
      { exchange: "NSE", symbol: "HDFCBANK", isPrimary: true },
      { exchange: "BSE", symbol: "500180", isPrimary: false },
    ],
  },
  {
    isin: "INE009A01021",
    companyName: "Infosys Limited",
    sector: "IT and Technology",
    listings: [
      { exchange: "NSE", symbol: "INFY", isPrimary: true },
      { exchange: "BSE", symbol: "500209", isPrimary: false },
    ],
  },
  {
    isin: "INE467B01029",
    companyName: "Tata Consultancy Services Limited",
    sector: "IT and Technology",
    listings: [
      { exchange: "NSE", symbol: "TCS", isPrimary: true },
      { exchange: "BSE", symbol: "532540", isPrimary: false },
    ],
  },
  {
    isin: "INE090A01021",
    companyName: "ICICI Bank Limited",
    sector: "Banks and Financial Services",
    listings: [
      { exchange: "NSE", symbol: "ICICIBANK", isPrimary: true },
      { exchange: "BSE", symbol: "532174", isPrimary: false },
    ],
  },
  {
    isin: "INE018A01030",
    companyName: "Larsen & Toubro Limited",
    sector: "Real Estate and Infrastructure",
    listings: [
      { exchange: "NSE", symbol: "LT", isPrimary: true },
      { exchange: "BSE", symbol: "500510", isPrimary: false },
    ],
  },
  {
    isin: "INE154A01025",
    companyName: "ITC Limited",
    sector: "FMCG and Consumer Goods",
    listings: [
      { exchange: "NSE", symbol: "ITC", isPrimary: true },
      { exchange: "BSE", symbol: "500875", isPrimary: false },
    ],
  },
  {
    isin: "INE397D01024",
    companyName: "Bharti Airtel Limited",
    sector: "Telecom and Media",
    listings: [
      { exchange: "NSE", symbol: "BHARTIARTL", isPrimary: true },
      { exchange: "BSE", symbol: "532454", isPrimary: false },
    ],
  },
  {
    isin: "INE030A01027",
    companyName: "Hindustan Unilever Limited",
    sector: "FMCG and Consumer Goods",
    listings: [
      { exchange: "NSE", symbol: "HINDUNILVR", isPrimary: true },
      { exchange: "BSE", symbol: "500696", isPrimary: false },
    ],
  },
  {
    isin: "INE062A01020",
    companyName: "State Bank of India",
    sector: "Banks and Financial Services",
    listings: [
      { exchange: "NSE", symbol: "SBIN", isPrimary: true },
      { exchange: "BSE", symbol: "500112", isPrimary: false },
    ],
  },
  {
    isin: "INE155A01022",
    companyName: "Tata Motors Limited",
    sector: "Automobiles and Manufacturing",
    listings: [
      { exchange: "NSE", symbol: "TATAMOTORS", isPrimary: true },
      { exchange: "BSE", symbol: "500570", isPrimary: false },
    ],
  },
  {
    isin: "INE081A01012",
    companyName: "Tata Steel Limited",
    sector: "Metals and Mining",
    listings: [
      { exchange: "NSE", symbol: "TATASTEEL", isPrimary: true },
      { exchange: "BSE", symbol: "500470", isPrimary: false },
    ],
  },
  {
    isin: "INE044A01036",
    companyName: "Sun Pharmaceutical Industries Limited",
    sector: "Pharma and Healthcare",
    listings: [
      { exchange: "NSE", symbol: "SUNPHARMA", isPrimary: true },
      { exchange: "BSE", symbol: "524715", isPrimary: false },
    ],
  },
  {
    isin: "INE216A01030",
    companyName: "Cipla Limited",
    sector: "Pharma and Healthcare",
    listings: [
      { exchange: "NSE", symbol: "CIPLA", isPrimary: true },
      { exchange: "BSE", symbol: "500087", isPrimary: false },
    ],
  },
];

export async function seedSecurities(): Promise<void> {
  console.log("Seeding canonical securities and exchange listings...");

  for (const item of SEED_DATA) {
    // Insert security or retrieve existing by ISIN
    const [sec] = await db
      .insert(securities)
      .values({
        isin: item.isin,
        companyName: item.companyName,
        sector: item.sector,
      })
      .onConflictDoUpdate({
        target: securities.isin,
        set: {
          companyName: item.companyName,
          sector: item.sector,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!sec) continue;

    for (const listing of item.listings) {
      await db
        .insert(listings)
        .values({
          securityId: sec.id,
          exchange: listing.exchange,
          symbol: listing.symbol,
          isPrimary: listing.isPrimary,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: [listings.exchange, listings.symbol],
          set: {
            securityId: sec.id,
            isPrimary: listing.isPrimary,
            isActive: true,
            updatedAt: new Date(),
          },
        });
    }
  }

  console.log(
    `Seeded ${SEED_DATA.length} canonical securities with dual listings.`,
  );
}

if (require.main === module) {
  seedSecurities()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to seed securities:", err);
      process.exit(1);
    });
}
