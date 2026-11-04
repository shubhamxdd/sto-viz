# 0001. Stack and Architecture for FolioCity

**Date**: 2026-11-04
**Status**: In Progress

## Summary

This document establishes the foundational technology stack and system architecture for FolioCity. The product runs as a full stack Next.js TypeScript application packaged with Docker Compose for self hosting, pairing React Three Fiber for procedural cyberpunk 3D rendering with PostgreSQL and Drizzle ORM for data storage. Better Auth provides self hosted authentication and account sync, while a scheduled ingestion worker handles official exchange Bhavcopy closing files after market hours.

## Context

FolioCity visualizes Indian stock portfolios (NSE and BSE listed equities) as a neon cyberpunk 3D cityscape where building height reflects invested capital, glow color signals profit or loss percentage, and building style reflects company sector. The application serves Indian retail investors who want an engaging visual overview of their holdings without trading features or live intraday data streams.

Several architectural forces shape this foundation:
First, rendering performance on mobile browsers is critical. A large share of Indian retail investors access web applications through budget or mid range Android phones. The 3D canvas must render smoothly at thirty frames per second on entry devices without draining battery or crashing the browser WebGL context (the browser interface for hardware accelerated 3D graphics).
Second, the user experience starts with zero barriers. First time visitors must be able to explore the 3D city immediately without signing in, storing holdings in browser local storage for up to three stocks. When adding a fourth stock, a gentle sign in prompt encourages saving to the cloud, moving local records into a persistent account.
Third, market data needs must remain simple, dependable, and free. Stock valuations use the previous trading day closing price. Directly calling market data APIs from client browsers adds vendor lock and ballooning API costs as user counts grow. Ingesting daily Bhavcopy files (daily closing summary files published by the National Stock Exchange) once per day keeps operational costs flat.
Finally, operational control and self hosting simplicity are paramount. The stack must deploy cleanly via Docker Compose on standard virtual private servers without reliance on proprietary hosted clouds.

## Scope and domain boundaries

This foundational specification settles the runtime environment, framework, persistence layer, container topology, and deployment mechanisms. Specific domain behaviors belong to their dedicated downstream specifications on the roadmap:
- Data model and domain contracts (Feature 3, spec 0002): defines canonical stock entities, ISIN and ticker normalization, portfolio math formulas, Better Auth user ownership, and local storage to account migration rules.
- Design system and 3D canvas (Feature 4, spec 0003): defines mobile polygon and draw call budgets, quality level thresholds, device pixel ratio caps, and 2D fallback views for devices with disabled or lost WebGL contexts.
- Exchange price pipeline (Feature 11, spec 0005): defines daily NSE and BSE file ingestion contracts, market holiday schedules, parsing edge cases, retry backoffs, and stale data indicators.

## Options considered

### Option 1: Next.js App Router with Drizzle, Better Auth, and Docker Compose

A unified TypeScript full stack application running Next.js App Router in standalone container output mode. React Three Fiber components load on the client with dynamic imports to avoid server rendering conflicts. Drizzle ORM provides lightweight type safe database access over PostgreSQL. Better Auth runs embedded in Next.js route handlers, storing sessions in PostgreSQL without external dependencies. A dedicated worker container within Docker Compose executes daily market ingestion and writes closing prices directly to PostgreSQL across the private internal network.

**Pros**:
- Single language and unified codebase for frontend pages, 3D viewport wrappers, and backend API handlers
- Server rendering available for public marketing pages and Open Graph social cards for shared city links
- Complete data privacy and zero ongoing vendor software fees through self hosted PostgreSQL and Better Auth
- Drizzle ORM incurs near zero runtime overhead and generates lean SQL queries
- Internal worker container keeps database traffic private without exposing public ingestion webhooks

**Cons**:
- Next.js Server Components require explicit client boundaries and dynamic imports with server rendering disabled for all Three.js canvas components
- Self hosting a persistent database container requires automated volume backups and host maintenance

