# FolioCity Data Model and Architectural Diagrams

## 1. Entity Relationship Diagram

The diagram below illustrates the relational schema modeled in Drizzle ORM. Canonical securities are separated from exchange listings to support dual listed stocks across NSE and BSE, while holdings store cumulative cost to prevent weighted average drift.

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
        varchar isin UK "12 char unique ISIN"
        varchar company_name
        varchar sector "10 archetype categories"
        timestamptz created_at
        timestamptz updated_at
    }

    LISTINGS {
        uuid id PK
        uuid security_id FK
        varchar exchange "NSE or BSE"
        varchar symbol "Ticker symbol"
        boolean is_primary "At most one primary per security"
        boolean is_active
        timestamptz created_at
    }

    DAILY_PRICES {
        uuid id PK
        uuid listing_id FK
        date price_date "Bhavcopy trading date"
        numeric close_price "Closing price"
        numeric previous_close
        numeric change_percent
        bigint volume
        varchar source "NSE_BHAVCOPY or BSE_BHAVCOPY"
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
        numeric total_cost "Cumulative invested rupees > 0"
        timestamptz created_at
        timestamptz updated_at
    }

    SHARE_LINKS {
        uuid id PK
        uuid portfolio_id FK
        varchar token UK "64 hex char token"
        varchar mode "live or snapshot"
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
    PromptConflict -- Merge --> MergeHoldings["Merge holdings: combine quantities and sum cumulative costs"]
    PromptConflict -- Replace --> ReplaceHoldings["Transactional replacement: replace cloud holdings with incoming browser holdings"]
    DirectMigration --> SyncDone["Clear browser storage and switch to cloud sync"]
    MergeHoldings --> SyncDone
    ReplaceHoldings --> SyncDone
    SyncDone --> RenderCity["Render synchronized 3D city"]
```

## 3. Public Sharing Privacy Projection Boundary

To prevent viewers from discovering private holding sizes by dividing market values by public closing prices, individual holding rupee values and share counts are stripped at the server projection boundary.

```mermaid
flowchart LR
    subgraph PrivateDatabase["Protected Database State"]
        H["Holding Record"]
        H --> Q["quantity = 150 shares"]
        H --> C["total_cost = Rs 3,75,000"]
        DP["Daily Closing Price = Rs 2,750"]
    end

    subgraph SecurityBoundary["Server Projection Boundary"]
        Filter["Sanitization Filter: strips quantity and costs"]
    end

    subgraph PublicView["Public Shared City View"]
        DTO["Allow listed Public DTO"]
        DTO --> SName["Company Name & Ticker"]
        DTO --> SSector["Sector Architectural Style"]
        DTO --> SPct["Position Gain: +10 percent"]
        DTO --> STotal["Optional Total Portfolio Sum (if opted in)"]
        DTO -.-> Blocked["Never sent: quantity, total cost, or individual rupee amounts"]
    end

    PrivateDatabase --> SecurityBoundary
    SecurityBoundary --> PublicView
```

## 4. Mathematical Valuation to 3D Scene Pipeline

The diagram below traces how exact financial numbers map into procedural 3D building geometries and neon visual shaders without floating point inaccuracies.

```mermaid
flowchart TD
    subgraph DataInputs["Domain Inputs"]
        InpQty["Share Quantity (whole integer)"]
        InpCost["Total Invested Cost (rupees)"]
        InpPrice["Latest Closing Price (from Bhavcopy)"]
        InpSector["Company Sector Classification"]
    end

    subgraph ExactMath["Deterministic Financial Formulas"]
        InpQty & InpCost --> BuyPriceCalc["Average Buy Price = total_cost / quantity"]
        InpQty & InpPrice --> MarketValCalc["Current Value = quantity * latest_close_price"]
        MarketValCalc & InpCost --> ProfitLossCalc["Profit or Loss = current_value - total_cost"]
        ProfitLossCalc & InpCost --> PctCalc["Gain or Loss Pct = (Profit or Loss / total_cost) * 100"]
    end

    subgraph Procedural3D["3D Visual Mapping"]
        InpCost --> HeightCalc["Logarithmic Height Curve: min 2 units, max 30 units"]
        PctCalc --> GlowColorCalc["Neon Shader Glow: Green/Cyan profit, Red/Magenta loss, Blue neutral"]
        InpSector --> MeshStyle["Architectural Model: Glass tower, Refinery, Clinic, Factory"]
    end

    Procedural3D --> CityCanvas["Three.js Cyberpunk Scene with InstancedMesh Batching"]
```
