# Verify: Stack and architecture · spec 0001 · updated 2026-11-04
_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Visit `/` in browser → renders FolioCity landing screen with dark cyberpunk styling and stack summary → AC-1

## Commands
- [ ] `npm run check` → Biome formatting, linting, and TypeScript compiler run clean with zero errors → AC-2
- [ ] `npm run build` → Next.js compiles standalone production build with static pages and dynamic `/api/health` route → AC-3
- [ ] `curl -s http://localhost:3000/api/health` → returns JSON status ok with current timestamp → AC-4
- [ ] `docker compose config` → validates compose services (app, db, proxy, worker) and networks → AC-5

## Acceptance-criteria coverage
- AC-1 covered by UI step · AC-2 covered by check command · AC-3 covered by build command · AC-4 covered by curl health command · AC-5 covered by compose config command
