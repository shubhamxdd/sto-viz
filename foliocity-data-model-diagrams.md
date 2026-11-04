# FolioCity Data Model and Architectural Diagrams

## 1. Entity Relationship Diagram

The diagram below illustrates the relational schema modeled in Drizzle ORM. Canonical securities are separated from exchange listings to support dual listed stocks across NSE and BSE, while monetary columns persist as native integer paise (`bigint`) to eliminate rounding drift.

```mermaid
erDiagram
    SECURITIES ||--o{ LISTINGS : "trades as"
    SECURITIES ||--o{ HOLDINGS : "held in"
    LISTINGS ||--o{ DAILY_PRICES : "priced by"
    USERS ||--o{ PORTFOLIOS : "owns"
    PORTFOLIOS ||--o{ HOLDINGS : "contains"
    PORTFOLIOS ||--o{ SHARE_LINKS : "shared via"

    SECURITIES {
        uuid id PK
        varchar isin UK "12 char uppercase ISIN regex check"
        varchar company_name
        varchar sector "10 archetype categories check"
        timestamptz created_at
        timestamptz updated_at
    }

    LISTINGS {
        uuid id PK
        uuid security_id FK
        varchar exchange "NSE or BSE check"
        varchar symbol "Ticker symbol"
        boolean is_primary "At most one primary per security"
        boolean is_active
        timestamptz created_at
    }

    DAILY_PRICES {
        uuid id PK
        uuid listing_id FK
        date price_date "Bhavcopy trading date"
        bigint close_price_paise "Closing price in paise > 0"
        bigint previous_close_paise "Previous close in paise > 0"
        numeric change_percent
        bigint volume
        varchar source "NSE_BHAVCOPY or BSE_BHAVCOPY check"
    }

    USERS {
        text id PK "Better Auth user identifier"
        varchar email
        varchar name
        timestamptz email_verified
    }

    PORTFOLIOS {
        uuid id PK
        text user_id FK
        varchar name "City name"
        boolean is_default "Only one default per user"
        integer version "Concurrency tracking"
        timestamptz created_at
        timestamptz updated_at
    }

    HOLDINGS {
        uuid id PK
        uuid portfolio_id FK
        uuid security_id FK
        integer quantity "Whole shares > 0"
        bigint total_cost_paise "Cumulative invested paise > 0"
        timestamptz created_at
        timestamptz updated_at
    }

    SHARE_LINKS {
        uuid id PK
        uuid portfolio_id FK
        varchar token UK "64 hex char token regex check"
        varchar mode "live or snapshot check"
        jsonb snapshot_payload "Sanitized public DTO"
        timestamptz snapshot_as_of "Snapshot timestamp"
        boolean show_rupee_totals "Optional portfolio sum"
        boolean is_active
        timestamptz revoked_at
        timestamptz created_at
    }
```

## 2. Guest to Cloud Account Synchronization Flow

First time visitors store up to three holdings in browser local storage using canonical ISIN identifiers. When adding a fourth stock, signing in triggers the synchronization process.

```mermaid
flowchart TD
    Start["Guest visits FolioCity"] --> AddStock["Adds stocks 1 to 3 in browser local storage"]
    AddStock --> CheckLimit{"Adds 4th stock?"}
    CheckLimit -- No --> RenderLocal["Render 3D city from browser storage"]
    CheckLimit -- Yes --> PromptAuth["Prompt sign in (Google or Email)"]
    PromptAuth --> Authenticated["User authenticates via Better Auth"]
    Authenticated --> QueryCloud["Fetch cloud portfolios from database"]
    QueryCloud --> HasCloudData{"Cloud holdings exist?"}
    HasCloudData -- No --> DirectMigration["Create default portfolio and copy browser holdings to database"]
    HasCloudData -- Yes --> PromptConflict["Prompt user: Merge or Replace cloud portfolio?"]
    PromptConflict -- Merge --> MergeHoldings["Merge holdings: combine quantities and sum cumulative paise costs"]
    PromptConflict -- Replace --> ReplaceHoldings["Transactional replacement: replace cloud holdings with incoming browser holdings"]
    DirectMigration --> SyncDone["Clear browser storage and switch to cloud sync"]
    MergeHoldings --> SyncDone
    ReplaceHoldings --> SyncDone
    SyncDone --> RenderCity["Render synchronized 3D city"]
```

## 3. Public Sharing Privacy Projection Boundary

To prevent viewers from discovering private holding sizes, individual holding rupee values and share counts are stripped at the server projection boundary. Total rupee amounts are optionally shown only at the aggregate portfolio level, and automatically suppressed if the portfolio contains only one stock.

```mermaid
flowchart LR
    subgraph PrivateDatabase["Protected Database State"]
        H["Holding Record"]
        H --> Q["quantity = 150 shares"]
        H --> C["total_cost_paise = 37500000"]
        DP["Daily Closing Price = 275000 paise"]
    end

    subgraph SecurityBoundary["Server Projection Boundary"]
        Filter["Sanitization Filter: strips quantity and costs"]
        SingleCheck["Single Stock Gate: nullifies total if count <= 1"]
    end

    subgraph PublicView["Public Shared City View"]
        DTO["Allow listed Public DTO"]
        DTO --> SName["Company Name & Ticker"]
        DTO --> SSector["Sector Architectural Style"]
        DTO --> SPct["Position Gain: +10 percent (visual glow)"]
        DTO --> STotal["Aggregate Portfolio Total (multi stock only)"]
        DTO -.-> Blocked["Never sent: quantity, total cost, or individual rupee amounts"]
    end

    PrivateDatabase --> SecurityBoundary
    SecurityBoundary --> PublicView
```

## 4. Mathematical Valuation to 3D Scene Pipeline

The diagram below traces how exact financial numbers in integer paise (`bigint`) map into procedural 3D building geometries and neon visual shaders without floating point inaccuracies.

```mermaid
flowchart TD
    subgraph DataInputs["Domain Inputs"]
        InpQty["Share Quantity (whole integer)"]
        InpCost["Total Invested Cost in Paise (bigint)"]
        InpPrice["Latest Closing Price in Paise (bigint)"]
        InpSector["Company Sector Classification"]
    end

    subgraph ExactMath["Deterministic Financial Formulas (Integer Paise)"]
        InpQty & InpCost --> BuyPriceCalc["Average Buy Price = total_cost_paise / quantity"]
        InpQty & InpPrice --> MarketValCalc["Current Value = quantity * close_price_paise"]
        MarketValCalc & InpCost --> ProfitLossCalc["Profit or Loss = current_value - total_cost_paise"]
        ProfitLossCalc & InpCost --> PctCalc["Basis Points = (Profit or Loss * 10000) / total_cost_paise"]
    end

    subgraph Procedural3D["3D Visual Mapping (Presentation Layer Only)"]
        InpCost --> HeightCalc["Logarithmic Height Curve: min 2 units, max 30 units"]
        PctCalc --> GlowColorCalc["Neon Shader Glow: Green/Cyan profit, Red/Magenta loss, Blue neutral"]
        InpSector --> MeshStyle["Architectural Model: Glass tower, Refinery, Clinic, Factory"]
    end

    Procedural3D --> CityCanvas["Three.js Cyberpunk Scene with InstancedMesh Batching"]
```
