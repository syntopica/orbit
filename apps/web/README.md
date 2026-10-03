# @orbit/web

The orbit browser app: Vite, React, TanStack Router, Tailwind. Built into
`apps/server/dist/public` and served by the orbit server; see the repository
README for running it.

## Dropped Lighthouse check

The vite-react-app template this package came from runs Lighthouse CI
(`@lhci/cli`, a `perf:check` script and `.lighthouserc.json`). It was removed
when the workspace was scaffolded because `@lhci/cli` pulled in five advisories
that fail `baseline-audit --level moderate`, all dev-only and transitive:

- `uuid` GHSA-w5hq-g745-h8pq
- `tmp` GHSA-ph9p-34f9-6g65
- `extract-zip` GHSA-jmr9-qjv8-65gv
- `extract-zip` GHSA-7pqw-9j4j-h8q3 (no patched release)
- `basic-ftp` GHSA-c475-qrg2-pj4r

`perf:check` was never part of `gate:pkg`, so no gate was weakened. Re-add
Lighthouse CI once those are patched upstream, or waive them explicitly in
`.baseline-advisories.json`. Until then the bundle budget (`size-limit`) and the
e2e suite cover the web app.
