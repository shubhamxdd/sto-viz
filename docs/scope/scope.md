# Scope: FolioCity

FolioCity turns an Indian stock portfolio into a cyberpunk 3D city where each stock is a building, making profit and loss visual and simple to share. Version 1 is a web application focusing on visualization without trading or live intraday data.

**Build approach:** Skateboard (ship the thinnest usable whole first, then grow it).
**Workflow:** Beta (/check verify, then /test). The project default level of rigor. /architect is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. · GA) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack and architecture | Foundation | done |
| 2 | Coding standards and tooling | Foundation | done |
| 3 | Data model | Foundation | done |
| 4 | Design system and 3D canvas | Foundation | in-progress |
| 5 | Manual portfolio entry | Release 1 | planned |
| 6 | Procedural 3D city visualizer | Release 1 | planned |
| 7 | City interaction and holding details | Release 1 | planned |
| 8 | Curated demo cities | Release 1 | planned |
| 9 | CSV holdings import | Release 2 | planned |
| 10 | Accounts and cloud sync | Release 2 | planned |
| 11 | Exchange Bhavcopy price pipeline | Release 3 | planned |
| 12 | Price freshness and market indicators | Release 3 | planned |
| 13 | Unlisted share links | Release 4 | planned |
| 14 | Read only shared city view | Release 4 | planned |
| 15 | High resolution image export | Release 4 | planned |
| 16 | Legal terms and analytics | Release 4 | planned |

## Foundations

### 1. Stack and architecture · done
Decide the web application stack, 3D rendering setup, backend service, and database, then scaffold a runnable project so every later slice builds on real structure.
**Done when:** the stack choices are recorded in a spec, and the scaffolded project runs locally and passes build checks.
- [x] Decide the stack (spec): `/architect stack and architecture`
- [x] Scaffold from the decision: `/develop stack and architecture`
- [x] Smoke check it runs: `/test`
Spec [0001](../specs/0001-stack-and-architecture/index.md) · code in src/

### 2. Coding standards and tooling · done
Capture conventions, then install lint, format, and pre-commit enforcement from the real scaffolded project.
**Done when:** root AGENTS.md reflects the real stack, and lint and format checks run clean.
- [x] Capture conventions and tooling choices: `/audit`

### 3. Data model · done
Core entities every feature builds on: stocks, holdings, daily prices, user accounts, and share links.
**Done when:** schemas, relationships, and validation rules support browser storage and cloud persistence without breaking migrations.
- [x] Design it (spec): `/architect data model`
- [x] Build it: `/develop data model`
  - [x] Domain entities and mathematical valuation services (AC-2, AC-3, AC-5)
  - [x] Relational Drizzle schema with foreign keys and check constraints (AC-1, AC-4, AC-6)
  - [x] Database migration and initial security seed script (AC-1, AC-6)
  - [x] Guest storage synchronization and share link projection filter (AC-7, AC-8)
- [x] Verify it: `/check verify data model`
- [x] Test it: `/test data model`
Spec [0002](../specs/0002-data-model.md) · code in src/domain/ and src/infrastructure/db/schema/

### 4. Design system and 3D canvas · in-progress
Visual theme, dark palette, typography, responsive 3D viewport canvas, camera controls, and quality level switches.
**Done when:** design guidelines cover color and typography, the 3D viewport renders smoothly with touch and mouse camera orbit, and quality presets adjust visual effects without errors.
- [x] Design it (spec): `/architect design system and 3D canvas`
- [x] Build it: `/develop design system and 3D canvas`
  - [x] Cyberpunk design tokens, color palette, and typography (AC-1)
  - [x] Persistent canvas state store with quality presets (AC-6)
  - [x] Responsive 3D viewport canvas with Three.js and R3F (AC-2)
  - [x] Constrained camera orbit controls with damping and touch support (AC-3)
  - [x] Cyberpunk atmosphere, night lighting, distance fog, and floor grid (AC-4)
  - [x] Selective bloom postprocessing conditional on quality preset (AC-5)
  - [x] Glassmorphism HUD overlay with non-blocking pointer events (AC-7)
- [x] Verify it: `/check verify design system and 3D canvas`
- [ ] Test it: `/test design system and 3D canvas`
Spec [0003](../specs/0003-design-system-and-3d-canvas/index.md) · code in src/presentation/ and src/app/

## Release 1: Local 3D city (skateboard)

### 5. Manual portfolio entry · needs a decision
Searchable NSE and BSE stock catalog, manual entry of buy price and quantity, editing and deletion, and automatic merging of duplicate purchases.
**Done when:** visitors can search listed stocks, save holdings to browser local storage, and see duplicate purchases merged with weighted average buy prices.
- [ ] Design it (spec): `/architect manual portfolio entry`

