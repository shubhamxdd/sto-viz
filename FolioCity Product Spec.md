# FolioCity: Product Spec

Nov 3, 2026 · @Shubham

FolioCity turns an Indian stock portfolio into a neon, cyberpunk 3D city where each stock is a building, so profit and loss are easy to read and share. Version 1 is a web app that only visualizes: no buying, selling or live prices.

## Decisions so far

The owner has made the choices marked Decided. Anything marked Proposed or Open must not be built on until the owner confirms it (see Open questions at the end).

| Area | Choice | Status |
| --- | --- | --- |
| Name | FolioCity | Decided |
| Market | India only: NSE and BSE listed stocks | Decided |
| Instruments | Stocks only in v1. Mutual funds come later | Decided |
| Purpose | Visualize profit and loss so it looks cool and is easy to share. No buying, selling or paper trading | Decided |
| Platform | Web first. React Native (Expo) app later | Decided |
| Look | Cyberpunk 3D city: neon lights on a dark skyline | Decided |
| Rendering approach | Low-poly models with an isometric-style camera, for speed on cheaper phones | Proposed |
| Building meaning | One building per stock. Height = amount invested. Glow and colour = profit or loss %. Building style = sector | Decided |
| Holdings shown | Current holdings only. Sold stocks are not shown | Decided |
| Duplicate buys of one stock | Merged into one holding with a weighted average buy price | Decided |
| Profit display | Percentages by default. A toggle lets the user show rupee amounts | Decided |
| Import | Manual entry, a Groww CSV, and a generic CSV template. Direct broker login (Zerodha, Groww) comes later | Decided |
| Login | None at first. Prompt to sign in once a user has more than 3 stocks. Google and email with password. Data syncs to the cloud after sign-in | Decided |
| Storage before sign-in | Browser localStorage | Decided |
| Sharing | A share link, created only by signed-in users. Viewers can move around the city but cannot edit. Links are unlisted and the owner can delete them | Decided |
| Image export | A shareable image of the city | Open |
| Browsing other users' cities | Users can explore other users' cities manually | Open |
| Quality setting | The user can choose a quality level. A Low level exists for low and mid-range devices | Decided |
| Comparing cities | Not in v1. Data must be stored so it can be added later | Decided |
| Price data | Previous trading day's closing price, shown with an as-of date | Open |
| Front-end stack | React with Three.js (React Three Fiber), structured so it can move to React Native (Expo) later | Decided |
| Backend, database, sign-in provider | Not chosen | Open |
| Revenue | None for now | Decided |

## Users and core flow

The target user is an Indian retail investor who holds NSE or BSE stocks and wants a more fun, shareable view of how their portfolio is doing than a table of numbers. The app never asks for broker passwords in v1 and never places orders.

1. The user opens the site. No sign-in is needed.
2. They add holdings by typing them in or importing a CSV (see Portfolio input).
3. The app looks up each stock's latest closing price and builds the city: one building per holding.
4. The user moves around the city (rotate, zoom, tap a building to see its details). Percentages are shown by default.
5. The user can switch on rupee profit and loss, and change the quality level.
6. Holdings are kept in the browser (localStorage) until the user has more than 3 stocks. When they add the fourth, the app asks them to sign in, explaining that signing in saves the city to the cloud and unlocks sharing.
7. After signing in (Google, or email and password), the holdings sync to the user's account and are available on any device.
8. A signed-in user can create a share link. Anyone with the link can explore the city but not change it. The owner can delete the link at any time.

A user who declines the sign-in prompt can keep using the city with the holdings already entered. Whether they can add more stocks without signing in is not decided (see Open questions).

## Portfolio input

A holding is one stock, a quantity, and the price the user paid. Users can create holdings by hand or by CSV import.

### Manual entry

| Field | Rule |
| --- | --- |
| Stock | Searchable by company name or ticker symbol, chosen from a list of NSE and BSE listed stocks. Free text that matches no listed stock is rejected |
| Buy price | Rupees per share, greater than 0, up to 2 decimal places |
| Quantity | Whole number of shares, greater than 0 |

The user can edit or delete any holding after adding it. No buy date is collected in v1.

### Duplicate buys

If the same stock is entered more than once (by hand or in a CSV), the app merges the entries into one holding and uses the weighted average buy price. The user sees one building per stock.

```latex
\text{average buy price} = \frac{\sum (\text{quantity}_i \times \text{buy price}_i)}{\sum \text{quantity}_i}
```

### CSV import

