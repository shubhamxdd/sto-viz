# 0001. Stack and Architecture for FolioCity

**Date**: 2026-11-04
**Status**: Accepted

## Summary

This document establishes the foundational technology stack and system architecture for FolioCity. The product runs as a full stack Next.js TypeScript application packaged with Docker Compose for self hosting, pairing React Three Fiber for procedural cyberpunk 3D rendering with PostgreSQL and Drizzle ORM for data storage. Better Auth provides self hosted authentication and account sync, while a scheduled ingestion worker handles official exchange Bhavcopy closing files after market hours.

## Scope and domain boundaries

This foundational specification settles the runtime environment, framework, persistence layer, container topology, and deployment mechanisms. Specific domain behaviors belong to their dedicated downstream specifications on the roadmap:
- Data model and domain contracts (Feature 3, spec 0002): defines canonical stock entities, ISIN and ticker normalization, portfolio math formulas, Better Auth user ownership, and local storage to account migration rules.
- Design system and 3D canvas (Feature 4, spec 0003): defines mobile polygon and draw call budgets, quality level thresholds, device pixel ratio caps, and 2D fallback views for devices with disabled or lost WebGL contexts.
- Exchange price pipeline (Feature 11, spec 0005): defines daily NSE and BSE file ingestion contracts, market holiday schedules, parsing edge cases, retry backoffs, and stale data indicators.

## Decision

**Chosen option**: Option 1: Next.js App Router with Drizzle, Better Auth, and Docker Compose

FolioCity will build on a unified Next.js App Router codebase in TypeScript, rendering 3D scenes via React Three Fiber with instanced mesh batching, persisting data in self hosted PostgreSQL via Drizzle ORM, authenticating users with Better Auth, and executing scheduled market closing ingestion through an internal container worker. (basis: unified full stack architecture reduces deployment complexity while preserving server rendered social previews)

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
1. Schema files live in `src/infrastructure/db/schema/` in TypeScript.
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

- [x] Configure `next.config.js` with `output: 'standalone'` for lean container packaging
- [x] Create multi stage `Dockerfile` with non root user execution
- [x] Create `docker-compose.yml` defining application, PostgreSQL, Caddy, and worker services
- [x] Set up automated database backup script with daily snapshot dumps to off host storage
- [x] Create migration runner script in `package.json` for one shot deployment execution
