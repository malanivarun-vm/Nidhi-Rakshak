# Nidhi-Rakshak

<!-- One sentence: what this project is and who it serves. Fill on first real session. -->

## Commands

- `pnpm dev` - run locally
- `pnpm check` - lint + typecheck (Biome + tsc)
- `pnpm test` - Vitest
- `pnpm build` - production build

## Stack

React 19, Next.js 15 App Router, TypeScript strict, Tailwind 4, shadcn/ui, Zustand, TanStack Query, React Hook Form + Zod, Drizzle + Postgres, Vitest + Playwright, pnpm, Biome.
Forbidden: CSS-in-JS, Redux/SWR, npm/yarn, class components, MUI/Chakra/Mantine, moment/date-fns, `any`, console.log in prod, barrel imports.

## Module map

<!-- dir -> responsibility. Update when structure settles. -->

## Invariants

- Every changed line traces to the request; match existing style.
- All four states handled: loading, error+retry, empty, data.
- Inputs validated at trust boundaries (Zod); parameterized queries only.
- Conventional commits, atomic, `git add` specific files (never `-A`), no AI attribution.
- Bug fix = root cause; regression test before fix when a bug recurs.

## Active work

<!-- Current focus. Keep to 3 lines max. -->