### Option 2: Vite React SPA with Standalone Fastify API and Prisma

A decoupled architecture featuring a pure client side Single Page Application built with Vite and React Three Fiber, talking over REST to a standalone Node.js Fastify API server with Prisma ORM.

**Pros**:
- Zero server hydration friction because the Vite client runs entirely in the browser
- Sub millisecond hot module reloading during 3D shader and camera tweaking
- Clean separation between frontend assets and backend service processes

**Cons**:
- Two separate codebases, lint configurations, and deployment pipelines to operate
- Poor search engine optimization and awkward social sharing previews because the single page application lacks server rendered meta tags for shared city links
- Prisma query engine adds higher memory overhead in resource constrained container environments

### Option 3: Hosted Serverless Stack on Vercel with Neon and Clerk

A fully managed serverless deployment hosting Next.js on Vercel, serverless PostgreSQL on Neon, and managed user identity via Clerk.

**Pros**:
- Zero server administration or container management
- Automated global edge caching for static assets

**Cons**:
- Conflicts directly with the requirement to self host the deployment
- Monthly subscription costs escalate quickly with user growth and database connection pooling
- Serverless function execution limits create reliability risks during large daily Bhavcopy CSV parsing jobs

## Decision

**Chosen option**: Option 1: Next.js App Router with Drizzle, Better Auth, and Docker Compose

FolioCity will build on a unified Next.js App Router codebase in TypeScript, rendering 3D scenes via React Three Fiber with instanced mesh batching, persisting data in self hosted PostgreSQL via Drizzle ORM, authenticating users with Better Auth, and executing scheduled market closing ingestion through an internal container worker. (basis: unified full stack architecture reduces deployment complexity while preserving server rendered social previews)

## Rationale

Option 1 provides the best balance of developer velocity, operational independence, and runtime efficiency.

Using Next.js App Router allows FolioCity to serve both interactive 3D client experiences and rich server rendered preview cards for shared city links. While WebGL cannot run on the server, Next.js dynamic imports with server rendering disabled cleanly isolate the 3D canvas to the browser, while outer page shells and meta tags render on the server for social platforms.

Better Auth runs directly inside the Next.js process, storing credentials and sessions in the primary PostgreSQL database. This eliminates external authentication services while giving complete control over user data and migration paths.

Drizzle ORM was chosen over Prisma due to its minimal runtime footprint and predictable SQL generation. When processing daily closing records for thousands of NSE tickers, Drizzle enables efficient batch inserts and conflict upserts without heavy engine overhead.

Packaging the application via Docker Compose satisfies the self hosting requirement. Running an internal worker container within the Compose network allows scheduled Bhavcopy downloads to write closing records directly into PostgreSQL without exposing authenticated public webhook endpoints.

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript 5+ | End to end type safety across database schemas, API contracts, and 3D scene parameters |
| Web framework | Next.js App Router | Unified full stack framework supporting server rendered social sharing tags and API handlers |
| 3D graphics engine | React Three Fiber and Three.js | Declarative 3D component model in React with seamless state binding (basis: React Three Fiber component ecosystem) |
| 3D performance | Three.js InstancedMesh | Batches procedural buildings into single draw calls to maintain thirty frames per second on mobile devices (basis: draw call batching for mobile WebGL) |
| Database | PostgreSQL 16 | Mature relational engine with ACID guarantees, JSON support, and robust indexing |
| ORM and query layer | Drizzle ORM | Zero overhead type safe queries with first class batch insert capabilities |
| Authentication | Better Auth | Self hosted authentication library running inside Next.js routes with full database schema control |
| Client state | Zustand with persist middleware | Lightweight store bridging browser local storage to Three.js render loops without re render cascades |
| UI components and styling | Tailwind CSS with shadcn/ui | Utility first CSS with accessible Radix UI primitives for dialogs, popovers, and theme toggles |
| Market data pipeline | Scheduled container worker | Internal Node worker running cron inside Docker Compose, keeping database writes private |
| Deployment | Docker Compose with Caddy | Multi container packaging with automatic HTTPS, non root execution, and named volume persistence |

