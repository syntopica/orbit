# orbit Memory adapters (sub-project 1a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring atrium, brain, clips and capture onto the Orbit home as live satellites, read through the engine surfaces that have landed, with no Memory screen yet.

**Architecture:** Sub-project 1 is split into three plans: **1a** (this plan) the engine command table and the four adapters; **1b** the Memory flow, Atrium and Clips screens; **1c** the Brain screen (WebGL graph, page view). 1a adds a generic engine runner (spec 5.3) that only runs the subcommands `orbit.json` lists, a JSON parser that accepts an engine document whatever the exit code, four adapters following the worker adapter's shape (`read` returns a `SnapshotCore`), and their contract keys and web labels. atrium is read from the two status files its jobs publish; `atrium doctor --json` is not polled (measured 114-188 s, 620-690 MB).

**Tech Stack:** Node 26, TypeScript, zod 4, Vitest 5, Playwright; existing `runProcess`, `buildChildEnv`, `ProcessError`, `readCappedText`.

**Spec:** `docs/superpowers/specs/2026-10-01-orbit-design.md` (sections 3.1, 3.2, 4, 5.1, 5.3, 6.6).

## Global Constraints

- Codeality strict (spec 11): one primary unit per file, `max-lines` 100 per production file and 200 per test file, `max-lines-per-function` 50, `complexity` 10, `--max-warnings 0`; never `eslint-disable`.
- Content never leaves an adapter (spec 6.6): snapshots carry counts, timestamps and closed codes only; no page ids, clip ids, titles, URLs or paths.
- Every engine document carries `"schemaVersion": 1`; any other major is `down` with `engine_schema_unsupported` (spec 4).
- Freshness (spec 3.1): capture cadence 120 s, freshness 240 s; atrium, brain, clips cadence 60 s, freshness 120 s; atrium index data is `stale` past 2 x the refresh interval.
- Not configured means absent; configured but unreadable means `down` with a reason code (spec 3.2).
- Subprocesses: `shell: false`, fixed argument lists, environment allowlist plus per-engine extras, 8 MB output cap (spec 5.3) — all already in `runProcess` and `buildChildEnv`.
- Public repository: fixtures and docs use placeholders only.
- Format per package (`pnpm exec prettier --write .` inside `apps/server`, `apps/web`, `packages/contract`) before `pnpm gate`; root and package Prettier configs order imports differently.

## Engine documents this plan reads

Shapes as landed (placeholder values). Parse only the fields listed; ignore the rest (`.passthrough()` is not needed: zod objects strip unknown keys by default, and these schemas must not be `.strict()` so engines can add fields).

- `brain lint --json` (brain bf94e87): `{ "schemaVersion": 1, "pageCount": 3, "indexStale": false, "issues": [{ "page": "<dir>/<page>", "code": "dangling_link" }] }`
- `brain doctor --json`: `{ "schemaVersion": 1, "ok": true, "checks": [{ "name": "paths", "ok": true, "code": "ok" }] }`
- `clips status --json` (clips 6a65e54): `{ "schemaVersion": 1, "generatedAt": "<iso>", "total": 100, "states": { "pending": 20, "synthesized": 0, "locally-stale": 0, "reconciliation-pending": 1, "reconciled": 75, "needs-claude": 4, "inconsistent": 0, "unreadable": 0 }, "oldestAt": { "pending": "<iso>|null", ... }, "intake": { "days": [{ "day": "2026-01-02", "count": 3 }], "undated": 0 } }`
- `clips doctor --json`: `{ "schemaVersion": 1, "ok": false, "checks": [{ "name": "archive", "ok": false, "code": "archive_public_remote" }] }`
- `<atrium state>/status/refresh.json` (atrium 6bef9e0): `{ "schemaVersion": 1, "writtenAt": "<iso>", "records": { "total": 3, "bySource": {...} }, "archive": { "at": "<iso>|null", ... }, "refresh": { "at": "<iso>|null", ... }, "content": { "at": "<iso>|null", ... }, "populations": [{ "model": "m", "listed": true, "records": 2, "episodes": 2, "intended": 2, "indexed": 1 }] }`
- `<atrium state>/status/synthesis.json`: `{ "schemaVersion": 1, "writtenAt": "<iso>", "lastPass": { "producer": "task", "startedAt": "<iso>", "finishedAt": "<iso>", "conversations": 2, "synthesized": 2, "skipped": 1, "failed": 0, "deferred": 1 } }`
- `GET <capture>/api/captures/count` with `Authorization: Bearer <token>` (capture 18bc65c): `{ "data": { "schemaVersion": 1, "count": 3, "oldestAt": "<iso>|null" } }`

Exit codes: brain's JSON modes exit 0; `clips status --json` exits 2 when a clip is inconsistent and `clips doctor --json` exits 1 when a check fails, with the document printed either way. The runner therefore judges a run by its stdout: a valid document is accepted whatever the exit code; otherwise a non-zero exit is `exit_nonzero` and a zero exit is `schema_invalid`.

## File structure

Contract (`packages/contract/src`): `metricKeys.ts`, `pendingKeys.ts` gain the new keys.

Server (`apps/server/src`):
- `engines/engineTableSchema.ts` — zod schema for `orbit.json` `engines`.
- `engines/resolveEngineCommand.ts` — command path to absolute executable, or `not_found`.
- `engines/createEngineRunner.ts` — runs one listed subcommand of one engine.
- `engines/sameArgs.ts` — exact argument-list equality.
- `engines/parseEngineDocument.ts` — stdout + exit code + schema to a typed document or a `ProcessError`.
- `engines/schemaVersionSchema.ts` — `{ schemaVersion: number }` probe.
- `engines/doctorDocumentSchema.ts` — shared `{ schemaVersion, ok, checks[] }` shape (brain and clips).
- `types/EngineRunner.ts`, `types/EngineTable.ts`, `types/ResolvedEngine.ts`.
- `adapters/brain/` — `brainLintSchema.ts`, `createBrainAdapter.ts`, `summarizeBrain.ts`.
- `adapters/clips/` — `clipsStatusSchema.ts`, `createClipsAdapter.ts`, `summarizeClips.ts`.
- `adapters/atrium/` — `atriumRefreshSchema.ts`, `atriumSynthesisSchema.ts`, `readStatusFile.ts`, `createAtriumAdapter.ts`, `summarizeAtrium.ts`.
- `adapters/capture/` — `captureCountSchema.ts`, `createCaptureAdapter.ts`.
- `adapters/buildAdapters.ts` (modify), `config/orbitConfigSchema.ts` (modify), `cli/checks/checkEngines.ts` (new), `cli/checks/doctorChecks.ts` (modify), `types/AdapterContext.ts` (modify).

Web (`apps/web/src`): `labels/metricLabels.ts`, `labels/pendingLabels.ts`, `screens/home/headlineMetrics.ts`.

E2E: `e2e/fixtures/bin/brain.mjs`, `e2e/fixtures/bin/clips.mjs`, `e2e/globalSetup.ts` (modify), `e2e/specs/memory.spec.ts`.

---

### Task 1: Contract keys and web labels

**Files:**
- Modify: `packages/contract/src/metricKeys.ts`, `packages/contract/src/pendingKeys.ts`
- Modify: `apps/web/src/labels/metricLabels.ts`, `apps/web/src/labels/pendingLabels.ts`, `apps/web/src/screens/home/headlineMetrics.ts`
- Test: `apps/web/src/labels/labels.test.ts` (existing, enforces a label per key)

