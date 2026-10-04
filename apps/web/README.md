# @orbit/web

The orbit browser app: Vite, React, TanStack Router, Tailwind. Built into
`apps/server/dist/public` and served by the orbit server; see the repository
README for running it.

## Lighthouse check

`pnpm perf:check` builds the app, serves it with `vite preview` and runs
`lighthouse` against it headless, failing when performance or best practices
score under 0.9 or accessibility under 1. Without the server only the login
screen renders. It needs a local Chrome (or `CHROME_PATH`) and is not part of
`gate:pkg`, because scores move with machine load.

The template's Lighthouse CI (`@lhci/cli`, `.lighthouserc.json`) is not used:
its last release, 0.15.1 of June 2025, still pulls 14 advisories (11 high),
while `lighthouse` itself has none (checked 2026-10-04).