The owner will supply a real Groww holdings export later. Until then the builder implements the generic template below and structures the importer so a Groww format can be added as a second parser without changing the rest of the app.

| Column | Meaning |
| --- | --- |
| symbol | Stock ticker as listed on the exchange |
| quantity | Whole number of shares |
| buy\_price | Average buy price per share, in rupees |

- The app offers a downloadable copy of this template.
- The first row must be the header. One row per holding; duplicates are merged as above.
- The user sees a preview before confirming the import. Rows that cannot be read (unknown symbol, bad number) are listed with the reason and are not imported; valid rows still import.
- Importing adds to the existing holdings. Whether it can instead replace them is not decided.

### Numbers the app shows

```latex
\begin{aligned}
\text{invested} &= \text{quantity} \times \text{average buy price} \\
\text{current value} &= \text{quantity} \times \text{latest closing price} \\
\text{profit or loss} &= \text{current value} - \text{invested} \\
\text{profit or loss \%} &= \frac{\text{profit or loss}}{\text{invested}} \times 100
\end{aligned}
```

The same four figures are computed for the whole portfolio by adding up all holdings.

## City rules

Every visual property of a building carries data, so the city is a readable chart and not decoration. The overall style is a dark, rainy cyberpunk skyline lit by neon.

### How a holding becomes a building

| Property | Driven by | Rule | Status |
| --- | --- | --- | --- |
| Height | Amount invested (quantity x average buy price) | Taller means more money in that stock. A minimum height keeps tiny holdings visible and a maximum height stops one large holding from hiding the rest. The exact scaling curve and limits are for the builder to propose and the owner to approve | Decided: driver. Open: curve |
| Glow and colour | Profit or loss % | Profit glows green or cyan, loss glows red or magenta, near zero is a dim neutral blue. Intensity grows with the size of the move up to a cap. The cap and the exact colours are not set | Decided: driver. Open: values |
| Building style | Sector | Each sector has its own look so a viewer can tell banks from IT from energy. Unknown sector uses a generic building | Decided: driver. Open: sector list and data source |
| Footprint | Fixed | Every building sits on the same size plot in v1 | Proposed |
| Name sign | Ticker symbol | Shown on or above each building | Proposed |

### Proposed sector styles

The sector list below is a starting point for the owner to approve. The builder must still choose where sector data comes from (see Open questions).

| Sector | Style idea |
| --- | --- |
| IT and technology | Glass towers with screens |
| Banks and financial services | Stone and steel with large signage |
| Oil, gas and energy | Refinery-style tanks and chimneys |
| Pharma and healthcare | Clean white block with a cross light |
| Automobiles | Low wide factory sheds |
| FMCG and consumer | Mall and market blocks |
| Metals and mining | Heavy industrial stacks |
| Real estate and infrastructure | Cranes and half-built frames |
| Telecom and media | Antenna masts |
| Other or unknown | Plain generic block |

### Layout and scene

How buildings are arranged (for example grouped into sector districts, largest first) is Proposed, not decided. Around them: roads, fog, rain and ambient neon signs. All of these must be switchable off for the Low quality level.

### Interaction

- Orbit, zoom and pan with mouse, trackpad and touch. The camera is limited so the user cannot lose the city.
- Tapping or clicking a building opens a panel: stock name, quantity, average buy price, latest closing price, profit or loss %, and share of the portfolio. Rupee amounts appear only when the user has switched them on.
- A portfolio summary shows total profit or loss % (and in rupees when switched on) and the as-of date of the prices.
- A toggle switches between percentages only and percentages with rupee amounts.
- Colour must not be the only signal: the panel always shows the number, and profit or loss buildings also differ in animation (steady glow versus a slow flicker). This is Proposed.

### Quality levels

The user can choose a quality level in settings. The Low level exists for low and mid-range phones.

| Level | Intended effect |
| --- | --- |
| High | Full lighting, glow effects, rain and fog, full-detail models |
| Medium | Reduced effects and particles |
| Low | No post-processing, no rain or fog, simplified models, reduced render resolution and frame rate cap |

Whether the app picks a level automatically on first visit and what frame rate Low must reach on a mid-range Android phone are Proposed (automatic choice, 30 frames per second target) and need owner confirmation.

## Price data

Version 1 values every holding at the previous trading day's closing price and shows an "as of" date next to every total. There are no live prices. The owner also asked about a 10-minute delayed price while the market is open; that is held back from v1 and listed under Open questions.

### How prices reach the app

1. A scheduled job runs once each trading day after the market closes.
2. It fetches closing prices and saves them in FolioCity's own database.
3. The app reads prices only from that database. User browsers never call a data provider directly.