**Interfaces:**
- Produces metric keys: `atrium.records`, `atrium.not_indexed`, `atrium.synth_deferred`, `atrium.synth_failed`, `brain.pages`, `brain.lint_issues`, `brain.doctor_failing`, `clips.total`, `clips.pending`, `clips.needs_claude`, `clips.intake_today`, `capture.undrained`.
- Produces pending keys: `atrium.not_indexed`, `brain.lint_issues`, `clips.pending`, `clips.needs_claude`, `capture.undrained`.

- [ ] **Step 1: Add the keys.** Append to `METRIC_KEYS` (before `'synthetic.value'`):

```ts
  'atrium.records',
  'atrium.not_indexed',
  'atrium.synth_deferred',
  'atrium.synth_failed',
  'brain.pages',
  'brain.lint_issues',
  'brain.doctor_failing',
  'clips.total',
  'clips.pending',
  'clips.needs_claude',
  'clips.intake_today',
  'capture.undrained',
```

and to `PENDING_KEYS` (before `'synthetic.items'`):

```ts
  'atrium.not_indexed',
  'brain.lint_issues',
  'clips.pending',
  'clips.needs_claude',
  'capture.undrained',
```

- [ ] **Step 2: Run the label test to see it fail.** `cd apps/web && pnpm vitest run src/labels` — Expected: FAIL in `names every id` (and a type error on the `Record` maps under `pnpm tsc --noEmit -p .`).

- [ ] **Step 3: Add the labels.** In `METRIC_LABELS`:

```ts
  'atrium.records': 'records',
  'atrium.not_indexed': 'not indexed',
  'atrium.synth_deferred': 'deferred by synthesis',
  'atrium.synth_failed': 'failed in synthesis',
  'brain.pages': 'pages',
  'brain.lint_issues': 'lint issues',
  'brain.doctor_failing': 'failing checks',
  'clips.total': 'clips',
  'clips.pending': 'pending',
  'clips.needs_claude': 'need review',
  'clips.intake_today': 'captured today',
  'capture.undrained': 'waiting',
```

In `PENDING_LABELS`:

```ts
  'atrium.not_indexed': 'records not indexed',
  'brain.lint_issues': 'lint issues',
  'clips.pending': 'clips pending',
  'clips.needs_claude': 'clips needing review',
  'capture.undrained': 'captures waiting',
```

In `HEADLINE_METRICS`:

```ts
  atrium: 'atrium.not_indexed',
  brain: 'brain.lint_issues',
  clips: 'clips.pending',
  capture: 'capture.undrained',
```

- [ ] **Step 4: Run.** `cd apps/web && pnpm vitest run src/labels && pnpm tsc --noEmit -p .` — Expected: PASS, no errors.

- [ ] **Step 5: Commit.** `git add packages/contract/src apps/web/src/labels apps/web/src/screens/home/headlineMetrics.ts && git commit -m "feat(contract): metric and pending keys for the memory components"`

---

### Task 2: Engine table, command resolution and runner

**Files:**
- Create: `apps/server/src/engines/engineTableSchema.ts`, `resolveEngineCommand.ts`, `sameArgs.ts`, `createEngineRunner.ts`
- Create: `apps/server/src/types/EngineTable.ts`, `ResolvedEngine.ts`, `EngineRunner.ts`
- Modify: `apps/server/src/config/orbitConfigSchema.ts`
- Test: `apps/server/src/engines/resolveEngineCommand.test.ts`, `createEngineRunner.test.ts`

**Interfaces:**
- Consumes: `InstanceConfig['engines']` (`Record<string, { path: string }>`, absolute checkout paths), `runProcess(request: RunRequest): Promise<RunResult>`, `buildChildEnv(source, extra)`.
- Produces:
  - `engineTableSchema` — `z.record(z.enum(['brain', 'clips']), { command: string, subcommands: string[][], env: Record<string,string> })`; `orbitConfigSchema.engines` defaults to `{}`.
  - `type EngineName = 'brain' | 'clips'`
  - `resolveEngineCommand(checkout: string, command: string): Promise<string>` — absolute path; throws `ProcessError('not_found')` when missing or not executable.
  - `type ResolvedEngine = { file: string; subcommands: readonly (readonly string[])[]; env: Readonly<Record<string, string>> }`
  - `type EngineRunner = (args: readonly string[], signal: AbortSignal) => Promise<RunResult>`
  - `createEngineRunner(engine: ResolvedEngine, run: (r: RunRequest) => Promise<RunResult>): EngineRunner` — refuses unlisted args with `ProcessError('check_failed')`, timeout 10 000 ms, `maxBytes` 8 MB.

- [ ] **Step 1: Write the failing tests.**

`resolveEngineCommand.test.ts`:

```ts
import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { resolveEngineCommand } from './resolveEngineCommand'

const checkout = async () => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-engine-'))
  await mkdir(join(dir, 'bin'))
  await writeFile(join(dir, 'bin', 'tool'), '#!/bin/sh\n')
  return dir
}

describe('resolveEngineCommand', () => {
  it('resolves a relative command inside the checkout', async () => {
    const dir = await checkout()
    await chmod(join(dir, 'bin', 'tool'), 0o755)
    expect(await resolveEngineCommand(dir, 'bin/tool')).toBe(
      join(dir, 'bin', 'tool'),
    )
  })
  it('keeps an absolute command', async () => {
    const dir = await checkout()
    await chmod(join(dir, 'bin', 'tool'), 0o755)
    const abs = join(dir, 'bin', 'tool')
    expect(await resolveEngineCommand('/elsewhere', abs)).toBe(abs)
  })
  it('reports a missing or non-executable command as not_found', async () => {
    const dir = await checkout()
    await expect(resolveEngineCommand(dir, 'bin/tool')).rejects.toMatchObject({
      reason: 'not_found',
    })
    await expect(resolveEngineCommand(dir, 'bin/none')).rejects.toMatchObject({
      reason: 'not_found',
    })
  })
})
```

`createEngineRunner.test.ts`:

```ts
import type { RunRequest } from '../types/RunRequest'
import { createEngineRunner } from './createEngineRunner'

const engine = {
  file: '/opt/engine/bin/tool',
  subcommands: [['lint', '--json']],
  env: { EXTRA: '1' },
}

describe('createEngineRunner', () => {
  it('runs a listed subcommand with the engine env and fixed limits', async () => {
    const seen: RunRequest[] = []
    const run = createEngineRunner(engine, async (request) => {
      seen.push(request)
      return await Promise.resolve({ code: 0, stdout: '{}' })
    })
    await run(['lint', '--json'], new AbortController().signal)
    expect(seen[0]).toMatchObject({
      file: '/opt/engine/bin/tool',
      args: ['lint', '--json'],
      timeoutMs: 10_000,
      maxBytes: 8 * 1024 * 1024,
    })
    expect(seen[0]?.env['EXTRA']).toBe('1')
  })
  it('refuses a subcommand the table does not list', async () => {
    const run = createEngineRunner(engine, async () => {
      throw new Error('must not run')
    })
    await expect(
      run(['lint'], new AbortController().signal),
    ).rejects.toMatchObject({ reason: 'check_failed' })
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/server && pnpm vitest run src/engines` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement.**

`types/EngineTable.ts`:

```ts
import type { z } from 'zod'

import type { engineTableSchema } from '../engines/engineTableSchema'

export type EngineTable = z.infer<typeof engineTableSchema>
```

`engines/engineTableSchema.ts`:

