# Rationale: 0001. Stack and Architecture for FolioCity

## Context

FolioCity visualizes Indian stock portfolios (NSE and BSE listed equities) as a neon cyberpunk 3D cityscape where building height reflects invested capital, glow color signals profit or loss percentage, and building style reflects company sector. The application serves Indian retail investors who want an engaging visual overview of their holdings without trading features or live intraday data streams.

Several architectural forces shape this foundation:
First, rendering performance on mobile browsers is critical. A large share of Indian retail investors access web applications through budget or mid range Android phones. The 3D canvas must render smoothly at thirty frames per second on entry devices without draining battery or crashing the browser WebGL context (the browser interface for hardware accelerated 3D graphics).
Second, the user experience starts with zero barriers. First time visitors must be able to explore the 3D city immediately without signing in, storing holdings in browser local storage for up to three stocks. When adding a fourth stock, a gentle sign in prompt encourages saving to the cloud, moving local records into a persistent account.
Third, market data needs must remain simple, dependable, and free. Stock valuations use the previous trading day closing price. Directly calling market data APIs from client browsers adds vendor lock and ballooning API costs as user counts grow. Ingesting daily Bhavcopy files (daily closing summary files published by the National Stock Exchange) once per day keeps operational costs flat.
Finally, operational control and self hosting simplicity are paramount. The stack must deploy cleanly via Docker Compose on standard virtual private servers without reliance on proprietary hosted clouds.

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

## Rationale

Option 1 provides the best balance of developer velocity, operational independence, and runtime efficiency.

Using Next.js App Router allows FolioCity to serve both interactive 3D client experiences and rich server rendered preview cards for shared city links. While WebGL cannot run on the server, Next.js dynamic imports with server rendering disabled cleanly isolate the 3D canvas to the browser, while outer page shells and meta tags render on the server for social platforms.

Better Auth runs directly inside the Next.js process, storing credentials and sessions in the primary PostgreSQL database. This eliminates external authentication services while giving complete control over user data and migration paths.

Drizzle ORM was chosen over Prisma due to its minimal runtime footprint and predictable SQL generation. When processing daily closing records for thousands of NSE tickers, Drizzle enables efficient batch inserts and conflict upserts without heavy engine overhead.

Packaging the application via Docker Compose satisfies the self hosting requirement. Running an internal worker container within the Compose network allows scheduled Bhavcopy downloads to write closing records directly into PostgreSQL without exposing authenticated public webhook endpoints.

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