This keeps cost flat as users grow (one fetch per stock per day, shared by everyone) and means a provider change does not break the app.

### Source options

The source is not chosen. The builder should check the terms and cost of each before picking one.

| Option | Notes |
| --- | --- |
| Official NSE and BSE end-of-day files ("bhavcopy") | Free, published by the exchanges, daily closing data. The builder parses the files. Best fit for a closing-price v1 |
| A paid or freemium market data API (for example EODHD, Tapetide or IndianAPI) | Supported and more stable, with a monthly cost and call limits. Terms and Indian coverage must be checked |
| Yahoo Finance through unofficial libraries | Fast for a prototype but unofficial, can stop working without notice, and is not licensed for a public commercial product. Prototype only |

### Rules

- **Stock list:** the app needs a list of listed stocks with ticker, company name and exchange for search. It should refresh regularly so new listings appear. Source: not chosen.
- **Stocks on both exchanges:** which exchange's price is used is not decided. Proposed: NSE.
- **Holidays and weekends:** show the most recent close and its date.
- **Stale data:** if the latest price is older than one trading day, show a visible warning. Proposed.
- **Price missing** (suspended, delisted or new listing): show the building in neutral grey labelled "price unavailable" and leave it out of totals. Proposed.
- **Splits, bonuses and other corporate actions:** v1 does not adjust the user's entered buy price or quantity. A user who bought before a split will see a wrong profit or loss unless they edit the holding. The owner must confirm this is acceptable for v1.

## Accounts, sync and sharing

### Accounts and sync

- **Sign-in methods:** Google, and email with password.
- **When the prompt appears:** when the user adds a fourth stock. Until then holdings live only in the browser's localStorage.
- **After sign-in:** holdings are stored against the account and sync across devices. Holdings already in localStorage are moved into the account.
- **Proposed, not decided:** email verification and password reset are included; when the same holding is edited on two devices the latest edit wins; a user can delete their account and all stored data. The owner and builder should confirm these, including any Indian legal requirements for personal data.
- **If the account already has holdings** when someone signs in with different holdings in localStorage, what happens is not decided (see Open questions).

### Share links

| Rule | Detail | Status |
| --- | --- | --- |
| Who can create one | Signed-in users only | Decided |
| Who can open one | Anyone with the link | Decided |
| Visibility | Unlisted: the address is long and hard to guess, not listed anywhere in the app, and hidden from search engines | Decided |
| Viewer abilities | Rotate, zoom and tap buildings. No editing of any kind | Decided |
| Deleting | The owner can delete the link at any time and it stops working immediately | Decided |
| Amounts on a shared city | Percentages by default. The owner chooses, per link, whether rupee amounts are included | Proposed |
| What a viewer sees on tapping a building | Stock name and profit or loss % only. Never quantity or buy price | Proposed |
| Viewer needs an account | No | Proposed |
| Number of links per user | One active link per user, which can be deleted and recreated | Proposed |
| Snapshot or live | Not decided: does the link show the city as it was when shared, or the owner's current city | Open |

### Image and browsing other cities

The owner's notes mention a shareable image and also say "instead of image, share link and explore users city manually". It is not clear whether the image export stays in v1, and what "explore users city manually" means. These two points are listed under Open questions and must be answered before the builder works on them. Comparing two cities side by side is not part of v1.

## Screens and v1 feature list

The web app must work in a desktop browser and in a phone browser. Layout details and visual design of the screens are not specified here and need a design pass.

| Screen | What it holds |
| --- | --- |
| City | The 3D city, portfolio summary with as-of date, the percent and amount toggle, and entry points to add holdings, import, settings and sharing |
| Empty city | Shown when there are no holdings: an empty plot and a prompt to add a stock or import a CSV |
| Add or edit holding | Stock search, buy price, quantity, save and delete |
| CSV import | Template download, file upload, preview with errors, confirm |
| Holding panel | Details for the tapped building |
| Settings | Quality level, show rupee amounts, account |
| Sign-in | Google and email with password, shown when the user adds a fourth stock or chooses to sign in |
| Share management | Create, copy and delete the share link; choose whether amounts are included |
| Shared city | Read-only city opened from a link, with no edit controls |

### Version 1 is done when