```ts
import { z } from 'zod'

// Per engine: the command (relative to the engine's checkout from the
// instance config, or absolute), the exact argument lists orbit may run, and
// extra environment variables beyond the allowlist (spec 5.3).
export const engineTableSchema = z.partialRecord(
  z.enum(['brain', 'clips']),
  z
    .object({
      command: z.string().min(1),
      subcommands: z.array(z.array(z.string().min(1)).min(1)).min(1),
      env: z.record(z.string().regex(/^[A-Z][A-Z0-9_]*$/), z.string()).default({}),
    })
    .strict(),
)
```

In `orbitConfigSchema.ts` add the import and the key (after `worker`):

```ts
    engines: engineTableSchema.default({}),
```

`types/ResolvedEngine.ts`:

```ts
export type ResolvedEngine = {
  readonly file: string
  readonly subcommands: readonly (readonly string[])[]
  readonly env: Readonly<Record<string, string>>
}
```

`types/EngineRunner.ts`:

```ts
import type { RunResult } from './RunResult'

export type EngineRunner = (
  args: readonly string[],
  signal: AbortSignal,
) => Promise<RunResult>
```

`engines/resolveEngineCommand.ts`:

```ts
import { access, constants } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'

import { ProcessError } from '../process/ProcessError'

// Resolved once at start; a missing or non-executable file is not_found.
export const resolveEngineCommand = async (
  checkout: string,
  command: string,
): Promise<string> => {
  const file = isAbsolute(command) ? command : join(checkout, command)
  const runnable = await access(file, constants.X_OK).then(
    () => true,
    () => false,
  )
  if (!runnable) throw new ProcessError('not_found')
  return file
}
```

`engines/sameArgs.ts`:

```ts
export const sameArgs = (
  a: readonly string[],
  b: readonly string[],
): boolean => a.length === b.length && a.every((arg, i) => arg === b[i])
```

`engines/createEngineRunner.ts`:

```ts
import { buildChildEnv } from '../process/buildChildEnv'
import { ProcessError } from '../process/ProcessError'
import type { EngineRunner } from '../types/EngineRunner'
import type { ResolvedEngine } from '../types/ResolvedEngine'
import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { sameArgs } from './sameArgs'

// Only the argument lists the table names ever run; anything else is refused.
export const createEngineRunner =
  (
    engine: ResolvedEngine,
    run: (request: RunRequest) => Promise<RunResult>,
  ): EngineRunner =>
  async (args, signal) => {
    if (!engine.subcommands.some((listed) => sameArgs(listed, args)))
      throw new ProcessError('check_failed')
    return await run({
      file: engine.file,
      args,
      env: buildChildEnv(process.env, engine.env),
      timeoutMs: 10_000,
      maxBytes: 8 * 1024 * 1024,
      signal,
    })
  }
```

- [ ] **Step 4: Run.** `cd apps/server && pnpm vitest run src/engines src/config` — Expected: PASS.

- [ ] **Step 5: Commit.** `git add apps/server/src/engines apps/server/src/types apps/server/src/config && git commit -m "feat(engines): engine command table, resolution and listed-only runner"`

---

### Task 3: Engine document parsing

**Files:**
- Create: `apps/server/src/engines/schemaVersionSchema.ts`, `parseEngineDocument.ts`, `doctorDocumentSchema.ts`
- Test: `apps/server/src/engines/parseEngineDocument.test.ts`

**Interfaces:**
- Consumes: `RunResult`, `ProcessError`.
- Produces:
  - `parseEngineDocument<T>(result: RunResult, schema: z.ZodType<T>): T`
  - `doctorDocumentSchema` → `{ schemaVersion: 1; ok: boolean; checks: { name: string; ok: boolean; code: string }[] }`

- [ ] **Step 1: Write the failing test.**

```ts
import { z } from 'zod'

import { parseEngineDocument } from './parseEngineDocument'

const schema = z.object({ schemaVersion: z.literal(1), n: z.number() })

describe('parseEngineDocument', () => {
  it('accepts a valid document whatever the exit code', () => {
    for (const code of [0, 1, 2])
      expect(
        parseEngineDocument({ code, stdout: '{"schemaVersion":1,"n":3}' }, schema),
      ).toEqual({ schemaVersion: 1, n: 3 })
  })
  it('reports an unknown major version as engine_schema_unsupported', () => {
    expect(() =>
      parseEngineDocument({ code: 0, stdout: '{"schemaVersion":2}' }, schema),
    ).toThrow(expect.objectContaining({ reason: 'engine_schema_unsupported' }))
  })
  it('reports unparseable output by exit code', () => {
    expect(() =>
      parseEngineDocument({ code: 1, stdout: 'usage: tool' }, schema),
    ).toThrow(expect.objectContaining({ reason: 'exit_nonzero' }))
    expect(() =>
      parseEngineDocument({ code: 0, stdout: '{"schemaVersion":1}' }, schema),
    ).toThrow(expect.objectContaining({ reason: 'schema_invalid' }))
  })
})
```

- [ ] **Step 2: Run to see it fail.** `cd apps/server && pnpm vitest run src/engines/parseEngineDocument.test.ts` — Expected: FAIL, module not found.

- [ ] **Step 3: Implement.**

`engines/schemaVersionSchema.ts`:

```ts
import { z } from 'zod'

export const schemaVersionSchema = z.object({ schemaVersion: z.number().int() })
```

`engines/parseEngineDocument.ts`:

```ts
import type { z } from 'zod'

import { ProcessError } from '../process/ProcessError'
import type { RunResult } from '../types/RunResult'
import { schemaVersionSchema } from './schemaVersionSchema'

// A run is judged by its stdout: engines print their document even when they
// exit non-zero to report findings. Nothing from stdout reaches an error.
export const parseEngineDocument = <T>(
  result: RunResult,
  schema: z.ZodType<T>,
): T => {
  let json: unknown
  try {
    json = JSON.parse(result.stdout)
  } catch {
    throw new ProcessError(result.code === 0 ? 'schema_invalid' : 'exit_nonzero')
  }
  const version = schemaVersionSchema.safeParse(json)
  if (version.success && version.data.schemaVersion !== 1)
    throw new ProcessError('engine_schema_unsupported')
  const parsed = schema.safeParse(json)
  if (parsed.success) return parsed.data
  throw new ProcessError(result.code === 0 ? 'schema_invalid' : 'exit_nonzero')
}
```

`engines/doctorDocumentSchema.ts`:

```ts
import { z } from 'zod'

export const doctorDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  ok: z.boolean(),
  checks: z.array(
    z.object({ name: z.string(), ok: z.boolean(), code: z.string() }),
  ),
})
```

- [ ] **Step 4: Run.** Same command — Expected: PASS.

- [ ] **Step 5: Commit.** `git add apps/server/src/engines && git commit -m "feat(engines): parse an engine document whatever its exit code"`

---

### Task 4: brain adapter

**Files:**
- Create: `apps/server/src/adapters/brain/brainLintSchema.ts`, `summarizeBrain.ts`, `createBrainAdapter.ts`
- Test: `apps/server/src/adapters/brain/summarizeBrain.test.ts`, `createBrainAdapter.test.ts`