## Production deployment topology

The production deployment runs via Docker Compose on any standard Linux host:
1. `app`: Built from a multi stage Dockerfile (base, dependencies, builder, runner) using Next.js standalone output. Runs as non root user `nextjs:nodejs` on internal port 3000. Health check probes `http://localhost:3000/api/health`.
2. `db`: Official `postgres:16-alpine` image with health check `pg_isready -U foliouser`. Data persists in named volume `postgres_data`. Database credentials inject via environment files not committed to version control.
3. `proxy`: Caddy 2 reverse proxy handling automatic HTTPS Let's Encrypt certificates, routing public traffic to `app:3000` with HTTP/2 and gzip or zstd compression.
4. `worker`: Lightweight container running daily market data sync jobs at 18:30 IST on trading days. Connects to `db:5432` across the private internal bridge network with zero public port exposure.

## Database migration strategy

Schema migrations follow strict version control and deploy time separation:
1. Schema files live in `src/db/schema/` in TypeScript.
2. Changes generate versioned SQL migration files in `drizzle/` via `drizzle-kit generate`.
3. Migrations execute as a dedicated one shot release step prior to updating the application container: `drizzle-kit migrate`. Application containers never mutate database schema on startup.
4. All schema migrations must be backward compatible (additive columns and non breaking changes) to permit seamless rollouts without downtime.

## Consequences

**Positive**:
- Self hosted architecture eliminates recurring third party platform charges
- Single TypeScript repository simplifies code sharing between database models, validation rules, and client views
- Dynamic imports isolate 3D WebGL code while allowing search engines and social platforms to read server rendered metadata for shared cities
- Instanced mesh rendering drastically cuts WebGL draw calls, ensuring low tier mobile phones run smoothly
- Internal container worker keeps market price ingestion private and immune to public webhook attacks

**Negative / tradeoffs**:
- Next.js Server Components require discipline to separate interactive 3D client components from server code
- The development team is responsible for managing database backups, container updates, and server security
- NSE Bhavcopy downloads depend on external exchange server availability and required browser request headers

**Neutral**:
- Initial project scaffolding must configure standalone output mode, multi stage Dockerfile, and Docker Compose volume mappings
- Local development requires running a local PostgreSQL instance or Docker container

## Follow-up

- [ ] Configure `next.config.js` with `output: 'standalone'` for lean container packaging
- [ ] Create multi stage `Dockerfile` with non root user execution
- [ ] Create `docker-compose.yml` defining application, PostgreSQL, Caddy, and worker services
- [ ] Set up automated database backup script with daily snapshot dumps to off host storage
- [ ] Create migration runner script in `package.json` for one shot deployment execution

## References

### Project sources
- `FolioCity Product Spec.md`: specifications for India market focus, 3D building rules, local storage entry, and Bhavcopy ingestion
- `docs/scope/scope.md`: feature roadmap establishing the Skateboard build approach and Beta workflow rigor

### Practices & standards
- Draw call batching for mobile WebGL: instancing geometries with shared materials to minimize CPU to GPU state changes
- Unified full stack architecture: co locating API routes and client presentation in one deployable unit to avoid distributed system latency
- Browser header emulation for exchange archives: supplying standard User-Agent headers when accessing public market data files
- One shot release migrations: running database migrations in an isolated pre deploy container rather than application boot

### Links
- [Vite vs Next.js for WebGL and React Three Fiber](https://dev.to): comparative analysis of client runtime requirements and server rendering boundaries
- [NSE India Bhavcopy Archives Guide](https://nsearchives.nseindia.com): official file patterns for daily security closing CSV files