- [ ] A new visitor can add stocks by hand and see a city without signing in
- [ ] Adding a fourth stock prompts sign-in, and holdings survive the sign-in
- [ ] The generic CSV template imports correctly, with a preview and clear errors
- [ ] Duplicate entries merge with the correct weighted average buy price
- [ ] Every building's height, glow and style follow the City rules
- [ ] Prices come from the stored daily closing data, with the as-of date visible
- [ ] The percent and amount toggle works everywhere, including shared cities
- [ ] The Low quality level runs smoothly on a mid-range Android phone in a mobile browser
- [ ] A signed-in user can create, open in a private window, and delete a share link, and the viewer cannot edit anything
- [ ] The app clearly states it is for visualization only and does not give investment advice

## Tech and architecture

&#91;embedded content: FolioCity architecture · 7 parts, price data flows one way into the database\]

A daily job saves closing prices into FolioCity's database. The web app and the shared city viewer read from that database through the backend, and never call the price source directly. Before sign-in, holdings stay in the browser only.

### What is decided and what is not

- **Front end (decided):** React with Three.js through React Three Fiber, for the web. Write the code so the city logic can move to React Native (Expo) later.
- **Backend, database, sign-in provider, hosting (not chosen):** see Open questions. The builder recommends and the owner approves.
- **Price source (not chosen):** see Price data.
- **Performance (required):** the Low quality level must run on low and mid-range phones. Test on a real mid-range Android phone early, not only on a desktop.
- **Security (required):** shared links are unlisted and deletable; viewers never receive edit access or another user's buy prices or quantities; the app never asks for broker passwords in v1.

## Out of scope for v1, and later

None of the following is built in v1.

- Buying, selling, paper trading or any connection to placing orders
- Live or intraday prices
- Direct import from broker accounts (Zerodha, Groww) by logging in
- Mutual funds
- Comparing cities or leaderboards
- A React Native (Expo) mobile app
- Showing sold stocks or realized profit
- Markets outside India
- Ads, subscriptions or any payments

The owner plans to add mutual funds, broker import, city comparison and the mobile app later. The order has not been decided.

### Build so these stay possible

- Store each holding with an instrument type, so mutual funds can be added without rebuilding the data model.
- Keep the logic that turns holdings into building data (heights, colours, styles) separate from the web page code, so the same logic can be reused in a React Native app.
- Store cities per user so two of them can be compared later.
- Keep the CSV importer pluggable so a broker-specific format is one more parser.

## Open questions

The owner must answer these before the builder starts the parts they affect. A proposed answer is given where one exists; it is not a decision until the owner confirms it.

| # | Question | Proposed answer |
| --- | --- | --- |
| 1 | Should v1 show only the previous close, or also a roughly 10-minute delayed price while the market is open? Delayed intraday data needs a licensed or paid source, and exchange rules on redistributing it must be checked | Previous close only in v1; delayed prices later |
| 2 | Does v1 include a downloadable image of the city, or only the share link? | Not decided |
| 3 | What does "explore users' cities manually" mean: opening someone's city only through their link, or browsing and searching other users inside the app? The second needs public profiles and conflicts with unlisted links | Links only |
| 4 | Does a share link show the city frozen at the moment of sharing, or the owner's current city? | Not decided |
| 5 | When someone signs in and their account already holds different holdings from the ones in localStorage, do we merge them, ask which to keep, or replace? | Ask the user |
| 6 | Can a user dismiss the sign-in prompt and keep adding stocks without an account? | Not decided |
| 7 | Are ETFs listed on NSE or BSE counted as stocks in v1? | Not decided |
| 8 | Which exchange's price is used when a stock trades on both NSE and BSE? | NSE |
| 9 | Which backend, database, sign-in provider and hosting? Is there a budget limit, and should the builder choose? | Builder recommends, owner approves |
| 10 | Where does sector data come from, and is the proposed sector list approved? | Not decided |
| 11 | Height curve and limits, glow cap, colour palette, and the maximum number of holdings the city must handle | Builder proposes, owner approves |
| 12 | Does a CSV import add to existing holdings or can it replace them? When will the Groww sample file be supplied? | Add; sample from owner |
| 13 | Is it acceptable in v1 that splits and bonus issues are not adjusted? | Yes, with a visible note |
| 14 | Are email verification, password reset and account deletion included, and what data-protection rules apply to storing users' holdings? | Include all three; builder to check rules |
| 15 | What disclaimer text is shown, and has anyone checked whether any regulation applies to showing prices and portfolio views? | "Visualization only, not investment advice"; owner to check regulation |
| 16 | Who makes the 3D buildings: generated in code, or modelled by an artist? This drives cost and timeline | Not decided |
| 17 | Has the name FolioCity been checked for domain and trademark availability? | Not checked |