**Interfaces:**
- Consumes: `EngineRunner`, `parseEngineDocument`, `doctorDocumentSchema`.
- Produces: `createBrainAdapter(deps: { run: EngineRunner; cadenceMs: number }): Adapter` with id `brain`, `timeoutMs` 25 000 (two sequential commands of up to 10 s), `freshnessMs` `cadenceMs * 2`. Runs `['lint', '--json']` then `['doctor', '--json']`.
- Health: `warn`/`check_failed` when doctor `ok` is false; `warn`/`stale` when `indexStale`; otherwise `ok`. Metrics `brain.pages`, `brain.lint_issues`, `brain.doctor_failing`. Pending `brain.lint_issues` (`oldestAt: null`) when issues > 0.

- [ ] **Step 1: Write the failing tests.**

`summarizeBrain.test.ts`:

```ts
import { summarizeBrain } from './summarizeBrain'

const at = new Date('2026-10-03T10:00:00.000Z')
const lint = (issues: number, indexStale = false) => ({
  schemaVersion: 1 as const,
  pageCount: 10,
  indexStale,
  issues: Array.from({ length: issues }, () => ({ page: 'p', code: 'c' })),
})
const doctor = (ok: boolean) => ({
  schemaVersion: 1 as const,
  ok,
  checks: [{ name: 'paths', ok, code: ok ? 'ok' : 'paths_missing' }],
})

describe('summarizeBrain', () => {
  it('reports pages, issues and failing checks without page ids', () => {
    const s = summarizeBrain(lint(2), doctor(true), at)
    expect(s.health).toEqual({ state: 'ok', reason: null })
    expect(s.metrics.map((m) => [m.key, m.value])).toEqual([
      ['brain.pages', 10],
      ['brain.lint_issues', 2],
      ['brain.doctor_failing', 0],
    ])
    expect(s.pending).toEqual([
      { key: 'brain.lint_issues', count: 2, oldestAt: null },
    ])
    expect(JSON.stringify(s)).not.toContain('"p"')
  })
  it('warns on a failing check before a stale index', () => {
    expect(summarizeBrain(lint(0, true), doctor(false), at).health).toEqual({
      state: 'warn',
      reason: 'check_failed',
    })
    expect(summarizeBrain(lint(0, true), doctor(true), at).health).toEqual({
      state: 'warn',
      reason: 'stale',
    })
    expect(summarizeBrain(lint(0), doctor(true), at).pending).toEqual([])
  })
})
```

`createBrainAdapter.test.ts`:

```ts
import { createBrainAdapter } from './createBrainAdapter'

const docs: Record<string, string> = {
  lint: '{"schemaVersion":1,"pageCount":4,"indexStale":false,"issues":[]}',
  doctor: '{"schemaVersion":1,"ok":true,"checks":[]}',
}

describe('createBrainAdapter', () => {
  it('runs lint then doctor and returns a brain snapshot', async () => {
    const calls: string[][] = []
    const adapter = createBrainAdapter({
      cadenceMs: 60_000,
      run: async (args) => {
        calls.push([...args])
        return await Promise.resolve({ code: 0, stdout: docs[args[0] ?? ''] ?? '' })
      },
    })
    const core = await adapter.read(new AbortController().signal)
    expect(calls).toEqual([
      ['lint', '--json'],
      ['doctor', '--json'],
    ])
    expect(core.component).toBe('brain')
    expect(core.metrics[0]).toMatchObject({ key: 'brain.pages', value: 4 })
    expect([adapter.cadenceMs, adapter.freshnessMs]).toEqual([60_000, 120_000])
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/server && pnpm vitest run src/adapters/brain` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement.**

`brainLintSchema.ts`:

```ts
import { z } from 'zod'

export const brainLintSchema = z.object({
  schemaVersion: z.literal(1),
  pageCount: z.number().int().nonnegative(),
  indexStale: z.boolean(),
  issues: z.array(z.object({ page: z.string(), code: z.string() })),
})
```

`summarizeBrain.ts`:

```ts
import type { SnapshotCore } from '@orbit/contract'
import type { z } from 'zod'

import type { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import type { brainLintSchema } from './brainLintSchema'

// Counts only: issue page ids are content and never leave the adapter.
export const summarizeBrain = (
  lint: z.infer<typeof brainLintSchema>,
  doctor: z.infer<typeof doctorDocumentSchema>,
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const at = now.toISOString()
  const issues = lint.issues.length
  const failing = doctor.checks.filter((check) => !check.ok).length
  const health: SnapshotCore['health'] = !doctor.ok
    ? { state: 'warn', reason: 'check_failed' }
    : lint.indexStale
      ? { state: 'warn', reason: 'stale' }
      : { state: 'ok', reason: null }
  return {
    health,
    metrics: [
      { key: 'brain.pages', value: lint.pageCount, at },
      { key: 'brain.lint_issues', value: issues, at },
      { key: 'brain.doctor_failing', value: failing, at },
    ],
    pending:
      issues > 0 ? [{ key: 'brain.lint_issues', count: issues, oldestAt: null }] : [],
  }
}
```

`createBrainAdapter.ts`:

```ts
import { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { Adapter } from '../../types/Adapter'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainLintSchema } from './brainLintSchema'
import { summarizeBrain } from './summarizeBrain'

export const createBrainAdapter = (deps: {
  readonly run: EngineRunner
  readonly cadenceMs: number
}): Adapter => ({
  id: 'brain',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 25_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const lint = parseEngineDocument(
      await deps.run(['lint', '--json'], signal),
      brainLintSchema,
    )
    const doctor = parseEngineDocument(
      await deps.run(['doctor', '--json'], signal),
      doctorDocumentSchema,
    )
    const now = new Date()
    return {
      component: 'brain',
      ...summarizeBrain(lint, doctor, now),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})
```

- [ ] **Step 4: Run.** Same command — Expected: PASS.

- [ ] **Step 5: Commit.** `git add apps/server/src/adapters/brain && git commit -m "feat(brain): adapter over lint and doctor JSON"`

---

### Task 5: clips adapter

**Files:**
- Create: `apps/server/src/adapters/clips/clipsStatusSchema.ts`, `summarizeClips.ts`, `createClipsAdapter.ts`
- Test: `apps/server/src/adapters/clips/summarizeClips.test.ts`, `createClipsAdapter.test.ts`

