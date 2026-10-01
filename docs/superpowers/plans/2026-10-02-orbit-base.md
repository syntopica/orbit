# orbit Base (sub-project 0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A secure, read-only orbit server and web shell that shows live health, metrics, pending items and events for launchd jobs and the worker, with a System screen of launchd heartbeat strips, reachable over the tailnet.

**Architecture:** pnpm workspace. `packages/contract` holds zod schemas shared by both apps. `apps/server` is a Hono server on Node that runs one adapter per component on a scheduler, keeps the latest snapshots in a hub with a replay ring, streams them over SSE, and persists auth and observation history in `node:sqlite`. `apps/web` is a Vite + React SPA served by the server.

**Tech Stack:** Node 26, pnpm 12, TypeScript (codeality aliases: `typescript` = `@typescript/typescript6`, `@typescript/native` = TS 7), Hono 4.13, `@hono/node-server` 2.1, zod 4, `node:sqlite`, esbuild (server bundle), Vite 8, React 19, TanStack Router 1 and Query 5, Tailwind 4, Motion 13, cmdk 1, Vitest 5, Playwright, codeality (`@syntopica/*` configs, `eslint-plugin-code-policy`).

**Spec:** `docs/superpowers/specs/2026-10-01-orbit-design.md` (revision 4). Read it before any task.

## Global Constraints

- Public repository, engine only: no host names, user names, labels of the real instance, tokens or paths of a real machine in code, fixtures or docs. Examples use `com.example.*` labels and `example.ts.net`.
- Read-only toward every other component. orbit writes only under `SYNTOPICA_DATA/orbit/` (spec 5.6).
- Content never appears in snapshots, events, the SSE stream, the history store, logs, error responses or audit records (spec 6.6). Event `refs` values: numbers, or strings of at most 64 characters matching `^[A-Za-z0-9._:-]+$`.
- Server listens on `127.0.0.1` only (spec 6.1).
- codeality strict (spec 11): `max-lines` 100 per production file and 200 per test file; `max-lines-per-function` 50; `complexity` 10; `max-params` 4; `max-depth` 4; `--max-warnings 0`, so every warning fails. `code-policy/one-primary-unit`, `no-hidden-top-level-declarations`, `no-inline-types-in-runtime-files`, `file-kind-placement`, `public-api-imports`, `no-cross-module-deep-imports`, `no-mixed-barrel` at error. Never `eslint-disable`, never `lint:suppress`.
- One exported unit per file. Types live in type-only files under a `types/` folder. Files starting `use` live in `hooks/`, `format` in `formatters/`, `validate` in `validators/`, `map` in `mappers/`, `select` in `selectors/`. No `utils/` or `helpers/` folders.
- Coverage thresholds 90 for lines, branches, functions and statements in every package; type-coverage 100.
- Every commit passes `pnpm gate`; nothing is pushed red. Commit messages: conventional commits, English, ending with the session trailer the executor is given.
- Timestamps on the wire are ISO 8601 strings; inside the server they are epoch milliseconds.
- File system mode: `SYNTOPICA_DATA/orbit/` is `0700`, files in it `0600`.
- After a task's commit passes `pnpm gate`, push it to `origin main` (owner's standing rule for this repository); never push a red commit.

## File map

```
package.json                       root scripts: gate, e2e, build
pnpm-workspace.yaml                workspaces + allowBuilds
lefthook.yml  commitlint.config.mjs  prettier.config.mjs  .gitignore  .editorconfig
.github/workflows/ci.yml           runs pnpm gate
e2e/                               Playwright suite + fixture instance (Task 24)
launchd/com.syntopica.orbit.plist.template
packages/contract/src/
  index.ts                         barrel (re-exports only)
  componentIds.ts reasonCodes.ts metricKeys.ts pendingKeys.ts eventKinds.ts
  schemas/{refValue,health,metric,pending,event,snapshotCore,snapshot,streamMessage}Schema.ts
  types/{ComponentId,ReasonCode,Health,Metric,Pending,OrbitEvent,SnapshotCore,Snapshot,StreamMessage}.ts
apps/server/src/
  cli/main.ts  cli/commands/*.ts  cli/startServer.ts
  config/  state/  process/  scheduler/  hub/  auth/  history/  http/  http/routes/
  adapters/buildAdapters.ts  adapters/launchd/  adapters/worker/  adapters/synthetic/
apps/web/src/
  main.tsx App.tsx styles.css router/ api/ stream/ hooks/ labels/ formatters/
  components/shell/ screens/{home,system,login,pair}/
```

Each task below lists its exact files.

---

### Task 1: Workspace, templates and the gate

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `lefthook.yml`, `commitlint.config.mjs`, `prettier.config.mjs`, `.prettierignore`, `.editorconfig`, `.gitignore`, `.npmrc`, `renovate.json`, `.github/workflows/ci.yml`
- Create: `packages/contract/` from `~/p/codeality/templates/ts-package` (all config files; `src/index.ts`, `src/index.test.ts` replaced below)
- Create: `apps/server/` from `~/p/codeality/templates/ts-package` (same)
- Create: `apps/web/` from `~/p/codeality/templates/vite-react-app` (all config files and `src/`)
- Modify: each package's `vitest.config.ts` (thresholds 90), each `package.json` (name, deps, `gate:pkg`)

**Interfaces:**
- Produces: `pnpm gate` (root) and `pnpm --filter <pkg> gate:pkg`; package names `@orbit/contract`, `@orbit/server`, `@orbit/web`.

- [ ] **Step 1: Copy the templates**

```bash
cd ~/p/orbit
mkdir -p packages apps
rsync -a --exclude node_modules --exclude dist --exclude coverage --exclude .turbo --exclude '*.tsbuildinfo' --exclude .lighthouseci --exclude .env ~/p/codeality/templates/ts-package/ packages/contract/
rsync -a --exclude node_modules --exclude dist --exclude coverage --exclude .turbo --exclude '*.tsbuildinfo' --exclude .lighthouseci --exclude .env ~/p/codeality/templates/ts-package/ apps/server/
rsync -a --exclude node_modules --exclude dist --exclude coverage --exclude .turbo --exclude '*.tsbuildinfo' --exclude .lighthouseci --exclude .env ~/p/codeality/templates/vite-react-app/ apps/web/
# Repository-level files move to the root; packages keep only package-level config.
for p in packages/contract apps/server apps/web; do
  rm -rf "$p/.github" "$p/lefthook.yml" "$p/commitlint.config.mjs" "$p/renovate.json" "$p/.editorconfig" "$p/.npmrc"
done
cp ~/p/codeality/templates/ts-package/{lefthook.yml,commitlint.config.mjs,renovate.json,.editorconfig,.npmrc,prettier.config.mjs,.prettierignore} .
rm -f apps/web/src/lib/add.ts apps/web/src/lib/add.test.ts
```

- [ ] **Step 2: Root manifest and workspace**

`package.json`:

```json
{
  "name": "orbit",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@12.8.1",
  "type": "module",
  "scripts": {
    "prepare": "lefthook install",
    "build": "pnpm --filter @orbit/web build && pnpm --filter @orbit/server build",
    "e2e": "pnpm build && playwright test --config e2e/playwright.config.ts",
    "format:check": "prettier --check .",
    "secrets:check": "gitleaks detect --no-banner --redact",
    "gate": "pnpm -r --workspace-concurrency=1 run gate:pkg && pnpm format:check && pnpm secrets:check && pnpm e2e"
  },
  "devDependencies": {
    "@commitlint/cli": "^21.2.3",
    "@commitlint/config-conventional": "^21.2.3",
    "@axe-core/playwright": "^4.13.0",
    "@playwright/test": "^1.63.0",
    "@syntopica/prettier-config": "^0.2.0",
    "lefthook": "^2.1.15",
    "prettier": "^3.9.9",
    "prettier-plugin-css-order": "^2.2.0",
    "prettier-plugin-organize-imports": "^4.3.0",
    "prettier-plugin-tailwindcss": "^0.8.1"
  }
}
```

`pnpm-workspace.yaml`:

```yaml
packages:
  - packages/*
  - apps/*
allowBuilds:
  lefthook: true
  unrs-resolver: true
  esbuild: true
```

- [ ] **Step 3: Package manifests**

In each package `package.json`: set `name` (`@orbit/contract`, `@orbit/server`, `@orbit/web`), replace every `workspace:*` on `@syntopica/*` with the published range (`@syntopica/eslint-config` `^0.8.0`, `@syntopica/prettier-config` `^0.2.0`, `@syntopica/tsconfig` `^0.3.0`, `@syntopica/quality-config` `^0.11.1`, `eslint-plugin-code-policy` `^0.7.4`), remove `prepare` and `lint:suppress`/`lint:prune` scripts, and add:

```json
"gate:pkg": "pnpm check:ci && pnpm check:quality && pnpm audit:check"
```

`packages/contract/package.json` also gets `"exports": { ".": "./src/index.ts" }` and `"dependencies": { "zod": "^4.6.5" }`.
`apps/server/package.json` gets `"dependencies": { "@orbit/contract": "workspace:*", "hono": "^4.13.12", "@hono/node-server": "^2.1.3", "zod": "^4.6.5", "qrcode-terminal": "^0.12.0" }`, devDependencies `"esbuild": "^0.28.2", "@types/qrcode-terminal": "^0.12.2"`, `"bin": { "orbit": "./dist/orbit.mjs" }`, and script `"build": "esbuild src/cli/main.ts --bundle --platform=node --format=esm --target=node26 --external:hono --external:@hono/node-server --external:zod --external:qrcode-terminal --outfile=dist/orbit.mjs"`. The registry dependencies stay external; `@orbit/contract` is deliberately bundled, because it exports TypeScript source with extensionless imports that Node cannot load at runtime. Add every new runtime dependency of the server to this `--external` list.
`apps/web/package.json` gets `"@orbit/contract": "workspace:*"` in dependencies sets `"size": "vite build && size-limit"` (size-limit measures built files, and `check:ci` never builds), then appends `&& pnpm size` to `check:ci`.

- [ ] **Step 4: Raise coverage to 90**

In all three `vitest.config.ts`, change every threshold value from `80` to `90`.

- [ ] **Step 5: Lefthook runs the gate before push**

Replace the `pre-push` block of the root `lefthook.yml` with:

```yaml
pre-push:
  commands:
    secrets:
      run: gitleaks detect --no-banner --redact
    gate:
      run: pnpm gate
```

- [ ] **Step 6: CI runs the gate**

`.github/workflows/ci.yml` (actions pinned to the SHAs used in the template):

```yaml
name: CI
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  gate:
    runs-on: macos-latest
    timeout-minutes: 40
    steps:
      - uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86 # v6
      - uses: actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6
        with:
          node-version: 26
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: brew install gitleaks
      - run: pnpm exec playwright install chromium
      - run: pnpm gate
```

`macos-latest` because the launchd adapter's fixtures use macOS `plutil` in e2e.

- [ ] **Step 7: Placeholder units so every package has one passing test**

`packages/contract/src/index.ts`:

```ts
export { COMPONENT_IDS } from './componentIds'
```

`packages/contract/src/componentIds.ts`:

```ts
export const COMPONENT_IDS = [
  'launchd',
  'worker',
  'atrium',
  'brain',
  'clips',
  'capture',
  'synthetic',
] as const
```

`packages/contract/src/componentIds.test.ts`:

```ts
import { COMPONENT_IDS } from './componentIds'

describe('COMPONENT_IDS', () => {
  it('lists each component once', () => {
    expect(new Set(COMPONENT_IDS).size).toBe(COMPONENT_IDS.length)
  })
})
```

Delete `packages/contract/src/index.test.ts` and `apps/server/src/index.test.ts`. `apps/server/src/cli/main.ts` (replaced in Task 17):

```ts
process.stdout.write('orbit\n')
```

`apps/server/src/cli/main.test.ts`:

```ts
describe('main', () => {
  it('prints the program name', async () => {
    const write = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
    await import('./main')
    expect(write).toHaveBeenCalledWith('orbit\n')
  })
})
```

Delete `apps/server/src/index.ts`. Keep the web template's `App.tsx`, `App.test.tsx`, `env.ts`, `env.test.ts` as they are for now.

- [ ] **Step 8: Install and run the gate (e2e skipped until Task 24)**

Until Task 24 creates `e2e/`, the root `gate` script must not call it: temporarily set `"gate"` to `pnpm -r --workspace-concurrency=1 run gate:pkg && pnpm format:check && pnpm secrets:check`. Task 24 restores `&& pnpm e2e`.

```bash
pnpm install
pnpm gate
```

Expected: every package passes `check:ci`, `check:quality`, `audit:check`; Prettier and gitleaks clean. If ESLint reports a missing peer, run `pnpm dlx @syntopica/create-baseline@^0.9.0 --check` in that package and add the peer it names.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "build: scaffold the workspace from the codeality templates"
```

---

### Task 2: Bundle budget probe

Spec 11 requires measuring the heavy libraries against the budget before screens are built. This task builds a throwaway probe, records the numbers, and removes the probe.

**Files:**
- Create: `docs/measurements/2026-10-02-bundle-probe.md`
- Modify: `apps/web/.size-limit.json`

- [ ] **Step 1: Probe build outside the app**

```bash
cd ~/p/orbit && mkdir -p /tmp/orbit-probe && cd /tmp/orbit-probe
pnpm init && pnpm add react@19 react-dom@19 sigma graphology graphology-layout-forceatlas2 graphology-communities-louvain @react-sigma/core @xyflow/react recharts cmdk @tanstack/react-router @tanstack/react-query motion vite @vitejs/plugin-react
```

Create three entry files, each importing and rendering one feature so tree shaking keeps them: `shell.tsx` (react, react-dom, TanStack Router, Query, cmdk, motion), `graph.tsx` (sigma, graphology, forceatlas2, louvain, @react-sigma/core), `flow.tsx` (@xyflow/react, recharts). Build with `vite build` using those three as `build.rollupOptions.input`, then measure:

```bash
for f in dist/assets/*.js; do printf "%s %s\n" "$f" "$(brotli -c "$f" | wc -c)"; done
```

- [ ] **Step 2: Record and set the budget**

Write the three brotli sizes into `docs/measurements/2026-10-02-bundle-probe.md` with the date, library versions from the probe's lockfile, and the verdict against spec 11 (initial route at most 150 KB, graph and flow chunks at most 250 KB each). If a chunk exceeds its budget, record which library dominates and stop: report to the owner before continuing, because the spec's budget or library choice must change first.

Set `apps/web/.size-limit.json` to the initial-route budget (lazy chunks get their own entries in sub-project 1):

```json
[
  { "name": "initial route (brotli)", "path": "dist/assets/index-*.js", "limit": "150 KB" }
]
```

- [ ] **Step 3: Remove the probe and commit**

```bash
rm -rf /tmp/orbit-probe
cd ~/p/orbit && pnpm gate
git add docs/measurements apps/web/.size-limit.json
git commit -m "docs: record the bundle probe against the spec budget"
```

---

### Task 3: Contract enums and leaf schemas

**Files:**
- Create: `packages/contract/src/reasonCodes.ts`, `metricKeys.ts`, `pendingKeys.ts`, `eventKinds.ts`
- Create: `packages/contract/src/schemas/refValueSchema.ts`, `healthSchema.ts`, `metricSchema.ts`, `pendingSchema.ts`, `eventSchema.ts`
- Create: `packages/contract/src/types/ComponentId.ts`, `ReasonCode.ts`, `Health.ts`, `Metric.ts`, `Pending.ts`, `OrbitEvent.ts`
- Test: `packages/contract/src/schemas/eventSchema.test.ts`, `healthSchema.test.ts`, `metricSchema.test.ts`

**Interfaces:**
- Produces: `REASON_CODES`, `METRIC_KEYS`, `PENDING_KEYS`, `EVENT_KINDS` (readonly tuples); `healthSchema`, `metricSchema`, `pendingSchema`, `eventSchema`, `refValueSchema`; types `ComponentId`, `ReasonCode`, `Health`, `Metric`, `Pending`, `OrbitEvent`.

- [ ] **Step 1: Write the failing tests**

`packages/contract/src/schemas/eventSchema.test.ts`:

```ts
import { eventSchema } from './eventSchema'

const base = {
  at: '2026-10-02T10:00:00.000Z',
  component: 'launchd',
  kind: 'launchd.exit_changed',
  severity: 'warn',
  refs: { label: 'com.example.job', exit: 78 },
}

describe('eventSchema', () => {
  it('accepts opaque refs', () => {
    expect(eventSchema.parse(base)).toEqual(base)
  })
  it('rejects a path-shaped ref', () => {
    expect(() => eventSchema.parse({ ...base, refs: { page: 'topics/secret-plan' } })).toThrow()
  })
  it('rejects a ref longer than 64 characters', () => {
    expect(() => eventSchema.parse({ ...base, refs: { id: 'a'.repeat(65) } })).toThrow()
  })
  it('rejects an unknown kind', () => {
    expect(() => eventSchema.parse({ ...base, kind: 'free.text' })).toThrow()
  })
  it('rejects unknown fields', () => {
    expect(() => eventSchema.parse({ ...base, summary: 'text' })).toThrow()
  })
})
```

`packages/contract/src/schemas/healthSchema.test.ts`:

```ts
import { healthSchema } from './healthSchema'

describe('healthSchema', () => {
  it('accepts ok without a reason', () => {
    expect(healthSchema.parse({ state: 'ok', reason: null })).toEqual({ state: 'ok', reason: null })
  })
  it('accepts down with a closed reason', () => {
    expect(healthSchema.parse({ state: 'down', reason: 'timeout' }).reason).toBe('timeout')
  })
  it('rejects a free-text reason', () => {
    expect(() => healthSchema.parse({ state: 'down', reason: 'disk on fire' })).toThrow()
  })
})
```

`packages/contract/src/schemas/metricSchema.test.ts`:

```ts
import { metricSchema } from './metricSchema'

describe('metricSchema', () => {
  it('accepts a known key with a number', () => {
    const m = { key: 'worker.queued', value: 3, at: '2026-10-02T10:00:00.000Z' }
    expect(metricSchema.parse(m)).toEqual(m)
  })
  it('rejects an unknown key', () => {
    expect(() => metricSchema.parse({ key: 'x', value: 1, at: '2026-10-02T10:00:00.000Z' })).toThrow()
  })
  it('rejects a non-finite value', () => {
    expect(() =>
      metricSchema.parse({ key: 'worker.queued', value: Infinity, at: '2026-10-02T10:00:00.000Z' }),
    ).toThrow()
  })
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @orbit/contract test`
Expected: FAIL, modules not found.

- [ ] **Step 3: Enums**

`packages/contract/src/reasonCodes.ts`:

```ts
export const REASON_CODES = [
  'stale',
  'timeout',
  'exit_nonzero',
  'output_too_large',
  'schema_invalid',
  'engine_schema_unsupported',
  'not_found',
  'unauthorized',
  'unreachable',
  'lagging',
  'check_failed',
] as const
```

`packages/contract/src/metricKeys.ts`:

```ts
export const METRIC_KEYS = [
  'launchd.jobs',
  'launchd.running',
  'launchd.failing',
  'worker.queued',
  'worker.live',
  'worker.failed',
  'worker.done_1h',
  'worker.wasted_1h_s',
  'worker.cooldowns',
  'worker.nodes',
  'synthetic.value',
] as const
```

`packages/contract/src/pendingKeys.ts`:

```ts
export const PENDING_KEYS = [
  'launchd.failing_jobs',
  'worker.failed_jobs',
  'worker.queued_jobs',
  'synthetic.items',
] as const
```

`packages/contract/src/eventKinds.ts`:

```ts
export const EVENT_KINDS = [
  'component.down',
  'component.recovered',
  'launchd.exit_changed',
  'launchd.started',
  'launchd.stopped',
  'worker.job_failed',
  'worker.cooldown_started',
  'synthetic.tick',
] as const
```

- [ ] **Step 4: Leaf schemas**

`packages/contract/src/schemas/refValueSchema.ts`:

```ts
import { z } from 'zod'

export const refValueSchema = z.union([
  z.number().finite(),
  z.string().max(64).regex(/^[A-Za-z0-9._:-]+$/),
])
```

`packages/contract/src/schemas/healthSchema.ts`:

```ts
import { z } from 'zod'

import { REASON_CODES } from '../reasonCodes'

export const healthSchema = z
  .object({ state: z.enum(['ok', 'warn', 'down']), reason: z.enum(REASON_CODES).nullable() })
  .strict()
```

`packages/contract/src/schemas/metricSchema.ts`:

```ts
import { z } from 'zod'

import { METRIC_KEYS } from '../metricKeys'

export const metricSchema = z
  .object({ key: z.enum(METRIC_KEYS), value: z.number().finite(), at: z.iso.datetime() })
  .strict()
```

`packages/contract/src/schemas/pendingSchema.ts`:

```ts
import { z } from 'zod'

import { PENDING_KEYS } from '../pendingKeys'

export const pendingSchema = z
  .object({
    key: z.enum(PENDING_KEYS),
    count: z.number().int().nonnegative(),
    oldestAt: z.iso.datetime().nullable(),
  })
  .strict()
```

`packages/contract/src/schemas/eventSchema.ts`:

```ts
import { z } from 'zod'

import { COMPONENT_IDS } from '../componentIds'
import { EVENT_KINDS } from '../eventKinds'
import { refValueSchema } from './refValueSchema'

export const eventSchema = z
  .object({
    at: z.iso.datetime(),
    component: z.enum(COMPONENT_IDS),
    kind: z.enum(EVENT_KINDS),
    severity: z.enum(['info', 'warn', 'error']),
    refs: z.record(z.string().regex(/^[a-z][a-zA-Z]{0,31}$/), refValueSchema),
  })
  .strict()
```

- [ ] **Step 5: Types**

One file each:

```ts
// packages/contract/src/types/ComponentId.ts
import type { COMPONENT_IDS } from '../componentIds'

export type ComponentId = (typeof COMPONENT_IDS)[number]
```

```ts
// packages/contract/src/types/ReasonCode.ts
import type { REASON_CODES } from '../reasonCodes'

export type ReasonCode = (typeof REASON_CODES)[number]
```

```ts
// packages/contract/src/types/Health.ts
import type { z } from 'zod'

import type { healthSchema } from '../schemas/healthSchema'

export type Health = z.infer<typeof healthSchema>
```

`Metric.ts`, `Pending.ts`, `OrbitEvent.ts` follow the `Health.ts` shape exactly with `metricSchema`, `pendingSchema`, `eventSchema` respectively:

```ts
// packages/contract/src/types/Metric.ts
import type { z } from 'zod'

import type { metricSchema } from '../schemas/metricSchema'

export type Metric = z.infer<typeof metricSchema>
```

```ts
// packages/contract/src/types/Pending.ts
import type { z } from 'zod'

import type { pendingSchema } from '../schemas/pendingSchema'

export type Pending = z.infer<typeof pendingSchema>
```

```ts
// packages/contract/src/types/OrbitEvent.ts
import type { z } from 'zod'

import type { eventSchema } from '../schemas/eventSchema'

export type OrbitEvent = z.infer<typeof eventSchema>
```

- [ ] **Step 6: Run the tests**

Run: `pnpm --filter @orbit/contract test`
Expected: PASS.

- [ ] **Step 7: Commit** (barrel updated in Task 4)

```bash
pnpm --filter @orbit/contract gate:pkg
git add packages/contract
git commit -m "feat(contract): closed enums and leaf schemas"
```

---

### Task 4: Snapshot and stream message schemas, barrel

**Files:**
- Create: `packages/contract/src/schemas/snapshotCoreSchema.ts`, `snapshotSchema.ts`, `streamMessageSchema.ts`
- Create: `packages/contract/src/types/SnapshotCore.ts`, `Snapshot.ts`, `StreamMessage.ts`
- Modify: `packages/contract/src/index.ts`
- Test: `packages/contract/src/schemas/snapshotSchema.test.ts`, `streamMessageSchema.test.ts`

**Interfaces:**
- Consumes: Task 3 schemas.
- Produces: `snapshotCoreSchema` (`{component, health, metrics, pending, events, observedAt}`), `snapshotSchema` (core plus `lastGood: SnapshotCore | null`), `streamMessageSchema` (discriminated on `type`: `snapshot {id, snapshot}`, `event {id, event}`, `sync {id}`, `resync {id}`; `id` is a non-negative integer); types `SnapshotCore`, `Snapshot`, `StreamMessage`. The barrel exports every enum, schema and type.

- [ ] **Step 1: Write the failing tests**

`packages/contract/src/schemas/snapshotSchema.test.ts`:

```ts
import { snapshotSchema } from './snapshotSchema'

const core = {
  component: 'worker',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'worker.queued', value: 2, at: '2026-10-02T10:00:00.000Z' }],
  pending: [{ key: 'worker.failed_jobs', count: 1, oldestAt: null }],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
}

describe('snapshotSchema', () => {
  it('accepts a snapshot without lastGood', () => {
    expect(snapshotSchema.parse({ ...core, lastGood: null }).component).toBe('worker')
  })
  it('accepts a down snapshot carrying the last good one', () => {
    const down = { ...core, health: { state: 'down', reason: 'timeout' }, lastGood: core }
    expect(snapshotSchema.parse(down).lastGood?.health.state).toBe('ok')
  })
  it('rejects a nested lastGood inside lastGood', () => {
    expect(() =>
      snapshotSchema.parse({ ...core, lastGood: { ...core, lastGood: null } }),
    ).toThrow()
  })
})
```

`packages/contract/src/schemas/streamMessageSchema.test.ts`:

```ts
import { streamMessageSchema } from './streamMessageSchema'

describe('streamMessageSchema', () => {
  it('accepts sync and resync markers', () => {
    expect(streamMessageSchema.parse({ type: 'sync', id: 4 }).type).toBe('sync')
    expect(streamMessageSchema.parse({ type: 'resync', id: 0 }).type).toBe('resync')
  })
  it('rejects a negative id', () => {
    expect(() => streamMessageSchema.parse({ type: 'sync', id: -1 })).toThrow()
  })
  it('rejects an unknown type', () => {
    expect(() => streamMessageSchema.parse({ type: 'page', id: 1 })).toThrow()
  })
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @orbit/contract test` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`packages/contract/src/schemas/snapshotCoreSchema.ts`:

```ts
import { z } from 'zod'

import { COMPONENT_IDS } from '../componentIds'
import { eventSchema } from './eventSchema'
import { healthSchema } from './healthSchema'
import { metricSchema } from './metricSchema'
import { pendingSchema } from './pendingSchema'

export const snapshotCoreSchema = z
  .object({
    component: z.enum(COMPONENT_IDS),
    health: healthSchema,
    metrics: z.array(metricSchema).max(64),
    pending: z.array(pendingSchema).max(32),
    events: z.array(eventSchema).max(100),
    observedAt: z.iso.datetime(),
  })
  .strict()
```

`packages/contract/src/schemas/snapshotSchema.ts`:

```ts
import { snapshotCoreSchema } from './snapshotCoreSchema'

export const snapshotSchema = snapshotCoreSchema.extend({
  lastGood: snapshotCoreSchema.nullable(),
})
```

`packages/contract/src/schemas/streamMessageSchema.ts`:

```ts
import { z } from 'zod'

import { eventSchema } from './eventSchema'
import { snapshotSchema } from './snapshotSchema'

export const streamMessageSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('snapshot'),
      id: z.number().int().nonnegative(),
      snapshot: snapshotSchema,
    })
    .strict(),
  z
    .object({ type: z.literal('event'), id: z.number().int().nonnegative(), event: eventSchema })
    .strict(),
  z.object({ type: z.literal('sync'), id: z.number().int().nonnegative() }).strict(),
  z.object({ type: z.literal('resync'), id: z.number().int().nonnegative() }).strict(),
])
```

(`no-hidden-top-level-declarations` forbids a shared top-level `const id`, so the id schema is repeated inline.)

Types, one file each, same shape as Task 3 Step 5:

```ts
// packages/contract/src/types/SnapshotCore.ts
import type { z } from 'zod'

import type { snapshotCoreSchema } from '../schemas/snapshotCoreSchema'

export type SnapshotCore = z.infer<typeof snapshotCoreSchema>
```

```ts
// packages/contract/src/types/Snapshot.ts
import type { z } from 'zod'

import type { snapshotSchema } from '../schemas/snapshotSchema'

export type Snapshot = z.infer<typeof snapshotSchema>
```

```ts
// packages/contract/src/types/StreamMessage.ts
import type { z } from 'zod'

import type { streamMessageSchema } from '../schemas/streamMessageSchema'

export type StreamMessage = z.infer<typeof streamMessageSchema>
```

`packages/contract/src/index.ts`:

```ts
export { COMPONENT_IDS } from './componentIds'
export { EVENT_KINDS } from './eventKinds'
export { METRIC_KEYS } from './metricKeys'
export { PENDING_KEYS } from './pendingKeys'
export { REASON_CODES } from './reasonCodes'
export { eventSchema } from './schemas/eventSchema'
export { healthSchema } from './schemas/healthSchema'
export { metricSchema } from './schemas/metricSchema'
export { pendingSchema } from './schemas/pendingSchema'
export { refValueSchema } from './schemas/refValueSchema'
export { snapshotCoreSchema } from './schemas/snapshotCoreSchema'
export { snapshotSchema } from './schemas/snapshotSchema'
export { streamMessageSchema } from './schemas/streamMessageSchema'
export type { ComponentId } from './types/ComponentId'
export type { Health } from './types/Health'
export type { Metric } from './types/Metric'
export type { OrbitEvent } from './types/OrbitEvent'
export type { Pending } from './types/Pending'
export type { ReasonCode } from './types/ReasonCode'
export type { Snapshot } from './types/Snapshot'
export type { SnapshotCore } from './types/SnapshotCore'
export type { StreamMessage } from './types/StreamMessage'
```

- [ ] **Step 4: Run tests and gate**

Run: `pnpm --filter @orbit/contract gate:pkg` — Expected: PASS, coverage at least 90.

- [ ] **Step 5: Commit**

```bash
git add packages/contract
git commit -m "feat(contract): snapshot and stream message schemas"
```

---
### Task 5: Instance and orbit configuration

**Files:**
- Create: `apps/server/src/fs/isNotFound.ts`, `apps/server/src/fs/readJsonFile.ts`
- Create: `apps/server/src/config/resolveDataDir.ts`, `instanceEnginesSchema.ts`, `loadInstanceConfig.ts`, `orbitConfigSchema.ts`, `loadOrbitConfig.ts`
- Create: `apps/server/src/types/InstanceConfig.ts`, `apps/server/src/types/OrbitConfig.ts`
- Test: `apps/server/src/config/loadInstanceConfig.test.ts`, `loadOrbitConfig.test.ts`, `resolveDataDir.test.ts`

**Interfaces:**
- Produces: `resolveDataDir(env: NodeJS.ProcessEnv): string`; `loadInstanceConfig(dataDir: string): Promise<InstanceConfig>` where `InstanceConfig = { dataDir: string; engines: Record<string, { path: string }> }` with absolute paths; `loadOrbitConfig(dataDir: string): Promise<OrbitConfig>` where `OrbitConfig = z.infer<typeof orbitConfigSchema>`; `readJsonFile(path): Promise<unknown>` (`undefined` when absent).

The engine command table of spec 5.3 is added to `orbitConfigSchema` in sub-project 1, the first time an engine command runs; nothing in Base executes an engine CLI.

- [ ] **Step 1: Write the failing tests**

`apps/server/src/config/resolveDataDir.test.ts`:

```ts
import { resolveDataDir } from './resolveDataDir'

describe('resolveDataDir', () => {
  it('returns an absolute SYNTOPICA_DATA', () => {
    expect(resolveDataDir({ SYNTOPICA_DATA: '/srv/instance' })).toBe('/srv/instance')
  })
  it('rejects a missing or relative value', () => {
    expect(() => resolveDataDir({})).toThrow('SYNTOPICA_DATA')
    expect(() => resolveDataDir({ SYNTOPICA_DATA: 'relative' })).toThrow('SYNTOPICA_DATA')
  })
})
```

`apps/server/src/config/loadInstanceConfig.test.ts`:

```ts
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { loadInstanceConfig } from './loadInstanceConfig'

const instance = async (files: Record<string, unknown>): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-instance-'))
  for (const [name, body] of Object.entries(files)) {
    await writeFile(join(dir, name), JSON.stringify(body))
  }
  return dir
}

describe('loadInstanceConfig', () => {
  it('resolves engine paths against the instance and applies the local overlay', async () => {
    const dir = await instance({
      'syntopica.config.json': { schemaVersion: 1, engines: { brain: { path: '../brain' } } },
      'syntopica.local.json': { engines: { clips: { path: '/opt/clips' } } },
    })
    const config = await loadInstanceConfig(dir)
    expect(config.engines['brain']?.path).toBe(join(dir, '../brain'))
    expect(config.engines['clips']?.path).toBe('/opt/clips')
  })
  it('fails when the instance has no config file', async () => {
    const dir = await instance({})
    await expect(loadInstanceConfig(dir)).rejects.toThrow('syntopica.config.json')
  })
})
```

`apps/server/src/config/loadOrbitConfig.test.ts`:

```ts
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { loadOrbitConfig } from './loadOrbitConfig'

const withOrbitJson = async (body: unknown): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-config-'))
  await mkdir(join(dir, 'orbit'))
  await writeFile(join(dir, 'orbit', 'orbit.json'), JSON.stringify(body))
  return dir
}

describe('loadOrbitConfig', () => {
  it('applies defaults when orbit.json is absent', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-config-'))
    const config = await loadOrbitConfig(dir)
    expect(config.port).toBe(8790)
    expect(config.allowedHosts).toEqual([])
    expect(config.synthetic).toBe(false)
  })
  it('reads launchd labels', async () => {
    const dir = await withOrbitJson({
      launchd: {
        labels: [
          { component: 'worker', label: 'com.example.worker', role: 'keepalive', plist: '/x.plist' },
        ],
      },
    })
    const config = await loadOrbitConfig(dir)
    expect(config.launchd?.labels[0]?.label).toBe('com.example.worker')
    expect(config.launchd?.launchctl).toBe('/bin/launchctl')
  })
  it('rejects unknown keys and unsafe labels', async () => {
    await expect(loadOrbitConfig(await withOrbitJson({ extra: 1 }))).rejects.toThrow()
    const bad = { launchd: { labels: [{ component: 'worker', label: 'a/b', role: 'scheduled', plist: '/x' }] } }
    await expect(loadOrbitConfig(await withOrbitJson(bad))).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @orbit/server test` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`apps/server/src/fs/isNotFound.ts`:

```ts
export const isNotFound = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && error.code === 'ENOENT'
```

`apps/server/src/fs/readJsonFile.ts`:

```ts
import { readFile } from 'node:fs/promises'

import { isNotFound } from './isNotFound'

export const readJsonFile = async (path: string): Promise<unknown> => {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as unknown
  } catch (error) {
    if (isNotFound(error)) return undefined
    throw error
  }
}
```

`apps/server/src/config/resolveDataDir.ts`:

```ts
import { isAbsolute } from 'node:path'

export const resolveDataDir = (env: NodeJS.ProcessEnv): string => {
  const dir = env['SYNTOPICA_DATA']
  if (dir === undefined || !isAbsolute(dir)) {
    throw new Error('SYNTOPICA_DATA must be set to an absolute path')
  }
  return dir
}
```

`apps/server/src/config/instanceEnginesSchema.ts`:

```ts
import { z } from 'zod'

export const instanceEnginesSchema = z.object({
  engines: z.record(z.string(), z.object({ path: z.string().min(1) })).default({}),
})
```

`apps/server/src/types/InstanceConfig.ts`:

```ts
export type InstanceConfig = {
  readonly dataDir: string
  readonly engines: Readonly<Record<string, { readonly path: string }>>
}
```

`apps/server/src/config/loadInstanceConfig.ts`:

```ts
import { join, resolve } from 'node:path'

import { readJsonFile } from '../fs/readJsonFile'
import type { InstanceConfig } from '../types/InstanceConfig'
import { instanceEnginesSchema } from './instanceEnginesSchema'

export const loadInstanceConfig = async (dataDir: string): Promise<InstanceConfig> => {
  const base = await readJsonFile(join(dataDir, 'syntopica.config.json'))
  if (base === undefined) throw new Error(`syntopica.config.json not found in ${dataDir}`)
  const local = (await readJsonFile(join(dataDir, 'syntopica.local.json'))) ?? {}
  const merged = {
    ...instanceEnginesSchema.parse(base).engines,
    ...instanceEnginesSchema.parse(local).engines,
  }
  const engines = Object.fromEntries(
    Object.entries(merged).map(([name, engine]) => [name, { path: resolve(dataDir, engine.path) }]),
  )
  return { dataDir, engines }
}
```

`apps/server/src/config/orbitConfigSchema.ts`:

```ts
import { COMPONENT_IDS } from '@orbit/contract'
import { z } from 'zod'

export const orbitConfigSchema = z
  .object({
    port: z.number().int().min(1024).max(65_535).default(8790),
    allowedHosts: z.array(z.string().regex(/^[a-z0-9.-]{1,253}$/)).default([]),
    allowedLogins: z.array(z.string().min(3).max(254)).default([]),
    synthetic: z.boolean().default(false),
    launchd: z
      .object({
        launchctl: z.string().default('/bin/launchctl'),
        plutil: z.string().default('/usr/bin/plutil'),
        labels: z
          .array(
            z
              .object({
                component: z.enum(COMPONENT_IDS),
                label: z.string().regex(/^[A-Za-z0-9._-]{1,64}$/),
                role: z.enum(['scheduled', 'keepalive']),
                plist: z.string().min(1),
              })
              .strict(),
          )
          .default([]),
      })
      .strict()
      .optional(),
    worker: z.object({ url: z.url(), tokenFile: z.string().min(1) }).strict().optional(),
    cadenceMs: z.partialRecord(z.enum(COMPONENT_IDS), z.number().int().min(1000)).default({}),
  })
  .strict()
```

`apps/server/src/types/OrbitConfig.ts`:

```ts
import type { z } from 'zod'

import type { orbitConfigSchema } from '../config/orbitConfigSchema'

export type OrbitConfig = z.infer<typeof orbitConfigSchema>
```

`apps/server/src/config/loadOrbitConfig.ts`:

```ts
import { join } from 'node:path'

import { readJsonFile } from '../fs/readJsonFile'
import type { OrbitConfig } from '../types/OrbitConfig'
import { orbitConfigSchema } from './orbitConfigSchema'

export const loadOrbitConfig = async (dataDir: string): Promise<OrbitConfig> =>
  orbitConfigSchema.parse((await readJsonFile(join(dataDir, 'orbit', 'orbit.json'))) ?? {})
```

- [ ] **Step 4: Run tests and gate**

Run: `pnpm --filter @orbit/server gate:pkg` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/server
git commit -m "feat(server): load instance and orbit configuration"
```

---

### Task 6: State directory and databases

**Files:**
- Create: `apps/server/src/state/ensureStateDir.ts`, `openDatabase.ts`, `authSchemaSql.ts`
- Test: `apps/server/src/state/openDatabase.test.ts`, `ensureStateDir.test.ts`

**Interfaces:**
- Produces: `ensureStateDir(dataDir): Promise<string>` returning `<dataDir>/orbit` with mode `0700`; `openDatabase(path: string, schemaSql: string): DatabaseSync` (WAL, `busy_timeout` 5000, file mode `0600`); `AUTH_SCHEMA_SQL` with tables `admin_token`, `sessions`, `invitations`, `rate_limits`, `audit`.

- [ ] **Step 1: Write the failing tests**

`apps/server/src/state/ensureStateDir.test.ts`:

```ts
import { mkdtemp, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { ensureStateDir } from './ensureStateDir'

describe('ensureStateDir', () => {
  it('creates <data>/orbit with mode 0700', async () => {
    const data = await mkdtemp(join(tmpdir(), 'orbit-state-'))
    const dir = await ensureStateDir(data)
    expect(dir).toBe(join(data, 'orbit'))
    expect((await stat(dir)).mode & 0o777).toBe(0o700)
  })
})
```

`apps/server/src/state/openDatabase.test.ts`:

```ts
import { mkdtemp, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { AUTH_SCHEMA_SQL } from './authSchemaSql'
import { openDatabase } from './openDatabase'

describe('openDatabase', () => {
  it('creates the schema in WAL mode with private permissions', async () => {
    const path = join(await mkdtemp(join(tmpdir(), 'orbit-db-')), 'auth.sqlite3')
    const db = openDatabase(path, AUTH_SCHEMA_SQL)
    const mode = db.prepare('PRAGMA journal_mode').get() as { journal_mode: string }
    expect(mode.journal_mode).toBe('wal')
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all()
    expect(tables.map((t) => (t as { name: string }).name)).toEqual([
      'admin_token',
      'audit',
      'invitations',
      'rate_limits',
      'sessions',
    ])
    expect((await stat(path)).mode & 0o777).toBe(0o600)
    db.close()
  })
})
```

- [ ] **Step 2: Run them to see them fail** — `pnpm --filter @orbit/server test`, FAIL.

- [ ] **Step 3: Implement**

`apps/server/src/state/ensureStateDir.ts`:

```ts
import { chmod, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export const ensureStateDir = async (dataDir: string): Promise<string> => {
  const dir = join(dataDir, 'orbit')
  await mkdir(dir, { recursive: true, mode: 0o700 })
  await chmod(dir, 0o700)
  return dir
}
```

`apps/server/src/state/openDatabase.ts`:

```ts
import { chmodSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'

export const openDatabase = (path: string, schemaSql: string): DatabaseSync => {
  const db = new DatabaseSync(path)
  chmodSync(path, 0o600)
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL;')
  db.exec(schemaSql)
  return db
}
```

`apps/server/src/state/authSchemaSql.ts`:

```ts
export const AUTH_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admin_token (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hash TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  hash TEXT PRIMARY KEY,
  created INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  secret_hash TEXT NOT NULL,
  expires INTEGER NOT NULL,
  failures INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (key, window)
);
CREATE TABLE IF NOT EXISTS audit (
  at INTEGER NOT NULL,
  action TEXT NOT NULL,
  outcome TEXT NOT NULL
);
`
```

The `-wal` and `-shm` side files are created by SQLite with the process umask; `startServer` (Task 17) sets `process.umask(0o077)` before opening any database so they are `0600` too.

- [ ] **Step 4: Run tests and gate** — `pnpm --filter @orbit/server gate:pkg`, PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/server
git commit -m "feat(server): private state directory and sqlite databases"
```

---

### Task 7: Subprocess runner

**Files:**
- Create: `apps/server/src/process/ProcessError.ts`, `buildChildEnv.ts`, `signalGroup.ts`, `killGroup.ts`, `runProcess.ts`
- Create: `apps/server/src/types/RunRequest.ts`, `apps/server/src/types/RunResult.ts`
- Test: `apps/server/src/process/runProcess.test.ts`, `buildChildEnv.test.ts`

**Interfaces:**
- Produces: `runProcess(request: RunRequest): Promise<RunResult>`; `RunRequest = { file: string; args: readonly string[]; env: Record<string, string>; timeoutMs: number; maxBytes: number; signal?: AbortSignal }`; `RunResult = { code: number; stdout: string }`; `ProcessError` with `reason: ReasonCode` (`timeout`, `output_too_large`, `not_found`); `buildChildEnv(source: NodeJS.ProcessEnv, extra: Record<string, string>): Record<string, string>`.

Stderr is discarded, never read, never logged (spec 6.6).

- [ ] **Step 1: Write the failing tests**

`apps/server/src/process/buildChildEnv.test.ts`:

```ts
import { buildChildEnv } from './buildChildEnv'

describe('buildChildEnv', () => {
  it('keeps only the allowlist plus declared extras', () => {
    const env = buildChildEnv(
      { PATH: '/bin', HOME: '/h', SECRET_TOKEN: 'x', SYNTOPICA_DATA: '/d', LANG: 'C' },
      { UV_CACHE_DIR: '/c' },
    )
    expect(env).toEqual({ PATH: '/bin', HOME: '/h', SYNTOPICA_DATA: '/d', LANG: 'C', UV_CACHE_DIR: '/c' })
  })
})
```

`apps/server/src/process/runProcess.test.ts`:

```ts
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { ProcessError } from './ProcessError'
import { runProcess } from './runProcess'

const node = (script: string, timeoutMs = 5000, maxBytes = 1024) =>
  runProcess({ file: process.execPath, args: ['-e', script], env: {}, timeoutMs, maxBytes })

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('runProcess', () => {
  it('returns stdout and the exit code', async () => {
    await expect(node('process.stdout.write("ok"); process.exit(3)')).resolves.toEqual({ code: 3, stdout: 'ok' })
  })
  it('kills the whole process group on timeout', async () => {
    const pidFile = join(await mkdtemp(join(tmpdir(), 'orbit-run-')), 'pid')
    const script = `
      const { spawn } = require('node:child_process')
      const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' })
      require('node:fs').writeFileSync(${JSON.stringify(pidFile)}, String(child.pid))
      setInterval(() => {}, 1000)`
    await expect(node(script, 500)).rejects.toThrow(ProcessError)
    await sleep(6000)
    const grandchild = Number(await readFile(pidFile, 'utf8'))
    expect(() => process.kill(grandchild, 0)).toThrow()
  }, 15_000)
  it('stops a process that writes more than maxBytes', async () => {
    await expect(node('setInterval(() => process.stdout.write("x".repeat(512)), 1)', 5000, 2048)).rejects.toMatchObject({
      reason: 'output_too_large',
    })
  })
  it('reports a missing executable as not_found', async () => {
    await expect(
      runProcess({ file: '/nonexistent/orbit-cli', args: [], env: {}, timeoutMs: 1000, maxBytes: 10 }),
    ).rejects.toMatchObject({ reason: 'not_found' })
  })
  it('stops when the caller aborts', async () => {
    const controller = new AbortController()
    const run = runProcess({
      file: process.execPath,
      args: ['-e', 'setInterval(() => {}, 1000)'],
      env: {},
      timeoutMs: 10_000,
      maxBytes: 10,
      signal: controller.signal,
    })
    controller.abort()
    await expect(run).rejects.toMatchObject({ reason: 'timeout' })
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL, modules not found.

- [ ] **Step 3: Implement**

`apps/server/src/types/RunRequest.ts`:

```ts
export type RunRequest = {
  readonly file: string
  readonly args: readonly string[]
  readonly env: Readonly<Record<string, string>>
  readonly timeoutMs: number
  readonly maxBytes: number
  readonly signal?: AbortSignal
}
```

`apps/server/src/types/RunResult.ts`:

```ts
export type RunResult = { readonly code: number; readonly stdout: string }
```

`apps/server/src/process/ProcessError.ts`:

```ts
import type { ReasonCode } from '@orbit/contract'

export class ProcessError extends Error {
  readonly reason: ReasonCode

  constructor(reason: ReasonCode) {
    super(reason)
    this.name = 'ProcessError'
    this.reason = reason
  }
}
```

`apps/server/src/process/buildChildEnv.ts`:

```ts
export const buildChildEnv = (
  source: NodeJS.ProcessEnv,
  extra: Readonly<Record<string, string>>,
): Record<string, string> => {
  const allowed = ['PATH', 'HOME', 'SYNTOPICA_DATA', 'LANG']
  const kept = allowed.flatMap((name) => {
    const value = source[name]
    return value === undefined ? [] : [[name, value] as const]
  })
  return { ...Object.fromEntries(kept), ...extra }
}
```

`apps/server/src/process/signalGroup.ts`:

```ts
export const signalGroup = (pid: number, signal: NodeJS.Signals): void => {
  try {
    process.kill(-pid, signal)
  } catch {
    // The group has already exited.
  }
}
```

`apps/server/src/process/killGroup.ts`:

```ts
import { signalGroup } from './signalGroup'

export const killGroup = (pid: number, graceMs: number): void => {
  signalGroup(pid, 'SIGTERM')
  setTimeout(() => signalGroup(pid, 'SIGKILL'), graceMs).unref()
}
```

`apps/server/src/process/runProcess.ts`:

```ts
import type { ReasonCode } from '@orbit/contract'
import { spawn } from 'node:child_process'

import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { killGroup } from './killGroup'
import { ProcessError } from './ProcessError'

export const runProcess = (request: RunRequest): Promise<RunResult> =>
  new Promise((resolve, reject) => {
    if (request.signal?.aborted === true) {
      reject(new ProcessError('timeout'))
      return
    }
    const child = spawn(request.file, [...request.args], {
      env: request.env,
      detached: true,
      shell: false,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const chunks: Buffer[] = []
    let size = 0
    let failure: ReasonCode | null = null
    const fail = (reason: ReasonCode): void => {
      if (failure !== null) return
      failure = reason
      if (child.pid !== undefined) killGroup(child.pid, 5000)
    }
    const timer = setTimeout(() => fail('timeout'), request.timeoutMs)
    request.signal?.addEventListener('abort', () => fail('timeout'), { once: true })
    child.stdout.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > request.maxBytes) fail('output_too_large')
      else chunks.push(chunk)
    })
    child.on('error', () => {
      clearTimeout(timer)
      reject(new ProcessError('not_found'))
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (failure === null) resolve({ code: code ?? -1, stdout: Buffer.concat(chunks).toString('utf8') })
      else reject(new ProcessError(failure))
    })
  })
```

If `max-lines-per-function` flags the executor arrow, move the `stdout` handler into `process/collectOutput.ts` exporting `collectOutput(stream, maxBytes, onOverflow): () => string` and call it here.

- [ ] **Step 4: Run tests and gate** — `pnpm --filter @orbit/server gate:pkg`, PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/server
git commit -m "feat(server): bounded subprocess runner with process-group kill"
```

---

### Task 8: Adapter loop and scheduler

**Files:**
- Create: `apps/server/src/types/Adapter.ts`, `apps/server/src/types/SnapshotSink.ts`, `apps/server/src/types/LoopHandle.ts`
- Create: `apps/server/src/scheduler/backoffDelay.ts`, `reasonOf.ts`, `downSnapshot.ts`, `degradeSnapshot.ts`, `raceAbort.ts`, `transitionEvent.ts`, `createAdapterLoop.ts`, `createScheduler.ts`
- Test: `apps/server/src/scheduler/createAdapterLoop.test.ts`, `createScheduler.test.ts`, `backoffDelay.test.ts`, `reasonOf.test.ts`

**Interfaces:**
- Consumes: `ProcessError` (Task 7), contract types.
- Produces:
  - `Adapter = { id: ComponentId; cadenceMs: number; timeoutMs: number; freshnessMs: number; read(signal: AbortSignal): Promise<SnapshotCore> }`
  - `SnapshotSink = { publish(snapshot: Snapshot): void }`
  - `createAdapterLoop(adapter: Adapter, sink: SnapshotSink): LoopHandle` with `LoopHandle = { start(): void; stop(): void }`
  - `createScheduler(adapters: readonly Adapter[], sink: SnapshotSink): LoopHandle`
  - Behaviour: single flight (next read is scheduled only after the previous settles); a read still running after `cadenceMs` publishes the last snapshot degraded to `lagging`; a read is aborted and reported as `timeout` at `timeoutMs` even if the adapter ignores its signal, but the next read starts only once the timed-out one has really settled (every subprocess adapter settles on abort, because `runProcess` kills the process group), so reads never overlap; failures publish `down` with `lastGood` and back off `min(cadence * 2^n, 10 * cadence)`; no publish for `freshnessMs` degrades the last snapshot to `stale`; health transitions to and from `down` add a `component.down` / `component.recovered` event.

- [ ] **Step 1: Write the failing tests**

`apps/server/src/scheduler/backoffDelay.test.ts`:

```ts
import { backoffDelay } from './backoffDelay'

describe('backoffDelay', () => {
  it('doubles per failure and caps at ten cadences', () => {
    expect(backoffDelay(1000, 1)).toBe(2000)
    expect(backoffDelay(1000, 3)).toBe(8000)
    expect(backoffDelay(1000, 9)).toBe(10_000)
  })
})
```

`apps/server/src/scheduler/reasonOf.test.ts`:

```ts
import { z } from 'zod'

import { ProcessError } from '../process/ProcessError'
import { reasonOf } from './reasonOf'

describe('reasonOf', () => {
  it('maps known failures to closed reason codes', () => {
    expect(reasonOf(new ProcessError('output_too_large'))).toBe('output_too_large')
    expect(reasonOf(z.number().safeParse('x').error)).toBe('schema_invalid')
    expect(reasonOf(new DOMException('t', 'TimeoutError'))).toBe('timeout')
    expect(reasonOf(new Error('anything'))).toBe('unreachable')
  })
})
```

`apps/server/src/scheduler/createAdapterLoop.test.ts`:

```ts
import type { Snapshot, SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import { createAdapterLoop } from './createAdapterLoop'

const core = (value: number): SnapshotCore => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: new Date().toISOString() }],
  pending: [],
  events: [],
  observedAt: new Date().toISOString(),
})

const adapter = (read: Adapter['read']): Adapter => ({
  id: 'synthetic',
  cadenceMs: 1000,
  timeoutMs: 3000,
  freshnessMs: 5000,
  read,
})

describe('createAdapterLoop', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('publishes each successful read', async () => {
    const published: Snapshot[] = []
    const loop = createAdapterLoop(adapter(async () => core(1)), { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(2500)
    loop.stop()
    expect(published.filter((s) => s.health.state === 'ok').length).toBe(3)
  })

  it('never overlaps reads and marks a slow read lagging', async () => {
    let active = 0
    let maxActive = 0
    const published: Snapshot[] = []
    const slow = adapter(async () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 2500))
      active -= 1
      return core(1)
    })
    const loop = createAdapterLoop(slow, { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(8000)
    loop.stop()
    expect(maxActive).toBe(1)
    expect(published.some((s) => s.health.reason === 'lagging')).toBe(true)
  })

  it('times out a read that ignores its signal and keeps the last good snapshot', async () => {
    let calls = 0
    const published: Snapshot[] = []
    const flaky = adapter(async () => {
      calls += 1
      if (calls === 1) return core(7)
      return new Promise<SnapshotCore>(() => undefined)
    })
    const loop = createAdapterLoop(flaky, { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(4500)
    loop.stop()
    const down = published.find((s) => s.health.state === 'down')
    expect(down?.health.reason).toBe('timeout')
    expect(down?.lastGood?.metrics[0]?.value).toBe(7)
    expect(down?.events.map((e) => e.kind)).toContain('component.down')
  })

  it('does not start a new read until a timed-out one settles', async () => {
    let active = 0
    let maxActive = 0
    let calls = 0
    const published: Snapshot[] = []
    const late = adapter(async () => {
      calls += 1
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, calls === 1 ? 6000 : 10))
      active -= 1
      return core(calls)
    })
    const loop = createAdapterLoop(late, { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(9000)
    loop.stop()
    expect(published.some((s) => s.health.reason === 'timeout')).toBe(true)
    expect(maxActive).toBe(1)
    expect(calls).toBeGreaterThan(1)
  })

  it('marks data stale when nothing new arrives within freshnessMs', async () => {
    let calls = 0
    const published: Snapshot[] = []
    const once = adapter(async () => {
      calls += 1
      if (calls === 1) return core(1)
      return new Promise<SnapshotCore>(() => undefined)
    })
    const loop = createAdapterLoop({ ...once, timeoutMs: 60_000 }, { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(5500)
    loop.stop()
    expect(published.some((s) => s.health.reason === 'stale')).toBe(true)
  })

  it('backs off after failures', async () => {
    let calls = 0
    const failing = adapter(async () => {
      calls += 1
      throw new Error('down')
    })
    const loop = createAdapterLoop(failing, { publish: () => undefined })
    loop.start()
    await vi.advanceTimersByTimeAsync(7100)
    loop.stop()
    // reads at 0, 2000 (2^1), 6000 (+4000): three calls in 7.1 s
    expect(calls).toBe(3)
  })
})
```

`apps/server/src/scheduler/createScheduler.test.ts`:

```ts
import type { Snapshot, SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import { createScheduler } from './createScheduler'

const ok = (component: 'worker' | 'launchd'): SnapshotCore => ({
  component,
  health: { state: 'ok', reason: null },
  metrics: [],
  pending: [],
  events: [],
  observedAt: new Date().toISOString(),
})

describe('createScheduler', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('keeps a healthy adapter on schedule while another hangs', async () => {
    const hung: Adapter = {
      id: 'launchd', cadenceMs: 1000, timeoutMs: 60_000, freshnessMs: 120_000,
      read: () => new Promise<SnapshotCore>(() => undefined),
    }
    const healthy: Adapter = {
      id: 'worker', cadenceMs: 1000, timeoutMs: 3000, freshnessMs: 10_000,
      read: async () => ok('worker'),
    }
    const times: number[] = []
    const scheduler = createScheduler([hung, healthy], {
      publish: (s: Snapshot) => {
        if (s.component === 'worker') times.push(Date.now())
      },
    })
    const start = Date.now()
    scheduler.start()
    await vi.advanceTimersByTimeAsync(5050)
    scheduler.stop()
    const offsets = times.map((t) => t - start)
    expect(offsets).toEqual([0, 1000, 2000, 3000, 4000, 5000])
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL, modules not found.

- [ ] **Step 3: Implement**

`apps/server/src/types/Adapter.ts`:

```ts
import type { ComponentId, SnapshotCore } from '@orbit/contract'

export type Adapter = {
  readonly id: ComponentId
  readonly cadenceMs: number
  readonly timeoutMs: number
  readonly freshnessMs: number
  read(signal: AbortSignal): Promise<SnapshotCore>
}
```

`apps/server/src/types/SnapshotSink.ts`:

```ts
import type { Snapshot } from '@orbit/contract'

export type SnapshotSink = { publish(snapshot: Snapshot): void }
```

`apps/server/src/types/LoopHandle.ts`:

```ts
export type LoopHandle = { start(): void; stop(): void }
```

`apps/server/src/scheduler/backoffDelay.ts`:

```ts
export const backoffDelay = (cadenceMs: number, failures: number): number =>
  Math.min(cadenceMs * 2 ** failures, cadenceMs * 10)
```

`apps/server/src/scheduler/reasonOf.ts`:

```ts
import type { ReasonCode } from '@orbit/contract'
import { ZodError } from 'zod'

import { ProcessError } from '../process/ProcessError'

export const reasonOf = (error: unknown): ReasonCode => {
  if (error instanceof ProcessError) return error.reason
  if (error instanceof ZodError) return 'schema_invalid'
  if (error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
    return 'timeout'
  }
  return 'unreachable'
}
```

`apps/server/src/scheduler/raceAbort.ts`:

```ts
import { ProcessError } from '../process/ProcessError'

export const raceAbort = <T>(work: Promise<T>, signal: AbortSignal): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new ProcessError('timeout')), { once: true })
    work.then(resolve, reject)
  })
```

`apps/server/src/scheduler/transitionEvent.ts`:

```ts
import type { Health, OrbitEvent, SnapshotCore } from '@orbit/contract'

export const transitionEvent = (
  previous: Health | null,
  next: SnapshotCore,
): OrbitEvent | null => {
  const wasDown = previous?.state === 'down'
  const isDown = next.health.state === 'down'
  if (wasDown === isDown) return null
  return {
    at: next.observedAt,
    component: next.component,
    kind: isDown ? 'component.down' : 'component.recovered',
    severity: isDown ? 'error' : 'info',
    refs: isDown && next.health.reason !== null ? { reason: next.health.reason } : {},
  }
}
```

`apps/server/src/scheduler/downSnapshot.ts`:

```ts
import type { ComponentId, ReasonCode, Snapshot, SnapshotCore } from '@orbit/contract'

export const downSnapshot = (
  component: ComponentId,
  reason: ReasonCode,
  lastGood: SnapshotCore | null,
): Snapshot => ({
  component,
  health: { state: 'down', reason },
  metrics: [],
  pending: [],
  events: [],
  observedAt: new Date().toISOString(),
  lastGood,
})
```

`apps/server/src/scheduler/degradeSnapshot.ts`:

```ts
import type { Snapshot } from '@orbit/contract'

export const degradeSnapshot = (last: Snapshot, reason: 'lagging' | 'stale'): Snapshot => ({
  ...last,
  events: [],
  health: { state: last.health.state === 'down' ? 'down' : 'warn', reason },
})
```

`apps/server/src/scheduler/createAdapterLoop.ts`:

```ts
import type { Snapshot, SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import type { LoopHandle } from '../types/LoopHandle'
import type { SnapshotSink } from '../types/SnapshotSink'
import { backoffDelay } from './backoffDelay'
import { degradeSnapshot } from './degradeSnapshot'
import { downSnapshot } from './downSnapshot'
import { raceAbort } from './raceAbort'
import { reasonOf } from './reasonOf'
import { transitionEvent } from './transitionEvent'

export const createAdapterLoop = (adapter: Adapter, sink: SnapshotSink): LoopHandle => {
  let stopped = true
  let failures = 0
  let lastGood: SnapshotCore | null = null
  let last: Snapshot | null = null
  let next: NodeJS.Timeout | undefined
  let stale: NodeJS.Timeout | undefined

  const emit = (snapshot: Snapshot): void => {
    const change = transitionEvent(last?.health ?? null, snapshot)
    last = snapshot
    sink.publish(change === null ? snapshot : { ...snapshot, events: [...snapshot.events, change] })
    clearTimeout(stale)
    stale = setTimeout(() => {
      if (last !== null) sink.publish(degradeSnapshot(last, 'stale'))
    }, adapter.freshnessMs)
  }

  const readOnce = async (): Promise<void> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), adapter.timeoutMs)
    const lag = setTimeout(() => {
      if (last !== null) sink.publish(degradeSnapshot(last, 'lagging'))
    }, adapter.cadenceMs)
    const work = adapter.read(controller.signal)
    try {
      const core = await raceAbort(work, controller.signal)
      lastGood = core
      failures = 0
      emit({ ...core, lastGood: null })
    } catch (error) {
      failures += 1
      emit(downSnapshot(adapter.id, reasonOf(error), lastGood))
    } finally {
      clearTimeout(timeout)
      clearTimeout(lag)
    }
    await work.catch(() => undefined)
    if (!stopped) next = setTimeout(tick, failures === 0 ? adapter.cadenceMs : backoffDelay(adapter.cadenceMs, failures))
  }

  const tick = (): void => {
    void readOnce()
  }

  return {
    start: () => {
      stopped = false
      tick()
    },
    stop: () => {
      stopped = true
      clearTimeout(next)
      clearTimeout(stale)
    },
  }
}
```

The success path schedules the next read `cadenceMs` after the previous one *settles*; the scheduler test expects ticks exactly on 1 s boundaries because the healthy read resolves immediately. If `max-lines-per-function` (50) flags the factory, move `emit` into `scheduler/createEmitter.ts` exporting `createEmitter(adapter, sink): { emit(snapshot): void; last(): Snapshot | null; stop(): void }` and use it here.

`apps/server/src/scheduler/createScheduler.ts`:

```ts
import type { Adapter } from '../types/Adapter'
import type { LoopHandle } from '../types/LoopHandle'
import type { SnapshotSink } from '../types/SnapshotSink'
import { createAdapterLoop } from './createAdapterLoop'

export const createScheduler = (adapters: readonly Adapter[], sink: SnapshotSink): LoopHandle => {
  const loops = adapters.map((adapter) => createAdapterLoop(adapter, sink))
  return {
    start: () => loops.forEach((loop) => loop.start()),
    stop: () => loops.forEach((loop) => loop.stop()),
  }
}
```

- [ ] **Step 4: Run tests and gate** — `pnpm --filter @orbit/server gate:pkg`, PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/server
git commit -m "feat(server): single-flight adapter loops with backoff, lag and staleness"
```

---
### Task 9: Hub and replay ring

**Files:**
- Create: `apps/server/src/types/Ring.ts`, `apps/server/src/types/Hub.ts`
- Create: `apps/server/src/hub/createRing.ts`, `apps/server/src/hub/createHub.ts`
- Test: `apps/server/src/hub/createRing.test.ts`, `apps/server/src/hub/createHub.test.ts`

**Interfaces:**
- Produces:
  - `Ring = { push(message: StreamMessage): void; after(id: number): StreamMessage[] | null }` — `null` means the id is outside the ring (resync needed).
  - `Hub = SnapshotSink & { snapshots(): Snapshot[]; recentEvents(): OrbitEvent[]; lastId(): number; replayAfter(id: number): StreamMessage[] | null; subscribe(listener: (message: StreamMessage) => void): () => void }`
  - `createHub(options: { ringSize: number; recentEvents: number; firstId: number }): Hub`. Stream ids start at `firstId` (the server passes `Date.now() * 1000` so ids grow across restarts). Snapshots are stored and sent with `events: []`; each event becomes its own `event` message. A snapshot message is sent only when the snapshot minus `observedAt` changed, or 30 s after the last one sent for that component.

- [ ] **Step 1: Write the failing tests**

`apps/server/src/hub/createRing.test.ts`:

```ts
import type { StreamMessage } from '@orbit/contract'

import { createRing } from './createRing'

const sync = (id: number): StreamMessage => ({ type: 'sync', id })

describe('createRing', () => {
  it('replays messages after a known id', () => {
    const ring = createRing(3)
    ;[1, 2, 3].forEach((id) => ring.push(sync(id)))
    expect(ring.after(1)?.map((m) => m.id)).toEqual([2, 3])
    expect(ring.after(3)).toEqual([])
    expect(ring.after(0)?.map((m) => m.id)).toEqual([1, 2, 3])
  })
  it('returns null outside the ring', () => {
    const ring = createRing(2)
    ;[1, 2, 3].forEach((id) => ring.push(sync(id)))
    expect(ring.after(0)).toBeNull()
    expect(ring.after(9)).toBeNull()
    expect(createRing(2).after(1)).toBeNull()
  })
})
```

`apps/server/src/hub/createHub.test.ts`:

```ts
import type { Snapshot, StreamMessage } from '@orbit/contract'

import { createHub } from './createHub'

const snap = (value: number, events: Snapshot['events'] = []): Snapshot => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: '2026-10-02T10:00:00.000Z' }],
  pending: [],
  events,
  observedAt: new Date().toISOString(),
  lastGood: null,
})

const tick = {
  at: '2026-10-02T10:00:00.000Z',
  component: 'synthetic',
  kind: 'synthetic.tick',
  severity: 'info',
  refs: { n: 1 },
} as const

describe('createHub', () => {
  it('sends a snapshot only when it changes, and events separately', () => {
    const hub = createHub({ ringSize: 10, recentEvents: 5, firstId: 100 })
    const seen: StreamMessage[] = []
    hub.subscribe((m) => seen.push(m))
    hub.publish(snap(1))
    hub.publish(snap(1))
    hub.publish(snap(2, [tick]))
    expect(seen.map((m) => [m.type, m.id])).toEqual([
      ['snapshot', 100],
      ['snapshot', 101],
      ['event', 102],
    ])
    expect(hub.snapshots()[0]?.events).toEqual([])
    expect(hub.recentEvents()).toHaveLength(1)
    expect(hub.lastId()).toBe(102)
    expect(hub.replayAfter(100)?.map((m) => m.id)).toEqual([101, 102])
  })
  it('stops delivering after unsubscribe and caps recent events', () => {
    const hub = createHub({ ringSize: 10, recentEvents: 2, firstId: 0 })
    const seen: StreamMessage[] = []
    const off = hub.subscribe((m) => seen.push(m))
    off()
    hub.publish(snap(1, [tick, tick, tick]))
    expect(seen).toEqual([])
    expect(hub.recentEvents()).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL.

- [ ] **Step 3: Implement**

`apps/server/src/types/Ring.ts`:

```ts
import type { StreamMessage } from '@orbit/contract'

export type Ring = {
  push(message: StreamMessage): void
  after(id: number): StreamMessage[] | null
}
```

`apps/server/src/types/Hub.ts`:

```ts
import type { OrbitEvent, Snapshot, StreamMessage } from '@orbit/contract'

import type { SnapshotSink } from './SnapshotSink'

export type Hub = SnapshotSink & {
  snapshots(): Snapshot[]
  recentEvents(): OrbitEvent[]
  lastId(): number
  replayAfter(id: number): StreamMessage[] | null
  subscribe(listener: (message: StreamMessage) => void): () => void
}
```

`apps/server/src/hub/createRing.ts`:

```ts
import type { StreamMessage } from '@orbit/contract'

import type { Ring } from '../types/Ring'

export const createRing = (capacity: number): Ring => {
  const items: StreamMessage[] = []
  return {
    push: (message) => {
      items.push(message)
      if (items.length > capacity) items.shift()
    },
    after: (id) => {
      const first = items[0]
      const last = items.at(-1)
      if (first === undefined || last === undefined) return null
      if (id < first.id - 1 || id > last.id) return null
      return items.filter((message) => message.id > id)
    },
  }
}
```

`apps/server/src/hub/createHub.ts`:

```ts
import type { ComponentId, OrbitEvent, Snapshot, StreamMessage } from '@orbit/contract'

import type { Hub } from '../types/Hub'
import { createRing } from './createRing'

export const createHub = (options: { ringSize: number; recentEvents: number; firstId: number }): Hub => {
  let nextId = options.firstId
  const ring = createRing(options.ringSize)
  const current = new Map<ComponentId, Snapshot>()
  const sent = new Map<ComponentId, { hash: string; at: number }>()
  const events: OrbitEvent[] = []
  const listeners = new Set<(message: StreamMessage) => void>()
  const send = (message: StreamMessage): void => {
    ring.push(message)
    listeners.forEach((listener) => listener(message))
  }
  const publishSnapshot = (snapshot: Snapshot): void => {
    const stored = { ...snapshot, events: [] }
    current.set(snapshot.component, stored)
    const hash = JSON.stringify({ ...stored, observedAt: '' })
    const prior = sent.get(snapshot.component)
    if (prior?.hash === hash && Date.now() - prior.at < 30_000) return
    sent.set(snapshot.component, { hash, at: Date.now() })
    send({ type: 'snapshot', id: nextId++, snapshot: stored })
  }
  return {
    publish: (snapshot) => {
      publishSnapshot(snapshot)
      for (const event of snapshot.events) {
        events.push(event)
        events.splice(0, Math.max(0, events.length - options.recentEvents))
        send({ type: 'event', id: nextId++, event })
      }
    },
    snapshots: () => [...current.values()],
    recentEvents: () => [...events],
    lastId: () => nextId - 1,
    replayAfter: (id) => ring.after(id),
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
```

- [ ] **Step 4: Run tests and gate** — `pnpm --filter @orbit/server gate:pkg`, PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/server
git commit -m "feat(server): snapshot hub with a replay ring"
```

---

### Task 10: Admin token, sessions, rate limits, audit

**Files:**
- Create: `apps/server/src/auth/randomToken.ts`, `hashSecret.ts`, `secretsEqual.ts`, `authDurations.ts`, `createAdminToken.ts`, `verifyAdminToken.ts`, `createSession.ts`, `touchSession.ts`, `deleteSession.ts`, `listSessions.ts`, `revokeSessions.ts`, `consumeRateLimit.ts`, `recordAudit.ts`
- Create: `apps/server/src/types/SessionSummary.ts`, `apps/server/src/types/RateRule.ts`
- Test: `apps/server/src/auth/adminToken.test.ts`, `sessions.test.ts`, `consumeRateLimit.test.ts`
- Create (test scaffolding): `apps/server/src/test/openAuthDb.ts`

**Interfaces:**
- Consumes: `openDatabase`, `AUTH_SCHEMA_SQL` (Task 6).
- Produces: `createAdminToken(db, now): string` (256-bit, base64url, replaces any previous); `verifyAdminToken(db, token): boolean`; `createSession(db, now): string`; `touchSession(db, id, now): boolean` (sliding 7 d, absolute 30 d; expired rows deleted); `deleteSession(db, id): void`; `listSessions(db): SessionSummary[]` with `SessionSummary = { prefix: string; created: number; lastSeen: number; expires: number }` (prefix = first 8 hex characters of the stored hash); `revokeSessions(db, prefix): number` (prefix at least 8 characters); `consumeRateLimit(db, rule: RateRule, now): boolean` with `RateRule = { key: string; limit: number }`, per-minute windows; `recordAudit(db, action: string, outcome: 'ok' | 'denied' | 'error', now): void` where `action` is a closed literal at each call site (never user input). `AUTH_DURATIONS = { sessionSlidingMs, sessionAbsoluteMs, invitationMs, invitationMaxFailures }`.

- [ ] **Step 1: Test scaffolding**

`apps/server/src/test/openAuthDb.ts`:

```ts
import { mkdtempSync } from 'node:fs'
import type { DatabaseSync } from 'node:sqlite'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { AUTH_SCHEMA_SQL } from '../state/authSchemaSql'
import { openDatabase } from '../state/openDatabase'

export const openAuthDb = (): DatabaseSync =>
  openDatabase(join(mkdtempSync(join(tmpdir(), 'orbit-auth-')), 'auth.sqlite3'), AUTH_SCHEMA_SQL)
```

- [ ] **Step 2: Write the failing tests**

`apps/server/src/auth/adminToken.test.ts`:

```ts
import { openAuthDb } from '../test/openAuthDb'
import { createAdminToken } from './createAdminToken'
import { verifyAdminToken } from './verifyAdminToken'

describe('admin token', () => {
  it('verifies only the latest token and stores no plaintext', () => {
    const db = openAuthDb()
    expect(verifyAdminToken(db, 'anything')).toBe(false)
    const first = createAdminToken(db, 1)
    const second = createAdminToken(db, 2)
    expect(second).toHaveLength(43)
    expect(verifyAdminToken(db, first)).toBe(false)
    expect(verifyAdminToken(db, second)).toBe(true)
    const stored = db.prepare('SELECT hash FROM admin_token').get() as { hash: string }
    expect(stored.hash).not.toContain(second)
  })
})
```

`apps/server/src/auth/sessions.test.ts`:

```ts
import { openAuthDb } from '../test/openAuthDb'
import { AUTH_DURATIONS } from './authDurations'
import { createSession } from './createSession'
import { deleteSession } from './deleteSession'
import { listSessions } from './listSessions'
import { revokeSessions } from './revokeSessions'
import { touchSession } from './touchSession'

const day = 86_400_000

describe('sessions', () => {
  it('slides the expiry on use', () => {
    const db = openAuthDb()
    const id = createSession(db, 0)
    expect(touchSession(db, id, 6 * day)).toBe(true)
    expect(touchSession(db, id, 12 * day)).toBe(true)
    expect(touchSession(db, id, 20 * day)).toBe(false)
  })
  it('enforces the absolute expiry even with constant use', () => {
    const db = openAuthDb()
    const id = createSession(db, 0)
    for (let t = day; t < AUTH_DURATIONS.sessionAbsoluteMs; t += day) {
      expect(touchSession(db, id, t)).toBe(true)
    }
    expect(touchSession(db, id, AUTH_DURATIONS.sessionAbsoluteMs)).toBe(false)
  })
  it('rejects unknown ids, deletes on logout, revokes by prefix', () => {
    const db = openAuthDb()
    expect(touchSession(db, 'nope', 0)).toBe(false)
    const a = createSession(db, 0)
    deleteSession(db, a)
    expect(touchSession(db, a, 1)).toBe(false)
    createSession(db, 0)
    const [summary] = listSessions(db)
    expect(summary?.prefix).toHaveLength(8)
    expect(() => revokeSessions(db, 'abc')).toThrow()
    expect(revokeSessions(db, summary?.prefix ?? '')).toBe(1)
    expect(listSessions(db)).toEqual([])
  })
})
```

`apps/server/src/auth/consumeRateLimit.test.ts`:

```ts
import { openAuthDb } from '../test/openAuthDb'
import { consumeRateLimit } from './consumeRateLimit'

describe('consumeRateLimit', () => {
  it('allows up to the limit per minute window', () => {
    const db = openAuthDb()
    const rule = { key: 'session:global', limit: 2 }
    expect(consumeRateLimit(db, rule, 0)).toBe(true)
    expect(consumeRateLimit(db, rule, 10)).toBe(true)
    expect(consumeRateLimit(db, rule, 20)).toBe(false)
    expect(consumeRateLimit(db, rule, 60_000)).toBe(true)
  })
})
```

- [ ] **Step 3: Run them to see them fail** — FAIL.

- [ ] **Step 4: Implement**

`apps/server/src/auth/randomToken.ts`:

```ts
import { randomBytes } from 'node:crypto'

export const randomToken = (bytes: number): string => randomBytes(bytes).toString('base64url')
```

`apps/server/src/auth/hashSecret.ts`:

```ts
import { createHash } from 'node:crypto'

export const hashSecret = (secret: string): string => createHash('sha256').update(secret).digest('hex')
```

`apps/server/src/auth/secretsEqual.ts`:

```ts
import { timingSafeEqual } from 'node:crypto'

export const secretsEqual = (aHex: string, bHex: string): boolean => {
  const a = Buffer.from(aHex, 'hex')
  const b = Buffer.from(bHex, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}
```

`apps/server/src/auth/authDurations.ts`:

```ts
export const AUTH_DURATIONS = {
  sessionSlidingMs: 7 * 86_400_000,
  sessionAbsoluteMs: 30 * 86_400_000,
  invitationMs: 5 * 60_000,
  invitationMaxFailures: 5,
} as const
```

`apps/server/src/auth/createAdminToken.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import { hashSecret } from './hashSecret'
import { randomToken } from './randomToken'

export const createAdminToken = (db: DatabaseSync, now: number): string => {
  const token = randomToken(32)
  db.prepare(
    'INSERT INTO admin_token (id, hash, created) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET hash = excluded.hash, created = excluded.created',
  ).run(hashSecret(token), now)
  return token
}
```

`apps/server/src/auth/verifyAdminToken.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import { hashSecret } from './hashSecret'
import { secretsEqual } from './secretsEqual'

export const verifyAdminToken = (db: DatabaseSync, token: string): boolean => {
  const row = db.prepare('SELECT hash FROM admin_token WHERE id = 1').get() as { hash: string } | undefined
  return row !== undefined && secretsEqual(row.hash, hashSecret(token))
}
```

`apps/server/src/auth/createSession.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import { AUTH_DURATIONS } from './authDurations'
import { hashSecret } from './hashSecret'
import { randomToken } from './randomToken'

export const createSession = (db: DatabaseSync, now: number): string => {
  const id = randomToken(32)
  db.prepare('INSERT INTO sessions (hash, created, last_seen, expires) VALUES (?, ?, ?, ?)').run(
    hashSecret(id),
    now,
    now,
    now + AUTH_DURATIONS.sessionSlidingMs,
  )
  return id
}
```

`apps/server/src/auth/touchSession.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import { AUTH_DURATIONS } from './authDurations'
import { hashSecret } from './hashSecret'

export const touchSession = (db: DatabaseSync, id: string, now: number): boolean => {
  const hash = hashSecret(id)
  const row = db.prepare('SELECT created, expires FROM sessions WHERE hash = ?').get(hash) as
    | { created: number; expires: number }
    | undefined
  if (row === undefined) return false
  const absolute = row.created + AUTH_DURATIONS.sessionAbsoluteMs
  if (row.expires <= now || absolute <= now) {
    db.prepare('DELETE FROM sessions WHERE hash = ?').run(hash)
    return false
  }
  db.prepare('UPDATE sessions SET last_seen = ?, expires = ? WHERE hash = ?').run(
    now,
    Math.min(now + AUTH_DURATIONS.sessionSlidingMs, absolute),
    hash,
  )
  return true
}
```

`apps/server/src/auth/deleteSession.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import { hashSecret } from './hashSecret'

export const deleteSession = (db: DatabaseSync, id: string): void => {
  db.prepare('DELETE FROM sessions WHERE hash = ?').run(hashSecret(id))
}
```

`apps/server/src/types/SessionSummary.ts`:

```ts
export type SessionSummary = {
  readonly prefix: string
  readonly created: number
  readonly lastSeen: number
  readonly expires: number
}
```

`apps/server/src/auth/listSessions.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { SessionSummary } from '../types/SessionSummary'

export const listSessions = (db: DatabaseSync): SessionSummary[] =>
  db
    .prepare('SELECT substr(hash, 1, 8) AS prefix, created, last_seen AS lastSeen, expires FROM sessions ORDER BY created')
    .all() as SessionSummary[]
```

`apps/server/src/auth/revokeSessions.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

export const revokeSessions = (db: DatabaseSync, prefix: string): number => {
  if (!/^[0-9a-f]{8,64}$/.test(prefix)) throw new Error('prefix must be at least 8 hex characters')
  const result = db.prepare('DELETE FROM sessions WHERE substr(hash, 1, ?) = ?').run(prefix.length, prefix)
  return Number(result.changes)
}
```

`apps/server/src/types/RateRule.ts`:

```ts
export type RateRule = { readonly key: string; readonly limit: number }
```

`apps/server/src/auth/consumeRateLimit.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { RateRule } from '../types/RateRule'

export const consumeRateLimit = (db: DatabaseSync, rule: RateRule, now: number): boolean => {
  const window = Math.floor(now / 60_000)
  const row = db
    .prepare(
      'INSERT INTO rate_limits (key, window, count) VALUES (?, ?, 1) ON CONFLICT(key, window) DO UPDATE SET count = count + 1 RETURNING count',
    )
    .get(rule.key, window) as { count: number }
  db.prepare('DELETE FROM rate_limits WHERE window < ?').run(window - 1)
  return row.count <= rule.limit
}
```

`apps/server/src/auth/recordAudit.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

export const recordAudit = (
  db: DatabaseSync,
  action: 'session.create' | 'session.pair' | 'session.logout',
  outcome: 'ok' | 'denied' | 'error',
  now: number,
): void => {
  db.prepare('INSERT INTO audit (at, action, outcome) VALUES (?, ?, ?)').run(now, action, outcome)
}
```

- [ ] **Step 5: Run tests and gate** — `pnpm --filter @orbit/server gate:pkg`, PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/server
git commit -m "feat(server): admin token, sliding sessions, persisted rate limits, audit"
```

---

### Task 11: Pairing invitations

**Files:**
- Create: `apps/server/src/auth/createInvitation.ts`, `apps/server/src/auth/redeemInvitation.ts`
- Create: `apps/server/src/types/Invitation.ts`
- Test: `apps/server/src/auth/invitations.test.ts`

**Interfaces:**
- Consumes: Task 10 helpers.
- Produces: `createInvitation(db, now): Invitation` with `Invitation = { id: string; secret: string }` (id 64-bit, secret 128-bit, base64url); `redeemInvitation(db, invitation: Invitation, now): string | null` returning a new session id, atomic (`BEGIN IMMEDIATE`), counting failed secrets against the id and refusing after 5 failures, after use, or after 5 minutes.

- [ ] **Step 1: Write the failing test**

`apps/server/src/auth/invitations.test.ts`:

```ts
import { openAuthDb } from '../test/openAuthDb'
import { createInvitation } from './createInvitation'
import { redeemInvitation } from './redeemInvitation'
import { touchSession } from './touchSession'

describe('invitations', () => {
  it('redeems once into a working session', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    const session = redeemInvitation(db, invitation, 1000)
    expect(session).not.toBeNull()
    expect(touchSession(db, session ?? '', 2000)).toBe(true)
    expect(redeemInvitation(db, invitation, 3000)).toBeNull()
  })
  it('expires after five minutes', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    expect(redeemInvitation(db, invitation, 5 * 60_000)).toBeNull()
  })
  it('locks after five wrong secrets', () => {
    const db = openAuthDb()
    const invitation = createInvitation(db, 0)
    for (let i = 0; i < 5; i += 1) {
      expect(redeemInvitation(db, { id: invitation.id, secret: 'wrong' }, 1)).toBeNull()
    }
    expect(redeemInvitation(db, invitation, 2)).toBeNull()
  })
  it('has 64-bit ids and 128-bit secrets', () => {
    const invitation = createInvitation(openAuthDb(), 0)
    expect(Buffer.from(invitation.id, 'base64url')).toHaveLength(8)
    expect(Buffer.from(invitation.secret, 'base64url')).toHaveLength(16)
  })
})
```

- [ ] **Step 2: Run it to see it fail** — FAIL.

- [ ] **Step 3: Implement**

`apps/server/src/types/Invitation.ts`:

```ts
export type Invitation = { readonly id: string; readonly secret: string }
```

`apps/server/src/auth/createInvitation.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { Invitation } from '../types/Invitation'
import { AUTH_DURATIONS } from './authDurations'
import { hashSecret } from './hashSecret'
import { randomToken } from './randomToken'

export const createInvitation = (db: DatabaseSync, now: number): Invitation => {
  const invitation = { id: randomToken(8), secret: randomToken(16) }
  db.prepare('INSERT INTO invitations (id, secret_hash, expires) VALUES (?, ?, ?)').run(
    invitation.id,
    hashSecret(invitation.secret),
    now + AUTH_DURATIONS.invitationMs,
  )
  return invitation
}
```

`apps/server/src/auth/redeemInvitation.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { Invitation } from '../types/Invitation'
import { AUTH_DURATIONS } from './authDurations'
import { createSession } from './createSession'
import { hashSecret } from './hashSecret'
import { secretsEqual } from './secretsEqual'

export const redeemInvitation = (db: DatabaseSync, invitation: Invitation, now: number): string | null => {
  db.exec('BEGIN IMMEDIATE')
  try {
    const row = db
      .prepare('SELECT secret_hash AS hash, failures FROM invitations WHERE id = ? AND used = 0 AND expires > ?')
      .get(invitation.id, now) as { hash: string; failures: number } | undefined
    let session: string | null = null
    if (row !== undefined && row.failures < AUTH_DURATIONS.invitationMaxFailures) {
      if (secretsEqual(row.hash, hashSecret(invitation.secret))) {
        db.prepare('UPDATE invitations SET used = 1 WHERE id = ?').run(invitation.id)
        session = createSession(db, now)
      } else {
        db.prepare('UPDATE invitations SET failures = failures + 1 WHERE id = ?').run(invitation.id)
      }
    }
    db.exec('COMMIT')
    return session
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
```

- [ ] **Step 4: Run tests and gate** — PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/server
git commit -m "feat(server): single-use pairing invitations"
```

---

### Task 12: Request guards

**Files:**
- Create: `apps/server/src/types/GuardConfig.ts`
- Create: `apps/server/src/http/allowedOrigins.ts`, `hostAllowlist.ts`, `securityHeaders.ts`, `requireSameOrigin.ts`, `requireCsrfHeader.ts`, `tailnetLogin.ts`, `sessionCookieName.ts`, `requireSession.ts`, `sourceKey.ts`
- Test: `apps/server/src/http/guards.test.ts`, `requireSession.test.ts`

**Interfaces:**
- Consumes: `touchSession` (Task 10).
- Produces (all Hono `MiddlewareHandler`s unless noted):
  - `GuardConfig = { port: number; allowedHosts: readonly string[]; allowedLogins: readonly string[] }`
  - `allowedOrigins(config: GuardConfig): string[]` → `http://127.0.0.1:<port>`, `http://localhost:<port>`, `https://<host>` for each allowed host
  - `hostAllowlist(config)` → 421 `{"error":"misdirected"}` when `Host` is not `127.0.0.1:<port>`, `localhost:<port>` or an allowed host
  - `securityHeaders()` → CSP `default-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; object-src 'none'`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and `Cache-Control: no-store` for `/api/*`
  - `requireSameOrigin(config)` → 403 `{"error":"forbidden"}` unless `Origin` is allowed, or there is no `Origin` and `Sec-Fetch-Site` is `same-origin`
  - `requireCsrfHeader()` → 403 for non-GET/HEAD without `X-Orbit: 1`
  - `tailnetLogin(config)` → 403 when `Tailscale-User-Login` is present and not allowed
  - `SESSION_COOKIE = '__Host-orbit_session'`
  - `requireSession(db, now: () => number)` → 401 `{"error":"unauthorized"}` unless the cookie names a live session
  - `sourceKey(c): string` → last `X-Forwarded-For` hop (the one Tailscale Serve appends; earlier hops are whatever the client sent), else the socket address, else `unknown`. A loopback caller can still forge it; the shared global limit is the real bound (spec 6.4)

- [ ] **Step 1: Write the failing tests**

`apps/server/src/http/guards.test.ts`:

```ts
import { Hono } from 'hono'

import { hostAllowlist } from './hostAllowlist'
import { requireCsrfHeader } from './requireCsrfHeader'
import { requireSameOrigin } from './requireSameOrigin'
import { securityHeaders } from './securityHeaders'
import { tailnetLogin } from './tailnetLogin'

const config = { port: 8790, allowedHosts: ['orbit.example.ts.net'], allowedLogins: ['me@example.com'] }

const app = new Hono()
app.use('*', hostAllowlist(config), securityHeaders(), tailnetLogin(config))
app.use('/api/*', requireSameOrigin(config), requireCsrfHeader())
app.get('/api/x', (c) => c.json({ ok: true }))
app.post('/api/x', (c) => c.json({ ok: true }))

const call = (path: string, init: RequestInit & { headers?: Record<string, string> } = {}) =>
  app.request(`http://127.0.0.1:8790${path}`, {
    ...init,
    headers: { Host: '127.0.0.1:8790', 'Sec-Fetch-Site': 'same-origin', ...init.headers },
  })

describe('request guards', () => {
  it('rejects an unknown Host (DNS rebinding)', async () => {
    expect((await call('/api/x', { headers: { Host: 'evil.example' } })).status).toBe(421)
  })
  it('accepts the tailnet host with its HTTPS origin', async () => {
    const res = await call('/api/x', {
      headers: { Host: 'orbit.example.ts.net', Origin: 'https://orbit.example.ts.net' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(res.headers.get('content-security-policy')).toContain("frame-ancestors 'none'")
  })
  it('rejects a cross-site origin and a missing same-origin signal', async () => {
    expect((await call('/api/x', { headers: { Origin: 'https://evil.example' } })).status).toBe(403)
    expect((await call('/api/x', { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status).toBe(403)
  })
  it('requires X-Orbit on mutations', async () => {
    expect((await call('/api/x', { method: 'POST' })).status).toBe(403)
    expect((await call('/api/x', { method: 'POST', headers: { 'X-Orbit': '1' } })).status).toBe(200)
  })
  it('refuses a tailnet login that is not allowed', async () => {
    expect((await call('/api/x', { headers: { 'Tailscale-User-Login': 'other@example.com' } })).status).toBe(403)
    expect((await call('/api/x', { headers: { 'Tailscale-User-Login': 'me@example.com' } })).status).toBe(200)
  })
})
```

`apps/server/src/http/requireSession.test.ts`:

```ts
import { Hono } from 'hono'

import { createSession } from '../auth/createSession'
import { openAuthDb } from '../test/openAuthDb'
import { requireSession } from './requireSession'
import { SESSION_COOKIE } from './sessionCookieName'

describe('requireSession', () => {
  it('admits only a live session cookie', async () => {
    const db = openAuthDb()
    const id = createSession(db, Date.now())
    const app = new Hono()
    app.use('*', requireSession(db, () => Date.now()))
    app.get('/', (c) => c.text('ok'))
    expect((await app.request('/')).status).toBe(401)
    expect((await app.request('/', { headers: { Cookie: `${SESSION_COOKIE}=bad` } })).status).toBe(401)
    expect((await app.request('/', { headers: { Cookie: `${SESSION_COOKIE}=${id}` } })).status).toBe(200)
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL.

- [ ] **Step 3: Implement**

`apps/server/src/types/GuardConfig.ts`:

```ts
export type GuardConfig = {
  readonly port: number
  readonly allowedHosts: readonly string[]
  readonly allowedLogins: readonly string[]
}
```

`apps/server/src/http/allowedOrigins.ts`:

```ts
import type { GuardConfig } from '../types/GuardConfig'

export const allowedOrigins = (config: GuardConfig): string[] => [
  `http://127.0.0.1:${config.port}`,
  `http://localhost:${config.port}`,
  ...config.allowedHosts.map((host) => `https://${host}`),
]
```

`apps/server/src/http/hostAllowlist.ts`:

```ts
import type { MiddlewareHandler } from 'hono'

import type { GuardConfig } from '../types/GuardConfig'

export const hostAllowlist = (config: GuardConfig): MiddlewareHandler => {
  const hosts = new Set([`127.0.0.1:${config.port}`, `localhost:${config.port}`, ...config.allowedHosts])
  return async (c, next) => {
    if (!hosts.has(c.req.header('Host') ?? '')) return c.json({ error: 'misdirected' }, 421)
    await next()
  }
}
```

`apps/server/src/http/securityHeaders.ts`:

```ts
import type { MiddlewareHandler } from 'hono'

export const securityHeaders = (): MiddlewareHandler => async (c, next) => {
  await next()
  c.header(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; object-src 'none'",
  )
  c.header('Referrer-Policy', 'no-referrer')
  c.header('X-Content-Type-Options', 'nosniff')
  if (c.req.path.startsWith('/api/')) c.header('Cache-Control', 'no-store')
}
```

`apps/server/src/http/requireSameOrigin.ts`:

```ts
import type { MiddlewareHandler } from 'hono'

import type { GuardConfig } from '../types/GuardConfig'
import { allowedOrigins } from './allowedOrigins'

export const requireSameOrigin = (config: GuardConfig): MiddlewareHandler => {
  const origins = new Set(allowedOrigins(config))
  return async (c, next) => {
    const origin = c.req.header('Origin')
    const sameOrigin = origin === undefined ? c.req.header('Sec-Fetch-Site') === 'same-origin' : origins.has(origin)
    if (!sameOrigin) return c.json({ error: 'forbidden' }, 403)
    await next()
  }
}
```

`apps/server/src/http/requireCsrfHeader.ts`:

```ts
import type { MiddlewareHandler } from 'hono'

export const requireCsrfHeader = (): MiddlewareHandler => async (c, next) => {
  const safe = c.req.method === 'GET' || c.req.method === 'HEAD'
  if (!safe && c.req.header('X-Orbit') !== '1') return c.json({ error: 'forbidden' }, 403)
  await next()
}
```

`apps/server/src/http/tailnetLogin.ts`:

```ts
import type { MiddlewareHandler } from 'hono'

import type { GuardConfig } from '../types/GuardConfig'

export const tailnetLogin = (config: GuardConfig): MiddlewareHandler => {
  const logins = new Set(config.allowedLogins)
  return async (c, next) => {
    const login = c.req.header('Tailscale-User-Login')
    if (login !== undefined && !logins.has(login)) return c.json({ error: 'forbidden' }, 403)
    await next()
  }
}
```

`apps/server/src/http/sessionCookieName.ts`:

```ts
export const SESSION_COOKIE = '__Host-orbit_session'
```

`apps/server/src/http/requireSession.ts`:

```ts
import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import type { DatabaseSync } from 'node:sqlite'

import { touchSession } from '../auth/touchSession'
import { SESSION_COOKIE } from './sessionCookieName'

export const requireSession =
  (db: DatabaseSync, now: () => number): MiddlewareHandler =>
  async (c, next) => {
    const id = getCookie(c, SESSION_COOKIE)
    if (id === undefined || !touchSession(db, id, now())) return c.json({ error: 'unauthorized' }, 401)
    await next()
  }
```

`apps/server/src/http/sourceKey.ts`:

```ts
import type { HttpBindings } from '@hono/node-server'
import type { Context } from 'hono'

export const sourceKey = (c: Context<{ Bindings: HttpBindings }>): string => {
  const forwarded = c.req.header('X-Forwarded-For')?.split(',').at(-1)?.trim()
  if (forwarded !== undefined && forwarded !== '') return forwarded
  const bindings = c.env as HttpBindings | undefined
  return bindings?.incoming.socket.remoteAddress ?? 'unknown'
}
```

`sourceKey` is exercised through the routes in Task 13.

- [ ] **Step 4: Run tests and gate** — PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/server
git commit -m "feat(server): host, origin, csrf, tailnet and session guards"
```

---
### Task 13: Observation history

**Files:**
- Create: `apps/server/src/history/historySchemaSql.ts`, `recordMetrics.ts`, `recordLaunchdObservation.ts`, `startRun.ts`, `touchRun.ts`, `rollupHours.ts`, `pruneHistory.ts`, `readLaunchdHistory.ts`
- Create: `apps/server/src/types/LaunchdObservation.ts`, `apps/server/src/types/LaunchdHistory.ts`
- Create (test scaffolding): `apps/server/src/test/openHistoryDb.ts`
- Test: `apps/server/src/history/recordMetrics.test.ts`, `recordLaunchdObservation.test.ts`, `pruneHistory.test.ts`, `readLaunchdHistory.test.ts`

**Interfaces:**
- Produces:
  - `HISTORY_SCHEMA_SQL` with tables `metric_samples(component, key, value, at)`, `launchd_observations(label, pid, runs, last_exit, at)`, `metric_rollups(component, key, hour, min, max, sum, count, PRIMARY KEY(component, key, hour))`, `runs(started PRIMARY KEY, stopped)`.
  - `recordMetrics(db, snapshot: Snapshot): void` — inserts a metric only when its value differs from the last stored value for `(component, key)`.
  - `LaunchdObservation = { label: string; pid: number | null; runs: number | null; lastExit: number | null; at: number }`; `recordLaunchdObservation(db, observation): void` — inserts only when `pid`, `runs` or `lastExit` changed for the label.
  - `startRun(db, now): number` (returns `started`); `touchRun(db, started, now): void`.
  - `pruneHistory(db, now): void` — recomputes rollups for the two last complete hours, deletes metric samples older than 7 days, launchd observations older than 30 days, rollups and runs older than 90 days, then `shrinkToCap(db, capBytes = 200 MB)`: checkpoint the WAL and, while the file exceeds the cap, delete the oldest 10 % of metric samples, then of launchd observations, then of rollups, stopping when nothing deletable is left.
  - `LaunchdHistory = { observations: LaunchdObservation[]; runs: { started: number; stopped: number }[] }`; `readLaunchdHistory(db, label, from: number): LaunchdHistory` — observations at or after `from` plus the last one before it, and run intervals overlapping `[from, now]`.

Launchd observations are kept 30 days rather than 7 because the System screen's longest range is 30 days; they are written only on change, so they stay small. Task 25 records this in the spec.

- [ ] **Step 1: Test scaffolding**

`apps/server/src/test/openHistoryDb.ts`:

```ts
import { mkdtempSync } from 'node:fs'
import type { DatabaseSync } from 'node:sqlite'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { HISTORY_SCHEMA_SQL } from '../history/historySchemaSql'
import { openDatabase } from '../state/openDatabase'

export const openHistoryDb = (): DatabaseSync =>
  openDatabase(join(mkdtempSync(join(tmpdir(), 'orbit-history-')), 'history.sqlite3'), HISTORY_SCHEMA_SQL)
```

- [ ] **Step 2: Write the failing tests**

`apps/server/src/history/recordMetrics.test.ts`:

```ts
import type { Snapshot } from '@orbit/contract'

import { openHistoryDb } from '../test/openHistoryDb'
import { recordMetrics } from './recordMetrics'

const snap = (value: number, at: string): Snapshot => ({
  component: 'worker',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'worker.queued', value, at }],
  pending: [],
  events: [],
  observedAt: at,
  lastGood: null,
})

describe('recordMetrics', () => {
  it('stores a sample only when the value changes', () => {
    const db = openHistoryDb()
    recordMetrics(db, snap(1, '2026-10-02T10:00:00.000Z'))
    recordMetrics(db, snap(1, '2026-10-02T10:00:05.000Z'))
    recordMetrics(db, snap(2, '2026-10-02T10:00:10.000Z'))
    const rows = db.prepare('SELECT value, at FROM metric_samples ORDER BY at').all() as { value: number }[]
    expect(rows.map((r) => r.value)).toEqual([1, 2])
  })
})
```

`apps/server/src/history/recordLaunchdObservation.test.ts`:

```ts
import { openHistoryDb } from '../test/openHistoryDb'
import { recordLaunchdObservation } from './recordLaunchdObservation'

describe('recordLaunchdObservation', () => {
  it('stores an observation only on change', () => {
    const db = openHistoryDb()
    const base = { label: 'com.example.job', pid: null, runs: 3, lastExit: 0 }
    recordLaunchdObservation(db, { ...base, at: 1 })
    recordLaunchdObservation(db, { ...base, at: 2 })
    recordLaunchdObservation(db, { ...base, runs: 4, at: 3 })
    recordLaunchdObservation(db, { ...base, runs: 4, lastExit: 78, at: 4 })
    const rows = db.prepare('SELECT at FROM launchd_observations ORDER BY at').all() as { at: number }[]
    expect(rows.map((r) => r.at)).toEqual([1, 3, 4])
  })
})
```

`apps/server/src/history/pruneHistory.test.ts`:

```ts
import { openHistoryDb } from '../test/openHistoryDb'
import { pruneHistory } from './pruneHistory'

const hour = 3_600_000
const day = 24 * hour

describe('pruneHistory', () => {
  it('rolls up complete hours idempotently and applies retention', () => {
    const db = openHistoryDb()
    const now = 100 * day + 30 * 60_000
    const insert = db.prepare('INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)')
    insert.run('worker', 'worker.queued', 2, now - hour)
    insert.run('worker', 'worker.queued', 6, now - hour + 60_000)
    insert.run('worker', 'worker.queued', 9, now - 8 * day)
    db.prepare('INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, ?, ?, ?, ?)').run('a', null, 1, 0, now - 31 * day)
    db.prepare('INSERT INTO runs (started, stopped) VALUES (?, ?)').run(now - 91 * day, now - 91 * day)
    pruneHistory(db, now)
    pruneHistory(db, now)
    const rollup = db.prepare('SELECT min, max, sum, count FROM metric_rollups').all()
    expect(rollup).toEqual([{ min: 2, max: 6, sum: 8, count: 2 }])
    expect(db.prepare('SELECT count(*) AS n FROM metric_samples').get()).toEqual({ n: 2 })
    expect(db.prepare('SELECT count(*) AS n FROM launchd_observations').get()).toEqual({ n: 0 })
    expect(db.prepare('SELECT count(*) AS n FROM runs').get()).toEqual({ n: 0 })
  })
})
```

`apps/server/src/history/readLaunchdHistory.test.ts`:

```ts
import { openHistoryDb } from '../test/openHistoryDb'
import { readLaunchdHistory } from './readLaunchdHistory'
import { recordLaunchdObservation } from './recordLaunchdObservation'
import { startRun } from './startRun'
import { touchRun } from './touchRun'

describe('readLaunchdHistory', () => {
  it('returns the range, the observation before it, and overlapping runs', () => {
    const db = openHistoryDb()
    const run = startRun(db, 0)
    touchRun(db, run, 500)
    recordLaunchdObservation(db, { label: 'a', pid: null, runs: 1, lastExit: 0, at: 50 })
    recordLaunchdObservation(db, { label: 'a', pid: null, runs: 2, lastExit: 0, at: 150 })
    recordLaunchdObservation(db, { label: 'b', pid: 9, runs: 1, lastExit: null, at: 160 })
    recordLaunchdObservation(db, { label: 'a', pid: null, runs: 3, lastExit: 0, at: 250 })
    const history = readLaunchdHistory(db, 'a', 200)
    expect(history.observations.map((o) => o.at)).toEqual([150, 250])
    expect(history.runs).toEqual([{ started: 0, stopped: 500 }])
  })
})
```

- [ ] **Step 3: Run them to see them fail** — FAIL.

- [ ] **Step 4: Implement**

`apps/server/src/history/historySchemaSql.ts`:

```ts
export const HISTORY_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS metric_samples (
  component TEXT NOT NULL, key TEXT NOT NULL, value REAL NOT NULL, at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS metric_samples_key ON metric_samples (component, key, at);
CREATE INDEX IF NOT EXISTS metric_samples_at ON metric_samples (at);
CREATE TABLE IF NOT EXISTS launchd_observations (
  label TEXT NOT NULL, pid INTEGER, runs INTEGER, last_exit INTEGER, at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS launchd_observations_label ON launchd_observations (label, at);
CREATE TABLE IF NOT EXISTS metric_rollups (
  component TEXT NOT NULL, key TEXT NOT NULL, hour INTEGER NOT NULL,
  min REAL NOT NULL, max REAL NOT NULL, sum REAL NOT NULL, count INTEGER NOT NULL,
  PRIMARY KEY (component, key, hour)
);
CREATE TABLE IF NOT EXISTS runs (started INTEGER PRIMARY KEY, stopped INTEGER NOT NULL);
`
```

`apps/server/src/history/recordMetrics.ts`:

```ts
import type { Snapshot } from '@orbit/contract'
import type { DatabaseSync } from 'node:sqlite'

export const recordMetrics = (db: DatabaseSync, snapshot: Snapshot): void => {
  const last = db.prepare(
    'SELECT value FROM metric_samples WHERE component = ? AND key = ? ORDER BY at DESC LIMIT 1',
  )
  const insert = db.prepare('INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)')
  for (const metric of snapshot.metrics) {
    const prior = last.get(snapshot.component, metric.key) as { value: number } | undefined
    if (prior?.value !== metric.value) {
      insert.run(snapshot.component, metric.key, metric.value, Date.parse(metric.at))
    }
  }
}
```

`apps/server/src/types/LaunchdObservation.ts`:

```ts
export type LaunchdObservation = {
  readonly label: string
  readonly pid: number | null
  readonly runs: number | null
  readonly lastExit: number | null
  readonly at: number
}
```

`apps/server/src/history/recordLaunchdObservation.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { LaunchdObservation } from '../types/LaunchdObservation'

export const recordLaunchdObservation = (db: DatabaseSync, observation: LaunchdObservation): void => {
  const prior = db
    .prepare('SELECT pid, runs, last_exit AS lastExit FROM launchd_observations WHERE label = ? ORDER BY at DESC LIMIT 1')
    .get(observation.label) as { pid: number | null; runs: number | null; lastExit: number | null } | undefined
  const unchanged =
    prior?.pid === observation.pid && prior.runs === observation.runs && prior.lastExit === observation.lastExit
  if (unchanged) return
  db.prepare('INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, ?, ?, ?, ?)').run(
    observation.label,
    observation.pid,
    observation.runs,
    observation.lastExit,
    observation.at,
  )
}
```

`apps/server/src/history/startRun.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

export const startRun = (db: DatabaseSync, now: number): number => {
  db.prepare('INSERT OR REPLACE INTO runs (started, stopped) VALUES (?, ?)').run(now, now)
  return now
}
```

`apps/server/src/history/touchRun.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

export const touchRun = (db: DatabaseSync, started: number, now: number): void => {
  db.prepare('UPDATE runs SET stopped = ? WHERE started = ?').run(now, started)
}
```

`apps/server/src/history/rollupHours.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

export const rollupHours = (db: DatabaseSync, now: number): void => {
  const hourMs = 3_600_000
  const currentHour = Math.floor(now / hourMs)
  db.prepare(
    `INSERT INTO metric_rollups (component, key, hour, min, max, sum, count)
     SELECT component, key, at / ${hourMs} AS hour, min(value), max(value), sum(value), count(*)
     FROM metric_samples WHERE at >= ? AND at < ? GROUP BY component, key, hour
     ON CONFLICT (component, key, hour) DO UPDATE SET
       min = excluded.min, max = excluded.max, sum = excluded.sum, count = excluded.count`,
  ).run((currentHour - 2) * hourMs, currentHour * hourMs)
}
```

`apps/server/src/history/shrinkToCap.ts` (checkpoints first, so the WAL is folded into the measured file; deletes the oldest tenth of the least valuable table that still has rows, round after round, until the file fits or nothing deletable is left):

```ts
import type { DatabaseSync } from 'node:sqlite'

export const shrinkToCap = (db: DatabaseSync, capBytes: number): void => {
  const size = (): number => {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)')
    const row = db.prepare('SELECT page_count * page_size AS bytes FROM pragma_page_count(), pragma_page_size()').get()
    return (row as { bytes: number }).bytes
  }
  const order = [
    ['metric_samples', 'at'],
    ['launchd_observations', 'at'],
    ['metric_rollups', 'hour'],
  ] as const
  while (size() > capBytes) {
    const target = order.find(([table]) => (db.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number }).n > 0)
    if (target === undefined) return
    const [table, column] = target
    db.exec(
      `DELETE FROM ${table} WHERE rowid IN (SELECT rowid FROM ${table} ORDER BY ${column} LIMIT (SELECT count(*) / 10 + 1 FROM ${table}))`,
    )
    db.exec('VACUUM')
  }
}
```

Table and column names come from the literal list above, never from input, so the interpolation is safe.

`apps/server/src/history/pruneHistory.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import { rollupHours } from './rollupHours'
import { shrinkToCap } from './shrinkToCap'

export const pruneHistory = (db: DatabaseSync, now: number, capBytes = 200 * 1024 * 1024): void => {
  const day = 86_400_000
  rollupHours(db, now)
  db.prepare('DELETE FROM metric_samples WHERE at < ?').run(now - 7 * day)
  db.prepare('DELETE FROM launchd_observations WHERE at < ?').run(now - 30 * day)
  db.prepare('DELETE FROM metric_rollups WHERE hour < ?').run(Math.floor((now - 90 * day) / 3_600_000))
  db.prepare('DELETE FROM runs WHERE stopped < ?').run(now - 90 * day)
  shrinkToCap(db, capBytes)
}
```

Add to `pruneHistory.test.ts`:

```ts
  it('shrinks to the cap, oldest metric samples first, then observations and rollups', () => {
    const db = openHistoryDb()
    const now = Date.now()
    for (let i = 0; i < 500; i += 1) {
      db.prepare('INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)').run('worker', 'worker.queued', i, now - i)
    }
    db.prepare('INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, ?, ?, ?, ?)').run('a', 1, 1, 0, now)
    pruneHistory(db, now, 10 * 1024 * 1024)
    expect(db.prepare('SELECT count(*) AS n FROM metric_samples').get()).toEqual({ n: 500 })
    pruneHistory(db, now, 1)
    expect(db.prepare('SELECT count(*) AS n FROM metric_samples').get()).toEqual({ n: 0 })
    expect(db.prepare('SELECT count(*) AS n FROM launchd_observations').get()).toEqual({ n: 0 })
  })
```

(A 1-byte cap can never be met, so this also proves the loop ends once nothing deletable is left.) Add `shrinkToCap.ts` to this task's file list.

`apps/server/src/types/LaunchdHistory.ts`:

```ts
import type { LaunchdObservation } from './LaunchdObservation'

export type LaunchdHistory = {
  readonly observations: LaunchdObservation[]
  readonly runs: { readonly started: number; readonly stopped: number }[]
}
```

`apps/server/src/history/readLaunchdHistory.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { LaunchdHistory } from '../types/LaunchdHistory'
import type { LaunchdObservation } from '../types/LaunchdObservation'

export const readLaunchdHistory = (db: DatabaseSync, label: string, from: number): LaunchdHistory => {
  const columns = 'label, pid, runs, last_exit AS lastExit, at'
  const before = db
    .prepare(`SELECT ${columns} FROM launchd_observations WHERE label = ? AND at < ? ORDER BY at DESC LIMIT 1`)
    .all(label, from) as LaunchdObservation[]
  const within = db
    .prepare(`SELECT ${columns} FROM launchd_observations WHERE label = ? AND at >= ? ORDER BY at`)
    .all(label, from) as LaunchdObservation[]
  const runs = db
    .prepare('SELECT started, stopped FROM runs WHERE stopped >= ? ORDER BY started')
    .all(from) as LaunchdHistory['runs']
  return { observations: [...before, ...within], runs }
}
```

- [ ] **Step 5: Run tests and gate** — PASS.

- [ ] **Step 6: Commit and push**

```bash
git add apps/server
git commit -m "feat(server): metadata-only observation history with retention"
pnpm gate && git push
```

---

### Task 14: launchd adapter

**Files:**
- Create: `apps/server/src/adapters/launchd/parseExitCode.ts`, `parseLaunchctlPrint.ts`, `readLabel.ts`, `readSchedule.ts`, `summarizeLaunchd.ts`, `diffLaunchd.ts`, `createLaunchdAdapter.ts`, `createLaunchdCatalog.ts`
- Create: `apps/server/src/types/LaunchctlState.ts`, `LabelEntry.ts`, `LabelReading.ts`, `LaunchdSchedule.ts`, `LaunchdCatalog.ts`, `LaunchdAdapterDeps.ts`
- Create fixtures: `apps/server/src/adapters/launchd/fixtures/running.txt`, `scheduled.txt`, `failed.txt`, `signalled.txt`
- Test: `apps/server/src/adapters/launchd/parseLaunchctlPrint.test.ts`, `summarizeLaunchd.test.ts`, `diffLaunchd.test.ts`, `createLaunchdAdapter.test.ts`

**Interfaces:**
- Consumes: `runProcess`, `buildChildEnv` (Task 7); `recordLaunchdObservation` (Task 13) through an injected `record` function.
- Produces:
  - `LaunchctlState = { state: string; pid: number | null; runs: number | null; lastExit: number | null }`
  - `parseLaunchctlPrint(text: string): LaunchctlState` — reads only top-level `\tkey = value` lines (exactly one leading tab); throws `ProcessError('schema_invalid')` when `state` is missing.
  - `parseExitCode(value: string): number | null` — `"0"` → 0, `"78: EX_CONFIG"` → 78, `"(never exited)"` → null.
  - `LabelEntry` = one registry row from `orbit.json` (`component`, `label`, `role`, `plist`).
  - `LabelReading = { entry: LabelEntry; loaded: boolean; state: LaunchctlState | null }`
  - `readLabel(deps, entry, signal): Promise<LabelReading>` — `launchctl print gui/<uid>/<label>`; a non-zero exit means not loaded.
  - `LaunchdSchedule = { intervalS: number | null; calendar: boolean; keepAlive: boolean }` — `intervalS` is the longest expected gap between runs: `StartInterval` when present, otherwise the period `calendarPeriodS` derives from `StartCalendarInterval` (the coarsest key set in an entry decides it: `Month` 366 d, `Day` 31 d, `Weekday` 7 d, `Hour` 1 d, `Minute` 1 h, empty 1 min; with several entries the shortest wins), so calendar jobs are also checked for missed runs; `readSchedule(deps, plist, signal): Promise<LaunchdSchedule>` via `plutil -convert json -o - <plist>`.
  - `summarizeLaunchd(readings, now: Date): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'>` — failing = not loaded, or no pid with a non-zero last exit; health `warn`/`check_failed` when any fail.
  - `diffLaunchd(previous: Map<string, LabelReading>, readings, now: Date): OrbitEvent[]` — `launchd.exit_changed` (`label`, `exit`), `launchd.started` (`label`), `launchd.stopped` (`label`).
  - `LaunchdAdapterDeps = { launchctl: string; plutil: string; labels: readonly LabelEntry[]; uid: number; run: (request: RunRequest) => Promise<RunResult>; record: (observation: LaunchdObservation) => void; cadenceMs: number }`
  - `createLaunchdAdapter(deps): Adapter` (id `launchd`, cadence default 10 s, timeout 15 s, freshness 20 s).
  - `LaunchdCatalog = { rows(signal: AbortSignal): Promise<{ component: ComponentId; label: string; role: 'scheduled' | 'keepalive'; schedule: LaunchdSchedule | null }[]> }`; `createLaunchdCatalog(deps): LaunchdCatalog` caching each schedule for 10 minutes.

- [ ] **Step 1: Fixtures**

Synthetic texts in the exact `launchctl print` layout (top-level keys use one tab, nested blocks two). Never paste real output: labels and paths are placeholders.

`fixtures/running.txt`:

```
gui/501/com.example.keepalive = {
	active count = 1
	path = /Users/example/Library/LaunchAgents/com.example.keepalive.plist
	type = LaunchAgent
	state = running

	program = /usr/local/bin/example
	runs = 26
	pid = 5627
	endpoints = {
		state = active
	}
}
```

`fixtures/scheduled.txt`:

```
gui/501/com.example.nightly = {
	state = not running
	runs = 38
	last exit code = 0
	run interval = 3600 seconds
	event triggers = {
		state = active
	}
}
```

`fixtures/failed.txt`:

```
gui/501/com.example.broken = {
	state = spawn scheduled
	runs = 282
	last exit code = 78: EX_CONFIG
}
```

`fixtures/signalled.txt`:

```
gui/501/com.example.server = {
	state = running
	runs = 2
	pid = 86643
	last terminating signal = Terminated: 15
}
```

- [ ] **Step 2: Write the failing tests**

`apps/server/src/adapters/launchd/parseLaunchctlPrint.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parseExitCode } from './parseExitCode'
import { parseLaunchctlPrint } from './parseLaunchctlPrint'

const fixture = (name: string) => readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf8')

describe('parseLaunchctlPrint', () => {
  it('reads a running keepalive job and ignores nested state lines', () => {
    expect(parseLaunchctlPrint(fixture('running.txt'))).toEqual({ state: 'running', pid: 5627, runs: 26, lastExit: null })
  })
  it('reads a scheduled job between runs', () => {
    expect(parseLaunchctlPrint(fixture('scheduled.txt'))).toEqual({ state: 'not running', pid: null, runs: 38, lastExit: 0 })
  })
  it('reads a named exit code', () => {
    expect(parseLaunchctlPrint(fixture('failed.txt')).lastExit).toBe(78)
  })
  it('reads a signalled job as running with no exit', () => {
    expect(parseLaunchctlPrint(fixture('signalled.txt'))).toMatchObject({ pid: 86643, lastExit: null })
  })
  it('fails closed on an unrecognised format', () => {
    expect(() => parseLaunchctlPrint('nothing here')).toThrow('schema_invalid')
  })
})

describe('parseExitCode', () => {
  it('handles plain, named and never-exited values', () => {
    expect(parseExitCode('0')).toBe(0)
    expect(parseExitCode('78: EX_CONFIG')).toBe(78)
    expect(parseExitCode('(never exited)')).toBeNull()
  })
})
```

`apps/server/src/adapters/launchd/summarizeLaunchd.test.ts`:

```ts
import type { LabelReading } from '../../types/LabelReading'
import { summarizeLaunchd } from './summarizeLaunchd'

const entry = (label: string) => ({ component: 'worker' as const, label, role: 'scheduled' as const, plist: '/x' })
const reading = (label: string, state: LabelReading['state'], loaded = true): LabelReading => ({ entry: entry(label), loaded, state })

describe('summarizeLaunchd', () => {
  it('counts jobs, running and failing', () => {
    const summary = summarizeLaunchd(
      [
        reading('a', { state: 'running', pid: 1, runs: 1, lastExit: null }),
        reading('b', { state: 'not running', pid: null, runs: 2, lastExit: 78 }),
        reading('c', null, false),
        reading('d', { state: 'not running', pid: null, runs: 2, lastExit: 0 }),
      ],
      new Date('2026-10-02T10:00:00.000Z'),
    )
    const value = (key: string) => summary.metrics.find((m) => m.key === key)?.value
    expect([value('launchd.jobs'), value('launchd.running'), value('launchd.failing')]).toEqual([4, 1, 2])
    expect(summary.health).toEqual({ state: 'warn', reason: 'check_failed' })
    expect(summary.pending).toEqual([{ key: 'launchd.failing_jobs', count: 2, oldestAt: null }])
  })
  it('is ok when nothing fails', () => {
    const summary = summarizeLaunchd([reading('a', { state: 'running', pid: 1, runs: 1, lastExit: null })], new Date())
    expect(summary.health).toEqual({ state: 'ok', reason: null })
    expect(summary.pending).toEqual([])
  })
})
```

`apps/server/src/adapters/launchd/diffLaunchd.test.ts`:

```ts
import type { LabelReading } from '../../types/LabelReading'
import { diffLaunchd } from './diffLaunchd'

const at = new Date('2026-10-02T10:00:00.000Z')
const reading = (pid: number | null, lastExit: number | null): LabelReading => ({
  entry: { component: 'worker', label: 'com.example.job', role: 'keepalive', plist: '/x' },
  loaded: true,
  state: { state: 'x', pid, runs: 1, lastExit },
})

describe('diffLaunchd', () => {
  it('emits nothing on the first reading', () => {
    expect(diffLaunchd(new Map(), [reading(1, null)], at)).toEqual([])
  })
  it('emits start, stop and exit changes', () => {
    const before = new Map([['com.example.job', reading(null, 0)]])
    expect(diffLaunchd(before, [reading(5, 0)], at).map((e) => e.kind)).toEqual(['launchd.started'])
    const running = new Map([['com.example.job', reading(5, 0)]])
    const events = diffLaunchd(running, [reading(null, 78)], at)
    expect(events.map((e) => e.kind)).toEqual(['launchd.stopped', 'launchd.exit_changed'])
    expect(events[1]?.refs).toEqual({ label: 'com.example.job', exit: 78 })
    expect(events[1]?.severity).toBe('warn')
  })
})
```

`apps/server/src/adapters/launchd/createLaunchdAdapter.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { LaunchdObservation } from '../../types/LaunchdObservation'
import type { RunRequest } from '../../types/RunRequest'
import { createLaunchdAdapter } from './createLaunchdAdapter'

const fixture = (name: string) => readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf8')

describe('createLaunchdAdapter', () => {
  it('reads every registered label and records observations', async () => {
    const calls: RunRequest[] = []
    const recorded: LaunchdObservation[] = []
    const adapter = createLaunchdAdapter({
      launchctl: '/bin/launchctl',
      plutil: '/usr/bin/plutil',
      uid: 501,
      cadenceMs: 10_000,
      labels: [
        { component: 'worker', label: 'com.example.keepalive', role: 'keepalive', plist: '/a' },
        { component: 'atrium', label: 'com.example.missing', role: 'scheduled', plist: '/b' },
      ],
      run: async (request) => {
        calls.push(request)
        return request.args[1]?.endsWith('keepalive') === true
          ? { code: 0, stdout: fixture('running.txt') }
          : { code: 113, stdout: '' }
      },
      record: (observation) => recorded.push(observation),
    })
    const core = await adapter.read(new AbortController().signal)
    expect(calls.map((c) => c.args)).toEqual([
      ['print', 'gui/501/com.example.keepalive'],
      ['print', 'gui/501/com.example.missing'],
    ])
    expect(core.component).toBe('launchd')
    expect(core.metrics.find((m) => m.key === 'launchd.failing')?.value).toBe(1)
    expect(recorded.map((o) => [o.label, o.pid])).toEqual([
      ['com.example.keepalive', 5627],
      ['com.example.missing', null],
    ])
  })
})
```

- [ ] **Step 3: Run them to see them fail** — FAIL.

- [ ] **Step 4: Implement**

`apps/server/src/types/LaunchctlState.ts`:

```ts
export type LaunchctlState = {
  readonly state: string
  readonly pid: number | null
  readonly runs: number | null
  readonly lastExit: number | null
}
```

`apps/server/src/types/LabelEntry.ts`:

```ts
import type { ComponentId } from '@orbit/contract'

export type LabelEntry = {
  readonly component: ComponentId
  readonly label: string
  readonly role: 'scheduled' | 'keepalive'
  readonly plist: string
}
```

`apps/server/src/types/LabelReading.ts`:

```ts
import type { LabelEntry } from './LabelEntry'
import type { LaunchctlState } from './LaunchctlState'

export type LabelReading = {
  readonly entry: LabelEntry
  readonly loaded: boolean
  readonly state: LaunchctlState | null
}
```

`apps/server/src/types/LaunchdSchedule.ts`:

```ts
export type LaunchdSchedule = {
  readonly intervalS: number | null
  readonly calendar: boolean
  readonly keepAlive: boolean
}
```

`apps/server/src/types/LaunchdAdapterDeps.ts`:

```ts
import type { LabelEntry } from './LabelEntry'
import type { LaunchdObservation } from './LaunchdObservation'
import type { RunRequest } from './RunRequest'
import type { RunResult } from './RunResult'

export type LaunchdAdapterDeps = {
  readonly launchctl: string
  readonly plutil: string
  readonly labels: readonly LabelEntry[]
  readonly uid: number
  readonly cadenceMs: number
  readonly run: (request: RunRequest) => Promise<RunResult>
  readonly record: (observation: LaunchdObservation) => void
}
```

`apps/server/src/types/LaunchdCatalog.ts`:

```ts
import type { ComponentId } from '@orbit/contract'

import type { LaunchdSchedule } from './LaunchdSchedule'

export type LaunchdCatalog = {
  rows(signal: AbortSignal): Promise<
    {
      readonly component: ComponentId
      readonly label: string
      readonly role: 'scheduled' | 'keepalive'
      readonly schedule: LaunchdSchedule | null
    }[]
  >
}
```

`apps/server/src/adapters/launchd/parseExitCode.ts`:

```ts
export const parseExitCode = (value: string): number | null => {
  const match = /^(-?\d+)/.exec(value.trim())
  return match?.[1] === undefined ? null : Number(match[1])
}
```

`apps/server/src/adapters/launchd/parseLaunchctlPrint.ts`:

```ts
import { ProcessError } from '../../process/ProcessError'
import type { LaunchctlState } from '../../types/LaunchctlState'
import { parseExitCode } from './parseExitCode'

export const parseLaunchctlPrint = (text: string): LaunchctlState => {
  const fields = new Map<string, string>()
  for (const line of text.split('\n')) {
    const match = /^\t([a-z][a-z ]*) = (.*)$/.exec(line)
    if (match?.[1] !== undefined && match[2] !== undefined && !fields.has(match[1])) {
      fields.set(match[1], match[2])
    }
  }
  const state = fields.get('state')
  if (state === undefined) throw new ProcessError('schema_invalid')
  const pid = fields.get('pid')
  const runs = fields.get('runs')
  const lastExit = fields.get('last exit code')
  return {
    state,
    pid: pid === undefined ? null : Number(pid),
    runs: runs === undefined ? null : Number(runs),
    lastExit: lastExit === undefined ? null : parseExitCode(lastExit),
  }
}
```

`apps/server/src/adapters/launchd/readLabel.ts`:

```ts
import { buildChildEnv } from '../../process/buildChildEnv'
import type { LabelEntry } from '../../types/LabelEntry'
import type { LabelReading } from '../../types/LabelReading'
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import { parseLaunchctlPrint } from './parseLaunchctlPrint'

export const readLabel = async (
  deps: LaunchdAdapterDeps,
  entry: LabelEntry,
  signal: AbortSignal,
): Promise<LabelReading> => {
  const result = await deps.run({
    file: deps.launchctl,
    args: ['print', `gui/${deps.uid}/${entry.label}`],
    env: buildChildEnv(process.env, {}),
    timeoutMs: 5000,
    maxBytes: 1_048_576,
    signal,
  })
  if (result.code !== 0) return { entry, loaded: false, state: null }
  return { entry, loaded: true, state: parseLaunchctlPrint(result.stdout) }
}
```

`apps/server/src/adapters/launchd/readSchedule.ts`:

```ts
import { z } from 'zod'

import { buildChildEnv } from '../../process/buildChildEnv'
import { ProcessError } from '../../process/ProcessError'
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import type { LaunchdSchedule } from '../../types/LaunchdSchedule'
import { calendarPeriodS } from './calendarPeriodS'

export const readSchedule = async (
  deps: LaunchdAdapterDeps,
  plist: string,
  signal: AbortSignal,
): Promise<LaunchdSchedule> => {
  const result = await deps.run({
    file: deps.plutil,
    args: ['-convert', 'json', '-o', '-', plist],
    env: buildChildEnv(process.env, {}),
    timeoutMs: 5000,
    maxBytes: 1_048_576,
    signal,
  })
  if (result.code !== 0) throw new ProcessError('not_found')
  const parsed = z
    .object({ StartInterval: z.number().int().optional(), StartCalendarInterval: z.unknown().optional(), KeepAlive: z.unknown().optional() })
    .parse(JSON.parse(result.stdout))
  return {
    intervalS: parsed.StartInterval ?? calendarPeriodS(parsed.StartCalendarInterval),
    calendar: parsed.StartCalendarInterval !== undefined,
    keepAlive: parsed.KeepAlive !== undefined && parsed.KeepAlive !== false,
  }
}
```

`apps/server/src/adapters/launchd/calendarPeriodS.ts`:

```ts
import { z } from 'zod'

export const calendarPeriodS = (value: unknown): number | null => {
  const entry = z.object({
    Minute: z.number().optional(),
    Hour: z.number().optional(),
    Day: z.number().optional(),
    Weekday: z.number().optional(),
    Month: z.number().optional(),
  })
  const parsed = z.union([entry, z.array(entry).min(1)]).safeParse(value)
  if (!parsed.success) return null
  const entries = Array.isArray(parsed.data) ? parsed.data : [parsed.data]
  const scale = [
    ['Month', 366 * 86_400],
    ['Day', 31 * 86_400],
    ['Weekday', 7 * 86_400],
    ['Hour', 86_400],
    ['Minute', 3_600],
  ] as const
  return Math.min(...entries.map((e) => scale.find(([key]) => e[key] !== undefined)?.[1] ?? 60))
}
```

`apps/server/src/adapters/launchd/calendarPeriodS.test.ts`:

```ts
import { calendarPeriodS } from './calendarPeriodS'

describe('calendarPeriodS', () => {
  it.each([
    [{ Minute: 0 }, 3_600],
    [{ Hour: 3, Minute: 0 }, 86_400],
    [{ Weekday: 1, Hour: 9 }, 604_800],
    [{ Day: 1 }, 2_678_400],
    [[{ Hour: 3 }, { Minute: 30 }], 3_600],
    [{}, 60],
  ])('%j repeats at most every %i s', (value, period) => expect(calendarPeriodS(value)).toBe(period))
  it('returns null without a calendar', () => expect(calendarPeriodS(undefined)).toBeNull())
})
```

Add both files to this task's file list.

`apps/server/src/adapters/launchd/summarizeLaunchd.ts`:

```ts
import type { SnapshotCore } from '@orbit/contract'

import type { LabelReading } from '../../types/LabelReading'

export const summarizeLaunchd = (
  readings: readonly LabelReading[],
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const at = now.toISOString()
  const failing = readings.filter(
    (r) => !r.loaded || (r.state?.pid === null && r.state.lastExit !== null && r.state.lastExit !== 0),
  ).length
  const running = readings.filter((r) => r.state !== null && r.state.pid !== null).length
  return {
    health: failing === 0 ? { state: 'ok', reason: null } : { state: 'warn', reason: 'check_failed' },
    metrics: [
      { key: 'launchd.jobs', value: readings.length, at },
      { key: 'launchd.running', value: running, at },
      { key: 'launchd.failing', value: failing, at },
    ],
    pending: failing === 0 ? [] : [{ key: 'launchd.failing_jobs', count: failing, oldestAt: null }],
  }
}
```

`apps/server/src/adapters/launchd/diffLaunchd.ts`:

```ts
import type { OrbitEvent } from '@orbit/contract'

import type { LabelReading } from '../../types/LabelReading'

export const diffLaunchd = (
  previous: ReadonlyMap<string, LabelReading>,
  readings: readonly LabelReading[],
  now: Date,
): OrbitEvent[] => {
  const at = now.toISOString()
  return readings.flatMap((reading): OrbitEvent[] => {
    const label = reading.entry.label
    const before = previous.get(label)?.state ?? null
    const after = reading.state
    if (before === null || after === null) return []
    const events: OrbitEvent[] = []
    if (before.pid === null && after.pid !== null) {
      events.push({ at, component: 'launchd', kind: 'launchd.started', severity: 'info', refs: { label } })
    }
    if (before.pid !== null && after.pid === null) {
      events.push({ at, component: 'launchd', kind: 'launchd.stopped', severity: 'info', refs: { label } })
    }
    if (after.lastExit !== null && after.lastExit !== before.lastExit) {
      const severity = after.lastExit === 0 ? 'info' : 'warn'
      events.push({ at, component: 'launchd', kind: 'launchd.exit_changed', severity, refs: { label, exit: after.lastExit } })
    }
    return events
  })
}
```

`apps/server/src/adapters/launchd/createLaunchdAdapter.ts`:

```ts
import type { Adapter } from '../../types/Adapter'
import type { LabelReading } from '../../types/LabelReading'
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import { diffLaunchd } from './diffLaunchd'
import { readLabel } from './readLabel'
import { summarizeLaunchd } from './summarizeLaunchd'

export const createLaunchdAdapter = (deps: LaunchdAdapterDeps): Adapter => {
  let previous = new Map<string, LabelReading>()
  return {
    id: 'launchd',
    cadenceMs: deps.cadenceMs,
    timeoutMs: 15_000,
    freshnessMs: deps.cadenceMs * 2,
    read: async (signal) => {
      const readings: LabelReading[] = []
      for (const entry of deps.labels) readings.push(await readLabel(deps, entry, signal))
      const now = new Date()
      for (const r of readings) {
        deps.record({ label: r.entry.label, pid: r.state?.pid ?? null, runs: r.state?.runs ?? null, lastExit: r.state?.lastExit ?? null, at: now.getTime() })
      }
      const events = diffLaunchd(previous, readings, now)
      previous = new Map(readings.map((r) => [r.entry.label, r]))
      return { component: 'launchd', ...summarizeLaunchd(readings, now), events, observedAt: now.toISOString() }
    },
  }
}
```

`apps/server/src/adapters/launchd/createLaunchdCatalog.ts`:

```ts
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import type { LaunchdCatalog } from '../../types/LaunchdCatalog'
import { ProcessError } from '../../process/ProcessError'
import type { LaunchdSchedule } from '../../types/LaunchdSchedule'
import { readSchedule } from './readSchedule'

export const createLaunchdCatalog = (deps: LaunchdAdapterDeps): LaunchdCatalog => {
  const cache = new Map<string, { schedule: LaunchdSchedule | null; at: number }>()
  const scheduleOf = async (plist: string, signal: AbortSignal): Promise<LaunchdSchedule | null> => {
    const hit = cache.get(plist)
    if (hit !== undefined && Date.now() - hit.at < 600_000) return hit.schedule
    const schedule = await readSchedule(deps, plist, signal).catch(() => null)
    cache.set(plist, { schedule, at: Date.now() })
    return schedule
  }
  return {
    rows: async (signal) => {
      const rows = []
      for (const entry of deps.labels) {
        if (signal.aborted) throw new ProcessError('timeout')
        rows.push({ component: entry.component, label: entry.label, role: entry.role, schedule: await scheduleOf(entry.plist, signal) })
      }
      return rows
    },
  }
}
```

Add a test for the catalog in `apps/server/src/adapters/launchd/createLaunchdCatalog.test.ts`:

```ts
import { createLaunchdCatalog } from './createLaunchdCatalog'

describe('createLaunchdCatalog', () => {
  it('reads each schedule once and tolerates a missing plist', async () => {
    let calls = 0
    const catalog = createLaunchdCatalog({
      launchctl: '/bin/launchctl', plutil: '/usr/bin/plutil', uid: 501, cadenceMs: 10_000, record: () => undefined,
      labels: [
        { component: 'atrium', label: 'com.example.nightly', role: 'scheduled', plist: '/a.plist' },
        { component: 'worker', label: 'com.example.gone', role: 'keepalive', plist: '/missing.plist' },
      ],
      run: async (request) => {
        calls += 1
        return request.args.at(-1) === '/a.plist'
          ? { code: 0, stdout: JSON.stringify({ StartInterval: 3600 }) }
          : { code: 1, stdout: '' }
      },
    })
    const signal = new AbortController().signal
    const rows = await catalog.rows(signal)
    await catalog.rows(signal)
    expect(calls).toBe(2)
    expect(rows.map((r) => r.schedule)).toEqual([{ intervalS: 3600, calendar: false, keepAlive: false }, null])
  })
})
```

- [ ] **Step 5: Run tests and gate** — PASS. If `max-lines-per-function` flags `diffLaunchd`'s inner callback, extract it as `adapters/launchd/eventsForLabel.ts` exporting `eventsForLabel(label, before, after, at): OrbitEvent[]`.

- [ ] **Step 5b: Measure the performance budget (spec 5.3)**

Before the adapter ships, measure the two commands it polls on this machine, against a label that is really loaded (any one from `launchctl list`), 20 runs each:

```bash
for i in $(seq 20); do /usr/bin/time -l launchctl print "gui/$(id -u)/<loaded-label>" >/dev/null 2>>/tmp/orbit-launchctl.time; done
grep -E 'real|maximum resident' /tmp/orbit-launchctl.time | sort | tail -4
```

and the same for `plutil -convert json -o - <a LaunchAgent plist>`. Both must stay under 2 s wall time at p95 and under 300 MB peak RSS (they normally take milliseconds and a few MB). Write the numbers, without the label or path, into `docs/measurements/2026-10-02-launchd-commands.md` and commit it with this task. If either misses the budget, stop and report: the spec says such a command is not polled.

- [ ] **Step 6: Commit and push**

```bash
git add apps/server docs/measurements
git commit -m "feat(server): launchd adapter with a registry, parser and schedule catalog"
pnpm gate && git push
```

---

### Task 15: Worker and synthetic adapters, adapter registry

**Files:**
- Create: `apps/server/src/adapters/worker/workerStatusSchema.ts`, `fetchWorkerStatus.ts`, `summarizeWorker.ts`, `workerEvents.ts`, `createWorkerAdapter.ts`
- Create: `apps/server/src/adapters/synthetic/createSyntheticAdapter.ts`
- Create: `apps/server/src/adapters/buildAdapters.ts`, `apps/server/src/refs/toSafeRef.ts`
- Create: `apps/server/src/types/WorkerStatus.ts`, `WorkerAdapterDeps.ts`, `AdapterContext.ts`
- Test: `apps/server/src/adapters/worker/summarizeWorker.test.ts`, `workerEvents.test.ts`, `createWorkerAdapter.test.ts`, `apps/server/src/adapters/synthetic/createSyntheticAdapter.test.ts`, `apps/server/src/adapters/buildAdapters.test.ts`, `apps/server/src/refs/toSafeRef.test.ts`

**Interfaces:**
- Produces:
  - `workerStatusSchema` for `GET /v1/status` of the worker (`queues`, `nodes`, `cooldowns`, `recent_failures`), tolerant of extra fields.
  - `fetchWorkerStatus(deps: WorkerAdapterDeps, signal): Promise<WorkerStatus>` — bearer token read from `tokenFile` at call time; 401/403 → `ProcessError('unauthorized')`; other non-2xx → `ProcessError('unreachable')`.
  - `summarizeWorker(status, now: Date): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'>`
  - `workerEvents(seen: { failures: Set<string>; cooldowns: Set<string> } | null, status, now): OrbitEvent[]` — nothing on the first read; then `worker.job_failed` (`job`, `queue`; the worker's `error` is never copied: it can carry a truncated provider code, which is free text, and spec 6.6 admits only closed values into the stream) and `worker.cooldown_started` (`runner`).
  - `toSafeRef(value: string | null): string | undefined` — returns the value only if it matches the ref pattern and length.
  - `createWorkerAdapter(deps): Adapter` (id `worker`, cadence 5 s, timeout 4 s, freshness 10 s).
  - `createSyntheticAdapter(failFlagPath: string): Adapter` (id `synthetic`, cadence 1 s, timeout 2 s, freshness 5 s): rejects with `ProcessError('unreachable')` while `failFlagPath` exists; otherwise metric `synthetic.value`, pending `synthetic.items`, one `synthetic.tick` event per read.
  - `AdapterContext = { config: OrbitConfig; stateDir: string; uid: number; record: (observation: LaunchdObservation) => void; run: (request: RunRequest) => Promise<RunResult>; fetch: typeof fetch }`
  - `buildAdapters(context): Adapter[]` — launchd when labels exist, worker when `config.worker` is set, synthetic when `config.synthetic`; cadence overrides from `config.cadenceMs`.

- [ ] **Step 1: Write the failing tests**

`apps/server/src/refs/toSafeRef.test.ts`:

```ts
import { toSafeRef } from './toSafeRef'

describe('toSafeRef', () => {
  it('keeps opaque ids and drops anything else', () => {
    expect(toSafeRef('job-01HZX.a:b')).toBe('job-01HZX.a:b')
    expect(toSafeRef('has space')).toBeUndefined()
    expect(toSafeRef('a/b')).toBeUndefined()
    expect(toSafeRef('x'.repeat(65))).toBeUndefined()
    expect(toSafeRef(null)).toBeUndefined()
  })
})
```

`apps/server/src/adapters/worker/summarizeWorker.test.ts`:

```ts
import { summarizeWorker } from './summarizeWorker'

const status = {
  queues: {
    'q.a': { states: { queued: 3, running: 1, failed: 2 }, oldest_queued_s: 120, done_1h: 5, wasted_1h_s: 1.5 },
    'q.b': { states: { leased: 1, draining: 1 }, oldest_queued_s: null, done_1h: 1, wasted_1h_s: 0 },
  },
  nodes: { n1: {}, n2: {} },
  cooldowns: { runner: 60 },
  recent_failures: [],
}

describe('summarizeWorker', () => {
  it('aggregates queues into closed metrics and pending items', () => {
    const now = new Date('2026-10-02T10:00:00.000Z')
    const summary = summarizeWorker(status, now)
    const value = (key: string) => summary.metrics.find((m) => m.key === key)?.value
    expect(value('worker.queued')).toBe(3)
    expect(value('worker.live')).toBe(3)
    expect(value('worker.failed')).toBe(2)
    expect(value('worker.done_1h')).toBe(6)
    expect(value('worker.cooldowns')).toBe(1)
    expect(value('worker.nodes')).toBe(2)
    expect(summary.pending).toEqual([
      { key: 'worker.failed_jobs', count: 2, oldestAt: null },
      { key: 'worker.queued_jobs', count: 3, oldestAt: '2026-10-02T09:58:00.000Z' },
    ])
    expect(summary.health).toEqual({ state: 'ok', reason: null })
  })
})
```

`apps/server/src/adapters/worker/workerEvents.test.ts`:

```ts
import { workerEvents } from './workerEvents'

const status = (failures: string[], cooldowns: string[]) => ({
  queues: {},
  nodes: {},
  cooldowns: Object.fromEntries(cooldowns.map((c) => [c, 10])),
  recent_failures: failures.map((id) => ({ id, queue: 'q.a', error: 'runner_failed', finished: 1 })),
})

describe('workerEvents', () => {
  it('reports only failures and cooldowns new since the previous read', () => {
    const now = new Date('2026-10-02T10:00:00.000Z')
    expect(workerEvents(null, status(['j1'], ['agy']), now)).toEqual([])
    const seen = { failures: new Set(['j1']), cooldowns: new Set(['agy']) }
    const events = workerEvents(seen, status(['j1', 'j2'], ['agy', 'cursor']), now)
    expect(events.map((e) => [e.kind, e.refs])).toEqual([
      ['worker.job_failed', { job: 'j2', queue: 'q.a' }],
      ['worker.cooldown_started', { runner: 'cursor' }],
    ])
  })
})
```

`apps/server/src/adapters/worker/createWorkerAdapter.test.ts`:

```ts
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createWorkerAdapter } from './createWorkerAdapter'

const body = { queues: {}, nodes: {}, cooldowns: {}, recent_failures: [] }

const tokenFile = async () => {
  const path = join(await mkdtemp(join(tmpdir(), 'orbit-worker-')), 'admin.token')
  await writeFile(path, 'secret-token\n')
  return path
}

describe('createWorkerAdapter', () => {
  it('sends the bearer token and parses the status', async () => {
    const seen: Headers[] = []
    const adapter = createWorkerAdapter({
      url: 'http://127.0.0.1:8765',
      tokenFile: await tokenFile(),
      cadenceMs: 5000,
      fetch: async (_input, init) => {
        seen.push(new Headers(init?.headers))
        return Response.json(body)
      },
    })
    const core = await adapter.read(new AbortController().signal)
    expect(seen[0]?.get('authorization')).toBe('Bearer secret-token')
    expect(core.component).toBe('worker')
  })
  it('maps 403 to unauthorized', async () => {
    const adapter = createWorkerAdapter({
      url: 'http://127.0.0.1:8765',
      tokenFile: await tokenFile(),
      cadenceMs: 5000,
      fetch: async () => new Response('{}', { status: 403 }),
    })
    await expect(adapter.read(new AbortController().signal)).rejects.toMatchObject({ reason: 'unauthorized' })
  })
})
```

`apps/server/src/adapters/synthetic/createSyntheticAdapter.test.ts`:

```ts
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createSyntheticAdapter } from './createSyntheticAdapter'

describe('createSyntheticAdapter', () => {
  it('fails while the flag file exists', async () => {
    const flag = join(await mkdtemp(join(tmpdir(), 'orbit-synthetic-')), 'synthetic-fail')
    const adapter = createSyntheticAdapter(flag)
    const signal = new AbortController().signal
    const core = await adapter.read(signal)
    expect(core.events.map((e) => e.kind)).toEqual(['synthetic.tick'])
    await writeFile(flag, '')
    await expect(adapter.read(signal)).rejects.toMatchObject({ reason: 'unreachable' })
    await rm(flag)
    await expect(adapter.read(signal)).resolves.toMatchObject({ component: 'synthetic' })
  })
})
```

`apps/server/src/adapters/buildAdapters.test.ts`:

```ts
import { orbitConfigSchema } from '../config/orbitConfigSchema'
import { buildAdapters } from './buildAdapters'

const context = (raw: unknown) => ({
  config: orbitConfigSchema.parse(raw),
  stateDir: '/tmp/orbit',
  uid: 501,
  record: () => undefined,
  run: async () => ({ code: 0, stdout: '' }),
  fetch,
})

describe('buildAdapters', () => {
  it('builds only configured components', () => {
    expect(buildAdapters(context({})).map((a) => a.id)).toEqual([])
    const all = buildAdapters(
      context({
        synthetic: true,
        worker: { url: 'http://127.0.0.1:8765', tokenFile: '/t' },
        launchd: { labels: [{ component: 'worker', label: 'com.example.w', role: 'keepalive', plist: '/p' }] },
        cadenceMs: { worker: 7000 },
      }),
    )
    expect(all.map((a) => [a.id, a.cadenceMs])).toEqual([
      ['launchd', 10_000],
      ['worker', 7000],
      ['synthetic', 1000],
    ])
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL.

- [ ] **Step 3: Implement**

`apps/server/src/refs/toSafeRef.ts`:

```ts
export const toSafeRef = (value: string | null): string | undefined =>
  value !== null && value.length <= 64 && /^[A-Za-z0-9._:-]+$/.test(value) ? value : undefined
```

`apps/server/src/adapters/worker/workerStatusSchema.ts`:

```ts
import { z } from 'zod'

export const workerStatusSchema = z.object({
  queues: z.record(
    z.string(),
    z.object({
      states: z.record(z.string(), z.number().int().nonnegative()),
      oldest_queued_s: z.number().nullable(),
      done_1h: z.number(),
      wasted_1h_s: z.number(),
    }),
  ),
  nodes: z.record(z.string(), z.unknown()),
  cooldowns: z.record(z.string(), z.number()),
  recent_failures: z.array(
    z.object({ id: z.string(), queue: z.string(), error: z.string().nullable(), finished: z.number().nullable() }),
  ),
})
```

`apps/server/src/types/WorkerStatus.ts`:

```ts
import type { z } from 'zod'

import type { workerStatusSchema } from '../adapters/worker/workerStatusSchema'

export type WorkerStatus = z.infer<typeof workerStatusSchema>
```

`apps/server/src/types/WorkerAdapterDeps.ts`:

```ts
export type WorkerAdapterDeps = {
  readonly url: string
  readonly tokenFile: string
  readonly cadenceMs: number
  readonly fetch: typeof fetch
}
```

`apps/server/src/adapters/worker/fetchWorkerStatus.ts`:

```ts
import { readFile } from 'node:fs/promises'

import { ProcessError } from '../../process/ProcessError'
import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import type { WorkerStatus } from '../../types/WorkerStatus'
import { workerStatusSchema } from './workerStatusSchema'

export const fetchWorkerStatus = async (deps: WorkerAdapterDeps, signal: AbortSignal): Promise<WorkerStatus> => {
  const token = (await readFile(deps.tokenFile, 'utf8')).trim()
  const response = await deps.fetch(`${deps.url}/v1/status`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })
  if (response.status === 401 || response.status === 403) throw new ProcessError('unauthorized')
  if (!response.ok) throw new ProcessError('unreachable')
  return workerStatusSchema.parse(await response.json())
}
```

`apps/server/src/adapters/worker/summarizeWorker.ts`:

```ts
import type { SnapshotCore } from '@orbit/contract'

import type { WorkerStatus } from '../../types/WorkerStatus'

export const summarizeWorker = (
  status: WorkerStatus,
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const queues = Object.values(status.queues)
  const sum = (pick: (q: (typeof queues)[number]) => number): number => queues.reduce((total, q) => total + pick(q), 0)
  const state = (name: string) => sum((q) => q.states[name] ?? 0)
  const at = now.toISOString()
  const oldest = Math.max(0, ...queues.map((q) => q.oldest_queued_s ?? 0))
  const queued = state('queued')
  const failed = state('failed')
  return {
    health: { state: 'ok', reason: null },
    metrics: [
      { key: 'worker.queued', value: queued, at },
      { key: 'worker.live', value: state('leased') + state('running') + state('draining'), at },
      { key: 'worker.failed', value: failed, at },
      { key: 'worker.done_1h', value: sum((q) => q.done_1h), at },
      { key: 'worker.wasted_1h_s', value: sum((q) => q.wasted_1h_s), at },
      { key: 'worker.cooldowns', value: Object.keys(status.cooldowns).length, at },
      { key: 'worker.nodes', value: Object.keys(status.nodes).length, at },
    ],
    pending: [
      ...(failed > 0 ? [{ key: 'worker.failed_jobs' as const, count: failed, oldestAt: null }] : []),
      ...(queued > 0
        ? [{ key: 'worker.queued_jobs' as const, count: queued, oldestAt: new Date(now.getTime() - oldest * 1000).toISOString() }]
        : []),
    ],
  }
}
```

`apps/server/src/adapters/worker/workerEvents.ts`:

```ts
import type { OrbitEvent } from '@orbit/contract'

import { toSafeRef } from '../../refs/toSafeRef'
import type { WorkerStatus } from '../../types/WorkerStatus'

export const workerEvents = (
  seen: { readonly failures: ReadonlySet<string>; readonly cooldowns: ReadonlySet<string> } | null,
  status: WorkerStatus,
  now: Date,
): OrbitEvent[] => {
  if (seen === null) return []
  const at = now.toISOString()
  const failures = status.recent_failures
    .filter((f) => !seen.failures.has(f.id))
    .map((f): OrbitEvent => ({
      at,
      component: 'worker',
      kind: 'worker.job_failed',
      severity: 'warn',
      refs: Object.fromEntries(
        Object.entries({ job: toSafeRef(f.id), queue: toSafeRef(f.queue) }).filter(
          (entry): entry is [string, string] => entry[1] !== undefined,
        ),
      ),
    }))
  const cooldowns = Object.keys(status.cooldowns)
    .filter((runner) => !seen.cooldowns.has(runner))
    .flatMap((runner): OrbitEvent[] => {
      const ref = toSafeRef(runner)
      return ref === undefined ? [] : [{ at, component: 'worker', kind: 'worker.cooldown_started', severity: 'info', refs: { runner: ref } }]
    })
  return [...failures, ...cooldowns]
}
```

`apps/server/src/adapters/worker/createWorkerAdapter.ts`:

```ts
import type { Adapter } from '../../types/Adapter'
import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import { fetchWorkerStatus } from './fetchWorkerStatus'
import { summarizeWorker } from './summarizeWorker'
import { workerEvents } from './workerEvents'

export const createWorkerAdapter = (deps: WorkerAdapterDeps): Adapter => {
  let seen: { failures: Set<string>; cooldowns: Set<string> } | null = null
  return {
    id: 'worker',
    cadenceMs: deps.cadenceMs,
    timeoutMs: Math.min(4000, deps.cadenceMs),
    freshnessMs: deps.cadenceMs * 2,
    read: async (signal) => {
      const status = await fetchWorkerStatus(deps, signal)
      const now = new Date()
      const events = workerEvents(seen, status, now)
      seen = {
        failures: new Set(status.recent_failures.map((f) => f.id)),
        cooldowns: new Set(Object.keys(status.cooldowns)),
      }
      return { component: 'worker', ...summarizeWorker(status, now), events, observedAt: now.toISOString() }
    },
  }
}
```

`apps/server/src/adapters/synthetic/createSyntheticAdapter.ts`:

```ts
import { existsSync } from 'node:fs'

import { ProcessError } from '../../process/ProcessError'
import type { Adapter } from '../../types/Adapter'

export const createSyntheticAdapter = (failFlagPath: string): Adapter => {
  let tick = 0
  return {
    id: 'synthetic',
    cadenceMs: 1000,
    timeoutMs: 2000,
    freshnessMs: 5000,
    read: async () => {
      if (existsSync(failFlagPath)) throw new ProcessError('unreachable')
      tick += 1
      const at = new Date().toISOString()
      return {
        component: 'synthetic',
        health: { state: 'ok', reason: null },
        metrics: [{ key: 'synthetic.value', value: tick % 100, at }],
        pending: [{ key: 'synthetic.items', count: tick % 5, oldestAt: null }],
        events: [{ at, component: 'synthetic', kind: 'synthetic.tick', severity: 'info', refs: { n: tick } }],
        observedAt: at,
      }
    },
  }
}
```

`apps/server/src/types/AdapterContext.ts`:

```ts
import type { LaunchdObservation } from './LaunchdObservation'
import type { OrbitConfig } from './OrbitConfig'
import type { RunRequest } from './RunRequest'
import type { RunResult } from './RunResult'

export type AdapterContext = {
  readonly config: OrbitConfig
  readonly stateDir: string
  readonly uid: number
  readonly record: (observation: LaunchdObservation) => void
  readonly run: (request: RunRequest) => Promise<RunResult>
  readonly fetch: typeof fetch
}
```

`apps/server/src/adapters/buildAdapters.ts`:

```ts
import { join } from 'node:path'

import type { Adapter } from '../types/Adapter'
import type { AdapterContext } from '../types/AdapterContext'
import { createLaunchdAdapter } from './launchd/createLaunchdAdapter'
import { createSyntheticAdapter } from './synthetic/createSyntheticAdapter'
import { createWorkerAdapter } from './worker/createWorkerAdapter'

export const buildAdapters = (context: AdapterContext): Adapter[] => {
  const { config } = context
  const adapters: Adapter[] = []
  const launchd = config.launchd
  if (launchd !== undefined && launchd.labels.length > 0) {
    adapters.push(
      createLaunchdAdapter({
        launchctl: launchd.launchctl,
        plutil: launchd.plutil,
        labels: launchd.labels,
        uid: context.uid,
        cadenceMs: config.cadenceMs.launchd ?? 10_000,
        run: context.run,
        record: context.record,
      }),
    )
  }
  if (config.worker !== undefined) {
    adapters.push(createWorkerAdapter({ ...config.worker, cadenceMs: config.cadenceMs.worker ?? 5000, fetch: context.fetch }))
  }
  if (config.synthetic) adapters.push(createSyntheticAdapter(join(context.stateDir, 'synthetic-fail')))
  return adapters
}
```

- [ ] **Step 4: Run tests and gate** — PASS. If `max-lines-per-function` or `complexity` flags `summarizeWorker`, extract `adapters/worker/sumQueueState.ts` exporting `sumQueueState(status, name): number` and `adapters/worker/workerPending.ts` exporting `workerPending(failed, queued, oldestAt): Pending[]`.

- [ ] **Step 5: Commit and push**

```bash
git add apps/server
git commit -m "feat(server): worker and synthetic adapters and the adapter registry"
pnpm gate && git push
```

---
### Task 16: HTTP routes and the app

**Files:**
- Create: `apps/server/src/http/routes/tokenBodySchema.ts`, `pairBodySchema.ts`, `setSessionCookie.ts`, `rateAllowed.ts`, `postSession.ts`, `postPair.ts`, `postLogout.ts`, `getSnapshots.ts`, `getLaunchdRows.ts`, `getLaunchdHistory.ts`, `writeMessage.ts`, `writeOpening.ts`, `flushQueue.ts`, `getStream.ts`
- Create: `apps/server/src/http/createApp.ts`, `apps/server/src/http/serveWeb.ts`, `apps/server/src/scheduler/createDetailPool.ts`, `apps/server/src/types/DetailPool.ts`, test `apps/server/src/scheduler/createDetailPool.test.ts`
- Create: `apps/server/src/types/AuthRouteDeps.ts`, `AppDeps.ts`, `OrbitEnv.ts`
- Test: `apps/server/src/http/routes/auth.test.ts`, `stream.test.ts`, `launchd.test.ts`, `apps/server/src/http/createApp.test.ts`

**Interfaces:**
- Consumes: Tasks 9-15.
- Produces:
  - `OrbitEnv = { Bindings: HttpBindings }`
  - `AuthRouteDeps = { db: DatabaseSync; now: () => number }`
  - `AppDeps = { authDb: DatabaseSync; historyDb: DatabaseSync; hub: Hub; catalog: LaunchdCatalog | null; guard: GuardConfig; webRoot: string; now: () => number }`
  - `createApp(deps: AppDeps): Hono<OrbitEnv>` with:
    - `POST /api/session` `{ token }` → 204 + cookie, or 401 `{"error":"unauthorized"}` (also when rate limited: 5/min per source, 30/min global)
    - `POST /api/pair` `{ id, secret }` → same contract, keys `pair:*`
    - `POST /api/logout` → 204, cookie cleared
    - `GET /api/snapshots` → `{ lastId, snapshots, events }`
    - `GET /api/stream` → SSE: default-event messages carry one `StreamMessage` JSON each with SSE `id` = message id; `event: ping` every 15 s
    - `GET /api/launchd` → `{ rows }` from the catalog (empty when no catalog)
    - `GET /api/launchd/history?label=<label>&range=24h|7d|30d` → `LaunchdHistory` for a registered label only, else 404
    - every other GET → static file from `webRoot`, falling back to `index.html`

- [ ] **Step 1: Write the failing tests**

`apps/server/src/http/routes/auth.test.ts`:

```ts
import { createAdminToken } from '../../auth/createAdminToken'
import { createInvitation } from '../../auth/createInvitation'
import { createHub } from '../../hub/createHub'
import { openAuthDb } from '../../test/openAuthDb'
import { openHistoryDb } from '../../test/openHistoryDb'
import { createApp } from '../createApp'

const setup = () => {
  const authDb = openAuthDb()
  const app = createApp({
    authDb,
    historyDb: openHistoryDb(),
    hub: createHub({ ringSize: 10, recentEvents: 5, firstId: 1 }),
    catalog: null,
    guard: { port: 8790, allowedHosts: [], allowedLogins: [] },
    webRoot: '/nonexistent',
    now: () => Date.now(),
  })
  const post = (path: string, body: unknown, source = '10.0.0.1') =>
    app.request(`http://127.0.0.1:8790${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Host: '127.0.0.1:8790',
        Origin: 'http://127.0.0.1:8790',
        'X-Orbit': '1',
        'Content-Type': 'application/json',
        'X-Forwarded-For': source,
      },
    })
  return { authDb, app, post }
}

describe('auth routes', () => {
  it('opens a session with the admin token and sets a hardened cookie', async () => {
    const { authDb, post } = setup()
    const token = createAdminToken(authDb, Date.now())
    const res = await post('/api/session', { token })
    expect(res.status).toBe(204)
    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie).toContain('__Host-orbit_session=')
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/Secure/i)
    expect(cookie).toMatch(/SameSite=Strict/i)
  })
  it('answers every failure the same way and rate limits per source', async () => {
    const { authDb, post } = setup()
    const token = createAdminToken(authDb, Date.now())
    const statuses = []
    for (let i = 0; i < 5; i += 1) statuses.push((await post('/api/session', { token: 'wrong' })).status)
    statuses.push((await post('/api/session', { token })).status)
    expect(statuses).toEqual([401, 401, 401, 401, 401, 401])
    expect((await post('/api/session', { token }, '10.0.0.2')).status).toBe(204)
    expect(await (await post('/api/session', { nope: 1 }, '10.0.0.3')).json()).toEqual({ error: 'unauthorized' })
  })
  it('redeems a pairing invitation once', async () => {
    const { authDb, post } = setup()
    const invitation = createInvitation(authDb, Date.now())
    expect((await post('/api/pair', invitation)).status).toBe(204)
    expect((await post('/api/pair', invitation)).status).toBe(401)
  })
  it('requires a session for data routes and unknown API paths alike', async () => {
    const { app } = setup()
    for (const path of ['/api/snapshots', '/api/no-such-route']) {
      const res = await app.request(`http://127.0.0.1:8790${path}`, {
        headers: { Host: '127.0.0.1:8790', 'Sec-Fetch-Site': 'same-origin' },
      })
      expect(res.status).toBe(401)
    }
  })
})
```

`apps/server/src/http/routes/stream.test.ts`:

```ts
import type { Snapshot, StreamMessage } from '@orbit/contract'

import { createSession } from '../../auth/createSession'
import { createHub } from '../../hub/createHub'
import { openAuthDb } from '../../test/openAuthDb'
import { openHistoryDb } from '../../test/openHistoryDb'
import { createApp } from '../createApp'

const snap = (value: number): Snapshot => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: '2026-10-02T10:00:00.000Z' }],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
})

const readMessages = async (res: Response, count: number): Promise<StreamMessage[]> => {
  const reader = res.body?.getReader()
  const decoder = new TextDecoder()
  let text = ''
  const messages: StreamMessage[] = []
  while (reader !== undefined && messages.length < count) {
    const chunk = await reader.read()
    if (chunk.done) break
    text += decoder.decode(chunk.value)
    const blocks = text.split('\n\n')
    text = blocks.pop() ?? ''
    for (const block of blocks) {
      const data = block.split('\n').find((line) => line.startsWith('data: '))
      if (data !== undefined) messages.push(JSON.parse(data.slice(6)) as StreamMessage)
    }
  }
  await reader?.cancel()
  return messages
}

const setup = () => {
  const authDb = openAuthDb()
  const hub = createHub({ ringSize: 2, recentEvents: 5, firstId: 1 })
  const app = createApp({
    authDb, historyDb: openHistoryDb(), hub, catalog: null,
    guard: { port: 8790, allowedHosts: [], allowedLogins: [] }, webRoot: '/nonexistent', now: () => Date.now(),
  })
  const headers = (extra: Record<string, string> = {}) => ({
    Host: '127.0.0.1:8790', 'Sec-Fetch-Site': 'same-origin',
    Cookie: `__Host-orbit_session=${createSession(authDb, Date.now())}`, ...extra,
  })
  return { app, hub, headers }
}

describe('GET /api/stream', () => {
  it('sends the current snapshots then a sync marker', async () => {
    const { app, hub, headers } = setup()
    hub.publish(snap(1))
    const res = await app.request('http://127.0.0.1:8790/api/stream', { headers: headers() })
    const messages = await readMessages(res, 2)
    expect(messages.map((m) => m.type)).toEqual(['snapshot', 'sync'])
  })
  it('puts an SSE id only on the closing sync of an opening', async () => {
    const { app, hub, headers } = setup()
    hub.publish(snap(1))
    const res = await app.request('http://127.0.0.1:8790/api/stream', { headers: headers() })
    const reader = res.body?.getReader()
    let text = ''
    while (reader !== undefined && !text.includes('"type":"sync"')) {
      const chunk = await reader.read()
      if (chunk.done) break
      text += new TextDecoder().decode(chunk.value)
    }
    await reader?.cancel()
    const blocks = text.split('\n\n').filter((b) => b.includes('data: '))
    expect(blocks.map((b) => b.includes('\nid: ') || b.startsWith('id: '))).toEqual([false, true])
  })
  it('replays after a known id inside the ring', async () => {
    const { app, hub, headers } = setup()
    hub.publish(snap(1))
    hub.publish(snap(2))
    const res = await app.request('http://127.0.0.1:8790/api/stream', { headers: headers({ 'Last-Event-ID': '1' }) })
    const messages = await readMessages(res, 2)
    expect(messages.map((m) => [m.type, m.id])).toEqual([['snapshot', 2], ['sync', 2]])
  })
  it('resyncs when the id fell out of the ring', async () => {
    const { app, hub, headers } = setup()
    ;[1, 2, 3, 4].forEach((v) => hub.publish(snap(v)))
    const res = await app.request('http://127.0.0.1:8790/api/stream', { headers: headers({ 'Last-Event-ID': '0' }) })
    const messages = await readMessages(res, 3)
    expect(messages.map((m) => m.type)).toEqual(['resync', 'snapshot', 'sync'])
  })
})
```

`apps/server/src/http/routes/launchd.test.ts`:

```ts
import { createSession } from '../../auth/createSession'
import { recordLaunchdObservation } from '../../history/recordLaunchdObservation'
import { createHub } from '../../hub/createHub'
import { openAuthDb } from '../../test/openAuthDb'
import { openHistoryDb } from '../../test/openHistoryDb'
import { createApp } from '../createApp'

describe('launchd routes', () => {
  it('serves rows and history for registered labels only', async () => {
    const authDb = openAuthDb()
    const historyDb = openHistoryDb()
    recordLaunchdObservation(historyDb, { label: 'com.example.a', pid: 1, runs: 1, lastExit: null, at: Date.now() })
    const app = createApp({
      authDb, historyDb, hub: createHub({ ringSize: 2, recentEvents: 2, firstId: 1 }),
      catalog: { rows: async () => [{ component: 'worker', label: 'com.example.a', role: 'keepalive', schedule: null }] },
      guard: { port: 8790, allowedHosts: [], allowedLogins: [] }, webRoot: '/nonexistent', now: () => Date.now(),
    })
    const headers = {
      Host: '127.0.0.1:8790', 'Sec-Fetch-Site': 'same-origin',
      Cookie: `__Host-orbit_session=${createSession(authDb, Date.now())}`,
    }
    const rows = await (await app.request('http://127.0.0.1:8790/api/launchd', { headers })).json()
    expect(rows).toEqual({ rows: [{ component: 'worker', label: 'com.example.a', role: 'keepalive', schedule: null }] })
    const ok = await app.request('http://127.0.0.1:8790/api/launchd/history?label=com.example.a&range=24h', { headers })
    expect(((await ok.json()) as { observations: unknown[] }).observations).toHaveLength(1)
    const unknown = await app.request('http://127.0.0.1:8790/api/launchd/history?label=com.example.b&range=24h', { headers })
    expect(unknown.status).toBe(404)
    const badRange = await app.request('http://127.0.0.1:8790/api/launchd/history?label=com.example.a&range=1y', { headers })
    expect(badRange.status).toBe(400)
  })
})
```

`apps/server/src/http/createApp.test.ts`:

```ts
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createHub } from '../hub/createHub'
import { openAuthDb } from '../test/openAuthDb'
import { openHistoryDb } from '../test/openHistoryDb'
import { createApp } from './createApp'

describe('createApp static files', () => {
  it('serves assets and falls back to index.html for client routes', async () => {
    const webRoot = await mkdtemp(join(tmpdir(), 'orbit-web-'))
    await writeFile(join(webRoot, 'index.html'), '<!doctype html><title>orbit</title>')
    await writeFile(join(webRoot, 'app.js'), 'console.log(1)')
    const app = createApp({
      authDb: openAuthDb(), historyDb: openHistoryDb(), hub: createHub({ ringSize: 2, recentEvents: 2, firstId: 1 }),
      catalog: null, guard: { port: 8790, allowedHosts: [], allowedLogins: [] }, webRoot, now: () => Date.now(),
    })
    const get = (path: string) => app.request(`http://127.0.0.1:8790${path}`, { headers: { Host: '127.0.0.1:8790' } })
    expect(await (await get('/app.js')).text()).toBe('console.log(1)')
    const page = await get('/system')
    expect(await page.text()).toContain('<title>orbit</title>')
    expect(page.headers.get('content-security-policy')).toContain("default-src 'self'")
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL.

- [ ] **Step 3: Implement**

`apps/server/src/types/OrbitEnv.ts`:

```ts
import type { HttpBindings } from '@hono/node-server'

export type OrbitEnv = { Bindings: HttpBindings }
```

`apps/server/src/types/AuthRouteDeps.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

export type AuthRouteDeps = { readonly db: DatabaseSync; readonly now: () => number }
```

`apps/server/src/types/AppDeps.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { GuardConfig } from './GuardConfig'
import type { Hub } from './Hub'
import type { LaunchdCatalog } from './LaunchdCatalog'

export type AppDeps = {
  readonly authDb: DatabaseSync
  readonly historyDb: DatabaseSync
  readonly hub: Hub
  readonly catalog: LaunchdCatalog | null
  readonly guard: GuardConfig
  readonly webRoot: string
  readonly now: () => number
}
```

`apps/server/src/http/routes/tokenBodySchema.ts`:

```ts
import { z } from 'zod'

export const tokenBodySchema = z.object({ token: z.string().min(1).max(200) }).strict()
```

`apps/server/src/http/routes/pairBodySchema.ts`:

```ts
import { z } from 'zod'

export const pairBodySchema = z
  .object({ id: z.string().regex(/^[\w-]{11}$/), secret: z.string().regex(/^[\w-]{22}$/) })
  .strict()
```

`apps/server/src/http/routes/setSessionCookie.ts`:

```ts
import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'

import { SESSION_COOKIE } from '../sessionCookieName'

export const setSessionCookie = (c: Context, id: string): void => {
  setCookie(c, SESSION_COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/',
    maxAge: 30 * 86_400,
  })
}
```

`apps/server/src/http/routes/rateAllowed.ts`:

```ts
import type { Context } from 'hono'

import { consumeRateLimit } from '../../auth/consumeRateLimit'
import type { AuthRouteDeps } from '../../types/AuthRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { sourceKey } from '../sourceKey'

export const rateAllowed = (deps: AuthRouteDeps, c: Context<OrbitEnv>, scope: 'session' | 'pair'): boolean => {
  const now = deps.now()
  return (
    consumeRateLimit(deps.db, { key: `${scope}:${sourceKey(c)}`, limit: 5 }, now) &&
    consumeRateLimit(deps.db, { key: 'auth:global', limit: 30 }, now)
  )
}
```

`apps/server/src/http/routes/postSession.ts`:

```ts
import type { Handler } from 'hono'

import { createSession } from '../../auth/createSession'
import { recordAudit } from '../../auth/recordAudit'
import { verifyAdminToken } from '../../auth/verifyAdminToken'
import type { AuthRouteDeps } from '../../types/AuthRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { rateAllowed } from './rateAllowed'
import { setSessionCookie } from './setSessionCookie'
import { tokenBodySchema } from './tokenBodySchema'

export const postSession =
  (deps: AuthRouteDeps): Handler<OrbitEnv> =>
  async (c) => {
    const allowed = rateAllowed(deps, c, 'session')
    const body = tokenBodySchema.safeParse(await c.req.json().catch(() => null))
    if (!allowed || !body.success || !verifyAdminToken(deps.db, body.data.token)) {
      recordAudit(deps.db, 'session.create', 'denied', deps.now())
      return c.json({ error: 'unauthorized' }, 401)
    }
    setSessionCookie(c, createSession(deps.db, deps.now()))
    recordAudit(deps.db, 'session.create', 'ok', deps.now())
    return c.body(null, 204)
  }
```

`apps/server/src/http/routes/postPair.ts`:

```ts
import type { Handler } from 'hono'

import { recordAudit } from '../../auth/recordAudit'
import { redeemInvitation } from '../../auth/redeemInvitation'
import type { AuthRouteDeps } from '../../types/AuthRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { pairBodySchema } from './pairBodySchema'
import { rateAllowed } from './rateAllowed'
import { setSessionCookie } from './setSessionCookie'

export const postPair =
  (deps: AuthRouteDeps): Handler<OrbitEnv> =>
  async (c) => {
    const allowed = rateAllowed(deps, c, 'pair')
    const body = pairBodySchema.safeParse(await c.req.json().catch(() => null))
    const session = allowed && body.success ? redeemInvitation(deps.db, body.data, deps.now()) : null
    if (session === null) {
      recordAudit(deps.db, 'session.pair', 'denied', deps.now())
      return c.json({ error: 'unauthorized' }, 401)
    }
    setSessionCookie(c, session)
    recordAudit(deps.db, 'session.pair', 'ok', deps.now())
    return c.body(null, 204)
  }
```

`apps/server/src/http/routes/postLogout.ts`:

```ts
import type { Handler } from 'hono'
import { deleteCookie, getCookie } from 'hono/cookie'

import { deleteSession } from '../../auth/deleteSession'
import { recordAudit } from '../../auth/recordAudit'
import type { AuthRouteDeps } from '../../types/AuthRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { SESSION_COOKIE } from '../sessionCookieName'

export const postLogout =
  (deps: AuthRouteDeps): Handler<OrbitEnv> =>
  (c) => {
    const id = getCookie(c, SESSION_COOKIE)
    if (id !== undefined) deleteSession(deps.db, id)
    deleteCookie(c, SESSION_COOKIE, { path: '/', secure: true })
    recordAudit(deps.db, 'session.logout', 'ok', deps.now())
    return c.body(null, 204)
  }
```

`apps/server/src/http/routes/getSnapshots.ts`:

```ts
import type { Handler } from 'hono'

import type { Hub } from '../../types/Hub'
import type { OrbitEnv } from '../../types/OrbitEnv'

export const getSnapshots =
  (hub: Hub): Handler<OrbitEnv> =>
  (c) =>
    c.json({ lastId: hub.lastId(), snapshots: hub.snapshots(), events: hub.recentEvents() })
```

Detail work (anything a request triggers, as opposed to polling) goes through one FIFO pool of 2 slots, timeout counted from enqueue (spec 5.2). Polling never touches it. At the deadline the caller gets `timeout` at once, but the slot stays taken until the work really settles, so a stuck job cannot multiply.

`apps/server/src/types/DetailPool.ts`:

```ts
export type DetailPool = {
  run<T>(work: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T>
}
```

`apps/server/src/scheduler/createDetailPool.ts`:

```ts
import { ProcessError } from '../process/ProcessError'
import type { DetailPool } from '../types/DetailPool'
import { raceAbort } from './raceAbort'

export const createDetailPool = (slots: number): DetailPool => {
  let running = 0
  const waiting: { readonly signal: AbortSignal; readonly start: () => void }[] = []
  const release = (): void => {
    running -= 1
    let next = waiting.shift()
    while (next !== undefined && next.signal.aborted) next = waiting.shift()
    next?.start()
  }
  const acquire = (signal: AbortSignal): Promise<void> => {
    if (running < slots) {
      running += 1
      return Promise.resolve()
    }
    return new Promise((resolve, reject) => {
      waiting.push({ signal, start: () => ((running += 1), resolve()) })
      signal.addEventListener('abort', () => reject(new ProcessError('timeout')), { once: true })
    })
  }
  return {
    run: async (work, timeoutMs) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      try {
        await acquire(controller.signal)
      } catch (error) {
        clearTimeout(timer)
        throw error
      }
      const job = work(controller.signal)
      void job.then(
        () => undefined,
        () => undefined,
      ).finally(() => {
        clearTimeout(timer)
        release()
      })
      return raceAbort(job, controller.signal)
    },
  }
}
```

If the comma expression in `start` trips `no-sequences`, write it as a block: `start: () => { running += 1; resolve() }`.

`apps/server/src/scheduler/createDetailPool.test.ts`:

```ts
import { createDetailPool } from './createDetailPool'

describe('createDetailPool', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('runs two at a time in arrival order and times out from enqueue', async () => {
    const pool = createDetailPool(2)
    let active = 0
    let maxActive = 0
    const order: number[] = []
    const job = (n: number, ms: number) => () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      order.push(n)
      return new Promise<number>((resolve) => setTimeout(() => ((active -= 1), resolve(n)), ms))
    }
    const results = [pool.run(job(1, 1000), 5000), pool.run(job(2, 1000), 5000), pool.run(job(3, 10), 5000)]
    const late = pool.run(job(4, 10), 500)
    const lateResult = late.catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(2000)
    expect(await Promise.all(results)).toEqual([1, 2, 3])
    expect(order).toEqual([1, 2, 3])
    expect(maxActive).toBe(2)
    expect(await lateResult).toMatchObject({ reason: 'timeout' })
  })

  it('answers at the deadline but keeps the slot until a stuck job settles', async () => {
    const pool = createDetailPool(1)
    let finish: () => void = () => undefined
    const stuck = pool.run(() => new Promise<void>((resolve) => (finish = resolve)), 100).catch((e: unknown) => e)
    const next = vi.fn(async () => 'ran')
    const queued = pool.run(next, 10_000)
    await vi.advanceTimersByTimeAsync(200)
    expect(await stuck).toMatchObject({ reason: 'timeout' })
    expect(next).not.toHaveBeenCalled()
    finish()
    await vi.advanceTimersByTimeAsync(0)
    expect(await queued).toBe('ran')
  })
})
```

`apps/server/src/http/routes/getLaunchdRows.ts`:

```ts
import type { Handler } from 'hono'

import type { DetailPool } from '../../types/DetailPool'
import type { LaunchdCatalog } from '../../types/LaunchdCatalog'
import type { OrbitEnv } from '../../types/OrbitEnv'

export const getLaunchdRows =
  (catalog: LaunchdCatalog | null, pool: DetailPool): Handler<OrbitEnv> =>
  async (c) => {
    if (catalog === null) return c.json({ rows: [] })
    const rows = await pool.run((signal) => catalog.rows(signal), 15_000).catch(() => null)
    return rows === null ? c.json({ error: 'unavailable' }, 503) : c.json({ rows })
  }
```

`apps/server/src/http/routes/getLaunchdHistory.ts`:

```ts
import type { Handler } from 'hono'
import type { DatabaseSync } from 'node:sqlite'

import { readLaunchdHistory } from '../../history/readLaunchdHistory'
import type { DetailPool } from '../../types/DetailPool'
import type { LaunchdCatalog } from '../../types/LaunchdCatalog'
import type { OrbitEnv } from '../../types/OrbitEnv'

export const getLaunchdHistory =
  (historyDb: DatabaseSync, catalog: LaunchdCatalog | null, pool: DetailPool, now: () => number): Handler<OrbitEnv> =>
  async (c) => {
    const ranges: Record<string, number> = { '24h': 86_400_000, '7d': 7 * 86_400_000, '30d': 30 * 86_400_000 }
    const span = ranges[c.req.query('range') ?? '']
    if (span === undefined) return c.json({ error: 'bad_request' }, 400)
    const label = c.req.query('label')
    const rows = catalog === null ? [] : await pool.run((signal) => catalog.rows(signal), 15_000).catch(() => [])
    if (!rows.some((row) => row.label === label) || label === undefined) return c.json({ error: 'not_found' }, 404)
    return c.json(readLaunchdHistory(historyDb, label, now() - span))
  }
```

`apps/server/src/http/routes/writeMessage.ts`:

```ts
import type { StreamMessage } from '@orbit/contract'
import type { SSEStreamingApi } from 'hono/streaming'

export const writeMessage = (stream: SSEStreamingApi, message: StreamMessage, withId = true): Promise<void> =>
  stream.writeSSE(withId ? { id: String(message.id), data: JSON.stringify(message) } : { data: JSON.stringify(message) })
```

`apps/server/src/http/routes/writeOpening.ts`:

```ts
import type { SSEStreamingApi } from 'hono/streaming'

import type { Hub } from '../../types/Hub'
import { writeMessage } from './writeMessage'

export const writeOpening = async (stream: SSEStreamingApi, hub: Hub, lastEventId: string | undefined): Promise<number> => {
  const requested = lastEventId === undefined ? null : Number(lastEventId)
  const replay = requested !== null && Number.isSafeInteger(requested) ? hub.replayAfter(requested) : null
  if (replay !== null && requested !== null) {
    for (const message of replay) await writeMessage(stream, message)
    const last = replay.at(-1)?.id ?? requested
    await writeMessage(stream, { type: 'sync', id: last }, false)
    return last
  }
  const id = hub.lastId()
  if (requested !== null) await writeMessage(stream, { type: 'resync', id }, false)
  for (const snapshot of hub.snapshots()) await writeMessage(stream, { type: 'snapshot', id, snapshot }, false)
  for (const event of hub.recentEvents()) await writeMessage(stream, { type: 'event', id, event }, false)
  await writeMessage(stream, { type: 'sync', id })
  return id
}
```

Only the closing `sync` of a full opening carries an SSE `id`. The browser's `Last-Event-ID` therefore moves only once the whole current set has arrived: a connection that drops halfway through the opening reconnects with the previous id (or none) and gets the full set again, instead of resuming from a point that skipped the rest of it. A replay ends with an id-less `sync` so the client knows it is current again. Ids stay monotonic because every id-bearing message is a hub id.

`apps/server/src/http/routes/flushQueue.ts`:

```ts
import type { StreamMessage } from '@orbit/contract'
import type { SSEStreamingApi } from 'hono/streaming'

import { writeMessage } from './writeMessage'

export const flushQueue = async (stream: SSEStreamingApi, queue: StreamMessage[], sent: number): Promise<number> => {
  let last = sent
  for (const message of queue.splice(0)) {
    if (message.id > last) {
      await writeMessage(stream, message)
      last = message.id
    }
  }
  return last
}
```

`apps/server/src/http/routes/getStream.ts`:

```ts
import type { StreamMessage } from '@orbit/contract'
import type { Handler } from 'hono'
import { streamSSE } from 'hono/streaming'

import type { Hub } from '../../types/Hub'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { flushQueue } from './flushQueue'
import { writeOpening } from './writeOpening'

export const getStream =
  (hub: Hub): Handler<OrbitEnv> =>
  (c) =>
    streamSSE(c, async (stream) => {
      const queue: StreamMessage[] = []
      const unsubscribe = hub.subscribe((message) => queue.push(message))
      stream.onAbort(unsubscribe)
      let sent = await writeOpening(stream, hub, c.req.header('Last-Event-ID'))
      let lastPing = Date.now()
      while (!stream.aborted) {
        sent = await flushQueue(stream, queue, sent)
        if (Date.now() - lastPing >= 15_000) {
          await stream.writeSSE({ event: 'ping', data: '' })
          lastPing = Date.now()
        }
        await stream.sleep(250)
      }
      unsubscribe()
    })
```

`apps/server/src/http/serveWeb.ts`:

```ts
import { serveStatic } from '@hono/node-server/serve-static'
import type { Hono } from 'hono'
import { readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import type { OrbitEnv } from '../types/OrbitEnv'

export const serveWeb = (app: Hono<OrbitEnv>, webRoot: string): void => {
  app.use('/*', serveStatic({ root: relative(process.cwd(), webRoot) }))
  app.get('*', async (c) => {
    const html = await readFile(join(webRoot, 'index.html'), 'utf8').catch(() => null)
    return html === null ? c.json({ error: 'not_found' }, 404) : c.html(html)
  })
}
```

`apps/server/src/http/createApp.ts`:

```ts
import { Hono } from 'hono'

import { createDetailPool } from '../scheduler/createDetailPool'
import type { AppDeps } from '../types/AppDeps'
import type { OrbitEnv } from '../types/OrbitEnv'
import { hostAllowlist } from './hostAllowlist'
import { requireCsrfHeader } from './requireCsrfHeader'
import { requireSameOrigin } from './requireSameOrigin'
import { requireSession } from './requireSession'
import { getLaunchdHistory } from './routes/getLaunchdHistory'
import { getLaunchdRows } from './routes/getLaunchdRows'
import { getSnapshots } from './routes/getSnapshots'
import { getStream } from './routes/getStream'
import { postLogout } from './routes/postLogout'
import { postPair } from './routes/postPair'
import { postSession } from './routes/postSession'
import { securityHeaders } from './securityHeaders'
import { serveWeb } from './serveWeb'
import { tailnetLogin } from './tailnetLogin'

export const createApp = (deps: AppDeps): Hono<OrbitEnv> => {
  const auth = { db: deps.authDb, now: deps.now }
  const pool = createDetailPool(2)
  const app = new Hono<OrbitEnv>()
  app.use('*', hostAllowlist(deps.guard), securityHeaders(), tailnetLogin(deps.guard))
  app.use('/api/*', requireSameOrigin(deps.guard), requireCsrfHeader())
  app.post('/api/session', postSession(auth))
  app.post('/api/pair', postPair(auth))
  const api = new Hono<OrbitEnv>()
  api.use('*', requireSession(deps.authDb, deps.now))
  api.post('/logout', postLogout(auth))
  api.get('/snapshots', getSnapshots(deps.hub))
  api.get('/stream', getStream(deps.hub))
  api.get('/launchd', getLaunchdRows(deps.catalog, pool))
  api.get('/launchd/history', getLaunchdHistory(deps.historyDb, deps.catalog, pool, deps.now))
  api.all('*', (c) => c.json({ error: 'not_found' }, 404))
  app.route('/api', api)
  serveWeb(app, deps.webRoot)
  return app
}
```

- [ ] **Step 4: Run tests and gate** — PASS. Two things to confirm while green: the static test proves `serveStatic` resolves the relative root; the `__Host-` cookie test proves Hono does not reject the prefix with `secure: true` and `path: '/'`.

- [ ] **Step 5: Commit and push**

```bash
git add apps/server
git commit -m "feat(server): auth, snapshot, stream, launchd and static routes"
pnpm gate && git push
```

---

### Task 17: CLI and server start

**Files:**
- Create: `apps/server/src/cli/runCli.ts`, `cli/openState.ts`, `cli/startServer.ts`, `cli/commands/serveCommand.ts`, `tokenCommand.ts`, `pairCommand.ts`, `sessionsCommand.ts`, `doctorCommand.ts`, `cli/checks/*.ts` (one check per file, listed in Step 3)
- Create: `apps/server/src/types/CliIo.ts`, `OrbitState.ts`, `DoctorCheck.ts`, `CheckResult.ts`
- Modify: `apps/server/src/cli/main.ts` (replace the Task 1 placeholder), delete `apps/server/src/cli/main.test.ts`
- Test: `apps/server/src/cli/runCli.test.ts`, `commands/tokenCommand.test.ts`, `commands/pairCommand.test.ts`, `commands/sessionsCommand.test.ts`, `commands/doctorCommand.test.ts`, `cli/startServer.test.ts`

**Interfaces:**
- Produces:
  - `CliIo = { out(line: string): void; err(line: string): void; env: NodeJS.ProcessEnv }`
  - `OrbitState = { dataDir: string; stateDir: string; config: OrbitConfig; authDb: DatabaseSync; historyDb: DatabaseSync; close(): void }`; `openState(env): Promise<OrbitState>`
  - `runCli(argv: readonly string[], io: CliIo): Promise<number>` — `serve`, `token create`, `pair`, `sessions list`, `sessions revoke <prefix>`, `doctor`; unknown command prints usage and returns 2.
  - `startServer(state: OrbitState, options: { webRoot: string; signal: AbortSignal }): Promise<{ port: number }>` — sets umask `0o077` before opening databases (done in `openState`), builds adapters, hub (`firstId = Date.now() * 1000`), records metrics from snapshot messages, starts a run interval (touched every 60 s), prunes history at start and hourly, serves on `127.0.0.1:<port>`, stops everything when `signal` aborts.
  - `DoctorCheck = (state: OrbitState) => Promise<CheckResult>`, `CheckResult = { name: string; level: 'ok' | 'warn' | 'fail'; detail: string }`.

- [ ] **Step 1: Write the failing tests**

`apps/server/src/cli/runCli.test.ts`:

```ts
import { runCli } from './runCli'

describe('runCli', () => {
  it('prints usage for an unknown command', async () => {
    const lines: string[] = []
    const code = await runCli(['nope'], { out: (l) => lines.push(l), err: (l) => lines.push(l), env: {} })
    expect(code).toBe(2)
    expect(lines.join('\n')).toContain('usage: orbit')
  })
})
```

`apps/server/src/cli/commands/tokenCommand.test.ts`:

```ts
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { verifyAdminToken } from '../../auth/verifyAdminToken'
import { openState } from '../openState'
import { tokenCommand } from './tokenCommand'

export const tempInstance = async (): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-cli-'))
  await writeFile(join(dir, 'syntopica.config.json'), JSON.stringify({ schemaVersion: 1 }))
  return dir
}

describe('tokenCommand', () => {
  it('creates a token, prints it once, and stores only its hash', async () => {
    const env = { SYNTOPICA_DATA: await tempInstance() }
    const out: string[] = []
    expect(await tokenCommand(['create'], { out: (l) => out.push(l), err: () => undefined, env })).toBe(0)
    const token = out.find((line) => /^[\w-]{43}$/.test(line)) ?? ''
    const state = await openState(env)
    expect(verifyAdminToken(state.authDb, token)).toBe(true)
    state.close()
  })
})
```

Move `tempInstance` into `apps/server/src/test/tempInstance.ts` (test scaffolding, one export) and import it from every CLI test instead of declaring it in the test file.

`apps/server/src/cli/commands/pairCommand.test.ts`:

```ts
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { tempInstance } from '../../test/tempInstance'
import { pairCommand } from './pairCommand'

describe('pairCommand', () => {
  it('refuses without a tailnet host', async () => {
    const err: string[] = []
    const code = await pairCommand([], { out: () => undefined, err: (l) => err.push(l), env: { SYNTOPICA_DATA: await tempInstance() } })
    expect(code).toBe(1)
    expect(err.join()).toContain('allowedHosts')
  })
  it('prints a pairing URL with the invitation in the fragment', async () => {
    const data = await tempInstance()
    await mkdir(join(data, 'orbit'), { recursive: true })
    await writeFile(join(data, 'orbit', 'orbit.json'), JSON.stringify({ allowedHosts: ['orbit.example.ts.net'] }))
    const out: string[] = []
    expect(await pairCommand([], { out: (l) => out.push(l), err: () => undefined, env: { SYNTOPICA_DATA: data } })).toBe(0)
    expect(out.join('\n')).toMatch(/https:\/\/orbit\.example\.ts\.net\/pair#[\w-]{11}\.[\w-]{22}/)
  })
})
```

`apps/server/src/cli/commands/sessionsCommand.test.ts`:

```ts
import { createSession } from '../../auth/createSession'
import { tempInstance } from '../../test/tempInstance'
import { openState } from '../openState'
import { sessionsCommand } from './sessionsCommand'

describe('sessionsCommand', () => {
  it('lists and revokes sessions by prefix', async () => {
    const env = { SYNTOPICA_DATA: await tempInstance() }
    const state = await openState(env)
    createSession(state.authDb, Date.now())
    state.close()
    const out: string[] = []
    const io = { out: (l: string) => out.push(l), err: () => undefined, env }
    expect(await sessionsCommand(['list'], io)).toBe(0)
    const prefix = out.at(-1)?.split(/\s+/)[0] ?? ''
    expect(prefix).toMatch(/^[0-9a-f]{8}$/)
    expect(await sessionsCommand(['revoke', prefix], io)).toBe(0)
    expect(out.at(-1)).toBe('revoked 1')
  })
})
```

`apps/server/src/cli/commands/doctorCommand.test.ts`:

```ts
import { tempInstance } from '../../test/tempInstance'
import { doctorCommand } from './doctorCommand'

describe('doctorCommand', () => {
  it('fails when no admin token exists and reports each check', async () => {
    const out: string[] = []
    const code = await doctorCommand([], { out: (l) => out.push(l), err: () => undefined, env: { SYNTOPICA_DATA: await tempInstance() } })
    expect(code).toBe(1)
    expect(out.some((l) => l.startsWith('fail') && l.includes('admin token'))).toBe(true)
    expect(out.some((l) => l.startsWith('ok') && l.includes('instance'))).toBe(true)
  })
})
```

`apps/server/src/cli/startServer.test.ts`:

```ts
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { tempInstance } from '../test/tempInstance'
import { openState } from './openState'
import { startServer } from './startServer'

describe('startServer', () => {
  it('serves on loopback and stops on abort', async () => {
    const data = await tempInstance()
    await mkdir(join(data, 'orbit'), { recursive: true })
    await writeFile(join(data, 'orbit', 'orbit.json'), JSON.stringify({ port: 18_791, synthetic: true }))
    const state = await openState({ SYNTOPICA_DATA: data })
    const controller = new AbortController()
    const { port } = await startServer(state, { webRoot: '/nonexistent', signal: controller.signal })
    const res = await fetch(`http://127.0.0.1:${port}/api/snapshots`, { headers: { 'Sec-Fetch-Site': 'same-origin' } })
    expect(res.status).toBe(401)
    controller.abort()
    await new Promise((resolve) => setTimeout(resolve, 200))
    await expect(fetch(`http://127.0.0.1:${port}/api/snapshots`)).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL.

- [ ] **Step 3: Implement**

`apps/server/src/types/CliIo.ts`:

```ts
export type CliIo = {
  readonly out: (line: string) => void
  readonly err: (line: string) => void
  readonly env: NodeJS.ProcessEnv
}
```

`apps/server/src/types/OrbitState.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { OrbitConfig } from './OrbitConfig'

export type OrbitState = {
  readonly dataDir: string
  readonly stateDir: string
  readonly config: OrbitConfig
  readonly authDb: DatabaseSync
  readonly historyDb: DatabaseSync
  close(): void
}
```

`apps/server/src/types/CheckResult.ts`:

```ts
export type CheckResult = { readonly name: string; readonly level: 'ok' | 'warn' | 'fail'; readonly detail: string }
```

`apps/server/src/types/DoctorCheck.ts`:

```ts
import type { CheckResult } from './CheckResult'
import type { OrbitState } from './OrbitState'

export type DoctorCheck = (state: OrbitState) => Promise<CheckResult>
```

`apps/server/src/cli/openState.ts`:

```ts
import { join } from 'node:path'

import { loadInstanceConfig } from '../config/loadInstanceConfig'
import { loadOrbitConfig } from '../config/loadOrbitConfig'
import { resolveDataDir } from '../config/resolveDataDir'
import { HISTORY_SCHEMA_SQL } from '../history/historySchemaSql'
import { AUTH_SCHEMA_SQL } from '../state/authSchemaSql'
import { ensureStateDir } from '../state/ensureStateDir'
import { openDatabase } from '../state/openDatabase'
import type { OrbitState } from '../types/OrbitState'

export const openState = async (env: NodeJS.ProcessEnv): Promise<OrbitState> => {
  process.umask(0o077)
  const dataDir = resolveDataDir(env)
  await loadInstanceConfig(dataDir)
  const stateDir = await ensureStateDir(dataDir)
  const config = await loadOrbitConfig(dataDir)
  const authDb = openDatabase(join(stateDir, 'auth.sqlite3'), AUTH_SCHEMA_SQL)
  const historyDb = openDatabase(join(stateDir, 'history.sqlite3'), HISTORY_SCHEMA_SQL)
  return {
    dataDir,
    stateDir,
    config,
    authDb,
    historyDb,
    close: () => {
      authDb.close()
      historyDb.close()
    },
  }
}
```

`apps/server/src/cli/startServer.ts`:

```ts
import { serve } from '@hono/node-server'

import { buildAdapters } from '../adapters/buildAdapters'
import { createLaunchdCatalog } from '../adapters/launchd/createLaunchdCatalog'
import { pruneHistory } from '../history/pruneHistory'
import { recordLaunchdObservation } from '../history/recordLaunchdObservation'
import { recordMetrics } from '../history/recordMetrics'
import { startRun } from '../history/startRun'
import { touchRun } from '../history/touchRun'
import { createApp } from '../http/createApp'
import { createHub } from '../hub/createHub'
import { runProcess } from '../process/runProcess'
import { createScheduler } from '../scheduler/createScheduler'
import type { OrbitState } from '../types/OrbitState'

export const startServer = async (
  state: OrbitState,
  options: { webRoot: string; signal: AbortSignal },
): Promise<{ port: number }> => {
  const { config, historyDb } = state
  const uid = process.getuid?.() ?? 0
  const record = (o: Parameters<typeof recordLaunchdObservation>[1]) => recordLaunchdObservation(historyDb, o)
  const hub = createHub({ ringSize: 1000, recentEvents: 50, firstId: Date.now() * 1000 })
  hub.subscribe((m) => m.type === 'snapshot' && recordMetrics(historyDb, m.snapshot))
  const context = { config, stateDir: state.stateDir, uid, record, run: runProcess, fetch }
  const scheduler = createScheduler(buildAdapters(context), hub)
  const launchd = config.launchd
  const catalog = launchd === undefined ? null : createLaunchdCatalog({ ...launchd, uid, cadenceMs: 10_000, run: runProcess, record })
  const guard = { port: config.port, allowedHosts: config.allowedHosts, allowedLogins: config.allowedLogins }
  const app = createApp({ authDb: state.authDb, historyDb, hub, catalog, guard, webRoot: options.webRoot, now: Date.now })
  const run = startRun(historyDb, Date.now())
  pruneHistory(historyDb, Date.now())
  const timers = [
    setInterval(() => touchRun(historyDb, run, Date.now()), 60_000),
    setInterval(() => pruneHistory(historyDb, Date.now()), 3_600_000),
  ]
  const server = serve({ fetch: app.fetch, port: config.port, hostname: '127.0.0.1' })
  scheduler.start()
  options.signal.addEventListener('abort', () => {
    scheduler.stop()
    timers.forEach(clearInterval)
    touchRun(historyDb, run, Date.now())
    server.close()
  }, { once: true })
  return { port: config.port }
}
```

`hub.subscribe((m) => m.type === 'snapshot' && recordMetrics(...))` is an expression statement; write it as a block with `if` to satisfy `no-unused-expressions`. If `max-lines-per-function` flags `startServer`, split the history wiring into `cli/startHistory.ts` exporting `startHistory(historyDb, hub): () => void` (returns its stop function).

`apps/server/src/cli/commands/serveCommand.ts`:

```ts
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CliIo } from '../../types/CliIo'
import { openState } from '../openState'
import { startServer } from '../startServer'

export const serveCommand = async (_args: readonly string[], io: CliIo): Promise<number> => {
  const state = await openState(io.env)
  const controller = new AbortController()
  const webRoot = join(dirname(fileURLToPath(import.meta.url)), 'public')
  const { port } = await startServer(state, { webRoot, signal: controller.signal })
  io.out(`orbit listening on http://127.0.0.1:${port}`)
  await new Promise<void>((resolve) => {
    const stop = () => {
      controller.abort()
      state.close()
      resolve()
    }
    process.once('SIGTERM', stop)
    process.once('SIGINT', stop)
  })
  return 0
}
```

`apps/server/src/cli/commands/tokenCommand.ts`:

```ts
import { createAdminToken } from '../../auth/createAdminToken'
import type { CliIo } from '../../types/CliIo'
import { openState } from '../openState'

export const tokenCommand = async (args: readonly string[], io: CliIo): Promise<number> => {
  if (args[0] !== 'create') {
    io.err('usage: orbit token create')
    return 2
  }
  const state = await openState(io.env)
  const token = createAdminToken(state.authDb, Date.now())
  state.close()
  io.out('New admin token (shown once; any previous token stops working):')
  io.out(token)
  return 0
}
```

`apps/server/src/cli/commands/pairCommand.ts`:

```ts
import qrcode from 'qrcode-terminal'

import { createInvitation } from '../../auth/createInvitation'
import type { CliIo } from '../../types/CliIo'
import { openState } from '../openState'

export const pairCommand = async (_args: readonly string[], io: CliIo): Promise<number> => {
  const state = await openState(io.env)
  const host = state.config.allowedHosts[0]
  if (host === undefined) {
    state.close()
    io.err('orbit pair needs a tailnet name in orbit.json allowedHosts')
    return 1
  }
  const invitation = createInvitation(state.authDb, Date.now())
  state.close()
  const url = `https://${host}/pair#${invitation.id}.${invitation.secret}`
  qrcode.generate(url, { small: true }, (code) => io.out(code))
  io.out(url)
  io.out('Valid for 5 minutes, once.')
  return 0
}
```

`apps/server/src/cli/commands/sessionsCommand.ts`:

```ts
import { listSessions } from '../../auth/listSessions'
import { revokeSessions } from '../../auth/revokeSessions'
import type { CliIo } from '../../types/CliIo'
import { openState } from '../openState'

export const sessionsCommand = async (args: readonly string[], io: CliIo): Promise<number> => {
  const state = await openState(io.env)
  try {
    if (args[0] === 'list') {
      io.out('prefix    created                   last seen')
      for (const s of listSessions(state.authDb)) {
        io.out(`${s.prefix}  ${new Date(s.created).toISOString()}  ${new Date(s.lastSeen).toISOString()}`)
      }
      return 0
    }
    if (args[0] === 'revoke' && args[1] !== undefined) {
      io.out(`revoked ${revokeSessions(state.authDb, args[1])}`)
      return 0
    }
    io.err('usage: orbit sessions list | orbit sessions revoke <prefix>')
    return 2
  } finally {
    state.close()
  }
}
```

The `list` test reads the prefix from the last line, so with one session the header line is not the last line.

Doctor checks, one file each under `apps/server/src/cli/checks/`:

```ts
// checkInstance.ts
import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkInstance: DoctorCheck = async (state) => ({
  name: 'instance',
  level: 'ok',
  detail: `SYNTOPICA_DATA=${state.dataDir}, orbit.json valid`,
})
```

```ts
// checkAdminToken.ts
import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkAdminToken: DoctorCheck = async (state) => {
  const row = state.authDb.prepare('SELECT 1 AS present FROM admin_token').get()
  return row === undefined
    ? { name: 'admin token', level: 'fail', detail: 'run: orbit token create' }
    : { name: 'admin token', level: 'ok', detail: 'present' }
}
```

```ts
// checkPort.ts
import { createServer } from 'node:net'

import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkPort: DoctorCheck = (state) =>
  new Promise((resolve) => {
    const probe = createServer()
    probe.once('error', () =>
      resolve({ name: 'port', level: 'warn', detail: `${state.config.port} in use (orbit already running?)` }),
    )
    probe.listen(state.config.port, '127.0.0.1', () => {
      probe.close()
      resolve({ name: 'port', level: 'ok', detail: `${state.config.port} free` })
    })
  })
```

```ts
// checkTailnet.ts
import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkTailnet: DoctorCheck = async (state) => {
  const { allowedHosts, allowedLogins } = state.config
  if (allowedHosts.length === 0) return { name: 'tailnet', level: 'warn', detail: 'no allowedHosts: local access only' }
  if (allowedLogins.length === 0) {
    return { name: 'tailnet', level: 'fail', detail: 'allowedHosts set but allowedLogins empty: every tailnet request is refused' }
  }
  return { name: 'tailnet', level: 'ok', detail: `${allowedHosts.length} host(s), ${allowedLogins.length} login(s)` }
}
```

```ts
// checkLaunchdLabels.ts
import { access } from 'node:fs/promises'

import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkLaunchdLabels: DoctorCheck = async (state) => {
  const labels = state.config.launchd?.labels ?? []
  const missing: string[] = []
  for (const entry of labels) {
    await access(entry.plist).catch(() => missing.push(entry.label))
  }
  if (missing.length > 0) return { name: 'launchd', level: 'fail', detail: `plist missing for ${missing.join(', ')}` }
  return { name: 'launchd', level: 'ok', detail: `${labels.length} label(s) registered` }
}
```

```ts
// checkWorkerToken.ts
import { access, constants } from 'node:fs/promises'

import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkWorkerToken: DoctorCheck = async (state) => {
  const worker = state.config.worker
  if (worker === undefined) return { name: 'worker', level: 'ok', detail: 'not configured' }
  const readable = await access(worker.tokenFile, constants.R_OK).then(() => true, () => false)
  return readable
    ? { name: 'worker', level: 'ok', detail: 'token file readable' }
    : { name: 'worker', level: 'fail', detail: 'token file not readable' }
}
```

```ts
// checkLaunchdLoaded.ts — every registered label exists in launchd (spec 10)
import { buildChildEnv } from '../../process/buildChildEnv'
import { runProcess } from '../../process/runProcess'
import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkLaunchdLoaded: DoctorCheck = async (state) => {
  const launchd = state.config.launchd
  if (launchd === undefined) return { name: 'launchd labels', level: 'ok', detail: 'none registered' }
  const uid = process.getuid?.() ?? 0
  const missing: string[] = []
  for (const entry of launchd.labels) {
    const result = await runProcess({
      file: launchd.launchctl,
      args: ['print', `gui/${uid}/${entry.label}`],
      env: buildChildEnv(process.env, {}),
      timeoutMs: 5000,
      maxBytes: 1_048_576,
    }).catch(() => null)
    if (result === null || result.code !== 0) missing.push(entry.label)
  }
  return missing.length === 0
    ? { name: 'launchd labels', level: 'ok', detail: `${launchd.labels.length} loaded` }
    : { name: 'launchd labels', level: 'fail', detail: `not loaded: ${missing.join(', ')}` }
}
```

```ts
// checkTailscaleServe.ts — the name Tailscale Serve publishes is allowed and proxies to this port (spec 10)
import { z } from 'zod'

import { buildChildEnv } from '../../process/buildChildEnv'
import { runProcess } from '../../process/runProcess'
import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkTailscaleServe: DoctorCheck = async (state) => {
  const { allowedHosts, port } = state.config
  if (allowedHosts.length === 0) return { name: 'tailscale serve', level: 'ok', detail: 'not published (no allowedHosts)' }
  const result = await runProcess({
    file: 'tailscale',
    args: ['serve', 'status', '--json'],
    env: buildChildEnv(process.env, {}),
    timeoutMs: 5000,
    maxBytes: 1_048_576,
  }).catch(() => null)
  if (result === null || result.code !== 0) return { name: 'tailscale serve', level: 'warn', detail: 'tailscale CLI unavailable' }
  let raw: unknown = null
  try {
    raw = JSON.parse(result.stdout)
  } catch {
    raw = null
  }
  const status = z
    .object({
      Web: z.record(z.string(), z.object({ Handlers: z.record(z.string(), z.object({ Proxy: z.string().optional() })) })).optional(),
      AllowFunnel: z.record(z.string(), z.boolean()).optional(),
    })
    .safeParse(raw)
  const data = status.success ? status.data : {}
  const served = Object.entries(data.Web ?? {}).filter(([, web]) => web.Handlers['/']?.Proxy?.endsWith(`127.0.0.1:${port}`) === true)
  const funnelled = served.filter(([hostPort]) => data.AllowFunnel?.[hostPort] === true).map(([hostPort]) => hostPort)
  if (funnelled.length > 0) return { name: 'tailscale serve', level: 'fail', detail: `Funnel exposes orbit publicly: ${funnelled.join(', ')}` }
  const published = served.map(([hostPort]) => hostPort.replace(/:443$/, ''))
  if (published.length === 0) return { name: 'tailscale serve', level: 'fail', detail: `no root handler proxies to 127.0.0.1:${port}` }
  const unlisted = published.filter((host) => !allowedHosts.includes(host))
  return unlisted.length === 0
    ? { name: 'tailscale serve', level: 'ok', detail: `published as ${published.join(', ')}` }
    : { name: 'tailscale serve', level: 'fail', detail: `published name not in allowedHosts: ${unlisted.join(', ')}` }
}
```

Only the `/` handler counts (a host that proxies only `/other` to orbit does not serve it), and Funnel on that host is a failure: spec 4 keeps orbit off the public internet. `checkTailscaleServe` will exceed the function-length and complexity limits as written; extract the parse step as `readServeStatus(stdout: string): ServeStatus` in `apps/server/src/cli/checks/readServeStatus.ts` (type `ServeStatus` in `types/`). Test it with two status documents: one serving `/` to the port (ok), one with `AllowFunnel` true for that host (fail), and one proxying only `/other` (fail).

`apps/server/src/cli/checks/doctorChecks.ts`:

```ts
import type { DoctorCheck } from '../../types/DoctorCheck'
import { checkAdminToken } from './checkAdminToken'
import { checkInstance } from './checkInstance'
import { checkLaunchdLabels } from './checkLaunchdLabels'
import { checkLaunchdLoaded } from './checkLaunchdLoaded'
import { checkPort } from './checkPort'
import { checkTailnet } from './checkTailnet'
import { checkTailscaleServe } from './checkTailscaleServe'
import { checkWorkerToken } from './checkWorkerToken'

export const DOCTOR_CHECKS: readonly DoctorCheck[] = [
  checkInstance,
  checkAdminToken,
  checkPort,
  checkTailnet,
  checkLaunchdLabels,
  checkLaunchdLoaded,
  checkTailscaleServe,
  checkWorkerToken,
]
```

`apps/server/src/cli/commands/doctorCommand.ts`:

```ts
import type { CliIo } from '../../types/CliIo'
import { DOCTOR_CHECKS } from '../checks/doctorChecks'
import { openState } from '../openState'

export const doctorCommand = async (_args: readonly string[], io: CliIo): Promise<number> => {
  const state = await openState(io.env).catch((error: unknown) => {
    io.out(`fail  instance  ${error instanceof Error ? error.message : 'unreadable'}`)
    return null
  })
  if (state === null) return 1
  let failed = false
  for (const check of DOCTOR_CHECKS) {
    const result = await check(state)
    failed ||= result.level === 'fail'
    io.out(`${result.level.padEnd(4)}  ${result.name}  ${result.detail}`)
  }
  state.close()
  return failed ? 1 : 0
}
```

`apps/server/src/cli/runCli.ts`:

```ts
import type { CliIo } from '../types/CliIo'
import { doctorCommand } from './commands/doctorCommand'
import { pairCommand } from './commands/pairCommand'
import { serveCommand } from './commands/serveCommand'
import { sessionsCommand } from './commands/sessionsCommand'
import { tokenCommand } from './commands/tokenCommand'

export const runCli = async (argv: readonly string[], io: CliIo): Promise<number> => {
  const commands: Record<string, (args: readonly string[], io: CliIo) => Promise<number>> = {
    serve: serveCommand,
    token: tokenCommand,
    pair: pairCommand,
    sessions: sessionsCommand,
    doctor: doctorCommand,
  }
  const command = commands[argv[0] ?? '']
  if (command === undefined) {
    io.err('usage: orbit serve | token create | pair | sessions list|revoke <prefix> | doctor')
    return 2
  }
  return command(argv.slice(1), io)
}
```

`apps/server/src/cli/main.ts`:

```ts
import { runCli } from './runCli'

process.exitCode = await runCli(process.argv.slice(2), {
  out: (line) => process.stdout.write(`${line}\n`),
  err: (line) => process.stderr.write(`${line}\n`),
  env: process.env,
})
```

Exclude `src/cli/main.ts` from coverage in `apps/server/vitest.config.ts` (it is the entry point, exercised by e2e), matching how the web template excludes `src/main.tsx`.

- [ ] **Step 4: Run tests and gate** — PASS. Then build and smoke-test the bundle:

```bash
pnpm --filter @orbit/server build
SYNTOPICA_DATA=$(mktemp -d) sh -c 'echo "{\"schemaVersion\":1}" > $SYNTOPICA_DATA/syntopica.config.json && node apps/server/dist/orbit.mjs doctor'
```

Expected: `fail  admin token  run: orbit token create` and exit code 1.

- [ ] **Step 5: Commit and push**

```bash
git add apps/server
git commit -m "feat(server): orbit CLI with serve, token, pair, sessions and doctor"
pnpm gate && git push
```

---

### Task 18: LaunchAgent template and operator docs

**Files:**
- Create: `launchd/com.syntopica.orbit.plist.template`
- Create: `apps/server/src/launchd/renderPlistTemplate.ts`, test `apps/server/src/launchd/renderPlistTemplate.test.ts`
- Modify: `README.md`

**Interfaces:**
- Produces: `renderPlistTemplate(template: string, values: { node: string; orbit: string; data: string }): string`.

`Umask` 63 is octal `077`: launchd opens `orbit.log` before orbit runs, so the plist, not orbit's own `umask`, is what makes the log `0600`.

- [ ] **Step 1: Write the failing test**

`apps/server/src/launchd/renderPlistTemplate.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { runProcess } from '../process/runProcess'
import { renderPlistTemplate } from './renderPlistTemplate'

describe('renderPlistTemplate', () => {
  it('produces a plist that plutil accepts', async () => {
    const template = readFileSync(join(import.meta.dirname, '../../../../launchd/com.syntopica.orbit.plist.template'), 'utf8')
    const rendered = renderPlistTemplate(template, { node: '/usr/local/bin/node', orbit: '/opt/orbit/orbit.mjs', data: '/srv/instance' })
    expect(rendered).not.toContain('__')
    expect(rendered).toContain('<key>Umask</key>\n  <integer>63</integer>')
    const path = join(await mkdtemp(join(tmpdir(), 'orbit-plist-')), 'orbit.plist')
    await writeFile(path, rendered)
    const lint = await runProcess({ file: '/usr/bin/plutil', args: ['-lint', path], env: {}, timeoutMs: 5000, maxBytes: 4096 })
    expect(lint.code).toBe(0)
  })
})
```

- [ ] **Step 2: Run it to see it fail** — FAIL.

- [ ] **Step 3: Implement**

`launchd/com.syntopica.orbit.plist.template`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.syntopica.orbit</string>
  <key>ProgramArguments</key>
  <array>
    <string>__NODE__</string>
    <string>__ORBIT__</string>
    <string>serve</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>SYNTOPICA_DATA</key>
    <string>__DATA__</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>Umask</key>
  <integer>63</integer>
  <key>StandardOutPath</key>
  <string>__DATA__/orbit/orbit.log</string>
  <key>StandardErrorPath</key>
  <string>__DATA__/orbit/orbit.log</string>
</dict>
</plist>
```

`apps/server/src/launchd/renderPlistTemplate.ts`:

```ts
export const renderPlistTemplate = (
  template: string,
  values: { readonly node: string; readonly orbit: string; readonly data: string },
): string =>
  template.replaceAll('__NODE__', values.node).replaceAll('__ORBIT__', values.orbit).replaceAll('__DATA__', values.data)
```

`renderPlistTemplate` is used by the README's install snippet through a one-line `node -e` call; knip must see it as used, so also call it from the `serve --print-plist` path: add to `serveCommand` an early branch `if (args[0] === '--print-plist')` that reads the template next to the bundle (`join(dirname(fileURLToPath(import.meta.url)), '../../../launchd/com.syntopica.orbit.plist.template')`), renders it with `process.execPath`, the bundle path and `SYNTOPICA_DATA`, prints it and returns 0. Add a test case for that branch in `serveCommand.test.ts`.

- [ ] **Step 4: README operator section**

Replace `README.md` "Status" paragraph with:

````markdown
## Run it

```bash
pnpm install && pnpm build
export SYNTOPICA_DATA=/path/to/instance
node apps/server/dist/orbit.mjs token create      # prints the admin token once
node apps/server/dist/orbit.mjs doctor
node apps/server/dist/orbit.mjs serve --print-plist > ~/Library/LaunchAgents/com.syntopica.orbit.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.syntopica.orbit.plist
```

Remote access goes through Tailscale Serve only; orbit itself never leaves loopback:

```bash
tailscale serve --bg --https=443 http://127.0.0.1:8790
```

Add the machine's tailnet name to `allowedHosts` and your tailnet login to `allowedLogins` in `$SYNTOPICA_DATA/orbit/orbit.json`, then pair a phone with `orbit pair` and scan the QR code.

`orbit.json` example (placeholders):

```json
{
  "port": 8790,
  "allowedHosts": ["machine.example.ts.net"],
  "allowedLogins": ["you@example.com"],
  "worker": { "url": "http://127.0.0.1:8765", "tokenFile": "/path/to/instance/worker/state/tokens/admin.token" },
  "launchd": {
    "labels": [
      { "component": "worker", "label": "com.example.worker.serve", "role": "keepalive", "plist": "/Users/you/Library/LaunchAgents/com.example.worker.serve.plist" }
    ]
  }
}
```
````

- [ ] **Step 5: Verify Tailscale Serve's Host header**

On the owner's machine, with orbit running and `tailscale serve` configured, run `curl -sI https://<tailnet-name>/` from another tailnet device and check orbit accepts it (200, not 421). If Serve forwards `Host: 127.0.0.1:<port>` instead of the tailnet name, the allowlist still passes and `Origin` carries the tailnet name; record which in `docs/measurements/2026-10-02-tailscale-serve.md`. Do not commit the real tailnet name: write it as `<tailnet-name>`.

- [ ] **Step 6: Gate, commit, push**

```bash
pnpm gate
git add launchd apps/server README.md docs/measurements
git commit -m "feat: LaunchAgent template and operator documentation"
git push
```

---
### Task 19: Web foundation, login and pairing

The web rules that bite in every web task (codeality `view-logic-separation`, on in the template): a `.tsx` view may not call `useState`, `useEffect`, `useReducer`, `useMemo`, `useCallback`, `useRef`, `useQuery`, `useMutation` or declare a named function inside the component. State and handlers live in a `use*` hook under `src/hooks/`, which the view calls. Inline arrows directly in JSX attributes (`onChange={(e) => model.setToken(e.target.value)}`) and in `.map(...)` are allowed. Contexts live in `src/contexts/`. Props types live in `src/types/`.

**Files:**
- Modify: `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/index.html`, `apps/web/.size-limit.json`, `apps/web/src/styles.css`, `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/App.test.tsx`, `apps/web/src/test/setup.ts`
- Create: `apps/web/src/api/ApiError.ts`, `api/apiFetch.ts`, `api/apiJson.ts`
- Create: `apps/web/src/validators/validatePairFragment.ts`
- Create: `apps/web/src/hooks/useLogin.ts`, `hooks/usePair.ts`
- Create: `apps/web/src/screens/login/LoginScreen.tsx`, `screens/pair/PairScreen.tsx`
- Create: `apps/web/src/router/rootRoute.ts`, `router/loginRoute.ts`, `router/pairRoute.ts`, `router/routeTree.ts`, `router/router.ts`
- Create: `apps/web/src/types/LoginStatus.ts`, `LoginModel.ts`, `PairStatus.ts`, `PairFragment.ts`, `router-register.d.ts`
- Create: `apps/web/src/test/renderAt.tsx`
- Test: `apps/web/src/api/apiFetch.test.ts`, `apiJson.test.ts`, `validators/validatePairFragment.test.ts`, `screens/login/LoginScreen.test.tsx`, `screens/pair/PairScreen.test.tsx`

**Interfaces:**
- Produces:
  - `apiFetch(path: string, init?: RequestInit): Promise<Response>` — same-origin credentials; adds `X-Orbit: 1` and `Content-Type: application/json` to every non-GET request.
  - `apiJson<T>(path: string, schema: z.ZodType<T>): Promise<T>` — GET, throws `ApiError(status)` when not ok, parses with `schema`.
  - `ApiError extends Error { readonly status: number }`
  - `validatePairFragment(hash: string): PairFragment | null`, `PairFragment = { id: string; secret: string }`
  - `routeTree`, `router` (TanStack Router, code-based routes), `renderAt(path): Promise<RenderResult & { router }>` for tests.
- Later tasks add routes by replacing `router/routeTree.ts` (full file shown each time).

- [ ] **Step 1: Dependencies and build wiring**

```bash
cd apps/web
pnpm add @tanstack/react-router@^1.170.0 @tanstack/react-query@^5.104.0 motion@^13.5.0 cmdk@^1.1.1 @fontsource/geist-sans@^5.3.0 @fontsource/geist-mono@^5.3.0
cd ../..
```

`apps/web/vite.config.ts` (the build lands next to the server bundle; the dev proxy rewrites `Origin` because the server only accepts its own origin):

```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: { outDir: '../server/dist/public', emptyOutDir: true },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8790',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (request) => request.setHeader('Origin', 'http://127.0.0.1:8790'))
        },
      },
    },
  },
})
```

`apps/web/.size-limit.json`:

```json
[
  { "name": "initial route (brotli)", "path": "../server/dist/public/assets/index-*.js", "limit": "150 KB" }
]
```

Root `package.json` `build` script must build the web app before the server, since the server bundle serves `dist/public`: `"build": "pnpm --filter @orbit/web exec vite build && pnpm --filter @orbit/server build"`. Add `apps/server/dist` to `.gitignore` and `.prettierignore` if the template did not.

`apps/web/index.html` `<head>` gains `<meta name="theme-color" content="#05070d" />`, `<meta name="color-scheme" content="dark light" />` and `<title>orbit</title>`.

- [ ] **Step 2: Theme**

`apps/web/src/styles.css`:

```css
@import 'tailwindcss';
@import '@fontsource/geist-sans/400.css';
@import '@fontsource/geist-sans/600.css';
@import '@fontsource/geist-mono/400.css';

@theme {
  --font-sans: 'Geist Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;
  --color-space: #05070d;
  --color-panel: #0c111c;
  --color-line: #1c2536;
  --color-ink: #e6edf7;
  --color-muted: #8391a7;
  --color-accent: #6ee7ff;
  --color-ok: #34d399;
  --color-warn: #fbbf24;
  --color-down: #f87171;
  --color-unknown: #475569;
}

@media (prefers-color-scheme: light) {
  :root {
    --color-space: #f5f7fb;
    --color-panel: #ffffff;
    --color-line: #d8dee9;
    --color-ink: #0b1220;
    --color-muted: #4b5568;
    --color-accent: #0e7490;
    --color-ok: #047857;
    --color-warn: #b45309;
    --color-down: #b91c1c;
    --color-unknown: #64748b;
  }
}

html,
body {
  background: var(--color-space);
  color: var(--color-ink);
  font-family: var(--font-sans);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation: none !important;
    transition: none !important;
  }
}
```

Light-theme colours are the darker shades so text and status colours keep 4.5:1 contrast on white; Task 24's axe run checks contrast in both schemes.

- [ ] **Step 3: Write the failing tests**

`apps/web/src/test/setup.ts` (append to the template's):

```ts
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
```

`apps/web/src/test/renderAt.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { routeTree } from '../router/routeTree'

export const renderAt = async (path: string) => {
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const view = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await router.load()
  return { ...view, router }
}
```

`apps/web/src/api/apiFetch.test.ts`:

```ts
import { apiFetch } from './apiFetch'

describe('apiFetch', () => {
  it('marks mutations with the CSRF header and leaves GETs plain', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    await apiFetch('/api/logout', { method: 'POST' })
    await apiFetch('/api/snapshots')
    const [post, get] = fetchMock.mock.calls as unknown as [string, RequestInit][]
    expect(new Headers(post[1].headers).get('X-Orbit')).toBe('1')
    expect(new Headers(get[1].headers).get('X-Orbit')).toBeNull()
    expect(post[1].credentials).toBe('same-origin')
  })
})
```

`apps/web/src/api/apiJson.test.ts`:

```ts
import { z } from 'zod'

import { ApiError } from './ApiError'
import { apiJson } from './apiJson'

describe('apiJson', () => {
  it('parses a body with the schema', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ n: 1 })))
    expect(await apiJson('/api/x', z.object({ n: z.number() }))).toEqual({ n: 1 })
  })
  it('throws ApiError with the status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })))
    await expect(apiJson('/api/x', z.object({}))).rejects.toEqual(new ApiError(401))
  })
})
```

`apps/web/src/validators/validatePairFragment.test.ts`:

```ts
import { validatePairFragment } from './validatePairFragment'

describe('validatePairFragment', () => {
  it('splits a well-formed fragment', () => {
    expect(validatePairFragment('abcdefghijk.0123456789abcdefghijkl')).toEqual({
      id: 'abcdefghijk',
      secret: '0123456789abcdefghijkl',
    })
  })
  it.each(['', 'short.x', 'abcdefghijk', 'abcdefghijk.0123456789abcdefghijkl.extra', 'abcdefghij!.0123456789abcdefghijkl'])(
    'rejects %j',
    (hash) => expect(validatePairFragment(hash)).toBeNull(),
  )
})
```

`apps/web/src/screens/login/LoginScreen.test.tsx`:

```tsx
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { renderAt } from '../../test/renderAt'

describe('LoginScreen', () => {
  it('opens a session and leaves the login page', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })))
    const { router } = await renderAt('/login')
    fireEvent.change(screen.getByLabelText('Admin token'), { target: { value: 'secret-token' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
  it('says the token was rejected', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })))
    await renderAt('/login')
    fireEvent.change(screen.getByLabelText('Admin token'), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Token rejected')
  })
})
```

`apps/web/src/screens/pair/PairScreen.test.tsx`:

```tsx
import { screen, waitFor } from '@testing-library/react'

import { renderAt } from '../../test/renderAt'

describe('PairScreen', () => {
  it('strips the fragment from the URL and redeems the invitation', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { router } = await renderAt('/pair#abcdefghijk.0123456789abcdefghijkl')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(router.history.location.href).not.toContain('abcdefghijk')
  })
  it('reports a malformed link without calling the server', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await renderAt('/pair#nope')
    expect(await screen.findByRole('alert')).toHaveTextContent('This pairing link is not valid')
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('reports a used or expired invitation', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })))
    await renderAt('/pair#abcdefghijk.0123456789abcdefghijkl')
    expect(await screen.findByRole('alert')).toHaveTextContent('expired or already used')
  })
})
```

Replace `apps/web/src/App.test.tsx` so the template's axe check runs against the real login screen:

```tsx
import { axe } from 'vitest-axe'

import { renderAt } from './test/renderAt'

describe('App', () => {
  it('login screen has no accessibility violations', async () => {
    const { container } = await renderAt('/login')
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toHaveLength(0)
  })
})
```

(jsdom cannot compute colours; contrast is checked in Task 24 with a real browser.)

- [ ] **Step 4: Run them to see them fail** — `pnpm --filter @orbit/web test` → FAIL.

- [ ] **Step 5: Implement**

`apps/web/src/api/ApiError.ts`:

```ts
export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}
```

`apps/web/src/api/apiFetch.ts`:

```ts
export const apiFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(init.headers)
  const method = (init.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('X-Orbit', '1')
    headers.set('Content-Type', 'application/json')
  }
  return fetch(path, { ...init, method, headers, credentials: 'same-origin' })
}
```

`apps/web/src/api/apiJson.ts`:

```ts
import type { z } from 'zod'

import { ApiError } from './ApiError'
import { apiFetch } from './apiFetch'

export const apiJson = async <T>(path: string, schema: z.ZodType<T>): Promise<T> => {
  const response = await apiFetch(path)
  if (!response.ok) throw new ApiError(response.status)
  return schema.parse(await response.json())
}
```

`apps/web/src/types/PairFragment.ts`:

```ts
export type PairFragment = { readonly id: string; readonly secret: string }
```

`apps/web/src/types/LoginStatus.ts`:

```ts
export type LoginStatus = 'idle' | 'busy' | 'rejected' | 'error'
```

`apps/web/src/types/LoginModel.ts`:

```ts
import type { FormEvent } from 'react'

import type { LoginStatus } from './LoginStatus'

export type LoginModel = {
  readonly token: string
  readonly status: LoginStatus
  readonly setToken: (token: string) => void
  readonly submit: (event: FormEvent<HTMLFormElement>) => void
}
```

`apps/web/src/types/PairStatus.ts`:

```ts
export type PairStatus = 'busy' | 'invalid' | 'rejected' | 'error'
```

`apps/web/src/validators/validatePairFragment.ts`:

```ts
import type { PairFragment } from '../types/PairFragment'

export const validatePairFragment = (hash: string): PairFragment | null => {
  const match = /^([\w-]{11})\.([\w-]{22})$/.exec(hash.replace(/^#/, ''))
  const id = match?.[1]
  const secret = match?.[2]
  return id === undefined || secret === undefined ? null : { id, secret }
}
```

`apps/web/src/hooks/useLogin.ts`:

```ts
import { useNavigate } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'

import { apiFetch } from '../api/apiFetch'
import type { LoginModel } from '../types/LoginModel'
import type { LoginStatus } from '../types/LoginStatus'

export const useLogin = (): LoginModel => {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<LoginStatus>('idle')
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setStatus('busy')
    apiFetch('/api/session', { method: 'POST', body: JSON.stringify({ token }) }).then(
      async (response) => {
        if (response.ok) await navigate({ to: '/' })
        else setStatus('rejected')
      },
      () => setStatus('error'),
    )
  }
  return { token, status, setToken, submit }
}
```

`apps/web/src/hooks/usePair.ts` (the ref guards React StrictMode's double effect, which would otherwise spend the one-time invitation twice):

```ts
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { apiFetch } from '../api/apiFetch'
import type { PairStatus } from '../types/PairStatus'
import { validatePairFragment } from '../validators/validatePairFragment'

export const usePair = (): PairStatus => {
  const hash = useLocation({ select: (location) => location.hash })
  const navigate = useNavigate()
  const [status, setStatus] = useState<PairStatus>('busy')
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const fragment = validatePairFragment(hash)
    void navigate({ to: '/pair', hash: '', replace: true })
    if (fragment === null) {
      setStatus('invalid')
      return
    }
    apiFetch('/api/pair', { method: 'POST', body: JSON.stringify(fragment) }).then(
      async (response) => {
        if (response.ok) await navigate({ to: '/' })
        else setStatus('rejected')
      },
      () => setStatus('error'),
    )
  }, [hash, navigate])
  return status
}
```

`apps/web/src/screens/login/LoginScreen.tsx`:

```tsx
import { useLogin } from '../../hooks/useLogin'

export const LoginScreen = () => {
  const model = useLogin()
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form onSubmit={model.submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-panel p-6">
        <h1 className="text-xl font-semibold tracking-tight">orbit</h1>
        <label className="block space-y-1 text-sm text-muted">
          <span>Admin token</span>
          <input
            type="password"
            autoComplete="current-password"
            value={model.token}
            onChange={(event) => model.setToken(event.target.value)}
            className="w-full rounded-lg border border-line bg-space px-3 py-2 font-mono text-ink"
          />
        </label>
        {model.status === 'rejected' && <p role="alert" className="text-sm text-down">Token rejected</p>}
        {model.status === 'error' && <p role="alert" className="text-sm text-down">Server unreachable</p>}
        <button
          type="submit"
          disabled={model.status === 'busy' || model.token === ''}
          className="w-full rounded-lg bg-accent px-3 py-2 font-semibold text-space disabled:opacity-50"
        >
          Sign in
        </button>
      </form>
    </main>
  )
}
```

`apps/web/src/screens/pair/PairScreen.tsx`:

```tsx
import { usePair } from '../../hooks/usePair'

export const PairScreen = () => {
  const status = usePair()
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      {status === 'busy' && <p aria-live="polite">Pairing this device…</p>}
      {status === 'invalid' && <p role="alert">This pairing link is not valid. Run orbit pair again.</p>}
      {status === 'rejected' && <p role="alert">This pairing link has expired or already used. Run orbit pair again.</p>}
      {status === 'error' && <p role="alert">Server unreachable.</p>}
    </main>
  )
}
```

`apps/web/src/router/rootRoute.ts`:

```ts
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const rootRoute = createRootRoute({ component: Outlet })
```

`apps/web/src/router/loginRoute.ts`:

```ts
import { createRoute } from '@tanstack/react-router'

import { LoginScreen } from '../screens/login/LoginScreen'
import { rootRoute } from './rootRoute'

export const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginScreen })
```

`apps/web/src/router/pairRoute.ts`:

```ts
import { createRoute } from '@tanstack/react-router'

import { PairScreen } from '../screens/pair/PairScreen'
import { rootRoute } from './rootRoute'

export const pairRoute = createRoute({ getParentRoute: () => rootRoute, path: '/pair', component: PairScreen })
```

`apps/web/src/router/routeTree.ts`:

```ts
import { loginRoute } from './loginRoute'
import { pairRoute } from './pairRoute'
import { rootRoute } from './rootRoute'

export const routeTree = rootRoute.addChildren([loginRoute, pairRoute])
```

`apps/web/src/router/router.ts`:

```ts
import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree'

export const router = createRouter({ routeTree, defaultPreload: false })
```

`apps/web/src/types/router-register.d.ts`:

```ts
import type { router } from '../router/router'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

`apps/web/src/App.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { MotionConfig } from 'motion/react'

import { router } from './router/router'

const client = new QueryClient({ defaultOptions: { queries: { staleTime: 5_000, retry: 1 } } })

export const App = () => (
  <MotionConfig reducedMotion="user">
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </MotionConfig>
)
```

If `no-hidden-top-level-declarations` flags `client`, move it to `apps/web/src/api/queryClient.ts` (`export const queryClient = new QueryClient(...)`) and import it.

`apps/web/src/main.tsx` keeps the template body; it imports `./styles.css` and renders `<App />` inside `<StrictMode>`. Remove `env.ts`/`env.test.ts` if knip reports them unused.

- [ ] **Step 6: Run tests and the package gate** — `pnpm --filter @orbit/web gate:pkg` → PASS (tests, lint, knip, size under 150 KB).

- [ ] **Step 7: Commit and push**

```bash
git add apps/web package.json .gitignore .prettierignore
git commit -m "feat(web): theme, API client, login and pairing screens"
pnpm gate && git push
```

---

### Task 20: Live stream state

**Files:**
- Create: `apps/web/src/stream/initialStreamState.ts`, `stream/applyStreamMessage.ts`, `stream/parseStreamData.ts`, `stream/createWatchdog.ts`, `stream/connectStream.ts`, `stream/StreamProvider.tsx`
- Create: `apps/web/src/api/probeSession.ts`
- Create: `apps/web/src/contexts/StreamContext.ts`
- Create: `apps/web/src/hooks/useStreamConnection.ts`, `hooks/useStream.ts`
- Create: `apps/web/src/types/StreamState.ts`, `StreamStatus.ts`, `StreamValue.ts`, `StreamHandlers.ts`, `Watchdog.ts`, `ChildrenProps.ts`
- Create: `apps/web/src/test/FakeEventSource.ts`
- Test: `apps/web/src/stream/applyStreamMessage.test.ts`, `parseStreamData.test.ts`, `createWatchdog.test.ts`, `connectStream.test.ts`, `apps/web/src/hooks/useStream.test.tsx`

**Interfaces:**
- Consumes: `StreamMessage`, `streamMessageSchema`, `Snapshot`, `OrbitEvent`, `ComponentId` from `@orbit/contract`; `apiFetch`.
- Produces:
  - `StreamState = { snapshots: Partial<Record<ComponentId, Snapshot>>; events: OrbitEvent[]; lastId: number | null; synced: boolean }`
  - `StreamStatus = 'connecting' | 'live' | 'stale' | 'offline' | 'unauthorized'`
  - `StreamValue = StreamState & { status: StreamStatus }`
  - `applyStreamMessage(state, message): StreamState` — `resync` empties snapshots and events; `snapshot` replaces that component; `event` prepends, keeping 50; `sync` sets `synced`; every message sets `lastId`.
  - `connectStream(handlers: StreamHandlers, retryMs?: number): () => void`
  - `<StreamProvider>`; `useStream(): StreamValue` (throws outside the provider)

Connection rules: the browser's `EventSource` reconnects by itself and sends `Last-Event-ID`; while it does, status is `offline`. When it gives up (`readyState === CLOSED`, which happens on any non-200 such as 401), `probeSession` asks `GET /api/snapshots`: 401 means `unauthorized` (the provider then routes to `/login`); anything else means `offline` and a new `EventSource` after `retryMs`. No message and no ping for 45 s means `stale` (the server pings every 15 s).

- [ ] **Step 1: Write the failing tests**

`apps/web/src/test/FakeEventSource.ts`:

```ts
export class FakeEventSource {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSED = 2
  static instances: FakeEventSource[] = []
  readonly url: string
  readyState = FakeEventSource.CONNECTING
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent<string>) => void) | null = null
  onerror: (() => void) | null = null
  readonly listeners = new Map<string, () => void>()

  constructor(url: string) {
    this.url = url
    FakeEventSource.instances.push(this)
  }

  addEventListener(type: string, listener: () => void): void {
    this.listeners.set(type, listener)
  }

  close(): void {
    this.readyState = FakeEventSource.CLOSED
  }

  emit(data: unknown): void {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }))
  }
}
```

`apps/web/src/stream/applyStreamMessage.test.ts`:

```ts
import type { Snapshot, StreamMessage } from '@orbit/contract'

import { applyStreamMessage } from './applyStreamMessage'
import { INITIAL_STREAM_STATE } from './initialStreamState'

const snapshot: Snapshot = {
  component: 'worker',
  health: { state: 'ok', reason: null },
  metrics: [],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
}
const event = (n: number): StreamMessage => ({
  type: 'event',
  id: n,
  event: { at: '2026-10-02T10:00:00.000Z', component: 'worker', kind: 'worker.job_failed', severity: 'error', refs: { n } },
})

describe('applyStreamMessage', () => {
  it('stores snapshots by component and marks sync', () => {
    let state = applyStreamMessage(INITIAL_STREAM_STATE, { type: 'snapshot', id: 5, snapshot })
    state = applyStreamMessage(state, { type: 'sync', id: 5 })
    expect(state.snapshots.worker).toEqual(snapshot)
    expect(state).toMatchObject({ lastId: 5, synced: true })
  })
  it('keeps the newest 50 events first', () => {
    let state = INITIAL_STREAM_STATE
    for (let n = 1; n <= 60; n += 1) state = applyStreamMessage(state, event(n))
    expect(state.events).toHaveLength(50)
    expect(state.events[0]?.refs).toEqual({ n: 60 })
  })
  it('forgets everything on resync', () => {
    let state = applyStreamMessage(INITIAL_STREAM_STATE, { type: 'snapshot', id: 1, snapshot })
    state = applyStreamMessage(state, event(2))
    state = applyStreamMessage(state, { type: 'resync', id: 9 })
    expect(state).toEqual({ snapshots: {}, events: [], lastId: 9, synced: false })
  })
})
```

`apps/web/src/stream/parseStreamData.test.ts`:

```ts
import { parseStreamData } from './parseStreamData'

describe('parseStreamData', () => {
  it('accepts a valid message', () => {
    expect(parseStreamData('{"type":"sync","id":3}')).toEqual({ type: 'sync', id: 3 })
  })
  it.each(['not json', '{"type":"sync"}', '{"type":"nope","id":1}'])('rejects %j', (data) => {
    expect(parseStreamData(data)).toBeNull()
  })
})
```

`apps/web/src/stream/createWatchdog.test.ts`:

```ts
import { createWatchdog } from './createWatchdog'

describe('createWatchdog', () => {
  it('fires after silence and not while fed', () => {
    vi.useFakeTimers()
    const fire = vi.fn()
    const dog = createWatchdog(1000, fire)
    vi.advanceTimersByTime(900)
    dog.reset()
    vi.advanceTimersByTime(900)
    expect(fire).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(fire).toHaveBeenCalledTimes(1)
    dog.stop()
    vi.useRealTimers()
  })
})
```

`apps/web/src/stream/connectStream.test.ts`:

```ts
import { FakeEventSource } from '../test/FakeEventSource'
import { connectStream } from './connectStream'

const setup = (probeStatus = 200) => {
  FakeEventSource.instances = []
  vi.stubGlobal('EventSource', FakeEventSource)
  vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: probeStatus })))
  const onMessage = vi.fn()
  const onStatus = vi.fn()
  const stop = connectStream({ onMessage, onStatus }, 10)
  const source = FakeEventSource.instances[0] as FakeEventSource
  return { onMessage, onStatus, stop, source }
}

describe('connectStream', () => {
  it('goes live and forwards valid messages only', () => {
    const { onMessage, onStatus, source, stop } = setup()
    source.onopen?.()
    source.emit({ type: 'sync', id: 1 })
    source.emit({ type: 'bogus' })
    expect(onStatus).toHaveBeenLastCalledWith('live')
    expect(onMessage).toHaveBeenCalledTimes(1)
    stop()
    expect(source.readyState).toBe(FakeEventSource.CLOSED)
  })
  it('reports offline while the browser retries', () => {
    const { onStatus, source, stop } = setup()
    source.onerror?.()
    expect(onStatus).toHaveBeenLastCalledWith('offline')
    stop()
  })
  it('reports unauthorized when the closed stream is a 401', async () => {
    const { onStatus, source, stop } = setup(401)
    source.close()
    source.onerror?.()
    await vi.waitFor(() => expect(onStatus).toHaveBeenLastCalledWith('unauthorized'))
    expect(FakeEventSource.instances).toHaveLength(1)
    stop()
  })
  it('reopens after a closed stream when the session is fine', async () => {
    const { source, stop } = setup(200)
    source.close()
    source.onerror?.()
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(2))
    stop()
  })
  it('turns stale after 45 s of silence', () => {
    vi.useFakeTimers()
    const { onStatus, source, stop } = setup()
    source.onopen?.()
    vi.advanceTimersByTime(30_000)
    source.listeners.get('ping')?.()
    vi.advanceTimersByTime(44_000)
    expect(onStatus).toHaveBeenLastCalledWith('live')
    vi.advanceTimersByTime(2_000)
    expect(onStatus).toHaveBeenLastCalledWith('stale')
    stop()
    vi.useRealTimers()
  })
})
```

`apps/web/src/hooks/useStream.test.tsx`:

```tsx
import { renderHook } from '@testing-library/react'

import { useStream } from './useStream'

describe('useStream', () => {
  it('refuses to run outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderHook(() => useStream())).toThrow('useStream needs <StreamProvider>')
  })
})
```

The provider itself is exercised through the shell in Task 21.

- [ ] **Step 2: Run them to see them fail** — FAIL.

- [ ] **Step 3: Implement**

`apps/web/src/types/StreamState.ts`:

```ts
import type { ComponentId, OrbitEvent, Snapshot } from '@orbit/contract'

export type StreamState = {
  readonly snapshots: Partial<Record<ComponentId, Snapshot>>
  readonly events: readonly OrbitEvent[]
  readonly lastId: number | null
  readonly synced: boolean
}
```

`apps/web/src/types/StreamStatus.ts`:

```ts
export type StreamStatus = 'connecting' | 'live' | 'stale' | 'offline' | 'unauthorized'
```

`apps/web/src/types/StreamValue.ts`:

```ts
import type { StreamState } from './StreamState'
import type { StreamStatus } from './StreamStatus'

export type StreamValue = StreamState & { readonly status: StreamStatus }
```

`apps/web/src/types/StreamHandlers.ts`:

```ts
import type { StreamMessage } from '@orbit/contract'

import type { StreamStatus } from './StreamStatus'

export type StreamHandlers = {
  readonly onMessage: (message: StreamMessage) => void
  readonly onStatus: (status: StreamStatus) => void
}
```

`apps/web/src/types/Watchdog.ts`:

```ts
export type Watchdog = { reset(): void; stop(): void }
```

`apps/web/src/types/ChildrenProps.ts`:

```ts
import type { ReactNode } from 'react'

export type ChildrenProps = { readonly children: ReactNode }
```

`apps/web/src/stream/initialStreamState.ts`:

```ts
import type { StreamState } from '../types/StreamState'

export const INITIAL_STREAM_STATE: StreamState = { snapshots: {}, events: [], lastId: null, synced: false }
```

`apps/web/src/stream/applyStreamMessage.ts`:

```ts
import type { StreamMessage } from '@orbit/contract'

import type { StreamState } from '../types/StreamState'

export const applyStreamMessage = (state: StreamState, message: StreamMessage): StreamState => {
  switch (message.type) {
    case 'resync':
      return { snapshots: {}, events: [], lastId: message.id, synced: false }
    case 'snapshot':
      return {
        ...state,
        lastId: message.id,
        snapshots: { ...state.snapshots, [message.snapshot.component]: message.snapshot },
      }
    case 'event':
      return { ...state, lastId: message.id, events: [message.event, ...state.events].slice(0, 50) }
    case 'sync':
      return { ...state, lastId: message.id, synced: true }
  }
}
```

`apps/web/src/stream/parseStreamData.ts`:

```ts
import { type StreamMessage, streamMessageSchema } from '@orbit/contract'

export const parseStreamData = (data: string): StreamMessage | null => {
  try {
    const parsed = streamMessageSchema.safeParse(JSON.parse(data))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
```

`apps/web/src/stream/createWatchdog.ts`:

```ts
import type { Watchdog } from '../types/Watchdog'

export const createWatchdog = (ms: number, onSilence: () => void): Watchdog => {
  let timer: ReturnType<typeof setTimeout> | undefined
  return {
    reset: () => {
      clearTimeout(timer)
      timer = setTimeout(onSilence, ms)
    },
    stop: () => clearTimeout(timer),
  }
}
```

`apps/web/src/api/probeSession.ts`:

```ts
import { apiFetch } from './apiFetch'

export const probeSession = (): Promise<boolean> =>
  apiFetch('/api/snapshots').then(
    (response) => response.status !== 401,
    () => true,
  )
```

`apps/web/src/stream/connectStream.ts`:

```ts
import { probeSession } from '../api/probeSession'
import type { StreamHandlers } from '../types/StreamHandlers'
import { createWatchdog } from './createWatchdog'
import { parseStreamData } from './parseStreamData'

export const connectStream = (handlers: StreamHandlers, retryMs = 5_000): (() => void) => {
  let source: EventSource | null = null
  let retry: ReturnType<typeof setTimeout> | undefined
  let stopped = false
  const watchdog = createWatchdog(45_000, () => handlers.onStatus('stale'))
  const alive = (): void => {
    watchdog.reset()
    handlers.onStatus('live')
  }
  const open = (): void => {
    const current = new EventSource('/api/stream')
    source = current
    current.onopen = alive
    current.addEventListener('ping', alive)
    current.onmessage = (event: MessageEvent<string>) => {
      alive()
      const message = parseStreamData(event.data)
      if (message !== null) handlers.onMessage(message)
    }
    current.onerror = () => {
      handlers.onStatus('offline')
      if (current.readyState !== EventSource.CLOSED) return
      void probeSession().then((authorized) => {
        if (stopped) return
        if (!authorized) handlers.onStatus('unauthorized')
        else retry = setTimeout(open, retryMs)
      })
    }
  }
  open()
  return () => {
    stopped = true
    clearTimeout(retry)
    watchdog.stop()
    source?.close()
  }
}
```

`apps/web/src/contexts/StreamContext.ts`:

```ts
import { createContext } from 'react'

import type { StreamValue } from '../types/StreamValue'

export const StreamContext = createContext<StreamValue | null>(null)
```

`apps/web/src/hooks/useStreamConnection.ts`:

```ts
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useReducer, useState } from 'react'

import { applyStreamMessage } from '../stream/applyStreamMessage'
import { connectStream } from '../stream/connectStream'
import { INITIAL_STREAM_STATE } from '../stream/initialStreamState'
import type { StreamStatus } from '../types/StreamStatus'
import type { StreamValue } from '../types/StreamValue'

export const useStreamConnection = (): StreamValue => {
  const [state, dispatch] = useReducer(applyStreamMessage, INITIAL_STREAM_STATE)
  const [status, setStatus] = useState<StreamStatus>('connecting')
  const navigate = useNavigate()
  useEffect(() => connectStream({ onMessage: dispatch, onStatus: setStatus }), [])
  useEffect(() => {
    if (status === 'unauthorized') void navigate({ to: '/login' })
  }, [status, navigate])
  return useMemo(() => ({ ...state, status }), [state, status])
}
```

`apps/web/src/hooks/useStream.ts`:

```ts
import { use } from 'react'

import { StreamContext } from '../contexts/StreamContext'
import type { StreamValue } from '../types/StreamValue'

export const useStream = (): StreamValue => {
  const value = use(StreamContext)
  if (value === null) throw new Error('useStream needs <StreamProvider>')
  return value
}
```

`apps/web/src/stream/StreamProvider.tsx`:

```tsx
import { StreamContext } from '../contexts/StreamContext'
import { useStreamConnection } from '../hooks/useStreamConnection'
import type { ChildrenProps } from '../types/ChildrenProps'

export const StreamProvider = ({ children }: ChildrenProps) => {
  const value = useStreamConnection()
  return <StreamContext value={value}>{children}</StreamContext>
}
```

Add `FakeEventSource` as the default `EventSource` in `src/test/setup.ts` (`vi.stubGlobal('EventSource', FakeEventSource)` inside a `beforeEach`, after resetting `FakeEventSource.instances = []`) so every rendered shell in later tests has one; jsdom has none.

- [ ] **Step 4: Run tests and the package gate** — PASS.

- [ ] **Step 5: Commit and push**

```bash
git add apps/web
git commit -m "feat(web): live stream state with replay, staleness and re-login"
pnpm gate && git push
```

---
### Task 21: App shell, connection state, toasts and command palette

**Files:**
- Create: `apps/web/src/labels/componentLabels.ts`, `reasonLabels.ts`, `eventLabels.ts`, `metricLabels.ts`, `pendingLabels.ts`, `connectionLabels.ts`
- Create: `apps/web/src/components/shell/navItems.ts`, `Shell.tsx`, `NavRail.tsx`, `TabBar.tsx`, `ConnectionIndicator.tsx`, `Toasts.tsx`, `CommandPalette.tsx`
- Create: `apps/web/src/selectors/selectNewlyDown.ts`
- Create: `apps/web/src/hooks/useDownToasts.ts`, `hooks/useHotkey.ts`, `hooks/useCommandPalette.ts`
- Create: `apps/web/src/types/NavItem.ts`, `Toast.ts`, `ToastsModel.ts`, `CommandPaletteModel.ts`, `DownTracking.ts`
- Create: `apps/web/src/test/renderShell.tsx`, `test/snapshotOf.ts`
- Test: `apps/web/src/labels/labels.test.ts`, `selectors/selectNewlyDown.test.ts`, `components/shell/Shell.test.tsx`

**Interfaces:**
- Consumes: Task 20 (`StreamProvider`, `useStream`), Task 19 (`apiFetch`).
- Produces:
  - Label maps, each a total `Record` over its contract enum: `COMPONENT_LABELS: Record<ComponentId, string>`, `REASON_LABELS: Record<ReasonCode, string>`, `EVENT_LABELS: Record<OrbitEvent['kind'], string>`, `METRIC_LABELS: Record<Metric['key'], string>`, `PENDING_LABELS: Record<Pending['key'], string>`, `CONNECTION_LABELS: Record<StreamStatus, string>`. All user-facing text comes from these maps; enum ids are never shown raw.
  - `NAV_ITEMS: readonly NavItem[]`, `NavItem = { to: '/' | '/system'; label: string }`
  - `selectNewlyDown(previous, next): ComponentId[]` — components whose health is `down` in `next` and was not `down` in `previous`.
  - `<Shell>` — the layout route component: `StreamProvider`, `NavRail` (768 px and wider), `TabBar` (narrower), `<Outlet>`, `Toasts`, `CommandPalette` (Cmd-K / Ctrl-K).
  - `snapshotOf(component, state, overrides?)` — test factory for `Snapshot`.

Toasts fire only for transitions seen while synced (both the previous and the current state were synced), so the initial load and a resync never flood the screen with "down" toasts for components that were already down. At most 4 toasts show; each leaves after 8 s or on dismiss.

- [ ] **Step 1: Write the failing tests**

`apps/web/src/test/snapshotOf.ts`:

```ts
import type { ComponentId, Snapshot } from '@orbit/contract'

export const snapshotOf = (
  component: ComponentId,
  state: 'ok' | 'warn' | 'down',
  overrides: Partial<Snapshot> = {},
): Snapshot => ({
  component,
  health: { state, reason: state === 'down' ? 'unreachable' : null },
  metrics: [],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
  ...overrides,
})
```

`apps/web/src/test/renderShell.tsx` (a test-only route tree: the shell with two stub pages, so the shell is tested before the real screens exist):

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { Shell } from '../components/shell/Shell'

export const renderShell = async (path = '/') => {
  const root = createRootRoute({ component: Shell })
  const home = createRoute({ getParentRoute: () => root, path: '/', component: () => <h1>home page</h1> })
  const system = createRoute({ getParentRoute: () => root, path: '/system', component: () => <h1>system page</h1> })
  const login = createRoute({ getParentRoute: () => root, path: '/login', component: () => <h1>login page</h1> })
  const router = createRouter({
    routeTree: root.addChildren([home, system, login]),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  const view = render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await router.load()
  return { ...view, router }
}
```

`apps/web/src/labels/labels.test.ts`:

```ts
import { COMPONENT_IDS, EVENT_KINDS, METRIC_KEYS, PENDING_KEYS, REASON_CODES } from '@orbit/contract'

import { COMPONENT_LABELS } from './componentLabels'
import { CONNECTION_LABELS } from './connectionLabels'
import { EVENT_LABELS } from './eventLabels'
import { METRIC_LABELS } from './metricLabels'
import { PENDING_LABELS } from './pendingLabels'
import { REASON_LABELS } from './reasonLabels'

describe('labels', () => {
  it.each([
    [COMPONENT_IDS, COMPONENT_LABELS],
    [REASON_CODES, REASON_LABELS],
    [EVENT_KINDS, EVENT_LABELS],
    [METRIC_KEYS, METRIC_LABELS],
    [PENDING_KEYS, PENDING_LABELS],
    [['connecting', 'live', 'stale', 'offline', 'unauthorized'], CONNECTION_LABELS],
  ] as const)('names every id', (ids, labels) => {
    for (const id of ids) expect((labels as Record<string, string>)[id]?.length).toBeGreaterThan(0)
  })
})
```

If the contract barrel does not export `REASON_CODES`, `METRIC_KEYS`, `PENDING_KEYS` and `EVENT_KINDS`, add those re-exports to `packages/contract/src/index.ts`.

`apps/web/src/selectors/selectNewlyDown.test.ts`:

```ts
import { snapshotOf } from '../test/snapshotOf'
import { selectNewlyDown } from './selectNewlyDown'

describe('selectNewlyDown', () => {
  it('lists components that just went down', () => {
    const previous = { worker: snapshotOf('worker', 'ok'), launchd: snapshotOf('launchd', 'down') }
    const next = { worker: snapshotOf('worker', 'down'), launchd: snapshotOf('launchd', 'down'), synthetic: snapshotOf('synthetic', 'down') }
    expect(selectNewlyDown(previous, next)).toEqual(['worker', 'synthetic'])
  })
})
```

`apps/web/src/components/shell/Shell.test.tsx`:

```tsx
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'

import { FakeEventSource } from '../../test/FakeEventSource'
import { renderShell } from '../../test/renderShell'
import { snapshotOf } from '../../test/snapshotOf'

const source = () => FakeEventSource.instances.at(-1) as FakeEventSource

describe('Shell', () => {
  it('shows the connection state and the page', async () => {
    const { container } = await renderShell()
    expect(screen.getByRole('heading', { name: 'home page' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Connection' })).toHaveTextContent('Connecting')
    act(() => source().onopen?.())
    expect(screen.getByRole('status', { name: 'Connection' })).toHaveTextContent('Live')
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toHaveLength(0)
  })
  it('toasts a component that goes down after sync, not one already down', async () => {
    await renderShell()
    act(() => {
      source().emit({ type: 'snapshot', id: 1, snapshot: snapshotOf('launchd', 'down') })
      source().emit({ type: 'snapshot', id: 1, snapshot: snapshotOf('worker', 'ok') })
      source().emit({ type: 'sync', id: 1 })
    })
    act(() => source().emit({ type: 'snapshot', id: 2, snapshot: snapshotOf('worker', 'down') }))
    const toasts = await screen.findAllByRole('alert')
    expect(toasts.map((t) => t.textContent)).toEqual([expect.stringContaining('Worker is down')])
  })
  it('opens the command palette with Cmd-K and navigates', async () => {
    const { router } = await renderShell()
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.click(await screen.findByRole('option', { name: 'System' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/system'))
  })
  it('routes to login when the session is gone', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })))
    const { router } = await renderShell()
    act(() => {
      source().close()
      source().onerror?.()
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL.

- [ ] **Step 3: Labels**

`apps/web/src/labels/componentLabels.ts`:

```ts
import type { ComponentId } from '@orbit/contract'

export const COMPONENT_LABELS: Record<ComponentId, string> = {
  launchd: 'Scheduled jobs',
  worker: 'Worker',
  atrium: 'Atrium',
  brain: 'Brain',
  clips: 'Clips',
  capture: 'Capture',
  synthetic: 'Synthetic probe',
}
```

`apps/web/src/labels/reasonLabels.ts`:

```ts
import type { ReasonCode } from '@orbit/contract'

export const REASON_LABELS: Record<ReasonCode, string> = {
  stale: 'No fresh reading',
  timeout: 'Read timed out',
  exit_nonzero: 'Probe command failed',
  output_too_large: 'Probe output too large',
  schema_invalid: 'Unreadable answer',
  engine_schema_unsupported: 'Engine version not supported',
  not_found: 'Not found',
  unauthorized: 'Not authorized',
  unreachable: 'Unreachable',
  lagging: 'Reads are slow',
  check_failed: 'Health check failed',
}
```

`apps/web/src/labels/eventLabels.ts`:

```ts
import type { OrbitEvent } from '@orbit/contract'

export const EVENT_LABELS: Record<OrbitEvent['kind'], string> = {
  'component.down': 'went down',
  'component.recovered': 'recovered',
  'launchd.exit_changed': 'job exit status changed',
  'launchd.started': 'job started',
  'launchd.stopped': 'job stopped',
  'worker.job_failed': 'job failed',
  'worker.cooldown_started': 'executor cooling down',
  'synthetic.tick': 'probe tick',
}
```

`apps/web/src/labels/metricLabels.ts`:

```ts
import type { Metric } from '@orbit/contract'

export const METRIC_LABELS: Record<Metric['key'], string> = {
  'launchd.jobs': 'jobs',
  'launchd.running': 'running',
  'launchd.failing': 'failing',
  'worker.queued': 'queued',
  'worker.live': 'running',
  'worker.failed': 'failed',
  'worker.done_1h': 'done in the last hour',
  'worker.wasted_1h_s': 'wasted in the last hour',
  'worker.cooldowns': 'cooling down',
  'worker.nodes': 'nodes',
  'synthetic.value': 'value',
}
```

`apps/web/src/labels/pendingLabels.ts`:

```ts
import type { Pending } from '@orbit/contract'

export const PENDING_LABELS: Record<Pending['key'], string> = {
  'launchd.failing_jobs': 'failing jobs',
  'worker.failed_jobs': 'failed jobs',
  'worker.queued_jobs': 'queued jobs',
  'synthetic.items': 'probe items',
}
```

`apps/web/src/labels/connectionLabels.ts`:

```ts
import type { StreamStatus } from '../types/StreamStatus'

export const CONNECTION_LABELS: Record<StreamStatus, string> = {
  connecting: 'Connecting',
  live: 'Live',
  stale: 'Stale',
  offline: 'Offline',
  unauthorized: 'Signed out',
}
```

- [ ] **Step 4: Types, selector, hooks**

`apps/web/src/types/NavItem.ts`:

```ts
export type NavItem = { readonly to: '/' | '/system'; readonly label: string }
```

`apps/web/src/types/Toast.ts`:

```ts
import type { ComponentId, ReasonCode } from '@orbit/contract'

export type Toast = { readonly id: string; readonly component: ComponentId; readonly reason: ReasonCode | null }
```

`apps/web/src/types/ToastsModel.ts`:

```ts
import type { Toast } from './Toast'

export type ToastsModel = { readonly toasts: readonly Toast[]; readonly dismiss: (id: string) => void }
```

`apps/web/src/types/CommandPaletteModel.ts`:

```ts
import type { NavItem } from './NavItem'

export type CommandPaletteModel = {
  readonly open: boolean
  readonly setOpen: (open: boolean) => void
  readonly go: (to: NavItem['to']) => void
  readonly signOut: () => void
}
```

`apps/web/src/types/DownTracking.ts`:

```ts
import type { StreamState } from './StreamState'

export type DownTracking = { readonly snapshots: StreamState['snapshots']; readonly synced: boolean }
```

`apps/web/src/components/shell/navItems.ts`:

```ts
import type { NavItem } from '../../types/NavItem'

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Orbit' },
  { to: '/system', label: 'System' },
]
```

`apps/web/src/selectors/selectNewlyDown.ts`:

```ts
import { COMPONENT_IDS, type ComponentId } from '@orbit/contract'

import type { StreamState } from '../types/StreamState'

export const selectNewlyDown = (previous: StreamState['snapshots'], next: StreamState['snapshots']): ComponentId[] =>
  COMPONENT_IDS.filter(
    (id) => next[id]?.health.state === 'down' && previous[id]?.health.state !== 'down',
  )
```

`apps/web/src/hooks/useDownToasts.ts`:

```ts
import { useEffect, useRef, useState } from 'react'

import { selectNewlyDown } from '../selectors/selectNewlyDown'
import type { DownTracking } from '../types/DownTracking'
import type { Toast } from '../types/Toast'
import type { ToastsModel } from '../types/ToastsModel'
import { useStream } from './useStream'

export const useDownToasts = (): ToastsModel => {
  const { snapshots, synced } = useStream()
  const previous = useRef<DownTracking>({ snapshots, synced })
  const [toasts, setToasts] = useState<readonly Toast[]>([])
  useEffect(() => {
    const before = previous.current
    previous.current = { snapshots, synced }
    if (!synced || !before.synced) return
    const at = Date.now()
    const fresh = selectNewlyDown(before.snapshots, snapshots).map((component) => ({
      id: `${component}:${at}`,
      component,
      reason: snapshots[component]?.health.reason ?? null,
    }))
    if (fresh.length > 0) setToasts((current) => [...current, ...fresh].slice(-4))
  }, [snapshots, synced])
  useEffect(() => {
    if (toasts.length === 0) return undefined
    const timer = setTimeout(() => setToasts((current) => current.slice(1)), 8_000)
    return () => clearTimeout(timer)
  }, [toasts])
  return { toasts, dismiss: (id) => setToasts((current) => current.filter((toast) => toast.id !== id)) }
}
```

`apps/web/src/hooks/useHotkey.ts`:

```ts
import { useEffect } from 'react'

export const useHotkey = (key: string, onPress: () => void): void => {
  useEffect(() => {
    const listener = (event: KeyboardEvent): void => {
      if (event.key.toLowerCase() !== key || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      onPress()
    }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [key, onPress])
}
```

`apps/web/src/hooks/useCommandPalette.ts`:

```ts
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

import { apiFetch } from '../api/apiFetch'
import type { CommandPaletteModel } from '../types/CommandPaletteModel'
import { useHotkey } from './useHotkey'

export const useCommandPalette = (): CommandPaletteModel => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  useHotkey('k', useCallback(() => setOpen((current) => !current), []))
  return {
    open,
    setOpen,
    go: (to) => {
      setOpen(false)
      void navigate({ to })
    },
    signOut: () => {
      setOpen(false)
      void apiFetch('/api/logout', { method: 'POST' }).finally(() => navigate({ to: '/login' }))
    },
  }
}
```

- [ ] **Step 5: Views**

`apps/web/src/components/shell/ConnectionIndicator.tsx`:

```tsx
import { useStream } from '../../hooks/useStream'
import { CONNECTION_LABELS } from '../../labels/connectionLabels'

export const ConnectionIndicator = () => {
  const { status } = useStream()
  return (
    <div role="status" aria-label="Connection" className="flex items-center gap-2 text-xs text-muted">
      <span
        aria-hidden="true"
        data-status={status}
        className="size-2 rounded-full bg-unknown data-[status=live]:bg-ok data-[status=stale]:bg-warn data-[status=offline]:bg-down"
      />
      {CONNECTION_LABELS[status]}
    </div>
  )
}
```

`apps/web/src/components/shell/NavRail.tsx`:

```tsx
import { Link } from '@tanstack/react-router'

import { ConnectionIndicator } from './ConnectionIndicator'
import { NAV_ITEMS } from './navItems'

export const NavRail = () => (
  <nav aria-label="Primary" className="hidden h-dvh flex-col gap-2 border-r border-line p-3 md:sticky md:top-0 md:flex">
    <span className="mb-4 font-mono text-sm text-accent">orbit</span>
    {NAV_ITEMS.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className="rounded-lg px-2 py-1.5 text-sm text-muted hover:text-ink"
        activeProps={{ className: 'bg-panel text-ink', 'aria-current': 'page' }}
        activeOptions={{ exact: true }}
      >
        {item.label}
      </Link>
    ))}
    <div className="mt-auto">
      <ConnectionIndicator />
    </div>
  </nav>
)
```

`apps/web/src/components/shell/TabBar.tsx`:

```tsx
import { Link } from '@tanstack/react-router'

import { NAV_ITEMS } from './navItems'

export const TabBar = () => (
  <nav
    aria-label="Tabs"
    className="fixed inset-x-0 bottom-0 flex justify-around border-t border-line bg-panel pb-[env(safe-area-inset-bottom)] md:hidden"
  >
    {NAV_ITEMS.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className="flex-1 py-3 text-center text-sm text-muted"
        activeProps={{ className: 'text-ink', 'aria-current': 'page' }}
        activeOptions={{ exact: true }}
      >
        {item.label}
      </Link>
    ))}
  </nav>
)
```

On phones the connection state shows in the page header instead: Task 22 places `<ConnectionIndicator />` in the home header with `md:hidden`. Until then the `status` role exists once (in the rail), which is what the Shell test reads; jsdom ignores the `hidden` class, so the test finds it regardless of width.

`apps/web/src/components/shell/Toasts.tsx`:

```tsx
import { useDownToasts } from '../../hooks/useDownToasts'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import { REASON_LABELS } from '../../labels/reasonLabels'

export const Toasts = () => {
  const { toasts, dismiss } = useDownToasts()
  return (
    <div className="fixed right-4 bottom-20 z-50 flex w-80 flex-col gap-2 md:bottom-4">
      {toasts.map((toast) => (
        <div key={toast.id} role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-down/40 bg-panel p-3 text-sm">
          <span>
            {COMPONENT_LABELS[toast.component]} is down
            {toast.reason !== null && <span className="block text-muted">{REASON_LABELS[toast.reason]}</span>}
          </span>
          <button type="button" aria-label="Dismiss" onClick={() => dismiss(toast.id)} className="text-muted">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
```

`apps/web/src/components/shell/CommandPalette.tsx`:

```tsx
import { Command } from 'cmdk'

import { useCommandPalette } from '../../hooks/useCommandPalette'
import { NAV_ITEMS } from './navItems'

export const CommandPalette = () => {
  const palette = useCommandPalette()
  return (
    <Command.Dialog
      open={palette.open}
      onOpenChange={palette.setOpen}
      label="Command palette"
      className="fixed inset-x-4 top-24 z-50 mx-auto max-w-lg rounded-2xl border border-line bg-panel p-2 shadow-2xl"
    >
      <Command.Input placeholder="Go to…" className="w-full bg-transparent px-3 py-2 outline-none" />
      <Command.List>
        <Command.Empty className="px-3 py-2 text-sm text-muted">Nothing matches</Command.Empty>
        <Command.Group heading="Go to">
          {NAV_ITEMS.map((item) => (
            <Command.Item key={item.to} onSelect={() => palette.go(item.to)} className="rounded-lg px-3 py-2 aria-selected:bg-space">
              {item.label}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Session">
          <Command.Item onSelect={palette.signOut} className="rounded-lg px-3 py-2 aria-selected:bg-space">
            Sign out
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
```

`apps/web/src/components/shell/Shell.tsx`:

```tsx
import { Outlet } from '@tanstack/react-router'

import { StreamProvider } from '../../stream/StreamProvider'
import { CommandPalette } from './CommandPalette'
import { NavRail } from './NavRail'
import { TabBar } from './TabBar'
import { Toasts } from './Toasts'

export const Shell = () => (
  <StreamProvider>
    <div className="min-h-dvh md:grid md:grid-cols-[9rem_1fr]">
      <NavRail />
      <div className="p-4 pb-24 md:p-8">
        <Outlet />
      </div>
      <TabBar />
      <Toasts />
      <CommandPalette />
    </div>
  </StreamProvider>
)
```

Each screen renders its own `<main>` with an `<h1>`, so the landmark count stays at one `main` per page.

- [ ] **Step 6: Run tests and the package gate** — PASS. If cmdk's dialog needs `ResizeObserver` or `scrollIntoView` in jsdom, stub them in `src/test/setup.ts` (`globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }`; `Element.prototype.scrollIntoView ??= () => undefined`).

- [ ] **Step 7: Commit and push**

```bash
git add apps/web packages/contract
git commit -m "feat(web): shell with navigation, connection state, down toasts and Cmd-K"
pnpm gate && git push
```

---
### Task 22: Orbit home screen

Spec 7.1: every component as a satellite around the core, health ring coloured by state, a pulse on each fresh reading, the headline metric, the pending strip sorted oldest first, and the event ticker. Under 768 px the map becomes a list (Glance-style). A down component keeps its last good reading, greyed, so the screen never goes blank.

**Files:**
- Create: `apps/web/src/geometry/orbitPosition.ts`
- Create: `apps/web/src/formatters/formatDuration.ts`, `formatAge.ts`, `formatMetric.ts`, `formatClock.ts`
- Create: `apps/web/src/selectors/selectCards.ts`, `selectHeadline.ts`, `selectPending.ts`
- Create: `apps/web/src/labels/healthLabels.ts`, `apps/web/src/screens/home/headlineMetrics.ts`
- Create: `apps/web/src/hooks/useNow.ts`, `useMediaQuery.ts`, `useHomeModel.ts`
- Create: `apps/web/src/screens/home/HomeScreen.tsx`, `OrbitMap.tsx`, `Satellite.tsx`, `HealthRing.tsx`, `ComponentList.tsx`, `PendingStrip.tsx`, `EventTicker.tsx`
- Create: `apps/web/src/types/CardState.ts`, `CardModel.ts`, `PendingRow.ts`, `HomeModel.ts`, `Point.ts`, `OrbitMapProps.ts`, `SatelliteProps.ts`, `HealthRingProps.ts`, `ComponentListProps.ts`, `PendingStripProps.ts`, `EventTickerProps.ts`
- Create: `apps/web/src/router/shellRoute.ts`, `router/homeRoute.ts`
- Create: `apps/web/src/test/mediaMatches.ts`
- Modify: `apps/web/src/router/routeTree.ts`, `apps/web/src/test/setup.ts`
- Test: `apps/web/src/geometry/orbitPosition.test.ts`, `formatters/formatters.test.ts`, `selectors/selectCards.test.ts`, `selectors/selectPending.test.ts`, `screens/home/HomeScreen.test.tsx`

**Interfaces:**
- Produces:
  - `CardState = 'ok' | 'warn' | 'down'`; `CardModel = { component; label; state; reason: string | null; headline: string | null; observedAt: string; greyed: boolean }`
  - `selectCards(snapshots): CardModel[]` in `COMPONENT_IDS` order, present components only.
  - `selectHeadline(core: SnapshotCore): string | null` — the component's headline metric from `HEADLINE_METRICS`, formatted with its label (`"3 running"`).
  - `PendingRow = { component; key; label: string; count: number; oldestAt: string | null; stale: boolean }`; `selectPending(snapshots): PendingRow[]` — count above 0, oldest first, unknown age last; a down component contributes its `lastGood` items with `stale: true`.
  - `formatDuration(ms)` → `"45s" | "12m" | "3h" | "2d"`; `formatAge(iso, now)`; `formatMetric(key, value)`; `formatClock(iso)` → local `HH:MM:SS`.
  - `orbitPosition(index, total, radius): Point` — evenly spaced, first at the top.
  - `useNow(intervalMs): number`, `useMediaQuery(query): boolean`, `useHomeModel(): HomeModel`.
  - Routes: pathless `shellRoute` (id `shell`, component `Shell`) under the root; `homeRoute` (`/`) under the shell.

- [ ] **Step 1: Write the failing tests**

Add a controllable `matchMedia` (jsdom has none). Tests add queries to `mediaMatches` to choose which ones match.

`apps/web/src/test/mediaMatches.ts`:

```ts
export const mediaMatches = new Set<string>()
```

Append to `apps/web/src/test/setup.ts` (importing `mediaMatches`):

```ts
beforeEach(() => {
  mediaMatches.clear()
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: mediaMatches.has(query),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    onchange: null,
    dispatchEvent: () => false,
  }))
})
```

`apps/web/src/geometry/orbitPosition.test.ts`:

```ts
import { orbitPosition } from './orbitPosition'

describe('orbitPosition', () => {
  it('starts at the top and spaces evenly', () => {
    expect(orbitPosition(0, 4, 100)).toEqual({ x: 0, y: -100 })
    const right = orbitPosition(1, 4, 100)
    expect(right.x).toBeCloseTo(100)
    expect(right.y).toBeCloseTo(0)
  })
})
```

`apps/web/src/formatters/formatters.test.ts`:

```ts
import { formatAge } from './formatAge'
import { formatClock } from './formatClock'
import { formatDuration } from './formatDuration'
import { formatMetric } from './formatMetric'

describe('formatters', () => {
  it.each([
    [0, '0s'],
    [45_000, '45s'],
    [12 * 60_000, '12m'],
    [3 * 3_600_000, '3h'],
    [50 * 3_600_000, '2d'],
  ])('formatDuration(%i) is %s', (ms, text) => expect(formatDuration(ms)).toBe(text))
  it('formats an age and never a negative one', () => {
    const now = Date.parse('2026-10-02T10:05:00.000Z')
    expect(formatAge('2026-10-02T10:00:00.000Z', now)).toBe('5m')
    expect(formatAge('2026-10-02T10:06:00.000Z', now)).toBe('0s')
  })
  it('formats metrics by key', () => {
    expect(formatMetric('worker.queued', 1234)).toBe('1,234')
    expect(formatMetric('worker.wasted_1h_s', 600)).toBe('10m')
  })
  it('formats a clock time', () => {
    expect(formatClock('2026-10-02T10:00:07.000Z')).toMatch(/^\d{2}:\d{2}:07$/)
  })
})
```

`apps/web/src/selectors/selectCards.test.ts`:

```ts
import { snapshotOf } from '../test/snapshotOf'
import { selectCards } from './selectCards'

describe('selectCards', () => {
  it('orders cards by component and labels the headline', () => {
    const worker = snapshotOf('worker', 'ok', {
      metrics: [{ key: 'worker.live', value: 3, at: '2026-10-02T10:00:00.000Z' }],
    })
    const cards = selectCards({ synthetic: snapshotOf('synthetic', 'ok'), worker })
    expect(cards.map((c) => c.component)).toEqual(['worker', 'synthetic'])
    expect(cards[0]).toMatchObject({ label: 'Worker', state: 'ok', headline: '3 running', greyed: false, reason: null })
  })
  it('keeps the last good reading of a down component, greyed', () => {
    const good = snapshotOf('worker', 'ok', { metrics: [{ key: 'worker.live', value: 2, at: '2026-10-02T09:00:00.000Z' }] })
    const { lastGood: _ignored, ...core } = good
    const down = snapshotOf('worker', 'down', { lastGood: { ...core, observedAt: '2026-10-02T09:00:00.000Z' } })
    expect(selectCards({ worker: down })[0]).toMatchObject({
      state: 'down',
      reason: 'Unreachable',
      headline: '2 running',
      observedAt: '2026-10-02T09:00:00.000Z',
      greyed: true,
    })
  })
})
```

`apps/web/src/selectors/selectPending.test.ts`:

```ts
import { snapshotOf } from '../test/snapshotOf'
import { selectPending } from './selectPending'

describe('selectPending', () => {
  it('drops empty items and sorts oldest first, unknown age last', () => {
    const worker = snapshotOf('worker', 'ok', {
      pending: [
        { key: 'worker.failed_jobs', count: 4, oldestAt: '2026-10-02T09:00:00.000Z' },
        { key: 'worker.queued_jobs', count: 0, oldestAt: null },
      ],
    })
    const launchd = snapshotOf('launchd', 'warn', {
      pending: [{ key: 'launchd.failing_jobs', count: 1, oldestAt: '2026-10-01T09:00:00.000Z' }],
    })
    const synthetic = snapshotOf('synthetic', 'ok', { pending: [{ key: 'synthetic.items', count: 2, oldestAt: null }] })
    expect(selectPending({ worker, launchd, synthetic }).map((row) => row.key)).toEqual([
      'launchd.failing_jobs',
      'worker.failed_jobs',
      'synthetic.items',
    ])
  })
  it('keeps the last known items of a down component, marked stale', () => {
    const { lastGood: _ignored, ...core } = snapshotOf('worker', 'ok', {
      pending: [{ key: 'worker.failed_jobs', count: 4, oldestAt: null }],
    })
    const rows = selectPending({ worker: snapshotOf('worker', 'down', { lastGood: core }) })
    expect(rows).toMatchObject([{ key: 'worker.failed_jobs', count: 4, stale: true }])
  })
})
```

`apps/web/src/screens/home/HomeScreen.test.tsx`:

```tsx
import { act, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'

import { FakeEventSource } from '../../test/FakeEventSource'
import { mediaMatches } from '../../test/mediaMatches'
import { renderAt } from '../../test/renderAt'
import { snapshotOf } from '../../test/snapshotOf'

const feed = () => {
  const source = FakeEventSource.instances.at(-1) as FakeEventSource
  act(() => {
    source.onopen?.()
    source.emit({
      type: 'snapshot',
      id: 1,
      snapshot: snapshotOf('worker', 'warn', {
        metrics: [{ key: 'worker.live', value: 2, at: '2026-10-02T10:00:00.000Z' }],
        pending: [{ key: 'worker.failed_jobs', count: 64, oldestAt: '2026-10-02T09:00:00.000Z' }],
      }),
    })
    source.emit({
      type: 'event',
      id: 1,
      event: { at: '2026-10-02T10:00:00.000Z', component: 'worker', kind: 'worker.job_failed', severity: 'error', refs: { job: 'j1' } },
    })
    source.emit({ type: 'sync', id: 1 })
  })
}

describe('HomeScreen', () => {
  it('draws the orbit map with health, pending and events', async () => {
    const { container } = await renderAt('/')
    feed()
    expect(screen.getByRole('img', { name: 'Worker: Degraded, 2 running' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: /Worker failed jobs/ })).toHaveTextContent('64')
    expect(screen.getByText('job failed')).toBeInTheDocument()
    expect(container.querySelector('[data-pulse]')).not.toBeNull()
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toHaveLength(0)
  })
  it('lists components on a phone', async () => {
    mediaMatches.add('(max-width: 767px)')
    await renderAt('/')
    feed()
    expect(screen.queryByRole('img', { name: /Worker/ })).toBeNull()
    expect(screen.getByRole('listitem', { name: /^Worker: Degraded/ })).toHaveTextContent('2 running')
  })
  it('does not pulse when the user asks for reduced motion', async () => {
    mediaMatches.add('(prefers-reduced-motion: reduce)')
    const { container } = await renderAt('/')
    feed()
    expect(container.querySelector('[data-pulse]')).toBeNull()
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL.

- [ ] **Step 3: Pure units**

`apps/web/src/types/Point.ts`:

```ts
export type Point = { readonly x: number; readonly y: number }
```

`apps/web/src/geometry/orbitPosition.ts`:

```ts
import type { Point } from '../types/Point'

export const orbitPosition = (index: number, total: number, radius: number): Point => {
  const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2
  return { x: Math.round(Math.cos(angle) * radius * 1000) / 1000, y: Math.round(Math.sin(angle) * radius * 1000) / 1000 }
}
```

`apps/web/src/formatters/formatDuration.ts`:

```ts
export const formatDuration = (ms: number): string => {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3_600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 172_800) return `${Math.floor(seconds / 3_600)}h`
  return `${Math.floor(seconds / 86_400)}d`
}
```

(50 hours reads `2d`, 47 hours reads `47h`: hours stay exact up to two days, where the difference still matters.)

`apps/web/src/formatters/formatAge.ts`:

```ts
import { formatDuration } from './formatDuration'

export const formatAge = (iso: string, now: number): string => formatDuration(now - Date.parse(iso))
```

`apps/web/src/formatters/formatMetric.ts`:

```ts
import type { Metric } from '@orbit/contract'

import { formatDuration } from './formatDuration'

export const formatMetric = (key: Metric['key'], value: number): string =>
  key === 'worker.wasted_1h_s'
    ? formatDuration(value * 1000)
    : new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(value)
```

`apps/web/src/formatters/formatClock.ts`:

```ts
export const formatClock = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
```

`apps/web/src/screens/home/headlineMetrics.ts`:

```ts
import type { ComponentId, Metric } from '@orbit/contract'

export const HEADLINE_METRICS: Partial<Record<ComponentId, Metric['key']>> = {
  launchd: 'launchd.failing',
  worker: 'worker.live',
  synthetic: 'synthetic.value',
}
```

`apps/web/src/labels/healthLabels.ts`:

```ts
import type { CardState } from '../types/CardState'

export const HEALTH_LABELS: Record<CardState, string> = { ok: 'Healthy', warn: 'Degraded', down: 'Down' }
```

`apps/web/src/types/CardState.ts`:

```ts
export type CardState = 'ok' | 'warn' | 'down'
```

`apps/web/src/types/CardModel.ts`:

```ts
import type { ComponentId } from '@orbit/contract'

import type { CardState } from './CardState'

export type CardModel = {
  readonly component: ComponentId
  readonly label: string
  readonly state: CardState
  readonly reason: string | null
  readonly headline: string | null
  readonly observedAt: string
  readonly greyed: boolean
}
```

`apps/web/src/types/PendingRow.ts`:

```ts
import type { ComponentId, Pending } from '@orbit/contract'

export type PendingRow = {
  readonly component: ComponentId
  readonly key: Pending['key']
  readonly label: string
  readonly count: number
  readonly oldestAt: string | null
  readonly stale: boolean
}
```

`apps/web/src/selectors/selectHeadline.ts`:

```ts
import type { SnapshotCore } from '@orbit/contract'

import { formatMetric } from '../formatters/formatMetric'
import { METRIC_LABELS } from '../labels/metricLabels'
import { HEADLINE_METRICS } from '../screens/home/headlineMetrics'

export const selectHeadline = (core: SnapshotCore): string | null => {
  const key = HEADLINE_METRICS[core.component]
  const metric = core.metrics.find((m) => m.key === key)
  return metric === undefined ? null : `${formatMetric(metric.key, metric.value)} ${METRIC_LABELS[metric.key]}`
}
```

`apps/web/src/selectors/selectCards.ts`:

```ts
import { COMPONENT_IDS, type Snapshot } from '@orbit/contract'

import { COMPONENT_LABELS } from '../labels/componentLabels'
import { REASON_LABELS } from '../labels/reasonLabels'
import type { CardModel } from '../types/CardModel'
import type { StreamState } from '../types/StreamState'
import { selectHeadline } from './selectHeadline'

export const selectCards = (snapshots: StreamState['snapshots']): CardModel[] =>
  COMPONENT_IDS.flatMap((id) => {
    const snapshot: Snapshot | undefined = snapshots[id]
    if (snapshot === undefined) return []
    const greyed = snapshot.health.state === 'down' && snapshot.lastGood !== null
    const source = greyed && snapshot.lastGood !== null ? snapshot.lastGood : snapshot
    return [
      {
        component: id,
        label: COMPONENT_LABELS[id],
        state: snapshot.health.state,
        reason: snapshot.health.reason === null ? null : REASON_LABELS[snapshot.health.reason],
        headline: selectHeadline(source),
        observedAt: source.observedAt,
        greyed,
      },
    ]
  })
```

`apps/web/src/selectors/selectPending.ts`:

```ts
import { COMPONENT_IDS } from '@orbit/contract'

import { PENDING_LABELS } from '../labels/pendingLabels'
import type { PendingRow } from '../types/PendingRow'
import type { StreamState } from '../types/StreamState'

export const selectPending = (snapshots: StreamState['snapshots']): PendingRow[] =>
  COMPONENT_IDS.flatMap((component) => {
    const snapshot = snapshots[component]
    const stale = snapshot?.health.state === 'down' && snapshot.lastGood !== null
    const items = (stale ? snapshot.lastGood?.pending : snapshot?.pending) ?? []
    return items
      .filter((item) => item.count > 0)
      .map((item) => ({ component, key: item.key, label: PENDING_LABELS[item.key], count: item.count, oldestAt: item.oldestAt, stale }))
  }).sort((a, b) => (a.oldestAt ?? '\uffff').localeCompare(b.oldestAt ?? '\uffff'))
```

ISO timestamps in one format sort correctly as strings; `'\uffff'` sorts unknown ages last.

- [ ] **Step 4: Hooks**

`apps/web/src/hooks/useNow.ts`:

```ts
import { useEffect, useState } from 'react'

export const useNow = (intervalMs: number): number => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}
```

`apps/web/src/hooks/useMediaQuery.ts`:

```ts
import { useSyncExternalStore } from 'react'

export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
```

`apps/web/src/types/HomeModel.ts`:

```ts
import type { OrbitEvent } from '@orbit/contract'

import type { CardModel } from './CardModel'
import type { PendingRow } from './PendingRow'

export type HomeModel = {
  readonly cards: readonly CardModel[]
  readonly pending: readonly PendingRow[]
  readonly events: readonly OrbitEvent[]
  readonly isPhone: boolean
  readonly animate: boolean
  readonly now: number
}
```

`apps/web/src/hooks/useHomeModel.ts`:

```ts
import { useMemo } from 'react'

import { selectCards } from '../selectors/selectCards'
import { selectPending } from '../selectors/selectPending'
import type { HomeModel } from '../types/HomeModel'
import { useMediaQuery } from './useMediaQuery'
import { useNow } from './useNow'
import { useStream } from './useStream'

export const useHomeModel = (): HomeModel => {
  const { snapshots, events, synced } = useStream()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const now = useNow(1_000)
  const cards = useMemo(() => (synced ? selectCards(snapshots) : []), [snapshots, synced])
  const pending = useMemo(() => (synced ? selectPending(snapshots) : []), [snapshots, synced])
  return { cards, pending, events: synced ? events.slice(0, 20) : [], isPhone, animate: !reduced, now }
}
```

(`useMediaQuery` for reduced motion instead of Motion's `useReducedMotion` keeps one source of truth that tests control. Nothing renders until the opening set ends with `sync`, and a `resync` hides it again until the next `sync` (spec 6.4), so the screen never shows half an opening.)

- [ ] **Step 5: Views**

Props types, one file each in `apps/web/src/types/`:

```ts
// HealthRingProps.ts
import type { CardState } from './CardState'

export type HealthRingProps = { readonly state: CardState; readonly greyed: boolean }
```

```ts
// SatelliteProps.ts
import type { CardModel } from './CardModel'
import type { Point } from './Point'

export type SatelliteProps = { readonly card: CardModel; readonly at: Point; readonly animate: boolean }
```

```ts
// OrbitMapProps.ts
import type { CardModel } from './CardModel'

export type OrbitMapProps = { readonly cards: readonly CardModel[]; readonly animate: boolean }
```

```ts
// ComponentListProps.ts
import type { CardModel } from './CardModel'

export type ComponentListProps = { readonly cards: readonly CardModel[]; readonly now: number }
```

```ts
// PendingStripProps.ts
import type { PendingRow } from './PendingRow'

export type PendingStripProps = { readonly rows: readonly PendingRow[]; readonly now: number }
```

```ts
// EventTickerProps.ts
import type { OrbitEvent } from '@orbit/contract'

export type EventTickerProps = { readonly events: readonly OrbitEvent[] }
```

`apps/web/src/screens/home/HealthRing.tsx`:

```tsx
import type { HealthRingProps } from '../../types/HealthRingProps'

export const HealthRing = ({ state, greyed }: HealthRingProps) => (
  <circle
    r={34}
    data-state={state}
    className="fill-panel stroke-[3] data-[state=down]:stroke-down data-[state=ok]:stroke-ok data-[state=warn]:stroke-warn"
    opacity={greyed ? 0.5 : 1}
  />
)
```

`apps/web/src/screens/home/Satellite.tsx`:

```tsx
import { motion } from 'motion/react'

import { HEALTH_LABELS } from '../../labels/healthLabels'
import type { SatelliteProps } from '../../types/SatelliteProps'
import { HealthRing } from './HealthRing'

export const Satellite = ({ card, at, animate }: SatelliteProps) => (
  <g
    role="img"
    aria-label={[`${card.label}: ${HEALTH_LABELS[card.state]}`, card.headline].filter(Boolean).join(', ')}
    transform={`translate(${at.x} ${at.y})`}
  >
    {animate && (
      <motion.circle
        key={card.observedAt}
        data-pulse=""
        className="fill-none stroke-accent"
        initial={{ r: 34, opacity: 0.6 }}
        animate={{ r: 52, opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    )}
    <HealthRing state={card.state} greyed={card.greyed} />
    <text y={4} textAnchor="middle" className="fill-ink text-[11px] font-semibold">
      {card.label}
    </text>
    {card.headline !== null && (
      <text y={56} textAnchor="middle" className="fill-muted font-mono text-[11px]">
        {card.headline}
      </text>
    )}
  </g>
)
```

Keying the pulse on `observedAt` remounts it on each fresh reading, which replays the animation.

`apps/web/src/screens/home/OrbitMap.tsx`:

```tsx
import { orbitPosition } from '../../geometry/orbitPosition'
import type { OrbitMapProps } from '../../types/OrbitMapProps'
import { Satellite } from './Satellite'

export const OrbitMap = ({ cards, animate }: OrbitMapProps) => (
  <svg viewBox="-300 -300 600 600" className="mx-auto block w-full max-w-2xl" role="group" aria-label="Components">
    <circle r={220} className="fill-none stroke-line" strokeDasharray="2 6" aria-hidden="true" />
    <circle r={120} className="fill-none stroke-line" strokeDasharray="2 6" aria-hidden="true" />
    <circle r={44} className="fill-panel stroke-accent" aria-hidden="true" />
    <text y={5} textAnchor="middle" className="fill-accent font-mono text-sm" aria-hidden="true">
      orbit
    </text>
    {cards.map((card, index) => (
      <Satellite key={card.component} card={card} at={orbitPosition(index, cards.length, 220)} animate={animate} />
    ))}
  </svg>
)
```

`apps/web/src/screens/home/ComponentList.tsx`:

```tsx
import { formatAge } from '../../formatters/formatAge'
import { HEALTH_LABELS } from '../../labels/healthLabels'
import type { ComponentListProps } from '../../types/ComponentListProps'

export const ComponentList = ({ cards, now }: ComponentListProps) => (
  <ul className="space-y-2">
    {cards.map((card) => (
      <li
        key={card.component}
        aria-label={`${card.label}: ${HEALTH_LABELS[card.state]}`}
        data-greyed={card.greyed}
        className="flex items-center gap-3 rounded-xl border border-line bg-panel p-3 data-[greyed=true]:opacity-60"
      >
        <span
          aria-hidden="true"
          data-state={card.state}
          className="size-2.5 rounded-full data-[state=down]:bg-down data-[state=ok]:bg-ok data-[state=warn]:bg-warn"
        />
        <span className="flex-1">
          <span className="block font-semibold">{card.label}</span>
          <span className="block text-xs text-muted">{card.reason ?? HEALTH_LABELS[card.state]}</span>
        </span>
        {card.headline !== null && <span className="font-mono text-sm">{card.headline}</span>}
        <span className="font-mono text-xs text-muted">{formatAge(card.observedAt, now)}</span>
      </li>
    ))}
  </ul>
)
```

`apps/web/src/screens/home/PendingStrip.tsx`:

```tsx
import { formatAge } from '../../formatters/formatAge'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import type { PendingStripProps } from '../../types/PendingStripProps'

export const PendingStrip = ({ rows, now }: PendingStripProps) => (
  <section aria-labelledby="pending-heading" className="space-y-2">
    <h2 id="pending-heading" className="text-sm font-semibold text-muted uppercase">
      Pending
    </h2>
    {rows.length === 0 ? (
      <p className="text-sm text-muted">Nothing pending.</p>
    ) : (
      <ul className="flex gap-2 overflow-x-auto pb-2">
        {rows.map((row) => (
          <li
            key={`${row.component}:${row.key}`}
            aria-label={`${COMPONENT_LABELS[row.component]} ${row.label}`}
            className="shrink-0 rounded-xl border border-line bg-panel px-3 py-2 text-sm"
          >
            <span className="font-mono text-lg">{row.count}</span> {COMPONENT_LABELS[row.component]} · {row.label}
            {row.stale && <span className="block text-xs text-warn">last known</span>}
            {row.oldestAt !== null && <span className="block text-xs text-muted">oldest {formatAge(row.oldestAt, now)}</span>}
          </li>
        ))}
      </ul>
    )}
  </section>
)
```

`apps/web/src/screens/home/EventTicker.tsx`:

```tsx
import { formatClock } from '../../formatters/formatClock'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import { EVENT_LABELS } from '../../labels/eventLabels'
import type { EventTickerProps } from '../../types/EventTickerProps'

export const EventTicker = ({ events }: EventTickerProps) => (
  <section aria-labelledby="events-heading" className="space-y-2">
    <h2 id="events-heading" className="text-sm font-semibold text-muted uppercase">
      Recent events
    </h2>
    {events.length === 0 ? (
      <p className="text-sm text-muted">No events yet.</p>
    ) : (
      <ol className="divide-y divide-line rounded-xl border border-line bg-panel">
        {events.map((event, index) => (
          <li key={`${event.at}:${index}`} className="flex gap-3 px-3 py-2 text-sm">
            <time dateTime={event.at} className="font-mono text-muted">
              {formatClock(event.at)}
            </time>
            <span
              aria-hidden="true"
              data-severity={event.severity}
              className="mt-1.5 size-2 rounded-full bg-unknown data-[severity=error]:bg-down data-[severity=warn]:bg-warn"
            />
            <span className="font-semibold">{COMPONENT_LABELS[event.component]}</span>
            <span>{EVENT_LABELS[event.kind]}</span>
          </li>
        ))}
      </ol>
    )}
  </section>
)
```

`apps/web/src/screens/home/HomeScreen.tsx`:

```tsx
import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useHomeModel } from '../../hooks/useHomeModel'
import { ComponentList } from './ComponentList'
import { EventTicker } from './EventTicker'
import { OrbitMap } from './OrbitMap'
import { PendingStrip } from './PendingStrip'

export const HomeScreen = () => {
  const model = useHomeModel()
  return (
    <main className="mx-auto max-w-5xl space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Orbit</h1>
        {model.isPhone && <ConnectionIndicator />}
      </header>
      {model.cards.length === 0 && <p className="text-muted">Waiting for the first readings…</p>}
      {model.isPhone ? <ComponentList cards={model.cards} now={model.now} /> : <OrbitMap cards={model.cards} animate={model.animate} />}
      <PendingStrip rows={model.pending} now={model.now} />
      <EventTicker events={model.events} />
    </main>
  )
}
```

On a phone the rail (with its indicator) is hidden by CSS, so the header shows the one visible indicator; the rail's copy is `display: none` and leaves the accessibility tree.

- [ ] **Step 6: Routes**

`apps/web/src/router/shellRoute.ts`:

```ts
import { createRoute } from '@tanstack/react-router'

import { Shell } from '../components/shell/Shell'
import { rootRoute } from './rootRoute'

export const shellRoute = createRoute({ getParentRoute: () => rootRoute, id: 'shell', component: Shell })
```

`apps/web/src/router/homeRoute.ts`:

```ts
import { createRoute } from '@tanstack/react-router'

import { HomeScreen } from '../screens/home/HomeScreen'
import { shellRoute } from './shellRoute'

export const homeRoute = createRoute({ getParentRoute: () => shellRoute, path: '/', component: HomeScreen })
```

`apps/web/src/router/routeTree.ts`:

```ts
import { homeRoute } from './homeRoute'
import { loginRoute } from './loginRoute'
import { pairRoute } from './pairRoute'
import { rootRoute } from './rootRoute'
import { shellRoute } from './shellRoute'

export const routeTree = rootRoute.addChildren([loginRoute, pairRoute, shellRoute.addChildren([homeRoute])])
```

- [ ] **Step 7: Run tests and the package gate** — PASS, size still under 150 KB (Motion and cmdk are in the initial route; Task 2 measured them).

- [ ] **Step 8: Commit and push**

```bash
git add apps/web
git commit -m "feat(web): orbit home with satellites, pending strip and event ticker"
pnpm gate && git push
```

---
### Task 23: System screen with launchd heartbeat strips

Spec 7.2 and 9: one row per registered launchd label with its role, schedule, current state and an Uptime-Kuma-style heartbeat strip for 24 h, 7 d or 30 d (range in the URL). The strip is drawn in SVG, not uPlot: it is a row of coloured buckets, and an SVG of 90 rectangles costs nothing while uPlot would add a chunk for no gain (recorded in the spec in Task 25).

Bucket states, in precedence order:

1. `unknown` — orbit was not running for the whole bucket (its run intervals, plus 90 s of slack for the 60 s touch cadence, do not cover it). Nothing else can be claimed about a window nobody watched.
2. `failed` — the job's last exit code at the end of the bucket, or any exit recorded inside it, is non-zero; for a keepalive job, also no pid at the end of the bucket.
3. `ok` — a scheduled job's run counter increased inside the bucket; a keepalive job had a pid.
4. `missed` — a scheduled job with a known interval, where orbit watched the whole window of the last 1.5 intervals before the bucket's end (covered, and a run-counter reading exists at or before the window's start as a baseline) and the counter did not increase inside it (spec 5.8). A job orbit has never seen run is still caught: the baseline is any earlier reading, not an earlier run.
5. `idle` — covered, nothing wrong, nothing due.

Ranges: `24h` = 48 buckets of 30 min, `7d` = 84 of 2 h, `30d` = 90 of 8 h.

**Files:**
- Create: `apps/web/src/schemas/launchdRowsSchema.ts`, `schemas/launchdHistorySchema.ts`
- Create: `apps/web/src/types/LaunchdRow.ts`, `LaunchdHistory.ts`, `LaunchdObservation.ts`, `HistoryRange.ts`, `SystemSearch.ts`, `BucketState.ts`, `Bucket.ts`, `BucketInput.ts`, `RangeSpec.ts`, `SystemModel.ts`, `LaunchdRowModel.ts`, `RangePickerProps.ts`, `LaunchdRowViewProps.ts`, `HeartbeatStripProps.ts`
- Create: `apps/web/src/heartbeat/rangeSpecs.ts`, `heartbeat/isCovered.ts`, `heartbeat/listRunTimes.ts`, `heartbeat/missWindowFor.ts`, `heartbeat/isMissed.ts`, `heartbeat/classifyBucket.ts`, `heartbeat/buildHeartbeat.ts`
- Create: `apps/web/src/validators/validateSystemSearch.ts`
- Create: `apps/web/src/formatters/formatSchedule.ts`, `formatters/formatJobState.ts`
- Create: `apps/web/src/labels/bucketLabels.ts`
- Create: `apps/web/src/hooks/useSystemModel.ts`, `hooks/useLaunchdRowModel.ts`
- Create: `apps/web/src/screens/system/SystemScreen.tsx`, `RangePicker.tsx`, `LaunchdRowView.tsx`, `HeartbeatStrip.tsx`
- Create: `apps/web/src/router/systemRoute.ts`; Modify: `apps/web/src/router/routeTree.ts`
- Test: `apps/web/src/heartbeat/heartbeat.test.ts`, `validators/validateSystemSearch.test.ts`, `formatters/systemFormatters.test.ts`, `screens/system/SystemScreen.test.tsx`

**Interfaces:**
- Consumes: `GET /api/launchd` → `{ rows }`, `GET /api/launchd/history?label&range` → `{ observations, runs }` (Task 16); `apiJson` (Task 19); `useNow`, `useMediaQuery` (Task 22).
- Produces:
  - `HistoryRange = '24h' | '7d' | '30d'`; `RANGE_SPECS: Record<HistoryRange, { spanMs: number; buckets: number }>`
  - `isCovered(runs, start, end): boolean`; `listRunTimes(observations): number[]`; `missWindowFor(history, runTimes, intervalMs, end): BucketInput["missWindow"]`; `isMissed(input): boolean`; `classifyBucket(input: BucketInput): BucketState`; `buildHeartbeat(history, row, range, now): Bucket[]`
  - `validateSystemSearch(search: Record<string, unknown>): SystemSearch` — unknown or missing range becomes `24h`.
  - `formatSchedule(row): string`; `formatJobState(observation | null): string`

- [ ] **Step 1: Write the failing tests**

`apps/web/src/heartbeat/heartbeat.test.ts`:

```ts
import type { LaunchdObservation } from '../types/LaunchdObservation'
import type { LaunchdRow } from '../types/LaunchdRow'
import { buildHeartbeat } from './buildHeartbeat'
import { classifyBucket } from './classifyBucket'
import { isCovered } from './isCovered'
import { listRunTimes } from './listRunTimes'

const H = 3_600_000
const obs = (at: number, runs: number | null, lastExit: number | null, pid: number | null = null): LaunchdObservation => ({
  label: 'com.example.job',
  at,
  runs,
  lastExit,
  pid,
})
const base = { covered: true, role: 'scheduled' as const, intervalMs: H, inBucket: [], atEnd: null, runInBucket: false, missWindow: null }

describe('isCovered', () => {
  it('needs the whole window inside merged run intervals', () => {
    const runs = [
      { started: 0, stopped: H },
      { started: H + 30_000, stopped: 3 * H },
    ]
    expect(isCovered(runs, 0, 2 * H)).toBe(true)
    expect(isCovered(runs, 2 * H, 4 * H)).toBe(false)
    expect(isCovered([], 0, 1)).toBe(false)
  })
})

describe('listRunTimes', () => {
  it('keeps the times where the run counter went up', () => {
    expect(listRunTimes([obs(1, 1, 0), obs(2, 2, 0), obs(3, 2, 78), obs(4, 0, 0), obs(5, 1, 0)])).toEqual([2, 5])
  })
})

describe('classifyBucket', () => {
  it('ranks unknown over everything', () => {
    expect(classifyBucket({ ...base, covered: false, inBucket: [obs(1, 1, 78)] })).toBe('unknown')
  })
  it('marks a non-zero exit as failed', () => {
    expect(classifyBucket({ ...base, atEnd: obs(1, 1, 78) })).toBe('failed')
  })
  it('marks a keepalive job without a pid as failed and with one as ok', () => {
    expect(classifyBucket({ ...base, role: 'keepalive', atEnd: obs(1, 1, 0, null) })).toBe('failed')
    expect(classifyBucket({ ...base, role: 'keepalive', atEnd: obs(1, 1, 0, 42) })).toBe('ok')
  })
  it('marks a run in the bucket as ok', () => {
    expect(classifyBucket({ ...base, runInBucket: true, atEnd: obs(1, 2, 0) })).toBe('ok')
  })
  it('marks a missed run only over a fully watched window with no run', () => {
    expect(classifyBucket({ ...base, missWindow: { watched: true, ran: false } })).toBe('missed')
    expect(classifyBucket({ ...base, missWindow: { watched: true, ran: true } })).toBe('idle')
    expect(classifyBucket({ ...base, missWindow: { watched: false, ran: false } })).toBe('idle')
    expect(classifyBucket({ ...base, intervalMs: null })).toBe('idle')
  })
})

describe('buildHeartbeat', () => {
  it('builds 48 buckets for a day with unknown before orbit started', () => {
    const now = 48 * 30 * 60_000
    const row: LaunchdRow = { component: 'worker', label: 'com.example.job', role: 'scheduled', schedule: { intervalS: 3_600, calendar: false, keepAlive: false } }
    const history = {
      observations: [obs(now - 3 * H, 1, 0), obs(now - 2 * H + 60_000, 2, 0)],
      runs: [{ started: now - 4 * H, stopped: now }],
    }
    const buckets = buildHeartbeat(history, row, '24h', now)
    expect(buckets).toHaveLength(48)
    expect(buckets[0]?.state).toBe('unknown')
    expect(buckets.at(-4)?.state).toBe('ok')
    expect(buckets.at(-1)?.state).toBe('missed')
  })
  it('marks missed even when orbit never saw the job run', () => {
    const now = 48 * 30 * 60_000
    const row: LaunchdRow = { component: 'worker', label: 'com.example.job', role: 'scheduled', schedule: { intervalS: 3_600, calendar: false, keepAlive: false } }
    const history = { observations: [obs(now - 5 * H, 3, 0)], runs: [{ started: now - 6 * H, stopped: now }] }
    expect(buildHeartbeat(history, row, '24h', now).at(-1)?.state).toBe('missed')
  })
})
```

`apps/web/src/validators/validateSystemSearch.test.ts`:

```ts
import { validateSystemSearch } from './validateSystemSearch'

describe('validateSystemSearch', () => {
  it('keeps a known range and defaults the rest', () => {
    expect(validateSystemSearch({ range: '7d' })).toEqual({ range: '7d' })
    expect(validateSystemSearch({ range: '1y' })).toEqual({ range: '24h' })
    expect(validateSystemSearch({})).toEqual({ range: '24h' })
  })
})
```

`apps/web/src/formatters/systemFormatters.test.ts`:

```ts
import { formatJobState } from './formatJobState'
import { formatSchedule } from './formatSchedule'

const row = { component: 'worker' as const, label: 'com.example.job', role: 'scheduled' as const }

describe('system formatters', () => {
  it('describes a schedule', () => {
    expect(formatSchedule({ ...row, schedule: { intervalS: 3_600, calendar: false, keepAlive: false } })).toBe('every 1h')
    expect(formatSchedule({ ...row, schedule: { intervalS: 86_400, calendar: true, keepAlive: false } })).toBe('calendar')
    expect(formatSchedule({ ...row, role: 'keepalive', schedule: { intervalS: null, calendar: false, keepAlive: true } })).toBe('kept alive')
    expect(formatSchedule({ ...row, schedule: null })).toBe('schedule unknown')
  })
  it('describes the current job state', () => {
    expect(formatJobState(null)).toBe('no reading yet')
    expect(formatJobState({ label: 'x', at: 1, runs: 3, lastExit: 0, pid: 42 })).toBe('running, pid 42')
    expect(formatJobState({ label: 'x', at: 1, runs: 3, lastExit: 0, pid: null })).toBe('last exit 0')
    expect(formatJobState({ label: 'x', at: 1, runs: 0, lastExit: null, pid: null })).toBe('never exited')
  })
})
```

`apps/web/src/screens/system/SystemScreen.test.tsx`:

```tsx
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'

const rows = [
  { component: 'worker', label: 'com.example.job', role: 'scheduled', schedule: { intervalS: 3_600, calendar: false, keepAlive: false } },
]
const history = {
  observations: [{ label: 'com.example.job', at: Date.now() - 60_000, runs: 4, lastExit: 78, pid: null }],
  runs: [{ started: Date.now() - 2 * 3_600_000, stopped: Date.now() }],
}

describe('SystemScreen', () => {
  it('shows each label with schedule, state and heartbeat', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) =>
        input === '/api/launchd'
          ? Response.json({ rows })
          : input.startsWith('/api/launchd/history?label=com.example.job&range=')
            ? Response.json(history)
            : new Response(null, { status: 200 }),
      ),
    )
    const { container, router } = await renderAt('/system')
    expect(await screen.findByRole('heading', { name: 'com.example.job' })).toBeInTheDocument()
    expect(screen.getByText('every 1h')).toBeInTheDocument()
    expect(await screen.findByText('last exit 78')).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: /com\.example\.job, last 24 hours: .*failed/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '7 days' }))
    await waitFor(() => expect(router.state.location.search).toEqual({ range: '7d' }))
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toHaveLength(0)
  })
  it('says when no labels are registered', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ rows: [] })))
    await renderAt('/system')
    expect(await screen.findByText(/No launchd labels are registered/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run them to see them fail** — FAIL.

- [ ] **Step 3: Schemas and types**

`apps/web/src/schemas/launchdRowsSchema.ts`:

```ts
import { COMPONENT_IDS } from '@orbit/contract'
import { z } from 'zod'

export const launchdRowsSchema = z.object({
  rows: z.array(
    z.object({
      component: z.enum(COMPONENT_IDS),
      label: z.string(),
      role: z.enum(['scheduled', 'keepalive']),
      schedule: z
        .object({ intervalS: z.number().nullable(), calendar: z.boolean(), keepAlive: z.boolean() })
        .nullable(),
    }),
  ),
})
```

`apps/web/src/schemas/launchdHistorySchema.ts`:

```ts
import { z } from 'zod'

export const launchdHistorySchema = z.object({
  observations: z.array(
    z.object({
      label: z.string(),
      at: z.number(),
      pid: z.number().nullable(),
      runs: z.number().nullable(),
      lastExit: z.number().nullable(),
    }),
  ),
  runs: z.array(z.object({ started: z.number(), stopped: z.number() })),
})
```

Types, one file each:

```ts
// LaunchdRow.ts
import type { z } from 'zod'

import type { launchdRowsSchema } from '../schemas/launchdRowsSchema'

export type LaunchdRow = z.infer<typeof launchdRowsSchema>['rows'][number]
```

```ts
// LaunchdHistory.ts
import type { z } from 'zod'

import type { launchdHistorySchema } from '../schemas/launchdHistorySchema'

export type LaunchdHistory = z.infer<typeof launchdHistorySchema>
```

```ts
// LaunchdObservation.ts
import type { LaunchdHistory } from './LaunchdHistory'

export type LaunchdObservation = LaunchdHistory['observations'][number]
```

```ts
// HistoryRange.ts
export type HistoryRange = '24h' | '7d' | '30d'
```

```ts
// SystemSearch.ts
import type { HistoryRange } from './HistoryRange'

export type SystemSearch = { readonly range: HistoryRange }
```

```ts
// BucketState.ts
export type BucketState = 'unknown' | 'failed' | 'ok' | 'missed' | 'idle'
```

```ts
// Bucket.ts
import type { BucketState } from './BucketState'

export type Bucket = { readonly start: number; readonly end: number; readonly state: BucketState }
```

```ts
// BucketInput.ts
import type { LaunchdObservation } from './LaunchdObservation'
import type { LaunchdRow } from './LaunchdRow'

export type BucketInput = {
  readonly covered: boolean
  readonly role: LaunchdRow['role']
  readonly intervalMs: number | null
  readonly inBucket: readonly LaunchdObservation[]
  readonly atEnd: LaunchdObservation | null
  readonly runInBucket: boolean
  readonly missWindow: { readonly watched: boolean; readonly ran: boolean } | null
}
```

```ts
// RangeSpec.ts
export type RangeSpec = { readonly spanMs: number; readonly buckets: number; readonly label: string }
```

```ts
// SystemModel.ts
import type { HistoryRange } from './HistoryRange'
import type { LaunchdRow } from './LaunchdRow'

export type SystemModel = {
  readonly rows: readonly LaunchdRow[] | null
  readonly failed: boolean
  readonly range: HistoryRange
  readonly setRange: (range: HistoryRange) => void
  readonly isPhone: boolean
}
```

```ts
// LaunchdRowModel.ts
import type { Bucket } from './Bucket'

export type LaunchdRowModel = { readonly buckets: readonly Bucket[] | null; readonly state: string; readonly summary: string }
```

```ts
// RangePickerProps.ts
import type { HistoryRange } from './HistoryRange'

export type RangePickerProps = { readonly range: HistoryRange; readonly onChange: (range: HistoryRange) => void }
```

```ts
// LaunchdRowViewProps.ts
import type { HistoryRange } from './HistoryRange'
import type { LaunchdRow } from './LaunchdRow'

export type LaunchdRowViewProps = { readonly row: LaunchdRow; readonly range: HistoryRange }
```

```ts
// HeartbeatStripProps.ts
import type { Bucket } from './Bucket'

export type HeartbeatStripProps = { readonly buckets: readonly Bucket[]; readonly summary: string }
```

- [ ] **Step 4: Heartbeat logic**

`apps/web/src/heartbeat/rangeSpecs.ts`:

```ts
import type { HistoryRange } from '../types/HistoryRange'
import type { RangeSpec } from '../types/RangeSpec'

export const RANGE_SPECS: Record<HistoryRange, RangeSpec> = {
  '24h': { spanMs: 86_400_000, buckets: 48, label: '24 hours' },
  '7d': { spanMs: 7 * 86_400_000, buckets: 84, label: '7 days' },
  '30d': { spanMs: 30 * 86_400_000, buckets: 90, label: '30 days' },
}
```

`apps/web/src/heartbeat/isCovered.ts`:

```ts
import type { LaunchdHistory } from '../types/LaunchdHistory'

export const isCovered = (runs: LaunchdHistory['runs'], start: number, end: number): boolean => {
  let reached = start
  for (const run of [...runs].sort((a, b) => a.started - b.started)) {
    if (run.started > reached) return false
    reached = Math.max(reached, run.stopped + 90_000)
    if (reached >= end) return true
  }
  return false
}
```

`apps/web/src/heartbeat/listRunTimes.ts`:

```ts
import type { LaunchdObservation } from '../types/LaunchdObservation'

export const listRunTimes = (observations: readonly LaunchdObservation[]): number[] =>
  observations.flatMap((observation, index) => {
    const before = observations[index - 1]?.runs ?? null
    return before !== null && observation.runs !== null && observation.runs > before ? [observation.at] : []
  })
```

A counter that drops (the job was reloaded) is not a run; the next increase from the new base is.

`apps/web/src/heartbeat/isMissed.ts`:

```ts
import type { BucketInput } from '../types/BucketInput'

export const isMissed = (input: BucketInput): boolean =>
  input.missWindow !== null && input.missWindow.watched && !input.missWindow.ran
```

`apps/web/src/heartbeat/missWindowFor.ts` (the window is the 1.5 intervals ending at the bucket's end, clipped to now):

```ts
import type { BucketInput } from '../types/BucketInput'
import type { LaunchdHistory } from '../types/LaunchdHistory'
import { isCovered } from './isCovered'

export const missWindowFor = (
  history: LaunchdHistory,
  runTimes: readonly number[],
  intervalMs: number | null,
  end: number,
): BucketInput['missWindow'] => {
  if (intervalMs === null) return null
  const start = end - 1.5 * intervalMs
  const baseline = history.observations.some((o) => o.at <= start && o.runs !== null)
  return {
    watched: baseline && isCovered(history.runs, start, end),
    ran: runTimes.some((at) => at > start && at <= end),
  }
}
```

`apps/web/src/heartbeat/classifyBucket.ts`:

```ts
import type { BucketInput } from '../types/BucketInput'
import type { BucketState } from '../types/BucketState'
import { isMissed } from './isMissed'

export const classifyBucket = (input: BucketInput): BucketState => {
  if (!input.covered) return 'unknown'
  const exits = [...input.inBucket, input.atEnd].map((o) => o?.lastExit ?? 0)
  if (exits.some((code) => code !== 0)) return 'failed'
  if (input.role === 'keepalive') return (input.atEnd?.pid ?? null) === null ? 'failed' : 'ok'
  if (input.runInBucket) return 'ok'
  return isMissed(input) ? 'missed' : 'idle'
}
```

`apps/web/src/heartbeat/buildHeartbeat.ts`:

```ts
import type { Bucket } from '../types/Bucket'
import type { HistoryRange } from '../types/HistoryRange'
import type { LaunchdHistory } from '../types/LaunchdHistory'
import type { LaunchdRow } from '../types/LaunchdRow'
import { classifyBucket } from './classifyBucket'
import { isCovered } from './isCovered'
import { listRunTimes } from './listRunTimes'
import { missWindowFor } from './missWindowFor'
import { RANGE_SPECS } from './rangeSpecs'

export const buildHeartbeat = (history: LaunchdHistory, row: LaunchdRow, range: HistoryRange, now: number): Bucket[] => {
  const { spanMs, buckets } = RANGE_SPECS[range]
  const width = spanMs / buckets
  const first = now - spanMs
  const runTimes = listRunTimes(history.observations)
  const intervalS = row.schedule?.intervalS ?? null
  const intervalMs = intervalS === null ? null : intervalS * 1000
  return Array.from({ length: buckets }, (_, index) => {
    const start = first + index * width
    const end = start + width
    const state = classifyBucket({
      covered: isCovered(history.runs, start, Math.min(end, now)),
      role: row.role,
      intervalMs,
      inBucket: history.observations.filter((o) => o.at >= start && o.at < end),
      atEnd: history.observations.findLast((o) => o.at < end) ?? null,
      runInBucket: runTimes.some((at) => at >= start && at < end),
      missWindow: missWindowFor(history, runTimes, intervalMs, Math.min(end, now)),
    })
    return { start, end, state }
  })
}
```

- [ ] **Step 5: Validator, formatters, labels**

`apps/web/src/validators/validateSystemSearch.ts`:

```ts
import type { HistoryRange } from '../types/HistoryRange'
import type { SystemSearch } from '../types/SystemSearch'

export const validateSystemSearch = (search: Record<string, unknown>): SystemSearch => {
  const ranges: readonly unknown[] = ['24h', '7d', '30d']
  return { range: ranges.includes(search['range']) ? (search['range'] as HistoryRange) : '24h' }
}
```

`apps/web/src/formatters/formatSchedule.ts`:

```ts
import type { LaunchdRow } from '../types/LaunchdRow'
import { formatDuration } from './formatDuration'

export const formatSchedule = (row: LaunchdRow): string => {
  const schedule = row.schedule
  if (schedule === null) return 'schedule unknown'
  if (schedule.calendar) return 'calendar'
  if (schedule.intervalS !== null) return `every ${formatDuration(schedule.intervalS * 1000)}`
  return schedule.keepAlive ? 'kept alive' : 'on demand'
}
```

`apps/web/src/formatters/formatJobState.ts`:

```ts
import type { LaunchdObservation } from '../types/LaunchdObservation'

export const formatJobState = (observation: LaunchdObservation | null): string => {
  if (observation === null) return 'no reading yet'
  if (observation.pid !== null) return `running, pid ${observation.pid}`
  return observation.lastExit === null ? 'never exited' : `last exit ${observation.lastExit}`
}
```

`apps/web/src/labels/bucketLabels.ts`:

```ts
import type { BucketState } from '../types/BucketState'

export const BUCKET_LABELS: Record<BucketState, string> = {
  unknown: 'not observed',
  failed: 'failed',
  ok: 'ran',
  missed: 'missed',
  idle: 'idle',
}
```

- [ ] **Step 6: Hooks**

`apps/web/src/hooks/useSystemModel.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { apiJson } from '../api/apiJson'
import { launchdRowsSchema } from '../schemas/launchdRowsSchema'
import type { SystemModel } from '../types/SystemModel'
import { validateSystemSearch } from '../validators/validateSystemSearch'
import { useMediaQuery } from './useMediaQuery'

export const useSystemModel = (): SystemModel => {
  const { range } = validateSystemSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const query = useQuery({
    queryKey: ['launchd-rows'],
    queryFn: () => apiJson('/api/launchd', launchdRowsSchema),
    refetchInterval: 60_000,
  })
  return {
    rows: query.data?.rows ?? null,
    failed: query.isError,
    range,
    setRange: (next) => void navigate({ to: '/system', search: { range: next } }),
    isPhone,
  }
}
```

`apps/web/src/hooks/useLaunchdRowModel.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { apiJson } from '../api/apiJson'
import { formatJobState } from '../formatters/formatJobState'
import { buildHeartbeat } from '../heartbeat/buildHeartbeat'
import { RANGE_SPECS } from '../heartbeat/rangeSpecs'
import { BUCKET_LABELS } from '../labels/bucketLabels'
import { launchdHistorySchema } from '../schemas/launchdHistorySchema'
import type { HistoryRange } from '../types/HistoryRange'
import type { LaunchdRow } from '../types/LaunchdRow'
import type { LaunchdRowModel } from '../types/LaunchdRowModel'
import { useNow } from './useNow'

export const useLaunchdRowModel = (row: LaunchdRow, range: HistoryRange): LaunchdRowModel => {
  const now = useNow(60_000)
  const query = useQuery({
    queryKey: ['launchd-history', row.label, range],
    queryFn: () =>
      apiJson(`/api/launchd/history?label=${encodeURIComponent(row.label)}&range=${range}`, launchdHistorySchema),
    refetchInterval: 60_000,
  })
  return useMemo(() => {
    if (query.data === undefined) return { buckets: null, state: query.isError ? 'history unavailable' : 'loading', summary: '' }
    const buckets = buildHeartbeat(query.data, row, range, now)
    const counts = (['failed', 'missed', 'unknown'] as const)
      .map((state) => [state, buckets.filter((b) => b.state === state).length] as const)
      .filter(([, n]) => n > 0)
      .map(([state, n]) => `${n} ${BUCKET_LABELS[state]}`)
    const summary = `${row.label}, last ${RANGE_SPECS[range].label}: ${counts.length === 0 ? 'all healthy' : counts.join(', ')}`
    return { buckets, state: formatJobState(query.data.observations.at(-1) ?? null), summary }
  }, [query.data, query.isError, row, range, now])
}
```

If `max-lines-per-function` or `complexity` flags the memo body, move it to `apps/web/src/selectors/selectRowModel.ts` (`selectRowModel(history, row, range, now): LaunchdRowModel`) and call it from the hook.

- [ ] **Step 7: Views**

`apps/web/src/screens/system/HeartbeatStrip.tsx`:

```tsx
import { formatClock } from '../../formatters/formatClock'
import { BUCKET_LABELS } from '../../labels/bucketLabels'
import type { HeartbeatStripProps } from '../../types/HeartbeatStripProps'

export const HeartbeatStrip = ({ buckets, summary }: HeartbeatStripProps) => (
  <svg role="img" aria-label={summary} viewBox={`0 0 ${buckets.length * 6} 24`} preserveAspectRatio="none" className="h-6 w-full">
    {buckets.map((bucket, index) => (
      <rect
        key={bucket.start}
        x={index * 6}
        width={4}
        height={24}
        rx={1}
        data-state={bucket.state}
        className="fill-unknown/40 data-[state=failed]:fill-down data-[state=idle]:fill-line data-[state=missed]:fill-warn data-[state=ok]:fill-ok"
      >
        <title>{`${formatClock(new Date(bucket.start).toISOString())}: ${BUCKET_LABELS[bucket.state]}`}</title>
      </rect>
    ))}
  </svg>
)
```

`apps/web/src/screens/system/LaunchdRowView.tsx`:

```tsx
import { formatSchedule } from '../../formatters/formatSchedule'
import { useLaunchdRowModel } from '../../hooks/useLaunchdRowModel'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import type { LaunchdRowViewProps } from '../../types/LaunchdRowViewProps'
import { HeartbeatStrip } from './HeartbeatStrip'

export const LaunchdRowView = ({ row, range }: LaunchdRowViewProps) => {
  const model = useLaunchdRowModel(row, range)
  return (
    <li className="space-y-2 rounded-xl border border-line bg-panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-sm">{row.label}</h2>
        <span className="text-xs text-muted">
          {COMPONENT_LABELS[row.component]} · {row.role} · <span>{formatSchedule(row)}</span> · <span>{model.state}</span>
        </span>
      </div>
      {model.buckets !== null && <HeartbeatStrip buckets={model.buckets} summary={model.summary} />}
    </li>
  )
}
```

`apps/web/src/screens/system/RangePicker.tsx`:

```tsx
import { RANGE_SPECS } from '../../heartbeat/rangeSpecs'
import type { HistoryRange } from '../../types/HistoryRange'
import type { RangePickerProps } from '../../types/RangePickerProps'

export const RangePicker = ({ range, onChange }: RangePickerProps) => (
  <div role="group" aria-label="Range" className="flex gap-1 rounded-lg border border-line p-1">
    {(Object.keys(RANGE_SPECS) as HistoryRange[]).map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={option === range}
        onClick={() => onChange(option)}
        className="rounded-md px-3 py-1 text-sm text-muted aria-pressed:bg-panel aria-pressed:text-ink"
      >
        {RANGE_SPECS[option].label}
      </button>
    ))}
  </div>
)
```

`apps/web/src/screens/system/SystemScreen.tsx`:

```tsx
import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useSystemModel } from '../../hooks/useSystemModel'
import { LaunchdRowView } from './LaunchdRowView'
import { RangePicker } from './RangePicker'

export const SystemScreen = () => {
  const model = useSystemModel()
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">System</h1>
        {model.isPhone && <ConnectionIndicator />}
        <RangePicker range={model.range} onChange={model.setRange} />
      </header>
      {model.failed && <p role="alert">Could not read the launchd catalog.</p>}
      {model.rows?.length === 0 && (
        <p className="text-muted">No launchd labels are registered. Add them to launchd.labels in orbit.json.</p>
      )}
      <ul className="space-y-3">
        {(model.rows ?? []).map((row) => (
          <LaunchdRowView key={row.label} row={row} range={model.range} />
        ))}
      </ul>
    </main>
  )
}
```

- [ ] **Step 8: Route**

`apps/web/src/router/systemRoute.ts`:

```ts
import { createRoute } from '@tanstack/react-router'

import { SystemScreen } from '../screens/system/SystemScreen'
import { validateSystemSearch } from '../validators/validateSystemSearch'
import { shellRoute } from './shellRoute'

export const systemRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/system',
  validateSearch: validateSystemSearch,
  component: SystemScreen,
})
```

`apps/web/src/router/routeTree.ts`:

```ts
import { homeRoute } from './homeRoute'
import { loginRoute } from './loginRoute'
import { pairRoute } from './pairRoute'
import { rootRoute } from './rootRoute'
import { shellRoute } from './shellRoute'
import { systemRoute } from './systemRoute'

export const routeTree = rootRoute.addChildren([
  loginRoute,
  pairRoute,
  shellRoute.addChildren([homeRoute, systemRoute]),
])
```

`NavItem['to']` already includes `/system`; with the search validator, `Link to="/system"` needs no search (the validator defaults it). If TypeScript demands `search` on those links, pass `search={{ range: '24h' }}` for the System item in `NavRail`, `TabBar` and the palette.

- [ ] **Step 9: Run tests and the package gate** — PASS.

- [ ] **Step 10: Commit and push**

```bash
git add apps/web
git commit -m "feat(web): system screen with launchd heartbeat strips"
pnpm gate && git push
```

---
### Task 24: End-to-end suite

The suite runs the real bundle (`node apps/server/dist/orbit.mjs serve`) against a throwaway instance in `e2e/.tmp/`, with a fake `launchctl` that prints the Task 14 fixture texts and real `/usr/bin/plutil` reading fixture plists. This is the acceptance check for spec sections 6 and 7: login, pairing, one component failing alone, heartbeat strips, accessibility in both colour schemes, reduced motion and the Host allowlist.

**Files:**
- Create: `e2e/playwright.config.ts`, `e2e/globalSetup.ts`, `e2e/support/paths.ts`, `e2e/support/signIn.ts`, `e2e/support/runOrbit.ts`
- Create: `e2e/fixtures/bin/launchctl.mjs`, `e2e/fixtures/plists/com.example.worker.serve.plist`, `e2e/fixtures/plists/com.example.nightly.plist`
- Create: `e2e/specs/login.spec.ts`, `pair.spec.ts`, `failure.spec.ts`, `system.spec.ts`, `a11y.spec.ts`, `motion.spec.ts`, `layout.spec.ts`, `host.spec.ts`
- Modify: root `package.json` (`gate` gains `&& pnpm e2e`), `.gitignore` (`e2e/.tmp/`, `test-results/`, `playwright-report/`)

**Interfaces:**
- `E2E = { root, data, stateDir, port: 18790, baseURL: 'http://127.0.0.1:18790' }` from `e2e/support/paths.ts`.
- `signIn(page): Promise<void>` — logs in with the token written by global setup.
- `runOrbit(args): Promise<string>` — runs the CLI against the e2e instance and returns stdout.

- [ ] **Step 1: Fixtures**

`e2e/fixtures/bin/launchctl.mjs` (mode 755; prints a Task 14 fixture for a known label, exits 113 like `launchctl` for an unknown one):

```js
#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const fixtures = join(import.meta.dirname, '../../../apps/server/src/adapters/launchd/fixtures')
const byLabel = { 'com.example.worker.serve': 'running.txt', 'com.example.nightly': 'failed.txt' }
const label = (process.argv[3] ?? '').split('/').at(-1) ?? ''
const file = byLabel[label]
if (process.argv[2] !== 'print' || file === undefined) {
  process.stderr.write('Could not find service\n')
  process.exit(113)
}
process.stdout.write(readFileSync(join(fixtures, file), 'utf8'))
```

`e2e/fixtures/plists/com.example.worker.serve.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.example.worker.serve</string>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
```

`e2e/fixtures/plists/com.example.nightly.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.example.nightly</string>
  <key>StartInterval</key>
  <integer>3600</integer>
</dict>
</plist>
```

- [ ] **Step 2: Support files and global setup**

`e2e/support/paths.ts`:

```ts
import { join } from 'node:path'

const root = join(import.meta.dirname, '..', '.tmp')

export const E2E = {
  root,
  data: join(root, 'instance'),
  stateDir: join(root, 'instance', 'orbit'),
  port: 18_790,
  baseURL: 'http://127.0.0.1:18790',
  bundle: join(import.meta.dirname, '..', '..', 'apps', 'server', 'dist', 'orbit.mjs'),
  fixtures: join(import.meta.dirname, '..', 'fixtures'),
} as const
```

`e2e/support/runOrbit.ts`:

```ts
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { E2E } from './paths'

export const runOrbit = async (args: readonly string[]): Promise<string> => {
  const { stdout } = await promisify(execFile)(process.execPath, [E2E.bundle, ...args], {
    env: { PATH: process.env['PATH'] ?? '', HOME: process.env['HOME'] ?? '', SYNTOPICA_DATA: E2E.data },
  })
  return stdout
}
```

`e2e/support/signIn.ts`:

```ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Page } from '@playwright/test'

import { E2E } from './paths'

export const signIn = async (page: Page): Promise<void> => {
  await page.goto('/login')
  await page.getByLabel('Admin token').fill(readFileSync(join(E2E.root, 'token'), 'utf8').trim())
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/')
}
```

`e2e/globalSetup.ts`:

```ts
import { spawn } from 'node:child_process'
import { chmod, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { E2E } from './support/paths'
import { runOrbit } from './support/runOrbit'

const waitForServer = async (): Promise<void> => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const up = await fetch(`${E2E.baseURL}/api/snapshots`).then(() => true, () => false)
    if (up) return
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error('orbit did not start')
}

export default async function globalSetup(): Promise<() => Promise<void>> {
  await rm(E2E.root, { recursive: true, force: true })
  await mkdir(E2E.stateDir, { recursive: true, mode: 0o700 })
  const launchctl = join(E2E.fixtures, 'bin', 'launchctl.mjs')
  await chmod(launchctl, 0o755)
  await writeFile(join(E2E.data, 'syntopica.config.json'), JSON.stringify({ schemaVersion: 1 }))
  const plist = (label: string) => join(E2E.fixtures, 'plists', `${label}.plist`)
  await writeFile(
    join(E2E.stateDir, 'orbit.json'),
    JSON.stringify({
      port: E2E.port,
      synthetic: true,
      allowedHosts: ['orbit.example.ts.net'],
      allowedLogins: ['owner@example.com'],
      launchd: {
        launchctl,
        labels: [
          { component: 'worker', label: 'com.example.worker.serve', role: 'keepalive', plist: plist('com.example.worker.serve') },
          { component: 'launchd', label: 'com.example.nightly', role: 'scheduled', plist: plist('com.example.nightly') },
        ],
      },
    }),
  )
  const token = (await runOrbit(['token', 'create'])).split('\n').find((line) => /^[\w-]{43}$/.test(line)) ?? ''
  await writeFile(join(E2E.root, 'token'), token)
  const server = spawn(process.execPath, [E2E.bundle, 'serve'], {
    env: { PATH: process.env['PATH'] ?? '', HOME: process.env['HOME'] ?? '', SYNTOPICA_DATA: E2E.data },
    detached: true,
    stdio: 'ignore',
  })
  await waitForServer()
  return async () => {
    if (server.pid !== undefined) process.kill(-server.pid, 'SIGTERM')
  }
}
```

The `launchd` label entries put `worker`'s keepalive under the `worker` component and the nightly job under `launchd`; both are read by the launchd adapter, which summarises every registered label. No `worker` block is configured, so there is no worker adapter: the suite never needs a coordinator.

`e2e/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './specs',
  globalSetup: './globalSetup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:18790', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

One worker: the failure spec flips a flag on the shared instance, and parallel specs would see it.

- [ ] **Step 3: Specs**

`e2e/specs/login.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('signs in and shows live satellites', async ({ page }) => {
  await signIn(page)
  await expect(page.getByRole('status', { name: 'Connection' }).first()).toHaveText('Live')
  await expect(page.getByRole('img', { name: /^Synthetic probe: Healthy/ })).toBeVisible()
  await expect(page.getByRole('img', { name: /^Scheduled jobs:/ })).toBeVisible()
})

test('rejects a wrong token', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Admin token').fill('wrong')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toHaveText('Token rejected')
})

test('sends a signed-out visitor to login', async ({ page }) => {
  await page.goto('/')
  await page.waitForURL('/login')
})
```

`e2e/specs/pair.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

import { runOrbit } from '../support/runOrbit'

test('pairs a device once from the printed link', async ({ page, browser }) => {
  const output = await runOrbit(['pair'])
  const link = /https:\/\/orbit\.example\.ts\.net(\/pair#\S+)/.exec(output)?.[1] ?? ''
  await page.goto(link)
  await page.waitForURL('/')
  await expect(page).not.toHaveURL(/#/)
  const second = await browser.newPage()
  await second.goto(link)
  await expect(second.getByRole('alert')).toContainText('expired or already used')
})
```

`e2e/specs/failure.spec.ts`:

```ts
import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { expect, test } from '@playwright/test'

import { E2E } from '../support/paths'
import { signIn } from '../support/signIn'

const flag = join(E2E.stateDir, 'synthetic-fail')

test.afterEach(async () => rm(flag, { force: true }))

test('one failing component goes down alone and recovers', async ({ page }) => {
  await signIn(page)
  await expect(page.getByRole('img', { name: /^Synthetic probe: Healthy/ })).toBeVisible()
  await writeFile(flag, '')
  await expect(page.getByRole('img', { name: /^Synthetic probe: Down/ })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('alert').filter({ hasText: 'Synthetic probe is down' })).toBeVisible()
  await expect(page.getByRole('img', { name: /^Scheduled jobs: Down/ })).toHaveCount(0)
  await rm(flag)
  await expect(page.getByRole('img', { name: /^Synthetic probe: Healthy/ })).toBeVisible({ timeout: 10_000 })
})
```

`e2e/specs/system.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('lists registered labels with heartbeat strips and a URL range', async ({ page }) => {
  await signIn(page)
  await page.getByRole('link', { name: 'System' }).first().click()
  await expect(page.getByRole('heading', { name: 'com.example.worker.serve' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'com.example.nightly' })).toBeVisible()
  await expect(page.getByText('every 1h')).toBeVisible()
  await expect(page.getByRole('img', { name: /com\.example\.nightly, last 24 hours/ })).toBeVisible()
  await page.getByRole('button', { name: '30 days' }).click()
  await expect(page).toHaveURL(/range=30d/)
  await expect(page.getByRole('img', { name: /com\.example\.nightly, last 30 days/ })).toBeVisible()
})
```

`e2e/specs/a11y.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

for (const colorScheme of ['dark', 'light'] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme })

    test('login, orbit and system have no axe violations', async ({ page }) => {
      await page.goto('/login')
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await signIn(page)
      await expect(page.getByRole('img', { name: /^Synthetic probe/ })).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.goto('/system')
      await expect(page.getByRole('heading', { name: 'com.example.nightly' })).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    })
  })
}
```

`e2e/specs/motion.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test.use({ reducedMotion: 'reduce' })

test('runs no animation when reduced motion is requested', async ({ page }) => {
  await signIn(page)
  await expect(page.getByRole('img', { name: /^Synthetic probe/ })).toBeVisible()
  await page.waitForTimeout(2_500)
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  expect(await page.locator('[data-pulse]').count()).toBe(0)
})
```

`e2e/specs/layout.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test.use({ viewport: { width: 390, height: 844 } })

test('a phone gets the list and the tab bar', async ({ page }) => {
  await signIn(page)
  await expect(page.getByRole('listitem', { name: /^Synthetic probe:/ })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Tabs' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
```

`e2e/specs/host.spec.ts` (raw `node:http`, because `fetch` will not send a forged `Host`):

```ts
import { request } from 'node:http'

import { expect, test } from '@playwright/test'

import { E2E } from '../support/paths'

const statusFor = (host: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port: E2E.port, path: '/api/snapshots', headers: { Host: host } }, (res) => {
      res.resume()
      resolve(res.statusCode ?? 0)
    })
    req.on('error', reject)
    req.end()
  })

test('refuses a request for a host it does not serve', async () => {
  expect(await statusFor('evil.example')).toBe(421)
  expect(await statusFor('orbit.example.ts.net')).toBe(401)
  expect(await statusFor(`127.0.0.1:${E2E.port}`)).toBe(401)
})
```

- [ ] **Step 4: Run the suite**

```bash
pnpm e2e
```

Expected: 11 tests pass. Two things this run settles and the executor must confirm rather than assume:
- Chromium accepts the `__Host-orbit_session` cookie (`Secure`) from `http://127.0.0.1`, which it treats as a trustworthy origin. If it does not, switch `baseURL` and `E2E.baseURL` to `http://localhost:18790` (also allowed by the Host guard) and re-run; do not weaken the cookie.
- The `host.spec` request with `Host: orbit.example.ts.net` and no `Tailscale-User-Login` reaches the session check (401). If the guard answers 403 instead, the spec expectation is wrong for the implemented rule (spec 6.2: a tailnet host without an allowed login is refused) — change the expectation to 403 and note it in the commit.

- [ ] **Step 5: Restore e2e in the gate, commit, push**

Root `package.json`: `"gate": "pnpm -r --workspace-concurrency=1 run gate:pkg && pnpm format:check && pnpm secrets:check && pnpm e2e"`.

```bash
pnpm gate
git add e2e package.json .gitignore
git commit -m "test: end-to-end suite for login, pairing, failure isolation, system and accessibility"
git push
```

---

### Task 25: Spec deltas and final pass

**Files:**
- Modify: `docs/superpowers/specs/2026-10-01-orbit-design.md`, `README.md`

- [ ] **Step 1: Record what this plan decided differently from spec revision 4**

Add a "Revision 5 (implementation of sub-project 0)" note at the top of the spec's change log and apply each change in its section:

1. Section 9 / 13: launchd heartbeat strips are SVG rectangles, not uPlot. uPlot stays the choice for dense metric charts in later sub-projects.
2. Section 8: launchd observations are kept 30 days (they are written only on change, and the System screen's longest range is 30 days); metric samples stay at 7 days.
3. Section 6.4: the SSE heartbeat is a named `ping` event every 15 s, not a comment line, so the client watchdog can see it.
4. Section 5.3: the engine command table in `orbit.json` is deferred to sub-project 1, where the first engine CLIs (atrium, brain, clips) are read; sub-project 0 runs only `launchctl` and `plutil`, with paths in `launchd.launchctl` and `launchd.plutil`.
5. Section 11: the Vite dev server proxies `/api` to the running server and rewrites `Origin` to the server's own origin, because the server accepts only its own origins.
6. Section 9: bucket states and their precedence exactly as Task 23 defines them (`unknown`, `failed`, `ok`, `missed`, `idle`; ranges 48 × 30 min, 84 × 2 h, 90 × 8 h).

- [ ] **Step 2: README**

Under "Run it" (Task 18), add a "Develop" section:

````markdown
## Develop

```bash
pnpm install
pnpm --filter @orbit/server build && SYNTOPICA_DATA=/path/to/instance node apps/server/dist/orbit.mjs serve
pnpm --filter @orbit/web dev      # http://localhost:5173, /api proxied to 127.0.0.1:8790
pnpm gate                         # everything CI runs, including the Playwright suite
```
````

- [ ] **Step 3: Full gate, commit, push**

```bash
pnpm gate
git add docs README.md
git commit -m "docs: spec revision 5 records the sub-project 0 decisions"
git push
```

- [ ] **Step 4: Acceptance on the owner's machine** (not committed; instance data stays out of the repository)

With the owner present: write the real `orbit.json` under `SYNTOPICA_DATA/orbit/` (real labels, worker token file), `orbit token create`, `orbit doctor` (every line `ok` or an understood `warn`), install the LaunchAgent with `serve --print-plist`, configure `tailscale serve`, run Task 18 Step 5, pair the phone with `orbit pair`. Confirm on both devices: satellites live, a failing launchd job visible on System, a worker failure counted in Pending. Record the outcome in the private instance's TODO log, not in this repository.