### 6. Procedural 3D city visualizer · needs a decision
Generate a cyberpunk skyline where building height scales with invested money, neon glow reflects profit or loss percentage, and building style reflects company sector.
**Done when:** each holding renders as a distinct procedural 3D building matching its sector style, with height reflecting invested capital and neon shaders signaling profit or loss.
- [ ] Design it (spec): `/architect procedural 3D city visualizer`

### 7. City interaction and holding details
Building selection, detailed information panel, total portfolio summary, and a toggle between percentage only and rupee amounts.
**Done when:** selecting a building displays its performance details, the total portfolio summary reflects current values, and the amount toggle switches between percentage only and rupee values.
- [ ] Build it: `/develop city interaction and holding details`

### 8. Curated demo cities
Sample portfolios that let first time visitors explore the 3D city instantly without typing their own stocks.
**Done when:** visitors can choose from sample portfolios on the empty city screen and immediately tour populated 3D cities.
- [ ] Build it: `/develop curated demo cities`

## Release 2: Import and cloud sync

### 9. CSV holdings import · needs a decision
Downloadable CSV template, file upload parser, row validation with error reporting, duplicate merging, and an optional replace existing holdings toggle.
**Done when:** users can download the template, upload a CSV, review errors for unknown tickers or bad numbers, and choose whether to append to or replace existing holdings.
- [ ] Design it (spec): `/architect CSV holdings import`

### 10. Accounts and cloud sync · needs a decision · GA
User authentication with Google and email with password, soft prompt upon adding a fourth stock, and cloud synchronization with conflict resolution.
**Done when:** adding a fourth stock shows a dismissible sign in prompt, authenticated accounts sync holdings across devices, and conflicts offer the user a clear choice to merge or replace.
- [ ] Design it (spec): `/architect accounts and cloud sync`

## Release 3: Daily market price engine

### 11. Exchange Bhavcopy price pipeline · needs a decision
Automated daily background job to download official NSE Bhavcopy files after market close and populate closing prices in the application database.
**Done when:** a scheduled job parses daily Bhavcopy closing data, stores closing prices reliably, and handles weekends and market holidays cleanly.
- [ ] Design it (spec): `/architect exchange Bhavcopy price pipeline`

### 12. Price freshness and market indicators
Surface price as of dates, highlight stale prices older than one trading day, and display unpriced stocks in neutral tones.
**Done when:** the city displays the price as of date on totals, shows a visible warning when data is stale, and renders unpriced stocks in neutral grey marked price unavailable.
- [ ] Build it: `/develop price freshness and market indicators`

## Release 4: Sharing and showcase

### 13. Unlisted share links · needs a decision · GA
Create unlisted, deletable links for sharing cities, with options for live updates versus frozen snapshots and optional rupee amount visibility.
**Done when:** signed in users can create unlisted links, choose whether the link updates or freezes, toggle rupee visibility, and delete links at any time to revoke access.
- [ ] Design it (spec): `/architect unlisted share links`

### 14. Read only shared city view
Dedicated public viewer displaying an unlisted shared city with full 3D camera controls and stock detail panels while preventing edits and hiding sensitive quantities.
**Done when:** viewers opening a link can explore the 3D city and see stock percentage gains, without edit controls and without exposing buy prices or share counts.
- [ ] Build it: `/develop read only shared city view`

### 15. High resolution image export · needs a decision
Capture and download a crisp, branded screenshot of the cyberpunk city for sharing on social platforms.
**Done when:** users can trigger an image export that renders a high resolution snapshot of their current city view with portfolio summary watermarks.
- [ ] Design it (spec): `/architect high resolution image export`

### 16. Legal terms and analytics
Investment disclaimer, terms of service, privacy policy, and privacy respectful analytics to detect 3D rendering crashes.
**Done when:** clear disclaimers state the application is for visualization only, legal pages are accessible, and client WebGL crashes report to error tracking.
- [ ] Build it: `/develop legal terms and analytics`

## Deferred
Out of scope for this version, kept so the plan stays honest.
- **Broker direct logins**: Zerodha and Groww API authentication · needs a decision
- **Mutual funds and ETFs**: support for funds and pooled instruments · needs a decision
- **Mobile native application**: React Native Expo build · needs a decision
- **Intraday delayed pricing**: ten minute delayed prices during market hours · needs a decision
- **City comparison and leaderboards**: compare portfolios side by side · needs a decision
- **Realized profit and loss**: track sold holdings and historical tax lots · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack and architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards and tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