**Interfaces:**
- Consumes: `EngineRunner`, `parseEngineDocument`, `doctorDocumentSchema`.
- Produces: `createClipsAdapter(deps: { run: EngineRunner; cadenceMs: number }): Adapter`, id `clips`, `timeoutMs` 25 000, `freshnessMs` `cadenceMs * 2`; runs `['status', '--json']` then `['doctor', '--json']`.
- Health: `warn`/`check_failed` when doctor `ok` is false or `states.inconsistent + states.unreadable > 0`; else `ok`. Metrics `clips.total`, `clips.pending`, `clips.needs_claude`, `clips.intake_today` (count of the last `intake.days` entry whose `day` equals today's UTC date, else 0). Pending `clips.pending` with `oldestAt.pending`, `clips.needs_claude` with `oldestAt['needs-claude']`, each only when > 0.

- [ ] **Step 1: Write the failing tests.**

`summarizeClips.test.ts`:

```ts
import { summarizeClips } from './summarizeClips'

const at = new Date('2026-10-03T10:00:00.000Z')
const status = (over: Partial<Record<string, number>> = {}) => ({
  schemaVersion: 1 as const,
  total: 30,
  states: {
    pending: 5,
    'needs-claude': 2,
    inconsistent: 0,
    unreadable: 0,
    reconciled: 23,
    ...over,
  },
  oldestAt: {
    pending: '2026-10-01T00:00:00.000Z',
    'needs-claude': '2026-09-30T00:00:00.000Z',
  },
  intake: {
    days: [
      { day: '2026-10-02', count: 4 },
      { day: '2026-10-03', count: 1 },
    ],
    undated: 0,
  },
})
const doctor = (ok: boolean) => ({ schemaVersion: 1 as const, ok, checks: [] })

describe('summarizeClips', () => {
  it('reports counts, today intake and pending with their oldest times', () => {
    const s = summarizeClips(status(), doctor(true), at)
    expect(s.health).toEqual({ state: 'ok', reason: null })
    expect(s.metrics.map((m) => [m.key, m.value])).toEqual([
      ['clips.total', 30],
      ['clips.pending', 5],
      ['clips.needs_claude', 2],
      ['clips.intake_today', 1],
    ])
    expect(s.pending).toEqual([
      { key: 'clips.pending', count: 5, oldestAt: '2026-10-01T00:00:00.000Z' },
      { key: 'clips.needs_claude', count: 2, oldestAt: '2026-09-30T00:00:00.000Z' },
    ])
  })
  it('warns on a failing check or an inconsistent clip', () => {
    const warn = { state: 'warn', reason: 'check_failed' }
    expect(summarizeClips(status(), doctor(false), at).health).toEqual(warn)
    expect(
      summarizeClips(status({ inconsistent: 1 }), doctor(true), at).health,
    ).toEqual(warn)
  })
})
```

`createClipsAdapter.test.ts`:

```ts
import { createClipsAdapter } from './createClipsAdapter'

describe('createClipsAdapter', () => {
  it('accepts a status document printed with exit 2', async () => {
    const adapter = createClipsAdapter({
      cadenceMs: 60_000,
      run: async (args) =>
        await Promise.resolve(
          args[0] === 'status'
            ? {
                code: 2,
                stdout:
                  '{"schemaVersion":1,"total":1,"states":{"inconsistent":1},"oldestAt":{},"intake":{"days":[],"undated":0}}',
              }
            : { code: 0, stdout: '{"schemaVersion":1,"ok":true,"checks":[]}' },
        ),
    })
    const core = await adapter.read(new AbortController().signal)
    expect(core.component).toBe('clips')
    expect(core.health).toEqual({ state: 'warn', reason: 'check_failed' })
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/server && pnpm vitest run src/adapters/clips` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement.**

`clipsStatusSchema.ts`:

```ts
import { z } from 'zod'

const count = z.number().int().nonnegative()

export const clipsStatusSchema = z.object({
  schemaVersion: z.literal(1),
  total: count,
  states: z.record(z.string(), count),
  oldestAt: z.record(z.string(), z.iso.datetime().nullable()),
  intake: z.object({
    days: z.array(z.object({ day: z.string(), count })),
    undated: count,
  }),
})
```

`summarizeClips.ts`:

```ts
import type { SnapshotCore } from '@orbit/contract'
import type { z } from 'zod'

import type { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import type { clipsStatusSchema } from './clipsStatusSchema'

export const summarizeClips = (
  status: z.infer<typeof clipsStatusSchema>,
  doctor: z.infer<typeof doctorDocumentSchema>,
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const at = now.toISOString()
  const state = (name: string): number => status.states[name] ?? 0
  const today = now.toISOString().slice(0, 10)
  const intake = status.intake.days.find((d) => d.day === today)?.count ?? 0
  const broken = state('inconsistent') + state('unreadable') > 0
  const pending: SnapshotCore['pending'] = []
  if (state('pending') > 0)
    pending.push({ key: 'clips.pending', count: state('pending'), oldestAt: status.oldestAt['pending'] ?? null })
  if (state('needs-claude') > 0)
    pending.push({ key: 'clips.needs_claude', count: state('needs-claude'), oldestAt: status.oldestAt['needs-claude'] ?? null })
  return {
    health:
      !doctor.ok || broken
        ? { state: 'warn', reason: 'check_failed' }
        : { state: 'ok', reason: null },
    metrics: [
      { key: 'clips.total', value: status.total, at },
      { key: 'clips.pending', value: state('pending'), at },
      { key: 'clips.needs_claude', value: state('needs-claude'), at },
      { key: 'clips.intake_today', value: intake, at },
    ],
    pending,
  }
}
```

`createClipsAdapter.ts`: as `createBrainAdapter` (Task 4) with `id: 'clips'`, `['status', '--json']` parsed by `clipsStatusSchema`, `['doctor', '--json']` by `doctorDocumentSchema`, and `summarizeClips(status, doctor, now)`; `component: 'clips'`.

```ts
import { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { Adapter } from '../../types/Adapter'
import type { EngineRunner } from '../../types/EngineRunner'
import { clipsStatusSchema } from './clipsStatusSchema'
import { summarizeClips } from './summarizeClips'

export const createClipsAdapter = (deps: {
  readonly run: EngineRunner
  readonly cadenceMs: number
}): Adapter => ({
  id: 'clips',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 25_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const status = parseEngineDocument(
      await deps.run(['status', '--json'], signal),
      clipsStatusSchema,
    )
    const doctor = parseEngineDocument(
      await deps.run(['doctor', '--json'], signal),
      doctorDocumentSchema,
    )
    const now = new Date()
    return {
      component: 'clips',
      ...summarizeClips(status, doctor, now),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})
```

- [ ] **Step 4: Run.** Same command — Expected: PASS. If `jscpd` (`pnpm dupes`) flags the two adapters as clones, extract `readEnginePair(run, first, second, signal)` into `engines/readEnginePair.ts` returning `[RunResult, RunResult]` and use it in both.

- [ ] **Step 5: Commit.** `git add apps/server/src/adapters/clips && git commit -m "feat(clips): adapter over status and doctor JSON"`

---

### Task 6: atrium adapter (status files)

**Files:**
- Create: `apps/server/src/adapters/atrium/atriumRefreshSchema.ts`, `atriumSynthesisSchema.ts`, `readStatusFile.ts`, `summarizeAtrium.ts`, `createAtriumAdapter.ts`
- Test: `apps/server/src/adapters/atrium/summarizeAtrium.test.ts`, `createAtriumAdapter.test.ts`

**Interfaces:**
- Produces: `createAtriumAdapter(deps: { statusDir: string; refreshIntervalMs: number; cadenceMs: number }): Adapter`, id `atrium`, `timeoutMs` 5000, `freshnessMs` `cadenceMs * 2`.
- `readStatusFile<T>(path: string, schema: z.ZodType<T>, signal: AbortSignal): Promise<T | null>` — `null` when the file is absent; reads at most 1 MiB (`readFile` then length check → `output_too_large`); bad JSON or shape → `schema_invalid`; other major → `engine_schema_unsupported`.
- Health: `down`/`not_found` when `refresh.json` is absent; `warn`/`stale` when `refresh.writtenAt` is older than `2 * refreshIntervalMs`; else `ok`. `synthesis.json` absent is not an error (metrics simply omitted).
- Metrics `atrium.records` (`records.total`), `atrium.not_indexed` (sum over populations of `max(0, intended - indexed)`), and when synthesis is present `atrium.synth_deferred`, `atrium.synth_failed`. Pending `atrium.not_indexed` (`oldestAt: null`) when > 0.

- [ ] **Step 1: Write the failing tests.**

`summarizeAtrium.test.ts`:

```ts
import { summarizeAtrium } from './summarizeAtrium'

const now = new Date('2026-10-03T12:00:00.000Z')
const hour = 3_600_000
const refresh = (writtenAt: string) => ({
  schemaVersion: 1 as const,
  writtenAt,
  records: { total: 50 },
  populations: [
    { intended: 10, indexed: 7 },
    { intended: 3, indexed: 5 },
  ],
})
const synthesis = {
  schemaVersion: 1 as const,
  writtenAt: '2026-10-03T11:00:00.000Z',
  lastPass: { deferred: 4, failed: 1 },
}

describe('summarizeAtrium', () => {
  it('counts records, unindexed records and the last synthesis pass', () => {
    const s = summarizeAtrium(refresh('2026-10-03T11:30:00.000Z'), synthesis, hour, now)
    expect(s.health).toEqual({ state: 'ok', reason: null })
    expect(s.metrics.map((m) => [m.key, m.value])).toEqual([
      ['atrium.records', 50],
      ['atrium.not_indexed', 3],
      ['atrium.synth_deferred', 4],
      ['atrium.synth_failed', 1],
    ])
    expect(s.pending).toEqual([
      { key: 'atrium.not_indexed', count: 3, oldestAt: null },
    ])
  })
  it('turns stale past twice the refresh interval and omits absent synthesis', () => {
    const s = summarizeAtrium(refresh('2026-10-03T09:59:59.000Z'), null, hour, now)
    expect(s.health).toEqual({ state: 'warn', reason: 'stale' })
    expect(s.metrics.map((m) => m.key)).toEqual([
      'atrium.records',
      'atrium.not_indexed',
    ])
  })
})
```

`createAtriumAdapter.test.ts`:

```ts
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createAtriumAdapter } from './createAtriumAdapter'

const signal = () => new AbortController().signal
const adapterIn = (statusDir: string) =>
  createAtriumAdapter({ statusDir, refreshIntervalMs: 3_600_000, cadenceMs: 60_000 })

describe('createAtriumAdapter', () => {
  it('reports a missing refresh document as not_found', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await expect(adapterIn(dir).read(signal())).rejects.toMatchObject({
      reason: 'not_found',
    })
  })
  it('rejects another schema major and reads a valid pair', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await writeFile(join(dir, 'refresh.json'), '{"schemaVersion":2}')
    await expect(adapterIn(dir).read(signal())).rejects.toMatchObject({
      reason: 'engine_schema_unsupported',
    })
    const writtenAt = new Date().toISOString()
    await writeFile(
      join(dir, 'refresh.json'),
      JSON.stringify({ schemaVersion: 1, writtenAt, records: { total: 2 }, populations: [] }),
    )
    const core = await adapterIn(dir).read(signal())
    expect(core.component).toBe('atrium')
    expect(core.metrics[0]).toMatchObject({ key: 'atrium.records', value: 2 })
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/server && pnpm vitest run src/adapters/atrium` — Expected: FAIL.

- [ ] **Step 3: Implement.**

`atriumRefreshSchema.ts`:

```ts
import { z } from 'zod'

const count = z.number().int().nonnegative()

export const atriumRefreshSchema = z.object({
  schemaVersion: z.literal(1),
  writtenAt: z.iso.datetime({ offset: true }),
  records: z.object({ total: count }),
  populations: z.array(z.object({ intended: count, indexed: count })),
})
```

`atriumSynthesisSchema.ts`:

```ts
import { z } from 'zod'

const count = z.number().int().nonnegative()

export const atriumSynthesisSchema = z.object({
  schemaVersion: z.literal(1),
  writtenAt: z.iso.datetime({ offset: true }),
  lastPass: z.object({ deferred: count, failed: count }),
})
```

`readStatusFile.ts`:

```ts
import { readFile } from 'node:fs/promises'

import type { z } from 'zod'

import { parseEngineDocument } from '../../engines/parseEngineDocument'
import { isNotFound } from '../../fs/isNotFound'
import { ProcessError } from '../../process/ProcessError'

// A status file is published atomically by its one writer, so a read never
// sees partial JSON; absent means that job has not finished a run yet.
export const readStatusFile = async <T>(
  path: string,
  schema: z.ZodType<T>,
  signal: AbortSignal,
): Promise<T | null> => {
  let text: string
  try {
    text = await readFile(path, { encoding: 'utf8', signal })
  } catch (error) {
    if (isNotFound(error)) return null
    throw new ProcessError('check_failed')
  }
  if (text.length > 1_048_576) throw new ProcessError('output_too_large')
  return parseEngineDocument({ code: 0, stdout: text }, schema)
}
```

`summarizeAtrium.ts`:

```ts
import type { SnapshotCore } from '@orbit/contract'
import type { z } from 'zod'

import type { atriumRefreshSchema } from './atriumRefreshSchema'
import type { atriumSynthesisSchema } from './atriumSynthesisSchema'

export const summarizeAtrium = (
  refresh: z.infer<typeof atriumRefreshSchema>,
  synthesis: z.infer<typeof atriumSynthesisSchema> | null,
  refreshIntervalMs: number,
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const at = now.toISOString()
  const notIndexed = refresh.populations.reduce(
    (sum, p) => sum + Math.max(0, p.intended - p.indexed),
    0,
  )
  const age = now.getTime() - Date.parse(refresh.writtenAt)
  const metrics: SnapshotCore['metrics'] = [
    { key: 'atrium.records', value: refresh.records.total, at },
    { key: 'atrium.not_indexed', value: notIndexed, at },
  ]
  if (synthesis !== null)
    metrics.push(
      { key: 'atrium.synth_deferred', value: synthesis.lastPass.deferred, at },
      { key: 'atrium.synth_failed', value: synthesis.lastPass.failed, at },
    )
  return {
    health:
      age > 2 * refreshIntervalMs
        ? { state: 'warn', reason: 'stale' }
        : { state: 'ok', reason: null },
    metrics,
    pending:
      notIndexed > 0
        ? [{ key: 'atrium.not_indexed', count: notIndexed, oldestAt: null }]
        : [],
  }
}
```

`createAtriumAdapter.ts`:

```ts
import { join } from 'node:path'

import { ProcessError } from '../../process/ProcessError'
import type { Adapter } from '../../types/Adapter'
import { atriumRefreshSchema } from './atriumRefreshSchema'
import { atriumSynthesisSchema } from './atriumSynthesisSchema'
import { readStatusFile } from './readStatusFile'
import { summarizeAtrium } from './summarizeAtrium'

// Reads the documents atrium's jobs publish; never runs atrium itself.
export const createAtriumAdapter = (deps: {
  readonly statusDir: string
  readonly refreshIntervalMs: number
  readonly cadenceMs: number
}): Adapter => ({
  id: 'atrium',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 5000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const file = (name: string) => join(deps.statusDir, name)
    const refresh = await readStatusFile(file('refresh.json'), atriumRefreshSchema, signal)
    if (refresh === null) throw new ProcessError('not_found')
    const synthesis = await readStatusFile(file('synthesis.json'), atriumSynthesisSchema, signal)
    const now = new Date()
    return {
      component: 'atrium',
      ...summarizeAtrium(refresh, synthesis, deps.refreshIntervalMs, now),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})
```

- [ ] **Step 4: Run.** Same command — Expected: PASS.

- [ ] **Step 5: Commit.** `git add apps/server/src/adapters/atrium && git commit -m "feat(atrium): adapter over the published status documents"`

---

### Task 7: capture adapter

**Files:**
- Create: `apps/server/src/adapters/capture/captureCountSchema.ts`, `createCaptureAdapter.ts`
- Test: `apps/server/src/adapters/capture/createCaptureAdapter.test.ts`

**Interfaces:**
- Consumes: `fetchWorkerText(deps: { url; tokenFile; fetch }, path, signal)` (generic bearer GET with capped body and fixed error codes despite its name), `parseEngineDocument`.
- Produces: `createCaptureAdapter(deps: { url: string; tokenFile: string; cadenceMs: number; fetch: typeof fetch }): Adapter`, id `capture`, `timeoutMs` 10 000, `freshnessMs` `cadenceMs * 2`. Health always `ok` when the read succeeds. Metric `capture.undrained`; pending `capture.undrained` with `oldestAt` when > 0.

- [ ] **Step 1: Write the failing test.**

```ts
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createCaptureAdapter } from './createCaptureAdapter'

const tokenFile = async () => {
  const path = join(await mkdtemp(join(tmpdir(), 'orbit-capture-')), 't')
  await writeFile(path, 'capture-token\n')
  return path
}
const reply = (body: unknown, status = 200): typeof fetch =>
  async () => await Promise.resolve(new Response(JSON.stringify(body), { status }))

describe('createCaptureAdapter', () => {
  it('reads the undrained count with a bearer token', async () => {
    let auth = ''
    const adapter = createCaptureAdapter({
      url: 'https://capture.example',
      tokenFile: await tokenFile(),
      cadenceMs: 120_000,
      fetch: async (input, init) => {
        auth = new Headers(init?.headers).get('Authorization') ?? ''
        expect(String(input)).toBe('https://capture.example/api/captures/count')
        return await reply({ data: { schemaVersion: 1, count: 2, oldestAt: '2026-10-01T00:00:00.000Z' } })()
      },
    })
    const core = await adapter.read(new AbortController().signal)
    expect(auth).toBe('Bearer capture-token')
    expect(core.pending).toEqual([
      { key: 'capture.undrained', count: 2, oldestAt: '2026-10-01T00:00:00.000Z' },
    ])
    expect(adapter.freshnessMs).toBe(240_000)
  })
  it('maps a refused token to unauthorized', async () => {
    const adapter = createCaptureAdapter({
      url: 'https://capture.example',
      tokenFile: await tokenFile(),
      cadenceMs: 120_000,
      fetch: reply({}, 401),
    })
    await expect(adapter.read(new AbortController().signal)).rejects.toMatchObject({
      reason: 'unauthorized',
    })
  })
})
```

- [ ] **Step 2: Run to see it fail.** `cd apps/server && pnpm vitest run src/adapters/capture` — Expected: FAIL.

- [ ] **Step 3: Implement.**

`captureCountSchema.ts`:

```ts
import { z } from 'zod'

export const captureCountSchema = z.object({
  data: z.object({
    schemaVersion: z.literal(1),
    count: z.number().int().nonnegative(),
    oldestAt: z.string().nullable(),
  }),
})
```

Note: the capture document nests `schemaVersion` under `data`, so `parseEngineDocument`'s top-level version probe does not see it; the literal in this schema is what enforces version 1. A future major therefore reads as `schema_invalid`, not `engine_schema_unsupported` — acceptable and noted in the adapter comment.

`createCaptureAdapter.ts`:

```ts
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { Adapter } from '../../types/Adapter'
import { fetchWorkerText } from '../worker/fetchWorkerText'
import { captureCountSchema } from './captureCountSchema'

// The capture service wraps answers in { data }; its schemaVersion is checked
// by the schema literal, so a new major reads as schema_invalid.
export const createCaptureAdapter = (deps: {
  readonly url: string
  readonly tokenFile: string
  readonly cadenceMs: number
  readonly fetch: typeof fetch
}): Adapter => ({
  id: 'capture',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 10_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const text = await fetchWorkerText(deps, '/api/captures/count', signal)
    const { data } = parseEngineDocument({ code: 0, stdout: text }, captureCountSchema)
    const now = new Date()
    const at = now.toISOString()
    return {
      component: 'capture',
      health: { state: 'ok', reason: null },
      metrics: [{ key: 'capture.undrained', value: data.count, at }],
      pending:
        data.count > 0
          ? [{ key: 'capture.undrained', count: data.count, oldestAt: data.oldestAt }]
          : [],
      events: [],
      observedAt: at,
    }
  },
})
```

`oldestAt` must satisfy the contract's `z.iso.datetime()`; the capture service stores ISO strings with `Z`. If the contract rejects a value, the snapshot fails validation at the hub boundary — add a test case with a non-ISO `oldestAt` expecting `schema_invalid` by tightening `captureCountSchema.oldestAt` to `z.iso.datetime({ offset: true }).nullable()`.

- [ ] **Step 4: Run.** Same command — Expected: PASS.

- [ ] **Step 5: Commit.** `git add apps/server/src/adapters/capture && git commit -m "feat(capture): adapter over the undrained count"`

---

### Task 8: Configuration, wiring and doctor

**Files:**
- Modify: `apps/server/src/config/orbitConfigSchema.ts` (add `atrium`, `capture`)
- Modify: `apps/server/src/types/AdapterContext.ts` (add `engines: Readonly<Record<string, EngineRunner>>`)
- Create: `apps/server/src/engines/resolveEngines.ts`
- Modify: `apps/server/src/adapters/buildAdapters.ts`, `apps/server/src/cli/buildScheduler.ts`
- Create: `apps/server/src/cli/checks/checkEngines.ts`; Modify: `apps/server/src/cli/checks/doctorChecks.ts`
- Modify: `README.md` (`orbit.json` example)
- Test: `apps/server/src/adapters/buildAdapters.test.ts`, `apps/server/src/engines/resolveEngines.test.ts`, `apps/server/src/cli/checks/checkEngines.test.ts`

**Interfaces:**
- `orbitConfigSchema` gains:

```ts
    atrium: z
      .object({
        statusDir: z.string().refine(isAbsolute),
        refreshIntervalMs: z.number().int().min(60_000).default(3_600_000),
      })
      .strict()
      .optional(),
    capture: z
      .object({
        url: z.url({ protocol: /^https?$/ }),
        tokenFile: z.string().min(1),
      })
      .strict()
      .optional(),
```

- `resolveEngines(table: EngineTable, instance: InstanceConfig['engines'], run): Promise<Record<string, EngineRunner>>` — for each table entry whose name is in the instance's engines, resolves the command (Task 2) and builds a runner; an entry whose instance engine is missing or whose command does not resolve is left out of the map and returned in a second value `failed: string[]` so the adapter is built to fail with `not_found` instead of vanishing. Signature: `Promise<{ runners: Record<string, EngineRunner>; failed: readonly string[] }>`.
- `buildAdapters` adds, in order after worker: atrium (when `config.atrium`), brain and clips (when the engine is in `config.engines`; a failed resolution gets a runner that always throws `ProcessError('not_found')`), capture (when `config.capture`). Cadences default per spec 3.1: atrium, brain, clips 60 000; capture 120 000; overridable by `config.cadenceMs[id]`.
- `buildScheduler` becomes async-aware: `openState` already loads the instance config; extend `OrbitState` with `instance: InstanceConfig` and resolve engines in `serveCommand` before `buildScheduler`, passing the runners through `AdapterContext.engines`.
- `checkEngines: DoctorCheck` — for each engine in `config.engines`, runs every listed subcommand once with its exact environment; level `fail` with detail `<engine> <reason>` on a `ProcessError`, `ok` with `<n> engine commands ran` otherwise; `ok` / `not configured` when the table is empty.

- [ ] **Step 1: Write the failing tests.** In `buildAdapters.test.ts` add:

```ts
  it('builds the memory adapters that are configured', () => {
    const runner = async () => await Promise.resolve({ code: 0, stdout: '' })
    const built = buildAdapters({
      ...context({
        atrium: { statusDir: '/data/atrium/status' },
        capture: { url: 'https://capture.example', tokenFile: '/t' },
        engines: {
          brain: { command: 'bin/brain', subcommands: [['lint', '--json']] },
          clips: { command: 'bin/clips', subcommands: [['status', '--json']] },
        },
      }),
      engines: { brain: runner, clips: runner },
    })
    expect(built.map((a) => [a.id, a.cadenceMs])).toEqual([
      ['atrium', 60_000],
      ['brain', 60_000],
      ['clips', 60_000],
      ['capture', 120_000],
    ])
  })
  it('keeps an engine whose command did not resolve, failing not_found', async () => {
    const [brain] = buildAdapters({
      ...context({
        engines: { brain: { command: 'bin/brain', subcommands: [['lint', '--json']] } },
      }),
      engines: {},
    })
    await expect(brain?.read(new AbortController().signal)).rejects.toMatchObject({
      reason: 'not_found',
    })
  })
```

and extend the shared `context` helper with `engines: {}`. In `resolveEngines.test.ts`, use a temp checkout with an executable `bin/tool` (as Task 2's test) and assert `{ runners: { brain }, failed: ['clips'] }` when the instance names only `brain`. In `checkEngines.test.ts`, build an `OrbitState` stub whose `config.engines.brain` lists `[['lint', '--json']]` and whose `instance.engines.brain.path` points at a temp checkout with `bin/tool` printing `{"schemaVersion":1}`; expect `level: 'ok'`; then a non-executable tool → `level: 'fail'`, detail `brain not_found`.

- [ ] **Step 2: Run to see them fail.** `cd apps/server && pnpm vitest run src/adapters src/engines src/cli/checks` — Expected: FAIL.

- [ ] **Step 3: Implement** the schema keys, `resolveEngines`, the `buildAdapters` branches (each branch a small helper file if `buildAdapters.ts` passes 100 lines: `adapters/buildMemoryAdapters.ts` returning `Adapter[]`), the `OrbitState.instance` field in `openState` (store the result of the `loadInstanceConfig` call already made there), runner resolution in `serveCommand`, and `checkEngines` registered last in `DOCTOR_CHECKS`. Add to the README `orbit.json` example:

```json
  "atrium": { "statusDir": "/path/to/instance/atrium/status" },
  "capture": {
    "url": "https://capture.example",
    "tokenFile": "/path/to/instance/capture.token"
  },
  "engines": {
    "brain": {
      "command": "bin/brain",
      "subcommands": [["lint", "--json"], ["doctor", "--json"]]
    },
    "clips": {
      "command": "bin/clips",
      "subcommands": [["status", "--json"], ["doctor", "--json"]]
    }
  }
```

- [ ] **Step 4: Run.** `cd apps/server && pnpm vitest run && pnpm tsc --noEmit -p .` — Expected: PASS.

- [ ] **Step 5: Commit.** `git add apps/server README.md && git commit -m "feat(server): configure and wire the memory adapters, doctor runs engine commands"`

---

### Task 9: End-to-end satellites

**Files:**
- Create: `e2e/fixtures/bin/brain.mjs`, `e2e/fixtures/bin/clips.mjs`
- Modify: `e2e/globalSetup.ts`
- Create: `e2e/specs/memory.spec.ts`

**Interfaces:**
- Consumes: everything above. The fixture engines print fixed documents for their listed subcommands and exit 64 otherwise.

- [ ] **Step 1: Write the fixtures.** `e2e/fixtures/bin/brain.mjs`:

```js
#!/usr/bin/env node
const docs = {
  'lint --json': { schemaVersion: 1, pageCount: 12, indexStale: false, issues: [{ page: 'notes/a', code: 'dangling_link' }] },
  'doctor --json': { schemaVersion: 1, ok: true, checks: [] },
}
const doc = docs[process.argv.slice(2).join(' ')]
if (doc === undefined) process.exit(64)
process.stdout.write(JSON.stringify(doc))
```

`e2e/fixtures/bin/clips.mjs` — same shape with `'status --json'`: `{ schemaVersion: 1, total: 9, states: { pending: 3, 'needs-claude': 1 }, oldestAt: { pending: '2026-10-01T00:00:00.000Z', 'needs-claude': null }, intake: { days: [], undated: 0 } }` and `'doctor --json'`: `{ schemaVersion: 1, ok: true, checks: [] }`.

- [ ] **Step 2: Wire them in `globalSetup.ts`.** Before writing `orbit.json`: create `join(E2E.root, 'engines', 'brain', 'bin')` and `.../clips/bin`, copy each fixture to `.../bin/brain` and `.../bin/clips` with mode `0o755`; write `syntopica.config.json` as `{ schemaVersion: 1, engines: { brain: { path: '<root>/engines/brain' }, clips: { path: '<root>/engines/clips' } } }`; write `join(E2E.root, 'atrium-status', 'refresh.json')` with `{ schemaVersion: 1, writtenAt: new Date().toISOString(), records: { total: 40 }, populations: [{ intended: 5, indexed: 3 }] }`; add to `orbit.json`: `atrium: { statusDir: <that dir> }` and the `engines` table of Task 8 with `command: 'bin/brain'` / `'bin/clips'`.

- [ ] **Step 3: Write the spec.** `e2e/specs/memory.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('shows the memory components as satellites with their pending work', async ({ page }) => {
  await signIn(page)
  for (const name of ['Atrium', 'Brain', 'Clips'])
    await expect(page.getByRole('img', { name: new RegExp(`^${name}: Healthy`) })).toBeVisible()
  const pending = page.getByRole('region', { name: /pending/i })
  await expect(pending).toContainText('records not indexed')
  await expect(pending).toContainText('clips pending')
  await expect(page.getByText('notes/a')).toHaveCount(0)
})
```

(Check the pending strip's accessible name in `PendingStrip.tsx` — it is `aria-labelledby="pending-heading"`, heading text "Pending"; use `page.getByRole('region', { name: 'Pending' })` if the regex is ambiguous.)

- [ ] **Step 4: Run.** `pnpm e2e` — Expected: all specs pass, including `memory.spec.ts`.

- [ ] **Step 5: Gate and commit.** Format per package, then `pnpm gate` — Expected: exit 0. `git add e2e && git commit -m "test(e2e): memory satellites from fixture engines and a status file"`

---

## Owner steps after this plan

- Add `atrium`, `engines` and (after the capture deploy) `capture` to the instance's `orbit.json`; run `orbit doctor` until `engines` is `ok`.
- Re-measure `brain graph --json --no-html` and `clips status --json` on a quiet machine before 1b/1c poll anything heavier (both were at or over 2 s p95 under load average 29-84).

## Self-review notes

- Spec 3.1 cadences and freshness: Tasks 4-8. Spec 3.2 absent vs down: Task 8 (`failed` engines kept as `not_found`, missing `refresh.json` is `not_found`). Spec 4 schemaVersion: Task 3 and 6. Spec 5.3 table, resolution, allowlist, doctor: Tasks 2 and 8. Spec 6.6 content: summarizers emit counts and timestamps only; the e2e asserts a page id never renders.
- Not in 1a by design: detail endpoints (`atrium context`, `brain graph`, `brain page`, `atrium doctor`), Memory flow stages, all Memory screens — plans 1b and 1c.
