# orbit Memory screens (sub-project 1b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Memory flow, Atrium and Clips screens, each backed by a session-guarded detail route, with trends read from orbit's own metric history.

**Architecture:** Sub-project 1 is three plans: 1a (done) the engine table and the four adapters; **1b** (this plan) the Memory flow, Atrium and Clips screens; 1c the Brain screen. 1b adds four detail routes on the server: `GET /api/history/metrics` (orbit's `metric_samples`, `metric_rollups` and run intervals), `GET /api/atrium` (the two atrium status files in full), `GET /api/clips` (clips status and doctor through the 1a engine runner, plus the capture snapshot) and `GET /api/memory/flow` (stage states computed from flow-stage data, the current snapshots, atrium instants, launchd last runs and counter rates). Every route answers counts, epoch-ms instants, closed codes and identifiers only. The web gets three lazy routes, `/memory`, `/atrium`, `/clips`; one shared trend chart over the history route; a React Flow canvas for the flow on desktop and a stage list under 768 px.

**Tech Stack:** Node 26, Hono, `node:sqlite`, TypeScript, zod 4, React 19, TanStack Router and Query, visx, `@xyflow/react` 12.12.0 (the version the 2026-10-02 bundle probe measured), Tailwind 4, Vitest 5, Testing Library, vitest-axe, Playwright with axe.

**Spec:** `docs/superpowers/specs/2026-10-01-orbit-design.md` (sections 2, 3.1, 3.3, 4, 5.2, 5.4, 5.7, 6.6, 7 items 3, 4, 6, 7.1, 7.3, 9, 11). Task 1 adds revision 8 with the decisions below; executors read both.

## Global Constraints

- Codeality strict (spec 11): one primary unit per file, `max-lines` 100 per production file and 200 per test file, `max-lines-per-function` 50, `complexity` 10, `--max-warnings 0`; never `eslint-disable`. A constant, type or helper that is not the file's export goes in its own file (`code-policy/no-hidden-top-level-declarations`); `src/**/*.test.ts(x)` files are exempt.
- Content (spec 6.6): these routes and screens carry counts, ages, states, codes and identifiers only. Identifiers (sources, models, clip states, doctor check names and codes, launchd labels, producers) must pass `identifierSchema` (`^[\w.:/@+-]{1,128}$`); a row whose identifier fails is dropped, a secondary identifier that fails is blanked to `null`. Never a clip id, title, URL, page id or path.
- Server errors are fixed JSON (spec 8): `400 {"error":"bad_request"}`, `503 {"error":"unavailable"}`; upstream text is never echoed or logged.
- Detail calls run in a two-slot pool of their own, FIFO, timeout counted from enqueue (spec 5.2), and are cached in memory for the adapter's cadence (spec 5.4).
- Budget (spec 4): a polled or detail engine command must meet p95 2 s and under 300 MB RSS. Measured under orbit's environment: brain lint 0.43 s, brain doctor 0.5 s, clips status 1.08 s, clips doctor 0.54 s. `atrium doctor --json` (114-188 s, 620-690 MB) and `atrium context --json` (no `schemaVersion`, never benchmarked) are not run by 1b.
- Freshness badges (spec 7 item 3): `ok` within policy, `warn` past it, `down` past twice; no measurable instant is `unknown`, drawn grey and labelled "Not measured" (spec 5.7: unknown is never drawn as healthy or failed).
- Charts (spec 7.1, 7.3): series slots in a fixed order, status colours only for state and always labelled, 2 px lines, hairline gridlines, one y axis, text in text tokens; every chart one tab stop as a `slider` with value text, Home/End/arrows, Escape hides the tooltip, and a "Show table" disclosure.
- Motion (spec 7.1): every animated element encodes a measured value; `prefers-reduced-motion` stops the flow particles.
- Bundle (spec 11): initial route at most 150 KB brotli; the flow route chunk at most 250 KB; all three screens are lazy routes.
- Shell (spec 7): 375 px and 768 px widths without sideways scroll; axe clean in both schemes.
- Public repository: fixtures and docs use placeholders (`source-a`, `model-a`, `com.example.*`).
- Format per package (`pnpm exec prettier --write .` inside `apps/server`, `apps/web`, `packages/contract`) before `pnpm gate`; root and package Prettier configs order imports differently. Commit per task; push only with `pnpm gate` green.

## Decisions on open product questions

The spec leaves these readings open; Task 1 records them as revision 8.

- **D1 Atrium doctor.** Not shown in 1b. `atrium doctor --json` exceeds the budget by two orders of magnitude, so it is neither polled nor run on demand; the panel lands when atrium publishes its doctor result to a status file (backlog item).
- **D2 Context inspector.** Deferred out of 1b. `atrium context --json` carries no `schemaVersion`, has no benchmark, needs a free query argument the 1a engine table cannot express (it runs exact argument lists only), and returns content. Spec 2 admits a screen part only once its engine contract and benchmark land (backlog item).
- **D3 Flow composition.** One route, `GET /api/memory/flow`, computes every stage server-side. Stage and edge definitions are data in `apps/server/src/flow/flowStages.ts` and `flowEdges.ts` (spec 3.3: data, not code); stage ids are a closed enum in the contract so labels and explanations stay UI strings keyed by enum (spec 5.1).
- **D4 Stage freshness.** Each stage names one freshness source: an atrium instant (`archive.at`, `refresh.at`, `content.at`, `lastPass.finishedAt`), the oldest waiting item of its backlog, or the last run of its launchd label. A stage with none of them is `unknown`. A stage whose component reads `down` is `down`; a stage whose component is not configured (no snapshot) is `unknown`.
- **D5 Stage labels.** A launchd registry entry in `orbit.json` may carry `"stage": "<stage id>"`; the stage then shows that label and its last run (the newest observation whose run count rose). Instance data stays in `orbit.json`.
- **D6 Throughput.** An edge animates only when it names a counter: archive to synthesis (growth of `atrium.records`), synthesis to index (sum of sampled `atrium.synth_synthesized`; samples are stored on change, so two identical consecutive passes count once). The rate is the 24 h total divided by 24; one particle crosses every `60 / perHour` seconds, clamped to 1.5-12 s. Particles stop while the upstream stage is `warn` or `down`. Other edges are drawn without particles.
- **D7 Clips lanes.** Only the capture API lane has a count surface (capture's snapshot). The browser clipper and newsletter lanes are named in a note as not measured.
- **D8 Clips funnel.** Pending, then needs review (`needs-claude`), then in reconciliation (`synthesized`, `locally-stale`, `reconciliation-pending`), then reconciled; `inconsistent` and `unreadable` are shown apart as broken, with the warn colour and its label. Unknown future states are listed after, by name.
- **D9 History.** 24 h and 7 d read raw samples as a step function (the value in force at each bucket's end); 30 d reads hourly rollup maxima for hours older than the 7-day raw retention. Buckets not covered by an orbit run interval are gaps. Buckets reuse the System ranges: 48 x 30 min, 84 x 2 h, 90 x 8 h.
- **D10 Clips extras.** The Clips screen also shows a backlog trend (pending, needs review) and failing doctor checks (name and code), so a `warn` clips card has its cause on screen.
- **D11 Atrium shape.** The atrium adapter adopts the full documented status shape (records per source, the three instants, population models, the whole last pass); one schema per file serves the adapter and the detail route.
- **D12 Phone.** Under 768 px the flow is an ordered list of stage cards with the same buttons; the React Flow canvas is desktop and tablet only.
- **D13 Atrium policies.** Archive and refresh instants: 2 x the configured refresh interval (spec 3.1). Newest content: 3 days. Synthesis: 2 days. Episodes (hook) and brain maintenance: 2 days by label. Curation: 7 days by label. Clips oldest pending: 7 days.

## File structure

Contract (`packages/contract/src`): `metricKeys.ts` (one key), `flowStageIds.ts`, `flowStageStates.ts`, `schemas/{metricHistorySchema,atriumViewSchema,clipsViewSchema,memoryFlowSchema}.ts`, `types/{MetricHistory,AtriumView,ClipsView,MemoryFlow,FlowStageId,FlowStageState}.ts`, `index.ts`.

Server (`apps/server/src`):
- `history/` — `readSamplePoints.ts`, `readRollupPoints.ts`, `readRunIntervals.ts`, `groupSeries.ts`, `readMetricHistory.ts`, `rawRetentionMs.ts`, `readLastRuns.ts`, `readCounterTotal.ts`.
- `adapters/atrium/` — `atriumInstantSchema.ts`, `atriumRefreshSchema.ts` and `atriumSynthesisSchema.ts` (full shape), `readAtriumDocuments.ts`.
- `adapters/clips/readClipsDocuments.ts`.
- `atriumView/` — `toAtriumView.ts`, `toSourceRows.ts`, `toPopulationRows.ts`, `toSynthesisView.ts`.
- `clipsView/` — `clipsStateOrder.ts`, `toStateRows.ts`, `toCheckRows.ts`, `toCaptureLane.ts`, `toClipsView.ts`, `isIntakeDay.ts`.
- `flow/` — `flowStages.ts`, `flowEdges.ts`, `componentOf.ts`, `edgeKey.ts`, `oldestPendingAt.ts`, `freshReaders.ts`, `resolvePolicyMs.ts`, `stageState.ts`, `stageMetrics.ts`, `stagePending.ts`, `toFlowStage.ts`, `toFlowEdges.ts`, `toMemoryFlow.ts`, `collectFlowInputs.ts`.
- `time/epochOrNull.ts`, `scheduler/createTtlCache.ts`.
- `cli/` — `buildAtriumReader.ts`, `buildClipsReader.ts`, `buildStageLabels.ts`; `buildHandler.ts` and `startServer.ts` modified.
- `http/routes/` — `getMetricHistory.ts`, `getAtrium.ts`, `getClips.ts`, `getMemoryFlow.ts`; `http/createApp.ts` modified.
- `types/` — `MetricRow.ts`, `AtriumDocuments.ts`, `AtriumReader.ts`, `AtriumDeps.ts`, `ClipsDocuments.ts`, `ClipsReader.ts`, `FlowStageSpec.ts`, `FlowEdgeSpec.ts`, `FreshSource.ts`, `FlowInputs.ts`, `FlowRouteDeps.ts`, `AppDeps.ts` and `LabelEntry.ts` modified.
- `test/` — `atriumRefreshDocument.ts`, `atriumSynthesisDocument.ts`, `insertSample.ts`; `buildTestApp.ts` modified.

Web (`apps/web/src`):
- Shared trend: `selectors/bucketSeries.ts`, `selectors/rangeStarts.ts`, `selectors/selectTrend.ts`, `geometry/trendPoints.ts`, `hooks/useTrend.ts`, `charts/trendHeight.ts`, `charts/trendStrokes.ts`, `screens/memory/TrendChart.tsx`, `screens/memory/TrendTable.tsx`, `screens/memory/TrendTooltip.tsx`, types.
- Freshness: `selectors/freshnessState.ts`, `screens/memory/StateBadge.tsx`, `labels/freshnessLabels.ts`.
- Atrium: `router/atriumRoute.ts`, `hooks/useAtriumModel.ts`, `screens/atrium/{AtriumScreen,FreshnessCard,SourceBars,PopulationTable,SynthesisSection}.tsx`, `labels/atriumLabels.ts`.
- Clips: `router/clipsRoute.ts`, `hooks/useClipsModel.ts`, `selectors/selectFunnel.ts`, `selectors/selectIntakeColumns.ts`, `charts/funnelGroups.ts`, `screens/clips/{ClipsScreen,ClipsFunnel,IntakeSection,OldestList,DoctorList}.tsx`, `labels/clipsLabels.ts`.
- Flow: `router/memoryRoute.ts`, `validators/validateMemorySearch.ts`, `hooks/useMemoryFlow.ts`, `charts/flowLayout.ts`, `charts/particleDurationS.ts`, `screens/memory/{MemoryFlowScreen,StageButton,StageList,StagePanel,FlowCanvas,StageNode,FlowEdge}.tsx`, `labels/flowLabels.ts`, `labels/flowStageLabels.ts`.
- Shell: `components/shell/navItems.ts`, `types/NavItem.ts`, `router/routeTree.ts`; `.size-limit.json`; `package.json` (`@xyflow/react`).

E2E: `e2e/globalSetup.ts`, `e2e/fixtures/bin/clips.mjs`, `e2e/specs/memoryScreens.spec.ts`, `e2e/specs/widths.spec.ts`, `e2e/specs/a11y.spec.ts`.

---

### Task 1: Spec revision 8 and backlog

**Files:**

- Modify: `docs/superpowers/specs/2026-10-01-orbit-design.md` (status line, change log, new section 7.4)
- Modify: `TODO.md`

**Interfaces:**

- Produces: the decisions D1-D13 as spec text, which every later task argues from.

- [ ] **Step 1: Bump the status line.** Replace `Status: draft, revision 7` with `Status: draft, revision 8`.

- [ ] **Step 2: Add the change log entry** directly above `**Revision 4.**`:

```markdown
**Revision 8 (memory screens).** 7.4 (new): the detail routes
`GET /api/history/metrics`, `GET /api/atrium`, `GET /api/clips` and
`GET /api/memory/flow`; flow stages and edges as data with freshness sources;
`stage` on launchd registry entries; throughput from orbit's metric history;
the Atrium doctor panel and context inspector deferred until atrium publishes
a doctor status file and a versioned, benchmarked context contract.
```

- [ ] **Step 3: Add section 7.4** after the end of section 7.3 (before `### 7.1 Visual language`):

```markdown
### 7.4 Memory screens

**History.** `GET /api/history/metrics?component=<id>&range=24h|7d|30d` is a
session-guarded route over orbit's own history; any other component or range
is a 400. It answers `{ now, from, runs, series }`, each series
`{ key, points: [{ at, value }] }` in epoch ms. Samples are stored on change,
so each key's newest sample before `from` is returned as the value in force.
Where raw samples are past their 7-day retention, each hour's rollup maximum
stands in, stamped at the hour's start. Screens bucket a series as the System
screen buckets a strip (48 x 30 min, 84 x 2 h, 90 x 8 h) and take the value in
force at each bucket's end; a bucket not covered by an orbit run interval is a
gap.

**Atrium.** `GET /api/atrium` reads the two status files under the detail
pool (4 s, cached for the atrium cadence) and answers records per source,
the archive, refresh and newest-content instants, the configured refresh
interval, every population's intended and indexed counts, and the last
synthesis pass. Sources, models and the producer are identifiers. The screen
shows records per source, a freshness card (archive and refresh against 2 x
the refresh interval, newest content against 3 days), the last pass with a
synthesized and deferred trend from history, and the populations with records
not in the index. The doctor panel waits for atrium to publish its doctor
result to a status file (its command exceeds the budget), and the context
inspector waits for a versioned, benchmarked `atrium context --json`.

**Clips.** `GET /api/clips` runs `clips status --json` and
`clips doctor --json` through the engine table under the detail pool (10 s,
cached for the clips cadence) and adds the capture lane from capture's
snapshot. It answers per-state counts with the oldest instant, intake per day,
undated count, doctor checks (`name`, `ok`, `code`) and the capture lane. The
screen draws the funnel pending, needs review, in reconciliation
(`synthesized`, `locally-stale`, `reconciliation-pending`), reconciled, with
`inconsistent` and `unreadable` apart as broken; the capture lane when
configured, the clipper and newsletter lanes named as not measured; intake per
day; the oldest waiting age per state; a pending and needs-review trend; and
failing doctor checks.

**Memory flow.** `GET /api/memory/flow` answers
`{ now, stages, edges }`. Stages and edges are data in orbit. Each stage
names its component, backlog metric, the metrics and pending keys its panel
lists, a freshness source (an atrium instant, the oldest waiting item of its
backlog, or the last run of its launchd label) and a policy. A launchd
registry entry may carry `"stage": "<id>"`; the stage's last run is the newest
observation whose run count rose. A stage is `down` while its component reads
`down`, `unknown` when its component is not configured or no instant is
measured, and otherwise `ok`, `warn` or `down` against its policy. An edge may
name a counter metric; its rate is the counter's 24 h increase (or sum, for a
per-pass count) divided by 24, and it flows while the rate is positive and its
upstream stage is neither `warn` nor `down`. One particle crosses an edge
every `60 / perHour` s, clamped to 1.5-12 s, and none move under reduced
motion. Under 768 px the flow is an ordered list of stage cards. The selected
stage is kept in the URL as `?stage=`.
```

- [ ] **Step 4: Add the backlog entries** to `TODO.md` under `## Memory (sub-project 1)`, after the 1b line:

```markdown
- [ ] Atrium doctor panel (spec 7.4): needs atrium to publish its doctor result
      to a status file at the end of work it already does; `atrium doctor --json`
      measured 114-188 s and 620-690 MB, over the spec 4 budget.
- [ ] Atrium context inspector (spec 7 item 4, 7.4): needs `schemaVersion` on
      `atrium context --json`, a benchmark against the budget, and an engine
      table form for one bounded free argument (spec 5.3, 500 characters).
```

- [ ] **Step 5: Format and commit.**

```bash
pnpm exec prettier --write docs/superpowers/specs/2026-10-01-orbit-design.md TODO.md
git add docs/superpowers/specs/2026-10-01-orbit-design.md TODO.md
git commit -m "docs(spec): memory screens routes and decisions (revision 8)"
```

---

### Task 2: Metric history route

**Files:**

- Create: `packages/contract/src/schemas/metricHistorySchema.ts`, `packages/contract/src/types/MetricHistory.ts`
- Modify: `packages/contract/src/index.ts`
- Create: `apps/server/src/history/{rawRetentionMs,readSamplePoints,readRollupPoints,readRunIntervals,groupSeries,readMetricHistory}.ts`, `apps/server/src/types/MetricRow.ts`, `apps/server/src/http/routes/getMetricHistory.ts`, `apps/server/src/test/insertSample.ts`
- Modify: `apps/server/src/history/readLaunchdHistory.ts` (use `readRunIntervals`), `apps/server/src/http/createApp.ts`
- Test: `packages/contract/src/schemas/metricHistorySchema.test.ts`, `apps/server/src/history/readMetricHistory.test.ts`, `apps/server/src/http/routes/metricHistory.test.ts`

**Interfaces:**

- Consumes: `HISTORY_RANGE_SPANS` (`apps/server/src/http/routes/historyRangeSpans.ts`), `COMPONENT_IDS`, `METRIC_KEYS`, `openHistoryDb()`, `buildTestApp(overrides)`.
- Produces:
  - `metricHistorySchema`, `type MetricHistory = { now: number; from: number; runs: { started: number; stopped: number }[]; series: { key: MetricKey; points: { at: number; value: number }[] }[] }` (exported from `@orbit/contract`).
  - `readMetricHistory(db: DatabaseSync, component: string, from: number, now: number): Pick<MetricHistory, 'runs' | 'series'>`
  - `readRunIntervals(db: DatabaseSync, from: number): { started: number; stopped: number }[]`
  - `insertSample(db, component, key, value, at): void` (test helper, used again in Tasks 6 and 7).
  - Route `GET /api/history/metrics?component=<ComponentId>&range=24h|7d|30d`.

- [ ] **Step 1: Write the failing tests.**

`packages/contract/src/schemas/metricHistorySchema.test.ts`:

```ts
import { metricHistorySchema } from './metricHistorySchema'

const history = {
  now: 1_790_000_000_000,
  from: 1_789_913_600_000,
  runs: [{ started: 1_789_900_000_000, stopped: 1_790_000_000_000 }],
  series: [
    { key: 'clips.pending', points: [{ at: 1_789_990_000_000, value: 3 }] },
  ],
}

describe('metricHistorySchema', () => {
  it('accepts a history', () => {
    expect(metricHistorySchema.parse(history)).toEqual(history)
  })
  it('rejects a key outside the metric enum', () => {
    const series = [{ key: 'clips.titles', points: [] }]
    expect(() => metricHistorySchema.parse({ ...history, series })).toThrow()
  })
})
```

`apps/server/src/test/insertSample.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

export const insertSample = (
  db: DatabaseSync,
  component: string,
  key: string,
  value: number,
  at: number,
): void => {
  db.prepare(
    'INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)',
  ).run(component, key, value, at)
}
```

`apps/server/src/history/readMetricHistory.test.ts`:

```ts
import { insertSample } from '../test/insertSample'
import { openHistoryDb } from '../test/openHistoryDb'
import { readMetricHistory } from './readMetricHistory'

const HOUR = 3_600_000
const NOW = 1_790_000_000_000

describe('readMetricHistory', () => {
  it('returns the value in force at the start and every sample after it', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', 'atrium.records', 10, NOW - 30 * HOUR)
    insertSample(db, 'atrium', 'atrium.records', 11, NOW - 29 * HOUR)
    insertSample(db, 'atrium', 'atrium.records', 12, NOW - 2 * HOUR)
    insertSample(db, 'brain', 'brain.pages', 5, NOW - HOUR)
    insertSample(db, 'atrium', 'retired.key', 1, NOW - HOUR)
    db.prepare('INSERT INTO runs (started, stopped) VALUES (?, ?)').run(
      NOW - 48 * HOUR,
      NOW,
    )
    const history = readMetricHistory(db, 'atrium', NOW - 24 * HOUR, NOW)
    expect(history.series).toEqual([
      {
        key: 'atrium.records',
        points: [
          { at: NOW - 29 * HOUR, value: 11 },
          { at: NOW - 2 * HOUR, value: 12 },
        ],
      },
    ])
    expect(history.runs).toEqual([{ started: NOW - 48 * HOUR, stopped: NOW }])
  })
  it('reads hourly rollup maxima where raw samples are past retention', () => {
    const db = openHistoryDb()
    const hour = Math.floor((NOW - 10 * 24 * HOUR) / HOUR)
    db.prepare(
      'INSERT INTO metric_rollups (component, key, hour, min, max, sum, count) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run('atrium', 'atrium.not_indexed', hour, 1, 4, 5, 2)
    insertSample(db, 'atrium', 'atrium.not_indexed', 2, NOW - HOUR)
    const history = readMetricHistory(db, 'atrium', NOW - 30 * 24 * HOUR, NOW)
    expect(history.series[0]?.points).toEqual([
      { at: hour * HOUR, value: 4 },
      { at: NOW - HOUR, value: 2 },
    ])
  })
})
```

`apps/server/src/http/routes/metricHistory.test.ts`:

```ts
import { buildTestApp } from '../../test/buildTestApp'
import { insertSample } from '../../test/insertSample'
import { openHistoryDb } from '../../test/openHistoryDb'

const NOW = 1_790_000_000_000
const HISTORY = '/api/history/metrics'

describe('GET /api/history/metrics', () => {
  it('answers one component over one range on the server clock', async () => {
    const historyDb = openHistoryDb()
    insertSample(historyDb, 'clips', 'clips.pending', 3, NOW - 3_600_000)
    const res = await buildTestApp({ historyDb }).get(
      `${HISTORY}?component=clips&range=24h`,
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      now: NOW,
      from: NOW - 86_400_000,
      runs: [],
      series: [
        { key: 'clips.pending', points: [{ at: NOW - 3_600_000, value: 3 }] },
      ],
    })
  })
  it('refuses a missing or unknown component or range with a 400', async () => {
    const { get } = buildTestApp()
    for (const query of [
      'component=clips',
      'range=24h',
      'component=nope&range=24h',
      'component=clips&range=1y',
    ]) {
      const res = await get(`${HISTORY}?${query}`)
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'bad_request' })
    }
  })
  it('needs a session', async () => {
    const { app } = buildTestApp()
    const res = await app.request(
      `http://127.0.0.1:8790${HISTORY}?component=clips&range=24h`,
      { headers: { Host: '127.0.0.1:8790', 'Sec-Fetch-Site': 'same-origin' } },
    )
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd packages/contract && pnpm vitest run src/schemas/metricHistorySchema.test.ts` and `cd apps/server && pnpm vitest run src/history/readMetricHistory.test.ts src/http/routes/metricHistory.test.ts` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the contract.**

`packages/contract/src/schemas/metricHistorySchema.ts`:

```ts
import { z } from 'zod'

import { METRIC_KEYS } from '../metricKeys'

// GET /api/history/metrics: orbit's own samples, epoch milliseconds (spec 7.4).
export const metricHistorySchema = z.object({
  now: z.number(),
  from: z.number(),
  runs: z.array(z.object({ started: z.number(), stopped: z.number() })),
  series: z.array(
    z.object({
      key: z.enum(METRIC_KEYS),
      points: z.array(z.object({ at: z.number(), value: z.number() })),
    }),
  ),
})
```

`packages/contract/src/types/MetricHistory.ts`:

```ts
import type { z } from 'zod'

import type { metricHistorySchema } from '../schemas/metricHistorySchema'

export type MetricHistory = z.infer<typeof metricHistorySchema>
```

In `index.ts` add `export { metricHistorySchema } from './schemas/metricHistorySchema'` and `export type { MetricHistory } from './types/MetricHistory'` in their sorted places.

- [ ] **Step 4: Implement the server readers.**

`apps/server/src/types/MetricRow.ts`:

```ts
export type MetricRow = {
  readonly key: string
  readonly at: number
  readonly value: number
}
```

`apps/server/src/history/rawRetentionMs.ts`:

```ts
// pruneHistory keeps raw metric samples for 7 days (spec 5.7).
export const RAW_RETENTION_MS = 7 * 86_400_000
```

`apps/server/src/history/readSamplePoints.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { MetricRow } from '../types/MetricRow'

// Samples are stored on change, so each key's newest sample before `from` is
// the value still in force at `from` and is returned as its first point.
// SQLite takes the bare `value` from the row holding max(at).
export const readSamplePoints = (
  db: DatabaseSync,
  component: string,
  from: number,
): MetricRow[] => {
  const baseline = db
    .prepare(
      'SELECT key, max(at) AS at, value FROM metric_samples WHERE component = ? AND at < ? GROUP BY key',
    )
    .all(component, from) as MetricRow[]
  const within = db
    .prepare(
      'SELECT key, at, value FROM metric_samples WHERE component = ? AND at >= ? ORDER BY at, rowid',
    )
    .all(component, from) as MetricRow[]
  return [...baseline, ...within]
}
```

`apps/server/src/history/readRollupPoints.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import type { MetricRow } from '../types/MetricRow'

// Hours whose raw samples are pruned: each hour's maximum, stamped at its start.
export const readRollupPoints = (
  db: DatabaseSync,
  component: string,
  from: number,
  to: number,
): MetricRow[] =>
  db
    .prepare(
      'SELECT key, hour * 3600000 AS at, "max" AS value FROM metric_rollups WHERE component = ? AND hour >= ? AND hour < ? ORDER BY hour',
    )
    .all(
      component,
      Math.floor(from / 3_600_000),
      Math.floor(to / 3_600_000),
    ) as MetricRow[]
```

`apps/server/src/history/readRunIntervals.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

export const readRunIntervals = (
  db: DatabaseSync,
  from: number,
): { started: number; stopped: number }[] =>
  db
    .prepare(
      'SELECT started, stopped FROM runs WHERE stopped >= ? ORDER BY started',
    )
    .all(from) as { started: number; stopped: number }[]
```

In `readLaunchdHistory.ts` replace the inline `runs` query with `const runs = readRunIntervals(db, from)` and import it.

`apps/server/src/history/groupSeries.ts`:

```ts
import { METRIC_KEYS, type MetricHistory } from '@orbit/contract'
import { z } from 'zod'

import type { MetricRow } from '../types/MetricRow'

// One series per known key, points in time order; retired keys are dropped.
export const groupSeries = (
  rows: readonly MetricRow[],
): MetricHistory['series'] => {
  const keySchema = z.enum(METRIC_KEYS)
  const byKey = new Map<MetricHistory['series'][number]['key'], MetricRow[]>()
  for (const row of rows) {
    const key = keySchema.safeParse(row.key)
    if (!key.success) continue
    byKey.set(key.data, [...(byKey.get(key.data) ?? []), row])
  }
  return [...byKey].map(([key, points]) => ({
    key,
    points: points
      .toSorted((a, b) => a.at - b.at)
      .map(({ at, value }) => ({ at, value })),
  }))
}
```

`apps/server/src/history/readMetricHistory.ts`:

```ts
import type { MetricHistory } from '@orbit/contract'
import type { DatabaseSync } from 'node:sqlite'

import { groupSeries } from './groupSeries'
import { RAW_RETENTION_MS } from './rawRetentionMs'
import { readRollupPoints } from './readRollupPoints'
import { readRunIntervals } from './readRunIntervals'
import { readSamplePoints } from './readSamplePoints'

// Raw samples where they are kept, hourly rollups before that (spec 7.4).
export const readMetricHistory = (
  db: DatabaseSync,
  component: string,
  from: number,
  now: number,
): Pick<MetricHistory, 'runs' | 'series'> => {
  const rawFrom = Math.max(from, now - RAW_RETENTION_MS)
  return {
    runs: readRunIntervals(db, from),
    series: groupSeries([
      ...readRollupPoints(db, component, from, rawFrom),
      ...readSamplePoints(db, component, rawFrom),
    ]),
  }
}
```

- [ ] **Step 5: Implement the route.**

`apps/server/src/http/routes/getMetricHistory.ts`:

```ts
import { COMPONENT_IDS } from '@orbit/contract'
import type { Handler } from 'hono'
import type { DatabaseSync } from 'node:sqlite'
import { z } from 'zod'

import { readMetricHistory } from '../../history/readMetricHistory'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { HISTORY_RANGE_SPANS } from './historyRangeSpans'

export const getMetricHistory =
  (historyDb: DatabaseSync, now: () => number): Handler<OrbitEnv, string> =>
  (c) => {
    const span = HISTORY_RANGE_SPANS.get(c.req.query('range') ?? '')
    const component = z
      .enum(COMPONENT_IDS)
      .safeParse(c.req.query('component'))
    if (span === undefined || !component.success)
      return c.json({ error: 'bad_request' }, 400)
    const at = now()
    const from = at - span
    return c.json({
      now: at,
      from,
      ...readMetricHistory(historyDb, component.data, from, at),
    })
  }
```

In `createApp.ts`, after the `/launchd/history` route:

```ts
api.get('/history/metrics', getMetricHistory(deps.historyDb, deps.now))
```

- [ ] **Step 6: Run.** `cd packages/contract && pnpm vitest run` and `cd apps/server && pnpm vitest run src/history src/http` — Expected: PASS (the launchd history tests still pass with `readRunIntervals`).

- [ ] **Step 7: Format, gate the packages, commit.**

```bash
(cd packages/contract && pnpm exec prettier --write .) && (cd apps/server && pnpm exec prettier --write .)
(cd packages/contract && pnpm check:ci) && (cd apps/server && pnpm check:ci)
git add packages/contract/src apps/server/src
git commit -m "feat(history): metric history route for the memory screens"
```

---

### Task 3: Full atrium status shape and the synthesized metric

**Files:**

- Create: `apps/server/src/adapters/atrium/atriumInstantSchema.ts`, `apps/server/src/adapters/atrium/readAtriumDocuments.ts`, `apps/server/src/types/AtriumDocuments.ts`, `apps/server/src/test/atriumRefreshDocument.ts`, `apps/server/src/test/atriumSynthesisDocument.ts`
- Modify: `apps/server/src/adapters/atrium/atriumRefreshSchema.ts`, `atriumSynthesisSchema.ts`, `createAtriumAdapter.ts`, `summarizeAtrium.ts`
- Modify: `packages/contract/src/metricKeys.ts`, `apps/web/src/labels/metricLabels.ts`
- Modify: `e2e/globalSetup.ts` (the atrium fixtures take the full shape, or the e2e memory spec turns atrium `down`)
- Test: `apps/server/src/adapters/atrium/summarizeAtrium.test.ts`, `createAtriumAdapter.test.ts`, `readAtriumDocuments.test.ts` (new)

**Interfaces:**

- Consumes: `readStatusFile(path, schema, signal)`, `nonNegativeCount`, `ProcessError`.
- Produces:
  - metric key `atrium.synth_synthesized` (contract, label `'synthesized in the last pass'`).
  - `atriumRefreshSchema`: `{ schemaVersion: 1, writtenAt, records: { total, bySource: Record<string, number> }, archive: { at: string | null }, refresh: { at }, content: { at }, populations: { model: string, intended, indexed }[] }`.
  - `atriumSynthesisSchema`: `{ schemaVersion: 1, writtenAt, lastPass: { producer, startedAt, finishedAt, conversations, synthesized, skipped, failed, deferred } }`.
  - `type AtriumDocuments = { readonly refresh: z.infer<typeof atriumRefreshSchema>; readonly synthesis: z.infer<typeof atriumSynthesisSchema> | null }`
  - `readAtriumDocuments(statusDir: string, signal: AbortSignal): Promise<AtriumDocuments>` — throws `ProcessError('not_found')` without `refresh.json`.
  - Test builders `atriumRefreshDocument(overrides?: Partial<AtriumDocuments['refresh']>)` and `atriumSynthesisDocument(lastPass?: Partial<NonNullable<AtriumDocuments['synthesis']>['lastPass']>)`.

- [ ] **Step 1: Add the test builders.**

`apps/server/src/test/atriumRefreshDocument.ts`:

```ts
import type { AtriumDocuments } from '../types/AtriumDocuments'

// A full refresh.json with placeholder sources and models.
export const atriumRefreshDocument = (
  overrides: Partial<AtriumDocuments['refresh']> = {},
): AtriumDocuments['refresh'] => ({
  schemaVersion: 1,
  writtenAt: '2026-10-03T11:30:00.000Z',
  records: { total: 50, bySource: { 'source-a': 40, 'source-b': 10 } },
  archive: { at: '2026-10-03T11:00:00.000Z' },
  refresh: { at: '2026-10-03T11:30:00.000Z' },
  content: { at: '2026-10-03T10:00:00.000Z' },
  populations: [
    { model: 'model-a', intended: 10, indexed: 7 },
    { model: 'model-b', intended: 3, indexed: 5 },
  ],
  ...overrides,
})
```

`apps/server/src/test/atriumSynthesisDocument.ts`:

```ts
import type { AtriumDocuments } from '../types/AtriumDocuments'

type LastPass = NonNullable<AtriumDocuments['synthesis']>['lastPass']

export const atriumSynthesisDocument = (
  lastPass: Partial<LastPass> = {},
): NonNullable<AtriumDocuments['synthesis']> => ({
  schemaVersion: 1,
  writtenAt: '2026-10-03T11:00:00.000Z',
  lastPass: {
    producer: 'task',
    startedAt: '2026-10-03T10:40:00.000Z',
    finishedAt: '2026-10-03T11:00:00.000Z',
    conversations: 12,
    synthesized: 6,
    skipped: 1,
    failed: 1,
    deferred: 4,
    ...lastPass,
  },
})
```

- [ ] **Step 2: Move the existing atrium tests onto the builders and add the new expectations.**

In `summarizeAtrium.test.ts` delete the local `refresh` and `synthesis` constants, import both builders, and write each call as `summarizeAtrium(atriumRefreshDocument({ writtenAt: '…' }), atriumSynthesisDocument(), hour, now)` (and `null` for the absent-synthesis case). The first test's metric expectation becomes:

```ts
expect(s.metrics.map((m) => [m.key, m.value])).toEqual([
  ['atrium.records', 50],
  ['atrium.not_indexed', 3],
  ['atrium.synth_synthesized', 6],
  ['atrium.synth_deferred', 4],
  ['atrium.synth_failed', 1],
])
```

In `createAtriumAdapter.test.ts`, the valid pair becomes:

```ts
await writeFile(
  join(dir, 'refresh.json'),
  JSON.stringify(
    atriumRefreshDocument({
      writtenAt,
      records: { total: 2, bySource: { 'source-a': 2 } },
      populations: [],
    }),
  ),
)
```

Create `readAtriumDocuments.test.ts`:

```ts
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { atriumRefreshDocument } from '../../test/atriumRefreshDocument'
import { atriumSynthesisDocument } from '../../test/atriumSynthesisDocument'
import { readAtriumDocuments } from './readAtriumDocuments'

const signal = () => new AbortController().signal

describe('readAtriumDocuments', () => {
  it('reads both documents and tolerates a missing synthesis file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await writeFile(
      join(dir, 'refresh.json'),
      JSON.stringify(atriumRefreshDocument()),
    )
    expect((await readAtriumDocuments(dir, signal())).synthesis).toBeNull()
    await writeFile(
      join(dir, 'synthesis.json'),
      JSON.stringify(atriumSynthesisDocument()),
    )
    const docs = await readAtriumDocuments(dir, signal())
    expect(docs.refresh.records.bySource).toEqual({
      'source-a': 40,
      'source-b': 10,
    })
    expect(docs.synthesis?.lastPass.synthesized).toBe(6)
  })
  it('reads not_found without refresh.json and schema_invalid when partial', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await expect(readAtriumDocuments(dir, signal())).rejects.toMatchObject({
      reason: 'not_found',
    })
    await writeFile(
      join(dir, 'refresh.json'),
      JSON.stringify({ ...atriumRefreshDocument(), archive: undefined }),
    )
    await expect(readAtriumDocuments(dir, signal())).rejects.toMatchObject({
      reason: 'schema_invalid',
    })
  })
})
```

- [ ] **Step 3: Run to see them fail.** `cd apps/server && pnpm vitest run src/adapters/atrium` — Expected: FAIL (`AtriumDocuments` and `readAtriumDocuments` missing; type errors in the builders).

- [ ] **Step 4: Implement.**

`packages/contract/src/metricKeys.ts`: insert `'atrium.synth_synthesized',` before `'atrium.synth_deferred',`. `apps/web/src/labels/metricLabels.ts`: insert `'atrium.synth_synthesized': 'synthesized in the last pass',` before the deferred label.

`apps/server/src/adapters/atrium/atriumInstantSchema.ts`:

```ts
import { z } from 'zod'

// `ageSeconds`, `exists` and `bytes` are ignored: orbit ages against its clock.
export const atriumInstantSchema = z.object({
  at: z.iso.datetime({ offset: true }).nullable(),
})
```

`atriumRefreshSchema.ts` (replace the body):

```ts
import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'
import { atriumInstantSchema } from './atriumInstantSchema'

// refresh.json as atrium documents it: counts, provider and model names,
// instants. Unknown fields are stripped, never rejected.
export const atriumRefreshSchema = z.object({
  schemaVersion: z.literal(1),
  writtenAt: z.iso.datetime({ offset: true }),
  records: z.object({
    total: nonNegativeCount,
    bySource: z.record(z.string(), nonNegativeCount),
  }),
  archive: atriumInstantSchema,
  refresh: atriumInstantSchema,
  content: atriumInstantSchema,
  populations: z.array(
    z.object({
      model: z.string(),
      intended: nonNegativeCount,
      indexed: nonNegativeCount,
    }),
  ),
})
```

`atriumSynthesisSchema.ts` (replace the body):

```ts
import { z } from 'zod'

import { nonNegativeCount } from '../nonNegativeCount'

export const atriumSynthesisSchema = z.object({
  schemaVersion: z.literal(1),
  writtenAt: z.iso.datetime({ offset: true }),
  lastPass: z.object({
    producer: z.string(),
    startedAt: z.iso.datetime({ offset: true }),
    finishedAt: z.iso.datetime({ offset: true }),
    conversations: nonNegativeCount,
    synthesized: nonNegativeCount,
    skipped: nonNegativeCount,
    failed: nonNegativeCount,
    deferred: nonNegativeCount,
  }),
})
```

`apps/server/src/types/AtriumDocuments.ts`:

```ts
import type { z } from 'zod'

import type { atriumRefreshSchema } from '../adapters/atrium/atriumRefreshSchema'
import type { atriumSynthesisSchema } from '../adapters/atrium/atriumSynthesisSchema'

export type AtriumDocuments = {
  readonly refresh: z.infer<typeof atriumRefreshSchema>
  readonly synthesis: z.infer<typeof atriumSynthesisSchema> | null
}
```

`apps/server/src/adapters/atrium/readAtriumDocuments.ts`:

```ts
import { join } from 'node:path'

import { ProcessError } from '../../process/ProcessError'
import type { AtriumDocuments } from '../../types/AtriumDocuments'
import { atriumRefreshSchema } from './atriumRefreshSchema'
import { atriumSynthesisSchema } from './atriumSynthesisSchema'
import { readStatusFile } from './readStatusFile'

// Shared by the adapter and the detail route; never runs atrium itself.
export const readAtriumDocuments = async (
  statusDir: string,
  signal: AbortSignal,
): Promise<AtriumDocuments> => {
  const refresh = await readStatusFile(
    join(statusDir, 'refresh.json'),
    atriumRefreshSchema,
    signal,
  )
  if (refresh === null) throw new ProcessError('not_found')
  const synthesis = await readStatusFile(
    join(statusDir, 'synthesis.json'),
    atriumSynthesisSchema,
    signal,
  )
  return { refresh, synthesis }
}
```

`createAtriumAdapter.ts`: replace the body of `read` with

```ts
  read: async (signal) => {
    const { refresh, synthesis } = await readAtriumDocuments(
      deps.statusDir,
      signal,
    )
    const now = new Date()
    return {
      component: 'atrium',
      ...summarizeAtrium(refresh, synthesis, deps.refreshIntervalMs, now),
      events: [],
      observedAt: now.toISOString(),
    }
  },
```

and drop the now-unused imports (`join`, `ProcessError`, both schemas, `readStatusFile`).

`summarizeAtrium.ts`: the `synthesis !== null` push becomes

```ts
  if (synthesis !== null)
    metrics.push(
      {
        key: 'atrium.synth_synthesized',
        value: synthesis.lastPass.synthesized,
        at,
      },
      { key: 'atrium.synth_deferred', value: synthesis.lastPass.deferred, at },
      { key: 'atrium.synth_failed', value: synthesis.lastPass.failed, at },
    )
```

- [ ] **Step 5: Give the e2e atrium fixture the full shape.** In `e2e/globalSetup.ts` replace the single `refresh.json` write with:

```ts
const ago = (ms: number): string => new Date(Date.now() - ms).toISOString()
await writeFile(
  join(atriumStatusDir, 'refresh.json'),
  JSON.stringify({
    schemaVersion: 1,
    writtenAt: ago(0),
    records: { total: 40, bySource: { 'source-a': 30, 'source-b': 10 } },
    archive: { at: ago(600_000), ageSeconds: 600, exists: true, bytes: 1 },
    refresh: { at: ago(300_000), ageSeconds: 300 },
    content: { at: ago(3_600_000), ageSeconds: 3600 },
    populations: [
      {
        model: 'model-a',
        listed: true,
        records: 5,
        episodes: 5,
        intended: 5,
        indexed: 3,
      },
    ],
  }),
)
await writeFile(
  join(atriumStatusDir, 'synthesis.json'),
  JSON.stringify({
    schemaVersion: 1,
    writtenAt: ago(900_000),
    lastPass: {
      producer: 'task',
      startedAt: ago(1_200_000),
      finishedAt: ago(900_000),
      conversations: 4,
      synthesized: 3,
      skipped: 0,
      failed: 0,
      deferred: 1,
    },
  }),
)
```

- [ ] **Step 6: Run.** `cd apps/server && pnpm vitest run src/adapters` and `cd apps/web && pnpm vitest run src/labels` — Expected: PASS. Then `pnpm build && pnpm exec playwright test -c e2e/playwright.config.ts e2e/specs/memory.spec.ts` from the root — Expected: PASS (`Atrium: Healthy`).

- [ ] **Step 7: Format and commit.**

```bash
for p in packages/contract apps/server apps/web; do (cd $p && pnpm exec prettier --write .); done
pnpm exec prettier --write e2e
git add packages/contract/src apps/server/src apps/web/src e2e/globalSetup.ts
git commit -m "feat(atrium): read the full status shape and sample synthesized per pass"
```

---

### Task 4: Atrium detail route

**Files:**

- Create: `packages/contract/src/schemas/atriumViewSchema.ts`, `packages/contract/src/types/AtriumView.ts`; modify `packages/contract/src/index.ts`
- Create: `apps/server/src/time/epochOrNull.ts`, `apps/server/src/scheduler/createTtlCache.ts`, `apps/server/src/atriumView/{toAtriumView,toSourceRows,toPopulationRows,toSynthesisView}.ts`, `apps/server/src/types/{AtriumReader,AtriumDeps}.ts`, `apps/server/src/cli/buildAtriumReader.ts`, `apps/server/src/http/routes/getAtrium.ts`
- Modify: `apps/server/src/types/AppDeps.ts`, `apps/server/src/http/createApp.ts`, `apps/server/src/test/buildTestApp.ts`, `apps/server/src/cli/buildHandler.ts`
- Test: `packages/contract/src/schemas/atriumViewSchema.test.ts`, `apps/server/src/scheduler/createTtlCache.test.ts`, `apps/server/src/http/routes/atrium.test.ts`

**Interfaces:**

- Consumes: `AtriumDocuments`, `readAtriumDocuments` (Task 3), `isIdentifier`, `identifierOrNull` (`apps/server/src/workerView/`), `createDetailPool`, builders from Task 3.
- Produces:
  - `atriumViewSchema` / `type AtriumView = { now; writtenAt; refreshIntervalMs; records: { total; bySource: { source: string; count: number }[] }; archiveAt: number | null; refreshAt: number | null; contentAt: number | null; populations: { model: string; intended: number; indexed: number }[]; synthesis: { finishedAt: number; durationMs: number; producer: string | null; conversations; synthesized; skipped; failed; deferred } | null }`
  - `epochOrNull(iso: string | null | undefined): number | null`
  - `createTtlCache<T>(ttlMs: number, now: () => number): (load: () => Promise<T>) => Promise<T>`
  - `type AtriumReader = (signal: AbortSignal) => Promise<AtriumDocuments>`; `type AtriumDeps = { readonly read: AtriumReader; readonly refreshIntervalMs: number }`
  - `AppDeps.atrium: AtriumDeps | null`; a third detail pool `memoryPool = createDetailPool(2)` in `createApp`, shared by every memory route.
  - Route `GET /api/atrium`.

- [ ] **Step 1: Write the failing tests.**

`packages/contract/src/schemas/atriumViewSchema.test.ts`:

```ts
import { atriumViewSchema } from './atriumViewSchema'

const view = {
  now: 1_790_000_000_000,
  writtenAt: 1_789_999_000_000,
  refreshIntervalMs: 3_600_000,
  records: { total: 3, bySource: [{ source: 'source-a', count: 3 }] },
  archiveAt: 1_789_998_000_000,
  refreshAt: null,
  contentAt: 1_789_990_000_000,
  populations: [{ model: 'model-a', intended: 4, indexed: 1 }],
  synthesis: {
    finishedAt: 1_789_999_000_000,
    durationMs: 60_000,
    producer: null,
    conversations: 2,
    synthesized: 1,
    skipped: 0,
    failed: 0,
    deferred: 1,
  },
}

describe('atriumViewSchema', () => {
  it('accepts a view', () => {
    expect(atriumViewSchema.parse(view)).toEqual(view)
  })
  it('rejects a source that is not an identifier', () => {
    const records = { total: 1, bySource: [{ source: 'a b', count: 1 }] }
    expect(() => atriumViewSchema.parse({ ...view, records })).toThrow()
  })
})
```

`apps/server/src/scheduler/createTtlCache.test.ts`:

```ts
import { createTtlCache } from './createTtlCache'

describe('createTtlCache', () => {
  it('serves a value for its ttl, shares a load in flight, and retries a failure', async () => {
    let clock = 0
    const cache = createTtlCache<number>(1000, () => clock)
    const load = vi.fn<() => Promise<number>>().mockResolvedValue(1)
    expect(await Promise.all([cache(load), cache(load)])).toEqual([1, 1])
    expect(load).toHaveBeenCalledTimes(1)
    clock = 999
    await cache(load)
    expect(load).toHaveBeenCalledTimes(1)
    clock = 1000
    load.mockRejectedValueOnce(new Error('boom'))
    await expect(cache(load)).rejects.toThrow('boom')
    expect(await cache(load)).toBe(1)
    expect(load).toHaveBeenCalledTimes(3)
  })
})
```

`apps/server/src/http/routes/atrium.test.ts`:

```ts
import { atriumViewSchema } from '@orbit/contract'

import { ProcessError } from '../../process/ProcessError'
import { atriumRefreshDocument } from '../../test/atriumRefreshDocument'
import { atriumSynthesisDocument } from '../../test/atriumSynthesisDocument'
import { buildTestApp } from '../../test/buildTestApp'
import type { AtriumDocuments } from '../../types/AtriumDocuments'

const docs: AtriumDocuments = {
  refresh: atriumRefreshDocument({
    records: { total: 3, bySource: { 'source-a': 1, 'bad source': 2 } },
    content: { at: null },
    populations: [
      { model: 'model-a', intended: 4, indexed: 1 },
      { model: 'model a', intended: 1, indexed: 0 },
    ],
  }),
  synthesis: atriumSynthesisDocument({ producer: 'free text here' }),
}
const atriumWith = (read: () => Promise<AtriumDocuments>) => ({
  atrium: { read, refreshIntervalMs: 3_600_000 },
})

describe('GET /api/atrium', () => {
  it('answers counts, instants and identifiers only', async () => {
    const res = await buildTestApp(
      atriumWith(async () => Promise.resolve(docs)),
    ).get('/api/atrium')
    expect(res.status).toBe(200)
    const view = atriumViewSchema.parse(await res.json())
    expect(view.now).toBe(1_790_000_000_000)
    expect(view.records.bySource).toEqual([{ source: 'source-a', count: 1 }])
    expect(view.populations).toEqual([
      { model: 'model-a', intended: 4, indexed: 1 },
    ])
    expect(view.refreshAt).toBe(Date.parse('2026-10-03T11:30:00.000Z'))
    expect(view.contentAt).toBeNull()
    expect(view.synthesis).toMatchObject({
      synthesized: 6,
      deferred: 4,
      producer: null,
      durationMs: 1_200_000,
    })
  })
  it('answers a fixed 503 when atrium is not configured or unreadable', async () => {
    const off = await buildTestApp().get('/api/atrium')
    expect(off.status).toBe(503)
    const failing = await buildTestApp(
      atriumWith(async () =>
        Promise.reject(new ProcessError('permission_denied')),
      ),
    ).get('/api/atrium')
    expect(failing.status).toBe(503)
    expect(await failing.json()).toEqual({ error: 'unavailable' })
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd packages/contract && pnpm vitest run src/schemas/atriumViewSchema.test.ts`; `cd apps/server && pnpm vitest run src/scheduler/createTtlCache.test.ts src/http/routes/atrium.test.ts` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the contract.**

`packages/contract/src/schemas/atriumViewSchema.ts`:

```ts
import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

// GET /api/atrium: counts, epoch-ms instants and identifiers (spec 7.4).
export const atriumViewSchema = z.object({
  now: z.number(),
  writtenAt: z.number(),
  refreshIntervalMs: z.number(),
  records: z.object({
    total: countSchema,
    bySource: z.array(
      z.object({ source: identifierSchema, count: countSchema }),
    ),
  }),
  archiveAt: z.number().nullable(),
  refreshAt: z.number().nullable(),
  contentAt: z.number().nullable(),
  populations: z.array(
    z.object({
      model: identifierSchema,
      intended: countSchema,
      indexed: countSchema,
    }),
  ),
  synthesis: z
    .object({
      finishedAt: z.number(),
      durationMs: z.number(),
      producer: identifierSchema.nullable(),
      conversations: countSchema,
      synthesized: countSchema,
      skipped: countSchema,
      failed: countSchema,
      deferred: countSchema,
    })
    .nullable(),
})
```

`packages/contract/src/types/AtriumView.ts`:

```ts
import type { z } from 'zod'

import type { atriumViewSchema } from '../schemas/atriumViewSchema'

export type AtriumView = z.infer<typeof atriumViewSchema>
```

Export both from `index.ts`.

- [ ] **Step 4: Implement the server pieces.**

`apps/server/src/time/epochOrNull.ts`:

```ts
// An ISO instant as epoch ms; null when absent or unparseable.
export const epochOrNull = (iso: string | null | undefined): number | null => {
  if (iso === null || iso === undefined) return null
  const at = Date.parse(iso)
  return Number.isNaN(at) ? null : at
}
```

`apps/server/src/scheduler/createTtlCache.ts`:

```ts
// Detail results are cached for the adapter's cadence (spec 5.4); calls in
// flight share one load, and a failure is never cached.
export const createTtlCache = <T>(
  ttlMs: number,
  now: () => number,
): ((load: () => Promise<T>) => Promise<T>) => {
  let held: { value: T; at: number } | null = null
  let flight: Promise<T> | null = null
  return async (load) => {
    if (held !== null && now() - held.at < ttlMs) return held.value
    flight ??= load()
      .then((value) => {
        held = { value, at: now() }
        return value
      })
      .finally(() => {
        flight = null
      })
    return flight
  }
}
```

`apps/server/src/types/AtriumReader.ts`:

```ts
import type { AtriumDocuments } from './AtriumDocuments'

export type AtriumReader = (signal: AbortSignal) => Promise<AtriumDocuments>
```

`apps/server/src/types/AtriumDeps.ts`:

```ts
import type { AtriumReader } from './AtriumReader'

export type AtriumDeps = {
  readonly read: AtriumReader
  readonly refreshIntervalMs: number
}
```

`apps/server/src/atriumView/toSourceRows.ts`:

```ts
import type { AtriumView } from '@orbit/contract'

import { isIdentifier } from '../workerView/isIdentifier'

// Largest source first; a source name that is not an identifier is dropped.
export const toSourceRows = (
  bySource: Readonly<Record<string, number>>,
): AtriumView['records']['bySource'] =>
  Object.entries(bySource)
    .filter(([source]) => isIdentifier(source))
    .map(([source, count]) => ({ source, count }))
    .toSorted((a, b) => b.count - a.count || a.source.localeCompare(b.source))
```

`apps/server/src/atriumView/toPopulationRows.ts`:

```ts
import type { AtriumView } from '@orbit/contract'

import type { AtriumDocuments } from '../types/AtriumDocuments'
import { isIdentifier } from '../workerView/isIdentifier'

export const toPopulationRows = (
  populations: AtriumDocuments['refresh']['populations'],
): AtriumView['populations'] =>
  populations
    .filter((p) => isIdentifier(p.model))
    .map(({ model, intended, indexed }) => ({ model, intended, indexed }))
```

`apps/server/src/atriumView/toSynthesisView.ts`:

```ts
import type { AtriumView } from '@orbit/contract'

import type { AtriumDocuments } from '../types/AtriumDocuments'
import { identifierOrNull } from '../workerView/identifierOrNull'

type LastPass = NonNullable<AtriumDocuments['synthesis']>['lastPass']

export const toSynthesisView = (
  pass: LastPass,
): NonNullable<AtriumView['synthesis']> => {
  const finishedAt = Date.parse(pass.finishedAt)
  return {
    finishedAt,
    durationMs: Math.max(0, finishedAt - Date.parse(pass.startedAt)),
    producer: identifierOrNull(pass.producer),
    conversations: pass.conversations,
    synthesized: pass.synthesized,
    skipped: pass.skipped,
    failed: pass.failed,
    deferred: pass.deferred,
  }
}
```

`apps/server/src/atriumView/toAtriumView.ts`:

```ts
import type { AtriumView } from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'
import type { AtriumDocuments } from '../types/AtriumDocuments'
import { toPopulationRows } from './toPopulationRows'
import { toSourceRows } from './toSourceRows'
import { toSynthesisView } from './toSynthesisView'

export const toAtriumView = (
  { refresh, synthesis }: AtriumDocuments,
  refreshIntervalMs: number,
  now: number,
): AtriumView => ({
  now,
  writtenAt: Date.parse(refresh.writtenAt),
  refreshIntervalMs,
  records: {
    total: refresh.records.total,
    bySource: toSourceRows(refresh.records.bySource),
  },
  archiveAt: epochOrNull(refresh.archive.at),
  refreshAt: epochOrNull(refresh.refresh.at),
  contentAt: epochOrNull(refresh.content.at),
  populations: toPopulationRows(refresh.populations),
  synthesis: synthesis === null ? null : toSynthesisView(synthesis.lastPass),
})
```

`apps/server/src/cli/buildAtriumReader.ts`:

```ts
import { readAtriumDocuments } from '../adapters/atrium/readAtriumDocuments'
import { createTtlCache } from '../scheduler/createTtlCache'
import type { AtriumDeps } from '../types/AtriumDeps'
import type { AtriumDocuments } from '../types/AtriumDocuments'
import type { OrbitConfig } from '../types/OrbitConfig'

export const buildAtriumReader = (
  atrium: OrbitConfig['atrium'],
  cadenceMs: number,
): AtriumDeps | null => {
  if (atrium === undefined) return null
  const cached = createTtlCache<AtriumDocuments>(cadenceMs, Date.now)
  return {
    refreshIntervalMs: atrium.refreshIntervalMs,
    read: async (signal) =>
      cached(async () => readAtriumDocuments(atrium.statusDir, signal)),
  }
}
```

`apps/server/src/http/routes/getAtrium.ts`:

```ts
import type { Handler } from 'hono'

import { toAtriumView } from '../../atriumView/toAtriumView'
import type { AtriumDeps } from '../../types/AtriumDeps'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'

// Fixed JSON on any failure: the reason stays on the atrium card.
export const getAtrium =
  (
    atrium: AtriumDeps | null,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (atrium === null) return c.json({ error: 'unavailable' }, 503)
    const docs = await pool.run(atrium.read, 4000).catch(() => null)
    return docs === null
      ? c.json({ error: 'unavailable' }, 503)
      : c.json(toAtriumView(docs, atrium.refreshIntervalMs, now()))
  }
```

`AppDeps.ts`: add `readonly atrium: AtriumDeps | null` (import the type). `buildTestApp.ts`: add `atrium: null,` to the defaults before `...overrides`. `createApp.ts`: add `const memoryPool = createDetailPool(2)` beside `workerPool` and

```ts
api.get('/atrium', getAtrium(deps.atrium, memoryPool, deps.now))
```

`buildHandler.ts`: add to the `createApp` call

```ts
    atrium: buildAtriumReader(config.atrium, config.cadenceMs.atrium ?? 60_000),
```

- [ ] **Step 5: Run.** `cd packages/contract && pnpm vitest run`; `cd apps/server && pnpm vitest run` — Expected: PASS.

- [ ] **Step 6: Format, gate the packages, commit.**

```bash
(cd packages/contract && pnpm exec prettier --write . && pnpm check:ci)
(cd apps/server && pnpm exec prettier --write . && pnpm check:ci)
git add packages/contract/src apps/server/src
git commit -m "feat(atrium): detail route with sources, instants and populations"
```

---
### Task 5: Clips detail route

**Files:**

- Create: `packages/contract/src/schemas/clipsViewSchema.ts`, `packages/contract/src/types/ClipsView.ts`; modify `packages/contract/src/index.ts`
- Create: `apps/server/src/adapters/clips/readClipsDocuments.ts`, `apps/server/src/types/{ClipsDocuments,ClipsReader}.ts`, `apps/server/src/clipsView/{clipsStateOrder,isIntakeDay,toStateRows,toCheckRows,toCaptureLane,toClipsView}.ts`, `apps/server/src/cli/buildClipsReader.ts`, `apps/server/src/http/routes/getClips.ts`
- Modify: `apps/server/src/adapters/clips/createClipsAdapter.ts`, `apps/server/src/types/AppDeps.ts`, `apps/server/src/http/createApp.ts`, `apps/server/src/test/buildTestApp.ts`, `apps/server/src/cli/buildHandler.ts` (new `engines` parameter), `apps/server/src/cli/startServer.ts`
- Test: `packages/contract/src/schemas/clipsViewSchema.test.ts`, `apps/server/src/http/routes/clips.test.ts`

**Interfaces:**

- Consumes: `EngineRunner`, `parseEngineDocument`, `clipsStatusSchema`, `doctorDocumentSchema`, `createFailedEngineRunner`, `createTtlCache`, `epochOrNull`, `isIdentifier` (Task 4), `Hub.snapshots()`, `memoryPool` (Task 4).
- Produces:
  - `clipsViewSchema` / `type ClipsView = { now; total; states: { state: string; count: number; oldestAt: number | null }[]; intake: { days: { day: string; count: number }[]; undated: number }; doctor: { ok: boolean; checks: { name: string; ok: boolean; code: string }[] }; capture: { count: number; oldestAt: number | null } | null }`
  - `type ClipsDocuments = { readonly status: z.infer<typeof clipsStatusSchema>; readonly doctor: z.infer<typeof doctorDocumentSchema> }`; `type ClipsReader = (signal: AbortSignal) => Promise<ClipsDocuments>`
  - `readClipsDocuments(run: EngineRunner, signal: AbortSignal): Promise<ClipsDocuments>` (shared by the adapter and the route)
  - `buildHandler(state, hub, webRoot, port, engines: Readonly<Record<string, EngineRunner>>)`; `AppDeps.clips: ClipsReader | null`
  - Route `GET /api/clips`.

- [ ] **Step 1: Write the failing tests.**

`packages/contract/src/schemas/clipsViewSchema.test.ts`:

```ts
import { clipsViewSchema } from './clipsViewSchema'

const view = {
  now: 1_790_000_000_000,
  total: 4,
  states: [{ state: 'pending', count: 4, oldestAt: 1_789_000_000_000 }],
  intake: { days: [{ day: '2026-10-02', count: 2 }], undated: 0 },
  doctor: { ok: true, checks: [{ name: 'paths', ok: true, code: 'ok' }] },
  capture: null,
}

describe('clipsViewSchema', () => {
  it('accepts a view', () => {
    expect(clipsViewSchema.parse(view)).toEqual(view)
  })
  it('rejects an intake day that is not a date and a free-text code', () => {
    const days = [{ day: 'yesterday', count: 1 }]
    expect(() =>
      clipsViewSchema.parse({ ...view, intake: { days, undated: 0 } }),
    ).toThrow()
    const checks = [{ name: 'paths', ok: false, code: 'see the log' }]
    expect(() =>
      clipsViewSchema.parse({ ...view, doctor: { ok: false, checks } }),
    ).toThrow()
  })
})
```

`apps/server/src/http/routes/clips.test.ts`:

```ts
import { clipsViewSchema, type Snapshot } from '@orbit/contract'

import { createHub } from '../../hub/createHub'
import { ProcessError } from '../../process/ProcessError'
import { buildTestApp } from '../../test/buildTestApp'
import type { ClipsDocuments } from '../../types/ClipsDocuments'

const docs: ClipsDocuments = {
  status: {
    schemaVersion: 1,
    total: 10,
    states: { reconciled: 4, pending: 3, 'needs-claude': 2, 'bad state': 1 },
    oldestAt: { pending: '2026-10-01T00:00:00.000Z', 'needs-claude': null },
    intake: {
      days: [
        { day: '2026-10-02', count: 2 },
        { day: 'yesterday', count: 1 },
      ],
      undated: 1,
    },
  },
  doctor: {
    schemaVersion: 1,
    ok: false,
    checks: [
      { name: 'archive', ok: false, code: 'archive_public_remote' },
      { name: 'paths', ok: true, code: 'free text' },
    ],
  },
}
const capture = (state: 'ok' | 'down'): Snapshot => ({
  component: 'capture',
  health: { state, reason: state === 'down' ? 'unreachable' : null },
  metrics:
    state === 'ok'
      ? [{ key: 'capture.undrained', value: 2, at: '2026-10-03T10:00:00.000Z' }]
      : [],
  pending:
    state === 'ok'
      ? [
          {
            key: 'capture.undrained',
            count: 2,
            oldestAt: '2026-10-02T08:00:00.000Z',
          },
        ]
      : [],
  events: [],
  observedAt: '2026-10-03T10:00:00.000Z',
  lastGood: null,
})
const appWith = (snapshot: Snapshot | null) => {
  const hub = createHub({ ringSize: 10, recentEvents: 5, firstId: 1 })
  if (snapshot !== null) hub.publish(snapshot)
  return buildTestApp({ hub, clips: async () => Promise.resolve(docs) })
}

describe('GET /api/clips', () => {
  it('answers ordered states, dated intake, coded checks and the capture lane', async () => {
    const res = await appWith(capture('ok')).get('/api/clips')
    expect(res.status).toBe(200)
    const view = clipsViewSchema.parse(await res.json())
    expect(view.states).toEqual([
      { state: 'pending', count: 3, oldestAt: Date.parse('2026-10-01T00:00:00.000Z') },
      { state: 'needs-claude', count: 2, oldestAt: null },
      { state: 'reconciled', count: 4, oldestAt: null },
    ])
    expect(view.intake).toEqual({
      days: [{ day: '2026-10-02', count: 2 }],
      undated: 1,
    })
    expect(view.doctor).toEqual({
      ok: false,
      checks: [{ name: 'archive', ok: false, code: 'archive_public_remote' }],
    })
    expect(view.capture).toEqual({
      count: 2,
      oldestAt: Date.parse('2026-10-02T08:00:00.000Z'),
    })
  })
  it('leaves the capture lane out when capture is absent or down', async () => {
    for (const snapshot of [null, capture('down')]) {
      const view = clipsViewSchema.parse(
        await (await appWith(snapshot).get('/api/clips')).json(),
      )
      expect(view.capture).toBeNull()
    }
  })
  it('answers a fixed 503 when clips is not configured or fails', async () => {
    expect((await buildTestApp().get('/api/clips')).status).toBe(503)
    const res = await buildTestApp({
      clips: async () => Promise.reject(new ProcessError('not_found')),
    }).get('/api/clips')
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'unavailable' })
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd packages/contract && pnpm vitest run src/schemas/clipsViewSchema.test.ts`; `cd apps/server && pnpm vitest run src/http/routes/clips.test.ts` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the contract.**

`packages/contract/src/schemas/clipsViewSchema.ts`:

```ts
import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

// GET /api/clips: states, days and codes only; no clip id, title or url.
export const clipsViewSchema = z.object({
  now: z.number(),
  total: countSchema,
  states: z.array(
    z.object({
      state: identifierSchema,
      count: countSchema,
      oldestAt: z.number().nullable(),
    }),
  ),
  intake: z.object({
    days: z.array(z.object({ day: z.iso.date(), count: countSchema })),
    undated: countSchema,
  }),
  doctor: z.object({
    ok: z.boolean(),
    checks: z.array(
      z.object({
        name: identifierSchema,
        ok: z.boolean(),
        code: identifierSchema,
      }),
    ),
  }),
  capture: z
    .object({ count: countSchema, oldestAt: z.number().nullable() })
    .nullable(),
})
```

`packages/contract/src/types/ClipsView.ts`:

```ts
import type { z } from 'zod'

import type { clipsViewSchema } from '../schemas/clipsViewSchema'

export type ClipsView = z.infer<typeof clipsViewSchema>
```

Export both from `index.ts`.

- [ ] **Step 4: Implement the shared read.**

`apps/server/src/types/ClipsDocuments.ts`:

```ts
import type { z } from 'zod'

import type { clipsStatusSchema } from '../adapters/clips/clipsStatusSchema'
import type { doctorDocumentSchema } from '../engines/doctorDocumentSchema'

export type ClipsDocuments = {
  readonly status: z.infer<typeof clipsStatusSchema>
  readonly doctor: z.infer<typeof doctorDocumentSchema>
}
```

`apps/server/src/types/ClipsReader.ts`:

```ts
import type { ClipsDocuments } from './ClipsDocuments'

export type ClipsReader = (signal: AbortSignal) => Promise<ClipsDocuments>
```

`apps/server/src/adapters/clips/readClipsDocuments.ts`:

```ts
import { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { ClipsDocuments } from '../../types/ClipsDocuments'
import type { EngineRunner } from '../../types/EngineRunner'
import { clipsStatusSchema } from './clipsStatusSchema'

// The two listed subcommands, in the order the adapter has always run them.
export const readClipsDocuments = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<ClipsDocuments> => {
  const status = parseEngineDocument(
    await run(['status', '--json'], signal),
    clipsStatusSchema,
  )
  const doctor = parseEngineDocument(
    await run(['doctor', '--json'], signal),
    doctorDocumentSchema,
  )
  return { status, doctor }
}
```

In `createClipsAdapter.ts` replace the two `parseEngineDocument` calls with `const { status, doctor } = await readClipsDocuments(deps.run, signal)` and drop the now-unused imports. Its existing tests must pass unchanged.

- [ ] **Step 5: Implement the view.**

`apps/server/src/clipsView/clipsStateOrder.ts`:

```ts
// Funnel order (spec 7.4); a state clips adds later sorts after these by name.
export const CLIPS_STATE_ORDER: readonly string[] = [
  'pending',
  'needs-claude',
  'synthesized',
  'locally-stale',
  'reconciliation-pending',
  'reconciled',
  'inconsistent',
  'unreadable',
]
```

`apps/server/src/clipsView/isIntakeDay.ts`:

```ts
import { z } from 'zod'

export const isIntakeDay = (day: string): boolean =>
  z.iso.date().safeParse(day).success
```

`apps/server/src/clipsView/toStateRows.ts`:

```ts
import type { ClipsView } from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'
import type { ClipsDocuments } from '../types/ClipsDocuments'
import { isIdentifier } from '../workerView/isIdentifier'
import { CLIPS_STATE_ORDER } from './clipsStateOrder'

export const toStateRows = (
  status: ClipsDocuments['status'],
): ClipsView['states'] => {
  const rank = (state: string): number => {
    const at = CLIPS_STATE_ORDER.indexOf(state)
    return at === -1 ? CLIPS_STATE_ORDER.length : at
  }
  return Object.entries(status.states)
    .filter(([state]) => isIdentifier(state))
    .toSorted(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([state, count]) => ({
      state,
      count,
      oldestAt: epochOrNull(status.oldestAt[state]),
    }))
}
```

`apps/server/src/clipsView/toCheckRows.ts`:

```ts
import type { ClipsView } from '@orbit/contract'

import type { ClipsDocuments } from '../types/ClipsDocuments'
import { isIdentifier } from '../workerView/isIdentifier'

export const toCheckRows = (
  doctor: ClipsDocuments['doctor'],
): ClipsView['doctor']['checks'] =>
  doctor.checks
    .filter((check) => isIdentifier(check.name) && isIdentifier(check.code))
    .map(({ name, ok, code }) => ({ name, ok, code }))
```

`apps/server/src/clipsView/toCaptureLane.ts`:

```ts
import type { ClipsView, Snapshot } from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'

// The one lane with a count surface: capture's undrained items (D7).
export const toCaptureLane = (
  snapshot: Snapshot | undefined,
): ClipsView['capture'] => {
  if (snapshot === undefined || snapshot.health.state === 'down') return null
  const metric = snapshot.metrics.find((m) => m.key === 'capture.undrained')
  if (metric === undefined) return null
  const pending = snapshot.pending.find((p) => p.key === 'capture.undrained')
  return { count: metric.value, oldestAt: epochOrNull(pending?.oldestAt) }
}
```

`apps/server/src/clipsView/toClipsView.ts`:

```ts
import type { ClipsView, Snapshot } from '@orbit/contract'

import type { ClipsDocuments } from '../types/ClipsDocuments'
import { isIntakeDay } from './isIntakeDay'
import { toCaptureLane } from './toCaptureLane'
import { toCheckRows } from './toCheckRows'
import { toStateRows } from './toStateRows'

export const toClipsView = (
  { status, doctor }: ClipsDocuments,
  capture: Snapshot | undefined,
  now: number,
): ClipsView => ({
  now,
  total: status.total,
  states: toStateRows(status),
  intake: {
    days: status.intake.days.filter((d) => isIntakeDay(d.day)),
    undated: status.intake.undated,
  },
  doctor: { ok: doctor.ok, checks: toCheckRows(doctor) },
  capture: toCaptureLane(capture),
})
```

- [ ] **Step 6: Implement the reader, route and wiring.**

`apps/server/src/cli/buildClipsReader.ts`:

```ts
import { readClipsDocuments } from '../adapters/clips/readClipsDocuments'
import { createFailedEngineRunner } from '../adapters/createFailedEngineRunner'
import { createTtlCache } from '../scheduler/createTtlCache'
import type { ClipsDocuments } from '../types/ClipsDocuments'
import type { ClipsReader } from '../types/ClipsReader'
import type { EngineRunner } from '../types/EngineRunner'

// Configured but unresolved reads fail like the adapter does (not_found).
export const buildClipsReader = (
  run: EngineRunner | undefined,
  configured: boolean,
  cadenceMs: number,
): ClipsReader | null => {
  if (!configured) return null
  const runner = run ?? createFailedEngineRunner
  const cached = createTtlCache<ClipsDocuments>(cadenceMs, Date.now)
  return async (signal) =>
    cached(async () => readClipsDocuments(runner, signal))
}
```

`apps/server/src/http/routes/getClips.ts`:

```ts
import type { Handler } from 'hono'

import { toClipsView } from '../../clipsView/toClipsView'
import type { ClipsReader } from '../../types/ClipsReader'
import type { DetailPool } from '../../types/DetailPool'
import type { Hub } from '../../types/Hub'
import type { OrbitEnv } from '../../types/OrbitEnv'

// Two engine runs of about 1.6 s together; 10 s from enqueue.
export const getClips =
  (
    read: ClipsReader | null,
    hub: Hub,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const docs = await pool.run(read, 10_000).catch(() => null)
    if (docs === null) return c.json({ error: 'unavailable' }, 503)
    const capture = hub.snapshots().find((s) => s.component === 'capture')
    return c.json(toClipsView(docs, capture, now()))
  }
```

`AppDeps.ts`: add `readonly clips: ClipsReader | null`. `buildTestApp.ts`: add `clips: null,` to the defaults. `createApp.ts`:

```ts
api.get('/clips', getClips(deps.clips, deps.hub, memoryPool, deps.now))
```

`buildHandler.ts`: add a fifth parameter `engines: Readonly<Record<string, EngineRunner>>` and, in the `createApp` call,

```ts
    clips: buildClipsReader(
      engines['clips'],
      config.engines.clips !== undefined,
      config.cadenceMs.clips ?? 60_000,
    ),
```

`startServer.ts`: `buildHandler(state, hub, options.webRoot, actual, options.engines)`.

- [ ] **Step 7: Run.** `cd packages/contract && pnpm vitest run`; `cd apps/server && pnpm vitest run` — Expected: PASS, including `createClipsAdapter.test.ts` unchanged and the server start tests.

- [ ] **Step 8: Format, gate the packages, commit.**

```bash
(cd packages/contract && pnpm exec prettier --write . && pnpm check:ci)
(cd apps/server && pnpm exec prettier --write . && pnpm check:ci)
git add packages/contract/src apps/server/src
git commit -m "feat(clips): detail route with states, intake, doctor codes and the capture lane"
```

---

### Task 6: Flow stage data, launchd stages and history readers

**Files:**

- Create: `packages/contract/src/flowStageIds.ts`, `packages/contract/src/flowStageStates.ts`, `packages/contract/src/types/FlowStageId.ts`, `packages/contract/src/types/FlowStageState.ts`; modify `packages/contract/src/index.ts`
- Create: `apps/server/src/types/{FreshSource,FlowStageSpec,FlowEdgeSpec}.ts`, `apps/server/src/flow/{flowStages,flowEdges}.ts`, `apps/server/src/history/{readLastRuns,readCounterTotal}.ts`, `apps/server/src/cli/buildStageLabels.ts`
- Modify: `apps/server/src/config/orbitConfigSchema.ts` (label `stage`), `apps/server/src/types/LabelEntry.ts`
- Test: `apps/server/src/flow/flowStages.test.ts`, `apps/server/src/history/readLastRuns.test.ts`, `apps/server/src/history/readCounterTotal.test.ts`, `apps/server/src/cli/buildStageLabels.test.ts`, `apps/server/src/config/loadOrbitConfig.test.ts` (one case)

**Interfaces:**

- Consumes: `readSamplePoints` (Task 2), `insertSample` (Task 2), `openHistoryDb`.
- Produces:
  - `FLOW_STAGE_IDS = ['archive', 'episodes', 'synthesis', 'clips', 'curation', 'brain', 'index', 'retrieval'] as const`, `type FlowStageId`; `FLOW_STAGE_STATES = ['ok', 'warn', 'down', 'unknown'] as const`, `type FlowStageState` (all exported from `@orbit/contract`).
  - `type FreshSource = 'atrium.archive' | 'atrium.refresh' | 'atrium.content' | 'atrium.synthesis' | 'oldest_pending' | 'label'`
  - `type FlowStageSpec = { id: FlowStageId; component: ComponentId; backlog: MetricKey | null; metrics: readonly MetricKey[]; pending: readonly PendingKey[]; fresh: FreshSource; policyMs: number | 'refresh2x' }`
  - `type FlowEdgeSpec = { from: FlowStageId; to: FlowStageId; counter: { key: MetricKey; mode: 'delta' | 'sum' } | null }`
  - `FLOW_STAGES: readonly FlowStageSpec[]`, `FLOW_EDGES: readonly FlowEdgeSpec[]`
  - `readLastRuns(db: DatabaseSync, labels: readonly string[]): Map<string, number>` — per label, the `at` of the newest observation whose run count rose.
  - `readCounterTotal(db, component: string, key: string, from: number, mode: 'delta' | 'sum'): number | null` — increase (delta) or sum of sampled values (sum) since `from`; `null` when orbit holds no sample of the key at or before the window.
  - `buildStageLabels(labels: readonly LabelEntry[]): ReadonlyMap<FlowStageId, string>` — the first label naming a stage wins.
  - `orbit.json` `launchd.labels[].stage?: FlowStageId`.

- [ ] **Step 1: Write the failing tests.**

`apps/server/src/flow/flowStages.test.ts`:

```ts
import { FLOW_STAGE_IDS } from '@orbit/contract'

import { FLOW_EDGES } from './flowEdges'
import { FLOW_STAGES } from './flowStages'

describe('flow stage data', () => {
  it('names every stage once, in flow order', () => {
    expect(FLOW_STAGES.map((stage) => stage.id)).toEqual([...FLOW_STAGE_IDS])
  })
  it('lists each backlog among its metrics and each pending key as a metric', () => {
    for (const stage of FLOW_STAGES) {
      if (stage.backlog !== null)
        expect(stage.metrics).toContain(stage.backlog)
      for (const key of stage.pending) expect(stage.metrics).toContain(key)
    }
  })
  it('joins known stages and counts with an upstream metric', () => {
    const byId = new Map(FLOW_STAGES.map((stage) => [stage.id, stage]))
    for (const edge of FLOW_EDGES) {
      expect(byId.has(edge.to)).toBe(true)
      const from = byId.get(edge.from)
      expect(from).toBeDefined()
      if (edge.counter !== null)
        expect(from?.metrics).toContain(edge.counter.key)
    }
  })
})
```

`apps/server/src/history/readLastRuns.test.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import { openHistoryDb } from '../test/openHistoryDb'
import { readLastRuns } from './readLastRuns'

const observe = (db: DatabaseSync, label: string, runs: number, at: number) => {
  db.prepare(
    'INSERT INTO launchd_observations (label, pid, runs, last_exit, at) VALUES (?, NULL, ?, 0, ?)',
  ).run(label, runs, at)
}

describe('readLastRuns', () => {
  it('takes the newest observation whose run count rose, per label', () => {
    const db = openHistoryDb()
    observe(db, 'com.example.a', 1, 1000)
    observe(db, 'com.example.a', 2, 2000)
    observe(db, 'com.example.a', 2, 3000)
    observe(db, 'com.example.b', 5, 1000)
    observe(db, 'com.example.c', 1, 1000)
    observe(db, 'com.example.c', 3, 4000)
    expect(
      readLastRuns(db, ['com.example.a', 'com.example.b', 'com.example.d']),
    ).toEqual(new Map([['com.example.a', 2000]]))
    expect(readLastRuns(db, [])).toEqual(new Map())
  })
})
```

`apps/server/src/history/readCounterTotal.test.ts`:

```ts
import { insertSample } from '../test/insertSample'
import { openHistoryDb } from '../test/openHistoryDb'
import { readCounterTotal } from './readCounterTotal'

describe('readCounterTotal', () => {
  it('adds the rises of a counter from the value in force at the start', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', 'atrium.records', 100, 500)
    insertSample(db, 'atrium', 'atrium.records', 110, 1500)
    insertSample(db, 'atrium', 'atrium.records', 90, 2000)
    insertSample(db, 'atrium', 'atrium.records', 95, 2500)
    expect(
      readCounterTotal(db, 'atrium', 'atrium.records', 1000, 'delta'),
    ).toBe(15)
  })
  it('sums per-pass samples inside the window only', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', 'atrium.synth_synthesized', 7, 500)
    insertSample(db, 'atrium', 'atrium.synth_synthesized', 3, 1500)
    insertSample(db, 'atrium', 'atrium.synth_synthesized', 4, 2500)
    expect(
      readCounterTotal(db, 'atrium', 'atrium.synth_synthesized', 1000, 'sum'),
    ).toBe(7)
  })
  it('reads zero for a steady counter and null for one never sampled', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', 'atrium.records', 100, 500)
    expect(
      readCounterTotal(db, 'atrium', 'atrium.records', 1000, 'delta'),
    ).toBe(0)
    expect(
      readCounterTotal(db, 'clips', 'clips.total', 1000, 'delta'),
    ).toBeNull()
  })
})
```

`apps/server/src/cli/buildStageLabels.test.ts`:

```ts
import { buildStageLabels } from './buildStageLabels'

const entry = (label: string, stage?: 'index' | 'synthesis') => ({
  component: 'atrium' as const,
  label,
  role: 'scheduled' as const,
  plist: '/x.plist',
  ...(stage === undefined ? {} : { stage }),
})

describe('buildStageLabels', () => {
  it('maps each stage to the first label naming it', () => {
    expect(
      buildStageLabels([
        entry('com.example.plain'),
        entry('com.example.refresh', 'index'),
        entry('com.example.second', 'index'),
        entry('com.example.synth', 'synthesis'),
      ]),
    ).toEqual(
      new Map([
        ['index', 'com.example.refresh'],
        ['synthesis', 'com.example.synth'],
      ]),
    )
  })
})
```

In `apps/server/src/config/loadOrbitConfig.test.ts` add:

```ts
  it('accepts a flow stage on a launchd label and refuses an unknown one', async () => {
    const withStage = (stage: string) => ({
      launchd: {
        labels: [
          {
            component: 'atrium',
            label: 'com.example.refresh',
            role: 'scheduled',
            plist: '/x.plist',
            stage,
          },
        ],
      },
    })
    const config = await loadOrbitConfig(await withOrbitJson(withStage('index')))
    expect(config.launchd?.labels[0]?.stage).toBe('index')
    await expect(
      loadOrbitConfig(await withOrbitJson(withStage('nowhere'))),
    ).rejects.toThrow()
  })
```

- [ ] **Step 2: Run to see them fail.** `cd apps/server && pnpm vitest run src/flow src/history/readLastRuns.test.ts src/history/readCounterTotal.test.ts src/cli/buildStageLabels.test.ts src/config` — Expected: FAIL, modules not found and the stage case rejected by the strict schema.

- [ ] **Step 3: Implement the contract enums.**

`packages/contract/src/flowStageIds.ts`:

```ts
// Spec 3.3 in flow order; titles and explanations are UI strings keyed by these.
export const FLOW_STAGE_IDS = [
  'archive',
  'episodes',
  'synthesis',
  'clips',
  'curation',
  'brain',
  'index',
  'retrieval',
] as const
```

`packages/contract/src/flowStageStates.ts`:

```ts
// ok within policy, warn past it, down past twice, unknown when unmeasured.
export const FLOW_STAGE_STATES = ['ok', 'warn', 'down', 'unknown'] as const
```

`packages/contract/src/types/FlowStageId.ts`:

```ts
import type { FLOW_STAGE_IDS } from '../flowStageIds'

export type FlowStageId = (typeof FLOW_STAGE_IDS)[number]
```

`packages/contract/src/types/FlowStageState.ts`:

```ts
import type { FLOW_STAGE_STATES } from '../flowStageStates'

export type FlowStageState = (typeof FLOW_STAGE_STATES)[number]
```

Export the two constants and two types from `index.ts`.

- [ ] **Step 4: Implement the stage data.**

`apps/server/src/types/FreshSource.ts`:

```ts
// Where a stage's freshness instant comes from (spec 7.4).
export type FreshSource =
  | 'atrium.archive'
  | 'atrium.refresh'
  | 'atrium.content'
  | 'atrium.synthesis'
  | 'oldest_pending'
  | 'label'
```

`apps/server/src/types/FlowStageSpec.ts`:

```ts
import type {
  ComponentId,
  FlowStageId,
  Metric,
  Pending,
} from '@orbit/contract'

import type { FreshSource } from './FreshSource'

export type FlowStageSpec = {
  readonly id: FlowStageId
  readonly component: ComponentId
  readonly backlog: Metric['key'] | null
  readonly metrics: readonly Metric['key'][]
  readonly pending: readonly Pending['key'][]
  readonly fresh: FreshSource
  // 'refresh2x' is twice the configured atrium refresh interval (spec 3.1).
  readonly policyMs: number | 'refresh2x'
}
```

`apps/server/src/types/FlowEdgeSpec.ts`:

```ts
import type { FlowStageId, Metric } from '@orbit/contract'

export type FlowEdgeSpec = {
  readonly from: FlowStageId
  readonly to: FlowStageId
  // delta: growth of a total; sum: a per-pass count summed over its samples.
  readonly counter: {
    readonly key: Metric['key']
    readonly mode: 'delta' | 'sum'
  } | null
}
```

`apps/server/src/flow/flowStages.ts`:

```ts
import type { FlowStageSpec } from '../types/FlowStageSpec'

// Spec 3.3 as data (D3, D4, D13). Policies: 172_800_000 is 2 days,
// 259_200_000 is 3 days, 604_800_000 is 7 days.
export const FLOW_STAGES: readonly FlowStageSpec[] = [
  {
    id: 'archive',
    component: 'atrium',
    backlog: null,
    metrics: ['atrium.records'],
    pending: [],
    fresh: 'atrium.archive',
    policyMs: 'refresh2x',
  },
  {
    id: 'episodes',
    component: 'atrium',
    backlog: null,
    metrics: [],
    pending: [],
    fresh: 'label',
    policyMs: 172_800_000,
  },
  {
    id: 'synthesis',
    component: 'atrium',
    backlog: 'atrium.synth_deferred',
    metrics: [
      'atrium.synth_synthesized',
      'atrium.synth_deferred',
      'atrium.synth_failed',
    ],
    pending: [],
    fresh: 'atrium.synthesis',
    policyMs: 172_800_000,
  },
  {
    id: 'clips',
    component: 'clips',
    backlog: 'clips.pending',
    metrics: [
      'clips.pending',
      'clips.needs_claude',
      'clips.intake_today',
      'capture.undrained',
    ],
    pending: ['clips.pending', 'clips.needs_claude', 'capture.undrained'],
    fresh: 'oldest_pending',
    policyMs: 604_800_000,
  },
  {
    id: 'curation',
    component: 'atrium',
    backlog: null,
    metrics: [],
    pending: [],
    fresh: 'label',
    policyMs: 604_800_000,
  },
  {
    id: 'brain',
    component: 'brain',
    backlog: 'brain.lint_issues',
    metrics: ['brain.pages', 'brain.lint_issues', 'brain.doctor_failing'],
    pending: ['brain.lint_issues'],
    fresh: 'label',
    policyMs: 172_800_000,
  },
  {
    id: 'index',
    component: 'atrium',
    backlog: 'atrium.not_indexed',
    metrics: ['atrium.records', 'atrium.not_indexed'],
    pending: ['atrium.not_indexed'],
    fresh: 'atrium.refresh',
    policyMs: 'refresh2x',
  },
  {
    id: 'retrieval',
    component: 'atrium',
    backlog: null,
    metrics: [],
    pending: [],
    fresh: 'atrium.content',
    policyMs: 259_200_000,
  },
]
```

`apps/server/src/flow/flowEdges.ts`:

```ts
import type { FlowEdgeSpec } from '../types/FlowEdgeSpec'

// Only an edge with a counter can carry particles (D6).
export const FLOW_EDGES: readonly FlowEdgeSpec[] = [
  { from: 'archive', to: 'episodes', counter: null },
  {
    from: 'archive',
    to: 'synthesis',
    counter: { key: 'atrium.records', mode: 'delta' },
  },
  {
    from: 'synthesis',
    to: 'index',
    counter: { key: 'atrium.synth_synthesized', mode: 'sum' },
  },
  { from: 'episodes', to: 'index', counter: null },
  { from: 'episodes', to: 'curation', counter: null },
  { from: 'curation', to: 'brain', counter: null },
  { from: 'clips', to: 'brain', counter: null },
  { from: 'brain', to: 'index', counter: null },
  { from: 'index', to: 'retrieval', counter: null },
]
```

- [ ] **Step 5: Implement the readers and the label map.**

`apps/server/src/history/readLastRuns.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

// Observations are written on change; a run is an observation whose run
// count is above the one before it for the same label.
export const readLastRuns = (
  db: DatabaseSync,
  labels: readonly string[],
): Map<string, number> => {
  const statement = db.prepare(
    `SELECT max(at) AS at FROM (
       SELECT at, runs, lag(runs) OVER (ORDER BY at, rowid) AS prior
       FROM launchd_observations WHERE label = ?
     ) WHERE runs > prior`,
  )
  const runs = new Map<string, number>()
  for (const label of labels) {
    const row = statement.get(label) as { at: number | null } | undefined
    if (typeof row?.at === 'number') runs.set(label, row.at)
  }
  return runs
}
```

`apps/server/src/history/readCounterTotal.ts`:

```ts
import type { DatabaseSync } from 'node:sqlite'

import { readSamplePoints } from './readSamplePoints'

// The growth of a total (delta) or the sum of a per-pass count (sum) since
// `from`. Samples are stored on change, so a steady counter has none inside
// the window and reads 0 from its baseline; never sampled reads null.
export const readCounterTotal = (
  db: DatabaseSync,
  component: string,
  key: string,
  from: number,
  mode: 'delta' | 'sum',
): number | null => {
  const points = readSamplePoints(db, component, from).filter(
    (point) => point.key === key,
  )
  if (points.length === 0) return null
  if (mode === 'sum')
    return points
      .filter((point) => point.at >= from)
      .reduce((total, point) => total + point.value, 0)
  return points
    .slice(1)
    .reduce(
      (total, point, i) =>
        total + Math.max(0, point.value - (points[i]?.value ?? point.value)),
      0,
    )
}
```

`apps/server/src/cli/buildStageLabels.ts`:

```ts
import type { FlowStageId } from '@orbit/contract'

import type { LabelEntry } from '../types/LabelEntry'

export const buildStageLabels = (
  labels: readonly LabelEntry[],
): ReadonlyMap<FlowStageId, string> => {
  const map = new Map<FlowStageId, string>()
  for (const entry of labels)
    if (entry.stage !== undefined && !map.has(entry.stage))
      map.set(entry.stage, entry.label)
  return map
}
```

`types/LabelEntry.ts`: add `readonly stage?: FlowStageId | undefined` (import the type from `@orbit/contract`). `orbitConfigSchema.ts`: in the label object, after `plist`, add `stage: z.enum(FLOW_STAGE_IDS).optional(),` and import `FLOW_STAGE_IDS`.

- [ ] **Step 6: Run.** `cd packages/contract && pnpm vitest run`; `cd apps/server && pnpm vitest run` — Expected: PASS.

- [ ] **Step 7: Format, gate the packages, commit.**

```bash
(cd packages/contract && pnpm exec prettier --write . && pnpm check:ci)
(cd apps/server && pnpm exec prettier --write . && pnpm check:ci)
git add packages/contract/src apps/server/src
git commit -m "feat(flow): stage and edge data, launchd stages, last runs and counter totals"
```

`knip` may report `FLOW_STAGES`, `FLOW_EDGES`, `readLastRuns`, `readCounterTotal` and `buildStageLabels` as unused exports until Task 7 consumes them. If it does, do not commit this task alone: carry on with Task 7 and commit both together with the Task 7 message, noting both in the body.

---

### Task 7: Memory flow route

**Files:**

- Create: `packages/contract/src/schemas/{metricValueSchema,memoryFlowSchema}.ts`, `packages/contract/src/types/MemoryFlow.ts`; modify `packages/contract/src/index.ts`
- Create: `apps/server/src/flow/{componentOf,edgeKey,oldestPendingAt,freshReaders,resolvePolicyMs,stageState,stageMetrics,stagePending,toFlowStage,toFlowEdges,toMemoryFlow,collectFlowInputs}.ts`, `apps/server/src/types/{FlowInputs,FlowRouteDeps}.ts`, `apps/server/src/http/routes/getMemoryFlow.ts`
- Modify: `apps/server/src/types/AppDeps.ts` (`stageLabels`), `apps/server/src/http/createApp.ts`, `apps/server/src/test/buildTestApp.ts`, `apps/server/src/cli/buildHandler.ts`
- Test: `packages/contract/src/schemas/memoryFlowSchema.test.ts`, `apps/server/src/flow/stageState.test.ts`, `apps/server/src/flow/toMemoryFlow.test.ts`, `apps/server/src/http/routes/memoryFlow.test.ts`

**Interfaces:**

- Consumes: `FLOW_STAGES`, `FLOW_EDGES`, `readLastRuns`, `readCounterTotal`, `buildStageLabels` (Task 6), `AtriumDeps`, `AtriumDocuments`, `epochOrNull`, `memoryPool` (Task 4), builders (Task 3), `insertSample` (Task 2).
- Produces:
  - `memoryFlowSchema` / `type MemoryFlow = { now: number; stages: FlowStage[]; edges: { from: FlowStageId; to: FlowStageId; perHour: number | null; flowing: boolean }[] }` where a stage is `{ id; component; state: FlowStageState; freshAt: number | null; policyMs: number | null; label: string | null; lastRunAt: number | null; backlog: { key; value } | null; metrics: { key; value }[]; pending: { key; count; oldestAt: number | null }[] }`.
  - `stageState(snapshot: Snapshot | undefined, freshAt: number | null, policyMs: number | null, now: number): FlowStageState`
  - `type FlowInputs = { now; snapshots: ReadonlyMap<ComponentId, Snapshot>; atrium: AtriumDocuments | null; refreshIntervalMs: number | null; labels: ReadonlyMap<FlowStageId, string>; lastRuns: ReadonlyMap<string, number>; totals: ReadonlyMap<string, number | null> }` (totals keyed by `edgeKey(edge)` = `'<from>><to>'`)
  - `toMemoryFlow(inputs: FlowInputs): MemoryFlow`
  - `AppDeps.stageLabels: ReadonlyMap<FlowStageId, string>`; route `GET /api/memory/flow`.

- [ ] **Step 1: Write the failing tests.**

`packages/contract/src/schemas/memoryFlowSchema.test.ts`:

```ts
import { memoryFlowSchema } from './memoryFlowSchema'

const stage = {
  id: 'index',
  component: 'atrium',
  state: 'ok',
  freshAt: 1_789_999_000_000,
  policyMs: 7_200_000,
  label: 'com.example.refresh',
  lastRunAt: null,
  backlog: { key: 'atrium.not_indexed', value: 2 },
  metrics: [{ key: 'atrium.not_indexed', value: 2 }],
  pending: [{ key: 'atrium.not_indexed', count: 2, oldestAt: null }],
}
const flow = {
  now: 1_790_000_000_000,
  stages: [stage],
  edges: [{ from: 'index', to: 'retrieval', perHour: null, flowing: false }],
}

describe('memoryFlowSchema', () => {
  it('accepts a flow', () => {
    expect(memoryFlowSchema.parse(flow)).toEqual(flow)
  })
  it('rejects an unknown stage or a label that is not an identifier', () => {
    const edges = [{ from: 'index', to: 'nowhere', perHour: 1, flowing: true }]
    expect(() => memoryFlowSchema.parse({ ...flow, edges })).toThrow()
    const stages = [{ ...stage, label: 'a label' }]
    expect(() => memoryFlowSchema.parse({ ...flow, stages })).toThrow()
  })
})
```

`apps/server/src/flow/stageState.test.ts`:

```ts
import type { Snapshot } from '@orbit/contract'

import { stageState } from './stageState'

const NOW = 1_790_000_000_000
const snapshot = (state: 'ok' | 'warn' | 'down'): Snapshot => ({
  component: 'atrium',
  health: { state, reason: state === 'ok' ? null : 'stale' },
  metrics: [],
  pending: [],
  events: [],
  observedAt: '2026-10-03T10:00:00.000Z',
  lastGood: null,
})

describe('stageState', () => {
  it.each([
    [undefined, NOW, 1000, 'unknown'],
    [snapshot('down'), NOW, 1000, 'down'],
    [snapshot('ok'), null, 1000, 'unknown'],
    [snapshot('ok'), NOW, null, 'unknown'],
    [snapshot('warn'), NOW - 1000, 1000, 'ok'],
    [snapshot('ok'), NOW - 1001, 1000, 'warn'],
    [snapshot('ok'), NOW - 2000, 1000, 'warn'],
    [snapshot('ok'), NOW - 2001, 1000, 'down'],
  ] as const)('reads %#', (snap, freshAt, policyMs, expected) => {
    expect(stageState(snap, freshAt, policyMs, NOW)).toBe(expected)
  })
})
```

`apps/server/src/flow/toMemoryFlow.test.ts`:

```ts
import type { ComponentId, Snapshot } from '@orbit/contract'

import { atriumRefreshDocument } from '../test/atriumRefreshDocument'
import type { FlowInputs } from '../types/FlowInputs'
import { toMemoryFlow } from './toMemoryFlow'

const NOW = 1_790_000_000_000
const DAY = 86_400_000
const iso = (at: number) => new Date(at).toISOString()
const atriumSnapshot: Snapshot = {
  component: 'atrium',
  health: { state: 'ok', reason: null },
  metrics: [
    { key: 'atrium.records', value: 50, at: iso(NOW) },
    { key: 'atrium.not_indexed', value: 3, at: iso(NOW) },
  ],
  pending: [{ key: 'atrium.not_indexed', count: 3, oldestAt: null }],
  events: [],
  observedAt: iso(NOW),
  lastGood: null,
}
const inputs: FlowInputs = {
  now: NOW,
  snapshots: new Map<ComponentId, Snapshot>([['atrium', atriumSnapshot]]),
  atrium: {
    refresh: atriumRefreshDocument({
      archive: { at: iso(NOW - 3 * 3_600_000) },
      refresh: { at: iso(NOW - 1_800_000) },
      content: { at: null },
    }),
    synthesis: null,
  },
  refreshIntervalMs: 3_600_000,
  labels: new Map([['curation' as const, 'com.example.curate']]),
  lastRuns: new Map([['com.example.curate', NOW - 8 * DAY]]),
  totals: new Map([
    ['archive>synthesis', 48],
    ['synthesis>index', null],
  ]),
}

describe('toMemoryFlow', () => {
  const flow = toMemoryFlow(inputs)
  const stage = (id: string) => flow.stages.find((s) => s.id === id)
  it('ages each stage against its policy', () => {
    expect(stage('index')).toMatchObject({
      state: 'ok',
      freshAt: NOW - 1_800_000,
      policyMs: 7_200_000,
      backlog: { key: 'atrium.not_indexed', value: 3 },
      pending: [{ key: 'atrium.not_indexed', count: 3, oldestAt: null }],
    })
    expect(stage('archive')?.state).toBe('warn')
    expect(stage('curation')).toMatchObject({
      state: 'warn',
      label: 'com.example.curate',
      lastRunAt: NOW - 8 * DAY,
    })
  })
  it('reads unmeasured and unconfigured stages as unknown', () => {
    expect(stage('retrieval')?.state).toBe('unknown')
    expect(stage('episodes')?.state).toBe('unknown')
    expect(stage('clips')).toMatchObject({ state: 'unknown', metrics: [] })
  })
  it('flows an edge with a positive rate and a fresh-enough upstream', () => {
    expect(flow.edges).toContainEqual({
      from: 'archive',
      to: 'synthesis',
      perHour: 2,
      flowing: false,
    })
    expect(flow.edges).toContainEqual({
      from: 'synthesis',
      to: 'index',
      perHour: null,
      flowing: false,
    })
    const fresh = toMemoryFlow({
      ...inputs,
      atrium: {
        refresh: atriumRefreshDocument({ archive: { at: iso(NOW) } }),
        synthesis: null,
      },
    })
    expect(fresh.edges[1]).toMatchObject({ perHour: 2, flowing: true })
  })
})
```

`apps/server/src/http/routes/memoryFlow.test.ts`:

```ts
import { memoryFlowSchema } from '@orbit/contract'

import { atriumRefreshDocument } from '../../test/atriumRefreshDocument'
import { buildTestApp } from '../../test/buildTestApp'
import { insertSample } from '../../test/insertSample'
import { openHistoryDb } from '../../test/openHistoryDb'

const NOW = 1_790_000_000_000

describe('GET /api/memory/flow', () => {
  it('answers every stage and edge from snapshots, atrium and history', async () => {
    const historyDb = openHistoryDb()
    insertSample(historyDb, 'atrium', 'atrium.records', 10, NOW - 30 * 3_600_000)
    insertSample(historyDb, 'atrium', 'atrium.records', 34, NOW - 3_600_000)
    const refresh = atriumRefreshDocument({
      archive: { at: new Date(NOW - 60_000).toISOString() },
    })
    const res = await buildTestApp({
      historyDb,
      atrium: {
        read: async () => Promise.resolve({ refresh, synthesis: null }),
        refreshIntervalMs: 3_600_000,
      },
      stageLabels: new Map([['index' as const, 'com.example.refresh']]),
    }).get('/api/memory/flow')
    expect(res.status).toBe(200)
    const flow = memoryFlowSchema.parse(await res.json())
    expect(flow.stages).toHaveLength(8)
    expect(flow.stages.find((s) => s.id === 'index')?.label).toBe(
      'com.example.refresh',
    )
    expect(flow.edges.find((e) => e.to === 'synthesis')?.perHour).toBe(1)
  })
  it('still answers when atrium cannot be read', async () => {
    const res = await buildTestApp({
      atrium: {
        read: async () => Promise.reject(new Error('unreadable')),
        refreshIntervalMs: 3_600_000,
      },
    }).get('/api/memory/flow')
    expect(res.status).toBe(200)
    const flow = memoryFlowSchema.parse(await res.json())
    expect(flow.stages.every((s) => s.state === 'unknown')).toBe(true)
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd packages/contract && pnpm vitest run src/schemas/memoryFlowSchema.test.ts`; `cd apps/server && pnpm vitest run src/flow src/http/routes/memoryFlow.test.ts` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the contract.**

`packages/contract/src/schemas/metricValueSchema.ts`:

```ts
import { z } from 'zod'

import { METRIC_KEYS } from '../metricKeys'

export const metricValueSchema = z.object({
  key: z.enum(METRIC_KEYS),
  value: z.number(),
})
```

`packages/contract/src/schemas/memoryFlowSchema.ts`:

```ts
import { z } from 'zod'

import { COMPONENT_IDS } from '../componentIds'
import { FLOW_STAGE_IDS } from '../flowStageIds'
import { FLOW_STAGE_STATES } from '../flowStageStates'
import { PENDING_KEYS } from '../pendingKeys'
import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'
import { metricValueSchema } from './metricValueSchema'

// GET /api/memory/flow (spec 7.4): stage states, values and edge rates.
export const memoryFlowSchema = z.object({
  now: z.number(),
  stages: z.array(
    z.object({
      id: z.enum(FLOW_STAGE_IDS),
      component: z.enum(COMPONENT_IDS),
      state: z.enum(FLOW_STAGE_STATES),
      freshAt: z.number().nullable(),
      policyMs: z.number().nullable(),
      label: identifierSchema.nullable(),
      lastRunAt: z.number().nullable(),
      backlog: metricValueSchema.nullable(),
      metrics: z.array(metricValueSchema),
      pending: z.array(
        z.object({
          key: z.enum(PENDING_KEYS),
          count: countSchema,
          oldestAt: z.number().nullable(),
        }),
      ),
    }),
  ),
  edges: z.array(
    z.object({
      from: z.enum(FLOW_STAGE_IDS),
      to: z.enum(FLOW_STAGE_IDS),
      perHour: z.number().nullable(),
      flowing: z.boolean(),
    }),
  ),
})
```

`packages/contract/src/types/MemoryFlow.ts`:

```ts
import type { z } from 'zod'

import type { memoryFlowSchema } from '../schemas/memoryFlowSchema'

export type MemoryFlow = z.infer<typeof memoryFlowSchema>
```

Export `memoryFlowSchema` and `MemoryFlow` from `index.ts`.

- [ ] **Step 4: Implement the stage helpers.**

`apps/server/src/types/FlowInputs.ts`:

```ts
import type { ComponentId, FlowStageId, Snapshot } from '@orbit/contract'

import type { AtriumDocuments } from './AtriumDocuments'

export type FlowInputs = {
  readonly now: number
  readonly snapshots: ReadonlyMap<ComponentId, Snapshot>
  readonly atrium: AtriumDocuments | null
  readonly refreshIntervalMs: number | null
  readonly labels: ReadonlyMap<FlowStageId, string>
  readonly lastRuns: ReadonlyMap<string, number>
  readonly totals: ReadonlyMap<string, number | null>
}
```

`apps/server/src/flow/componentOf.ts`:

```ts
import { COMPONENT_IDS, type ComponentId } from '@orbit/contract'
import { z } from 'zod'

// Every metric and pending key is `<component>.<name>`.
export const componentOf = (key: string): ComponentId =>
  z.enum(COMPONENT_IDS).parse(key.slice(0, key.indexOf('.')))
```

`apps/server/src/flow/edgeKey.ts`:

```ts
import type { FlowEdgeSpec } from '../types/FlowEdgeSpec'

export const edgeKey = (edge: Pick<FlowEdgeSpec, 'from' | 'to'>): string =>
  `${edge.from}>${edge.to}`
```

`apps/server/src/flow/oldestPendingAt.ts`:

```ts
import { epochOrNull } from '../time/epochOrNull'
import type { FlowInputs } from '../types/FlowInputs'
import type { FlowStageSpec } from '../types/FlowStageSpec'

// Nothing waiting is fresh now; otherwise the oldest waiting item's instant.
export const oldestPendingAt = (
  spec: FlowStageSpec,
  inputs: FlowInputs,
): number | null => {
  const snapshot = inputs.snapshots.get(spec.component)
  if (snapshot === undefined || spec.backlog === null) return null
  const item = snapshot.pending.find((p) => p.key === spec.backlog)
  return item === undefined ? inputs.now : epochOrNull(item.oldestAt)
}
```

`apps/server/src/flow/freshReaders.ts`:

```ts
import { epochOrNull } from '../time/epochOrNull'
import type { FlowInputs } from '../types/FlowInputs'
import type { FlowStageSpec } from '../types/FlowStageSpec'
import type { FreshSource } from '../types/FreshSource'
import { oldestPendingAt } from './oldestPendingAt'

type Reader = (spec: FlowStageSpec, inputs: FlowInputs) => number | null

// Where each freshness source finds its instant (D4).
export const FRESH_READERS: Readonly<Record<FreshSource, Reader>> = {
  'atrium.archive': (_spec, i) => epochOrNull(i.atrium?.refresh.archive.at),
  'atrium.refresh': (_spec, i) => epochOrNull(i.atrium?.refresh.refresh.at),
  'atrium.content': (_spec, i) => epochOrNull(i.atrium?.refresh.content.at),
  'atrium.synthesis': (_spec, i) =>
    epochOrNull(i.atrium?.synthesis?.lastPass.finishedAt),
  oldest_pending: oldestPendingAt,
  label: (spec, i) => {
    const label = i.labels.get(spec.id)
    return label === undefined ? null : (i.lastRuns.get(label) ?? null)
  },
}
```

(`type Reader` is a local type alias used only in the annotation; if `no-hidden-top-level-declarations` flags it, move it to `apps/server/src/types/FreshReader.ts` and import it.)

`apps/server/src/flow/resolvePolicyMs.ts`:

```ts
import type { FlowStageSpec } from '../types/FlowStageSpec'

export const resolvePolicyMs = (
  spec: FlowStageSpec,
  refreshIntervalMs: number | null,
): number | null => {
  if (spec.policyMs !== 'refresh2x') return spec.policyMs
  return refreshIntervalMs === null ? null : 2 * refreshIntervalMs
}
```

`apps/server/src/flow/stageState.ts`:

```ts
import type { FlowStageState, Snapshot } from '@orbit/contract'

// Spec 7 item 3: ok within policy, warn past it, down past twice. A down
// component downs its stage; an absent one or a missing instant is unknown.
export const stageState = (
  snapshot: Snapshot | undefined,
  freshAt: number | null,
  policyMs: number | null,
  now: number,
): FlowStageState => {
  if (snapshot === undefined) return 'unknown'
  if (snapshot.health.state === 'down') return 'down'
  if (freshAt === null || policyMs === null) return 'unknown'
  const age = now - freshAt
  if (age <= policyMs) return 'ok'
  return age <= 2 * policyMs ? 'warn' : 'down'
}
```

`apps/server/src/flow/stageMetrics.ts`:

```ts
import type { ComponentId, MemoryFlow, Metric, Snapshot } from '@orbit/contract'

import { componentOf } from './componentOf'

export const stageMetrics = (
  keys: readonly Metric['key'][],
  snapshots: ReadonlyMap<ComponentId, Snapshot>,
): MemoryFlow['stages'][number]['metrics'] =>
  keys.flatMap((key) => {
    const metric = snapshots
      .get(componentOf(key))
      ?.metrics.find((m) => m.key === key)
    return metric === undefined ? [] : [{ key, value: metric.value }]
  })
```

`apps/server/src/flow/stagePending.ts`:

```ts
import type {
  ComponentId,
  MemoryFlow,
  Pending,
  Snapshot,
} from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'
import { componentOf } from './componentOf'

export const stagePending = (
  keys: readonly Pending['key'][],
  snapshots: ReadonlyMap<ComponentId, Snapshot>,
): MemoryFlow['stages'][number]['pending'] =>
  keys.flatMap((key) => {
    const item = snapshots
      .get(componentOf(key))
      ?.pending.find((p) => p.key === key)
    return item === undefined
      ? []
      : [{ key, count: item.count, oldestAt: epochOrNull(item.oldestAt) }]
  })
```

`apps/server/src/flow/toFlowStage.ts`:

```ts
import type { MemoryFlow } from '@orbit/contract'

import type { FlowInputs } from '../types/FlowInputs'
import type { FlowStageSpec } from '../types/FlowStageSpec'
import { FRESH_READERS } from './freshReaders'
import { resolvePolicyMs } from './resolvePolicyMs'
import { stageMetrics } from './stageMetrics'
import { stagePending } from './stagePending'
import { stageState } from './stageState'

export const toFlowStage = (
  spec: FlowStageSpec,
  inputs: FlowInputs,
): MemoryFlow['stages'][number] => {
  const freshAt = FRESH_READERS[spec.fresh](spec, inputs)
  const policyMs = resolvePolicyMs(spec, inputs.refreshIntervalMs)
  const label = inputs.labels.get(spec.id) ?? null
  const metrics = stageMetrics(spec.metrics, inputs.snapshots)
  return {
    id: spec.id,
    component: spec.component,
    state: stageState(
      inputs.snapshots.get(spec.component),
      freshAt,
      policyMs,
      inputs.now,
    ),
    freshAt,
    policyMs,
    label,
    lastRunAt: label === null ? null : (inputs.lastRuns.get(label) ?? null),
    backlog: metrics.find((m) => m.key === spec.backlog) ?? null,
    metrics,
    pending: stagePending(spec.pending, inputs.snapshots),
  }
}
```

`apps/server/src/flow/toFlowEdges.ts`:

```ts
import type { MemoryFlow } from '@orbit/contract'

import { edgeKey } from './edgeKey'
import { FLOW_EDGES } from './flowEdges'

// A rate over the last 24 h; particles stop behind a stale upstream (D6).
export const toFlowEdges = (
  stages: MemoryFlow['stages'],
  totals: ReadonlyMap<string, number | null>,
): MemoryFlow['edges'] => {
  const stateOf = new Map(stages.map((stage) => [stage.id, stage.state]))
  return FLOW_EDGES.map((edge) => {
    const total = totals.get(edgeKey(edge)) ?? null
    const perHour = total === null ? null : total / 24
    const upstream = stateOf.get(edge.from)
    const stale = upstream === 'warn' || upstream === 'down'
    return {
      from: edge.from,
      to: edge.to,
      perHour,
      flowing: perHour !== null && perHour > 0 && !stale,
    }
  })
}
```

`apps/server/src/flow/toMemoryFlow.ts`:

```ts
import type { MemoryFlow } from '@orbit/contract'

import type { FlowInputs } from '../types/FlowInputs'
import { FLOW_STAGES } from './flowStages'
import { toFlowEdges } from './toFlowEdges'
import { toFlowStage } from './toFlowStage'

export const toMemoryFlow = (inputs: FlowInputs): MemoryFlow => {
  const stages = FLOW_STAGES.map((spec) => toFlowStage(spec, inputs))
  return { now: inputs.now, stages, edges: toFlowEdges(stages, inputs.totals) }
}
```

- [ ] **Step 5: Implement the inputs, route and wiring.**

`apps/server/src/types/FlowRouteDeps.ts`:

```ts
import type { AppDeps } from './AppDeps'

export type FlowRouteDeps = Pick<
  AppDeps,
  'hub' | 'historyDb' | 'atrium' | 'stageLabels' | 'now'
>
```

`apps/server/src/flow/collectFlowInputs.ts`:

```ts
import { readCounterTotal } from '../history/readCounterTotal'
import { readLastRuns } from '../history/readLastRuns'
import type { AtriumDocuments } from '../types/AtriumDocuments'
import type { FlowInputs } from '../types/FlowInputs'
import type { FlowRouteDeps } from '../types/FlowRouteDeps'
import { componentOf } from './componentOf'
import { edgeKey } from './edgeKey'
import { FLOW_EDGES } from './flowEdges'

export const collectFlowInputs = (
  deps: FlowRouteDeps,
  atrium: AtriumDocuments | null,
): FlowInputs => {
  const now = deps.now()
  const totals = new Map<string, number | null>()
  for (const edge of FLOW_EDGES) {
    if (edge.counter === null) continue
    const { key, mode } = edge.counter
    const from = now - 86_400_000
    totals.set(
      edgeKey(edge),
      readCounterTotal(deps.historyDb, componentOf(key), key, from, mode),
    )
  }
  return {
    now,
    snapshots: new Map(deps.hub.snapshots().map((s) => [s.component, s])),
    atrium,
    refreshIntervalMs: deps.atrium?.refreshIntervalMs ?? null,
    labels: deps.stageLabels,
    lastRuns: readLastRuns(deps.historyDb, [...deps.stageLabels.values()]),
    totals,
  }
}
```

`apps/server/src/http/routes/getMemoryFlow.ts`:

```ts
import type { Handler } from 'hono'

import { collectFlowInputs } from '../../flow/collectFlowInputs'
import { toMemoryFlow } from '../../flow/toMemoryFlow'
import type { DetailPool } from '../../types/DetailPool'
import type { FlowRouteDeps } from '../../types/FlowRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'

// An unreadable atrium leaves its stages unknown; the route still answers.
export const getMemoryFlow =
  (deps: FlowRouteDeps, pool: DetailPool): Handler<OrbitEnv, string> =>
  async (c) => {
    const atrium =
      deps.atrium === null
        ? null
        : await pool.run(deps.atrium.read, 4000).catch(() => null)
    return c.json(toMemoryFlow(collectFlowInputs(deps, atrium)))
  }
```

`AppDeps.ts`: add `readonly stageLabels: ReadonlyMap<FlowStageId, string>`. `buildTestApp.ts`: add `stageLabels: new Map(),` to the defaults. `createApp.ts`: `api.get('/memory/flow', getMemoryFlow(deps, memoryPool))`. `buildHandler.ts`: `stageLabels: buildStageLabels(config.launchd?.labels ?? []),`.

The second route test expects every stage `unknown` because `buildTestApp`'s hub holds no snapshot: with no snapshot a component is unconfigured as far as the flow knows.

- [ ] **Step 6: Run.** `cd packages/contract && pnpm vitest run`; `cd apps/server && pnpm vitest run` — Expected: PASS.

- [ ] **Step 7: Format, gate the packages, commit.**

```bash
(cd packages/contract && pnpm exec prettier --write . && pnpm check:ci)
(cd apps/server && pnpm exec prettier --write . && pnpm check:ci)
git add packages/contract/src apps/server/src
git commit -m "feat(flow): memory flow route with stage freshness and edge rates"
```

---
### Task 8: Shared trend chart over metric history

**Files:**

- Create: `apps/web/src/types/{TrendSpec,TrendSlot,TrendLine,TrendModel,TrendState,TrendPoint,TrendChartProps,TrendTooltipProps,TrendTableProps,TrendBodyProps,TrendSectionProps}.ts`
- Create: `apps/web/src/selectors/{rangeStarts,bucketSeries,selectTrend}.ts`, `apps/web/src/geometry/trendPoints.ts`, `apps/web/src/charts/{trendHeight,trendSlot}.ts`, `apps/web/src/formatters/{formatTrendValue,formatTrendValues}.ts`, `apps/web/src/labels/trendLabels.ts`, `apps/web/src/hooks/useTrend.ts`
- Create: `apps/web/src/screens/memory/{TrendChart,TrendTooltip,TrendTable,TrendBody,TrendSection}.tsx`
- Modify: `apps/web/src/types/SparkPathProps.ts`, `apps/web/src/screens/worker/SparkPath.tsx` (gaps)
- Test: `apps/web/src/selectors/trendSelectors.test.ts`, `apps/web/src/screens/memory/TrendSection.test.tsx`

**Interfaces:**

- Consumes: `metricHistorySchema`, `MetricHistory` (Task 2); `RANGE_SPECS`, `HISTORY_RANGE_OPTIONS`, `isCovered`, `RangePicker`, `ChartSlider`, `ChartTooltip`, `HitBands`, `ChartLegend`, `SparkPath`, `useChartWidth`, `useColumnFocus`, `formatBucketRange`, `formatCount`, `apiJson`.
- Produces:
  - `type TrendSpec = { readonly key: Metric['key']; readonly label: string }`
  - `type TrendLine = { key; label; values: readonly (number | null)[]; stroke; dot; swatch }`, `type TrendModel = { starts: readonly number[]; bucketMs: number; lines: readonly TrendLine[] }`, `type TrendState = { model: TrendModel | null; stale: boolean; failed: boolean }`
  - `bucketSeries(points, runs, starts, bucketMs): (number | null)[]` — the value in force at each bucket's end; `null` when the bucket is not covered or nothing was sampled yet.
  - `selectTrend(history: MetricHistory, range: HistoryRange, specs: readonly TrendSpec[]): TrendModel`
  - `useTrend(component: ComponentId, range: HistoryRange, specs: readonly TrendSpec[]): TrendState` (specs must be a module constant)
  - `<TrendSection title chartLabel trend range setRange />` — a region named `title` with the range control, legend, chart (`slider` named `chartLabel`) and "Show table".

- [ ] **Step 1: Write the failing tests.**

`apps/web/src/selectors/trendSelectors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { bucketSeries } from './bucketSeries'
import { rangeStarts } from './rangeStarts'
import { selectTrend } from './selectTrend'

const NOW = 1_790_000_000_000
const HALF = 1_800_000

describe('rangeStarts', () => {
  it('ends the newest bucket at now', () => {
    const { starts, bucketMs } = rangeStarts(NOW, '24h')
    expect(bucketMs).toBe(HALF)
    expect(starts).toHaveLength(48)
    expect((starts.at(-1) ?? 0) + bucketMs).toBe(NOW)
  })
})

describe('bucketSeries', () => {
  const starts = [NOW - 3 * HALF, NOW - 2 * HALF, NOW - HALF]
  it('carries the value in force at each bucket end and gaps unwatched buckets', () => {
    const points = [
      { at: NOW - 4 * HALF, value: 5 },
      { at: NOW - HALF - 1, value: 7 },
    ]
    const runs = [{ started: NOW - 2 * HALF, stopped: NOW }]
    expect(bucketSeries(points, runs, starts, HALF)).toEqual([null, 7, 7])
  })
  it('is null before the first sample', () => {
    const runs = [{ started: NOW - 10 * HALF, stopped: NOW }]
    const points = [{ at: NOW - HALF, value: 2 }]
    expect(bucketSeries(points, runs, starts, HALF)).toEqual([null, null, 2])
  })
})

describe('selectTrend', () => {
  it('builds one line per spec in fixed slots, empty series as gaps', () => {
    const model = selectTrend(
      {
        now: NOW,
        from: NOW - 86_400_000,
        runs: [{ started: NOW - 86_400_000, stopped: NOW }],
        series: [
          { key: 'clips.pending', points: [{ at: NOW - 86_400_000, value: 3 }] },
        ],
      },
      '24h',
      [
        { key: 'clips.pending', label: 'pending' },
        { key: 'clips.needs_claude', label: 'need review' },
      ],
    )
    expect(model.lines.map((l) => [l.label, l.stroke])).toEqual([
      ['pending', 'stroke-series-1'],
      ['need review', 'stroke-series-2'],
    ])
    expect(model.lines[0]?.values.at(-1)).toBe(3)
    expect(model.lines[1]?.values.every((v) => v === null)).toBe(true)
  })
})
```

`apps/web/src/screens/memory/TrendSection.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import type { TrendModel } from '../../types/TrendModel'
import { TrendSection } from './TrendSection'

const model: TrendModel = {
  starts: [1_790_000_000_000, 1_790_001_800_000],
  bucketMs: 1_800_000,
  lines: [
    {
      key: 'clips.pending',
      label: 'pending',
      values: [4, null],
      stroke: 'stroke-series-1',
      dot: 'fill-series-1',
      swatch: 'bg-series-1',
    },
  ],
}
const renderSection = (overrides: Partial<{ failed: boolean }> = {}) => {
  const setRange = vi.fn()
  const view = render(
    <TrendSection
      title="Backlog"
      chartLabel="Pending per bucket"
      trend={{ model, stale: false, failed: overrides.failed ?? false }}
      range="24h"
      setRange={setRange}
    />,
  )
  return { ...view, setRange }
}

describe('TrendSection', () => {
  it('reads each bucket by keyboard, gaps included, and lists them in a table', async () => {
    const { container, setRange } = renderSection()
    const region = screen.getByRole('region', { name: 'Backlog' })
    const chart = within(region).getByRole('slider', {
      name: 'Pending per bucket',
    })
    expect(chart).toHaveAttribute(
      'aria-valuetext',
      expect.stringContaining('no data pending'),
    )
    fireEvent.focus(chart)
    fireEvent.keyDown(chart, { key: 'Home' })
    expect(chart).toHaveAttribute(
      'aria-valuetext',
      expect.stringContaining('4 pending'),
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent('4 pending')
    fireEvent.keyDown(chart, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(within(region).getAllByRole('row')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: '7 days' }))
    expect(setRange).toHaveBeenCalledWith('7d')
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
  it('says the history is unavailable when the first read fails', () => {
    renderSection({ failed: true })
    expect(screen.getByRole('alert')).toHaveTextContent('History unavailable.')
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/web && pnpm vitest run src/selectors/trendSelectors.test.ts src/screens/memory` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the types.**

```ts
// apps/web/src/types/TrendSpec.ts
import type { Metric } from '@orbit/contract'

export type TrendSpec = { readonly key: Metric['key']; readonly label: string }
```

```ts
// apps/web/src/types/TrendSlot.ts
export type TrendSlot = {
  readonly stroke: string
  readonly dot: string
  readonly swatch: string
}
```

```ts
// apps/web/src/types/TrendLine.ts
import type { TrendSlot } from './TrendSlot'
import type { TrendSpec } from './TrendSpec'

export type TrendLine = TrendSpec &
  TrendSlot & { readonly values: readonly (number | null)[] }
```

```ts
// apps/web/src/types/TrendModel.ts
import type { TrendLine } from './TrendLine'

export type TrendModel = {
  readonly starts: readonly number[]
  readonly bucketMs: number
  readonly lines: readonly TrendLine[]
}
```

```ts
// apps/web/src/types/TrendState.ts
import type { TrendModel } from './TrendModel'

export type TrendState = {
  readonly model: TrendModel | null
  readonly stale: boolean
  readonly failed: boolean
}
```

```ts
// apps/web/src/types/TrendPoint.ts
// A line point; y is null where the series has a gap.
export type TrendPoint = { readonly x: number; readonly y: number | null }
```

```ts
// apps/web/src/types/TrendChartProps.ts
import type { TrendModel } from './TrendModel'

export type TrendChartProps = {
  readonly label: string
  readonly model: TrendModel
}
```

```ts
// apps/web/src/types/TrendTooltipProps.ts
import type { TrendLine } from './TrendLine'

export type TrendTooltipProps = {
  readonly lines: readonly TrendLine[]
  readonly index: number
  readonly when: string
}
```

```ts
// apps/web/src/types/TrendTableProps.ts
import type { TrendModel } from './TrendModel'

export type TrendTableProps = { readonly model: TrendModel }
```

```ts
// apps/web/src/types/TrendBodyProps.ts
import type { TrendState } from './TrendState'

export type TrendBodyProps = {
  readonly chartLabel: string
  readonly trend: TrendState
}
```

```ts
// apps/web/src/types/TrendSectionProps.ts
import type { HistoryRange } from './HistoryRange'
import type { TrendState } from './TrendState'

export type TrendSectionProps = {
  readonly title: string
  readonly chartLabel: string
  readonly trend: TrendState
  readonly range: HistoryRange
  readonly setRange: (next: HistoryRange) => void
}
```

In `SparkPathProps.ts` change `points` to `readonly TrendPoint[]` (import `TrendPoint`; a `SparkPoint[]` still fits).

- [ ] **Step 4: Implement the selectors, geometry and formatters.**

`apps/web/src/selectors/rangeStarts.ts`:

```ts
import { RANGE_SPECS } from '../heartbeat/rangeSpecs'
import type { HistoryRange } from '../types/HistoryRange'

// The System screen's buckets (spec 7.2), the newest ending at the server's now.
export const rangeStarts = (
  now: number,
  range: HistoryRange,
): { starts: number[]; bucketMs: number } => {
  const { spanMs, buckets } = RANGE_SPECS[range]
  const bucketMs = spanMs / buckets
  return {
    bucketMs,
    starts: Array.from(
      { length: buckets },
      (_, i) => now - spanMs + i * bucketMs,
    ),
  }
}
```

`apps/web/src/selectors/bucketSeries.ts`:

```ts
import type { MetricHistory } from '@orbit/contract'

import { isCovered } from '../heartbeat/isCovered'

// Samples are stored on change, so a bucket reads the value in force at its
// end; a bucket orbit did not watch whole is a gap (spec 5.7, 7.4).
export const bucketSeries = (
  points: MetricHistory['series'][number]['points'],
  runs: MetricHistory['runs'],
  starts: readonly number[],
  bucketMs: number,
): (number | null)[] =>
  starts.map((start) => {
    const end = start + bucketMs
    if (!isCovered(runs, start, end)) return null
    return points.findLast((point) => point.at < end)?.value ?? null
  })
```

`apps/web/src/charts/trendSlot.ts`:

```ts
import type { TrendSlot } from '../types/TrendSlot'

// Series slots in a fixed order (spec 7.1); literal classes for Tailwind.
export const trendSlot = (index: number): TrendSlot => {
  const slots = [
    { stroke: 'stroke-series-1', dot: 'fill-series-1', swatch: 'bg-series-1' },
    { stroke: 'stroke-series-2', dot: 'fill-series-2', swatch: 'bg-series-2' },
    { stroke: 'stroke-series-3', dot: 'fill-series-3', swatch: 'bg-series-3' },
  ] as const
  return slots[index % slots.length] ?? slots[0]
}
```

`apps/web/src/selectors/selectTrend.ts`:

```ts
import type { MetricHistory } from '@orbit/contract'

import { trendSlot } from '../charts/trendSlot'
import type { HistoryRange } from '../types/HistoryRange'
import type { TrendModel } from '../types/TrendModel'
import type { TrendSpec } from '../types/TrendSpec'
import { bucketSeries } from './bucketSeries'
import { rangeStarts } from './rangeStarts'

export const selectTrend = (
  history: MetricHistory,
  range: HistoryRange,
  specs: readonly TrendSpec[],
): TrendModel => {
  const { starts, bucketMs } = rangeStarts(history.now, range)
  return {
    starts,
    bucketMs,
    lines: specs.map((spec, i) => ({
      ...spec,
      ...trendSlot(i),
      values: bucketSeries(
        history.series.find((s) => s.key === spec.key)?.points ?? [],
        history.runs,
        starts,
        bucketMs,
      ),
    })),
  }
}
```

`apps/web/src/charts/trendHeight.ts`:

```ts
export const TREND_HEIGHT = 120
```

`apps/web/src/geometry/trendPoints.ts`:

```ts
import { scaleLinear } from '@visx/scale'

import type { TrendPoint } from '../types/TrendPoint'

// Band centres on a shared scale, 4 px clear of the edges for the end dot.
export const trendPoints = (
  values: readonly (number | null)[],
  width: number,
  height: number,
  max: number,
): TrendPoint[] => {
  const step = width / Math.max(1, values.length)
  const y = scaleLinear<number>({
    domain: [0, Math.max(1, max)],
    range: [height - 4, 4],
  })
  return values.map((value, i) => ({
    x: step * i + step / 2,
    y: value === null ? null : y(value),
  }))
}
```

(If jscpd flags it against `sparkPoints`, make `sparkPoints` return `trendPoints(values, width, height, Math.max(0, ...values))` mapped to numbers.)

`apps/web/src/formatters/formatTrendValue.ts`:

```ts
import { TREND_LABELS } from '../labels/trendLabels'
import { formatCount } from './formatCount'

export const formatTrendValue = (value: number | null | undefined): string =>
  value === null || value === undefined ? TREND_LABELS.noData : formatCount(value)
```

`apps/web/src/formatters/formatTrendValues.ts`:

```ts
import type { TrendLine } from '../types/TrendLine'
import { formatTrendValue } from './formatTrendValue'

// The slider's value text: every line's number at one bucket.
export const formatTrendValues = (
  lines: readonly TrendLine[],
  index: number,
): string =>
  lines
    .map((line) => `${formatTrendValue(line.values[index])} ${line.label}`)
    .join(', ')
```

`apps/web/src/labels/trendLabels.ts`:

```ts
export const TREND_LABELS = {
  showTable: 'Show table',
  bucket: 'Bucket',
  loading: 'loading',
  unavailable: 'History unavailable.',
  noData: 'no data',
} as const
```

- [ ] **Step 5: Implement the hook and components.**

`apps/web/src/hooks/useTrend.ts`:

```ts
import {
  type ComponentId,
  metricHistorySchema,
} from '@orbit/contract'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { apiJson } from '../api/apiJson'
import { selectTrend } from '../selectors/selectTrend'
import type { HistoryRange } from '../types/HistoryRange'
import type { TrendSpec } from '../types/TrendSpec'
import type { TrendState } from '../types/TrendState'

export const useTrend = (
  component: ComponentId,
  range: HistoryRange,
  specs: readonly TrendSpec[],
): TrendState => {
  const query = useQuery({
    queryKey: ['metric-history', component, range],
    queryFn: async () =>
      apiJson(
        `/api/history/metrics?component=${component}&range=${range}`,
        metricHistorySchema,
      ),
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  })
  const model = useMemo(
    () =>
      query.data === undefined ? null : selectTrend(query.data, range, specs),
    [query.data, range, specs],
  )
  return {
    model,
    stale: query.isPlaceholderData,
    failed: query.isError && model === null,
  }
}
```

`SparkPath.tsx`: give `LinePath` `y={(p) => p.y ?? 0}` and `defined={(p) => p.y !== null}`, and draw the dot only when `point !== undefined && point.y !== null`.

`apps/web/src/screens/memory/TrendTooltip.tsx`:

```tsx
import { formatTrendValue } from '../../formatters/formatTrendValue'
import type { TrendTooltipProps } from '../../types/TrendTooltipProps'

export const TrendTooltip = ({ lines, index, when }: TrendTooltipProps) => (
  <div className="space-y-0.5 whitespace-nowrap">
    {lines.map((line) => (
      <p key={line.key}>
        <strong className="text-ink font-semibold">
          {formatTrendValue(line.values[index])}
        </strong>{' '}
        <span className="text-muted">{line.label}</span>
      </p>
    ))}
    <p className="text-muted">{when}</p>
  </div>
)
```

`apps/web/src/screens/memory/TrendChart.tsx`:

```tsx
import { TREND_HEIGHT } from '../../charts/trendHeight'
import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatTrendValues } from '../../formatters/formatTrendValues'
import { trendPoints } from '../../geometry/trendPoints'
import { useChartWidth } from '../../hooks/useChartWidth'
import { useColumnFocus } from '../../hooks/useColumnFocus'
import type { TrendChartProps } from '../../types/TrendChartProps'
import { ChartSlider } from '../worker/ChartSlider'
import { ChartTooltip } from '../worker/ChartTooltip'
import { HitBands } from '../worker/HitBands'
import { SparkPath } from '../worker/SparkPath'
import { TrendTooltip } from './TrendTooltip'

// 2 px lines on one scale with a baseline; gaps are buckets orbit did not watch.
export const TrendChart = ({ label, model }: TrendChartProps) => {
  const { parentRef, width } = useChartWidth()
  const count = model.starts.length
  const focus = useColumnFocus(count)
  const step = width / Math.max(1, count)
  const max = Math.max(
    1,
    ...model.lines.flatMap((line) => line.values.map((v) => v ?? 0)),
  )
  const index = focus.active ?? count - 1
  const start = model.starts[index] ?? 0
  const when = formatBucketRange(start, start + model.bucketMs)
  return (
    <div ref={parentRef} className="relative w-full">
      <ChartSlider
        label={label}
        count={count}
        valueText={`${formatTrendValues(model.lines, index)}, ${when}`}
        width={width}
        height={TREND_HEIGHT}
        focus={focus}
      >
        <line
          x1={0}
          x2={width}
          y1={TREND_HEIGHT - 4}
          y2={TREND_HEIGHT - 4}
          className="stroke-line"
          shapeRendering="crispEdges"
        />
        {model.lines.map((line) => (
          <SparkPath
            key={line.key}
            points={trendPoints(line.values, width, TREND_HEIGHT, max)}
            active={focus.active}
            stroke={line.stroke}
            dot={line.dot}
          />
        ))}
        <HitBands
          bands={model.starts.map((_, i) => ({ x: step * i, width: step }))}
          height={TREND_HEIGHT}
          onShow={focus.show}
        />
      </ChartSlider>
      {focus.active === null ? null : (
        <ChartTooltip left={step * focus.active + step / 2} top={0}>
          <TrendTooltip lines={model.lines} index={focus.active} when={when} />
        </ChartTooltip>
      )}
    </div>
  )
}
```

`apps/web/src/screens/memory/TrendTable.tsx`:

```tsx
import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatTrendValue } from '../../formatters/formatTrendValue'
import { TREND_LABELS } from '../../labels/trendLabels'
import type { TrendTableProps } from '../../types/TrendTableProps'

// The chart's numbers without hovering: every bucket, newest first.
export const TrendTable = ({ model }: TrendTableProps) => (
  <details className="text-sm">
    <summary className="text-muted cursor-pointer">
      {TREND_LABELS.showTable}
    </summary>
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted">
            <th scope="col" className="py-1 pr-3 text-left font-normal">
              {TREND_LABELS.bucket}
            </th>
            {model.lines.map((line) => (
              <th
                key={line.key}
                scope="col"
                className="py-1 pr-3 text-right font-normal"
              >
                {line.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-line divide-y tabular-nums">
          {model.starts.toReversed().map((start, r) => {
            const i = model.starts.length - 1 - r
            return (
              <tr key={start}>
                <th scope="row" className="py-1 pr-3 text-left font-normal">
                  {formatBucketRange(start, start + model.bucketMs)}
                </th>
                {model.lines.map((line) => (
                  <td key={line.key} className="py-1 pr-3 text-right">
                    {formatTrendValue(line.values[i])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </details>
)
```

`apps/web/src/screens/memory/TrendBody.tsx`:

```tsx
import { TREND_LABELS } from '../../labels/trendLabels'
import type { TrendBodyProps } from '../../types/TrendBodyProps'
import { ChartLegend } from '../worker/ChartLegend'
import { TrendChart } from './TrendChart'
import { TrendTable } from './TrendTable'

// A range change keeps the previous render at half opacity (spec 7.3).
export const TrendBody = ({ chartLabel, trend }: TrendBodyProps) => {
  if (trend.failed) return <p role="alert">{TREND_LABELS.unavailable}</p>
  if (trend.model === null)
    return <p className="text-muted">{TREND_LABELS.loading}</p>
  const { lines } = trend.model
  return (
    <div className={`space-y-2 ${trend.stale ? 'opacity-50' : ''}`}>
      <ChartLegend
        keys={lines.map((line) => line.label)}
        swatches={Object.fromEntries(lines.map((l) => [l.label, l.swatch]))}
      />
      <TrendChart label={chartLabel} model={trend.model} />
      <TrendTable model={trend.model} />
    </div>
  )
}
```

`apps/web/src/screens/memory/TrendSection.tsx`:

```tsx
import { HISTORY_RANGE_OPTIONS } from '../../heartbeat/historyRangeOptions'
import type { TrendSectionProps } from '../../types/TrendSectionProps'
import { RangePicker } from '../system/RangePicker'
import { TrendBody } from './TrendBody'

export const TrendSection = ({
  title,
  chartLabel,
  trend,
  range,
  setRange,
}: TrendSectionProps) => (
  <section
    aria-label={title}
    className="border-line bg-panel space-y-3 rounded-xl border p-4"
  >
    <header className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <RangePicker
        options={HISTORY_RANGE_OPTIONS}
        range={range}
        onChange={setRange}
      />
    </header>
    <TrendBody chartLabel={chartLabel} trend={trend} />
  </section>
)
```

- [ ] **Step 6: Run.** `cd apps/web && pnpm vitest run` — Expected: PASS, including the worker sparkline tests after the `SparkPath` change.

- [ ] **Step 7: Format, gate the package, commit.** `useTrend` has no caller until Task 9; if `knip` reports it, fold this commit into Task 9's.

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci)
git add apps/web/src
git commit -m "feat(web): trend chart over orbit's metric history"
```

---

### Task 9: Atrium screen

**Files:**

- Create: `apps/web/src/router/atriumRoute.ts`, `apps/web/src/hooks/useAtriumModel.ts`, `apps/web/src/types/{AtriumModel,FreshnessRow,StateBadgeProps,FreshnessCardProps,SourceBarsProps,PopulationTableProps,SynthesisSectionProps,AtriumBodyProps}.ts`, `apps/web/src/charts/{atriumTrendSpecs,stateDots}.ts`, `apps/web/src/selectors/{freshnessState,selectFreshnessRows}.ts`, `apps/web/src/labels/{freshnessLabels,atriumLabels}.ts`, `apps/web/src/formatters/formatLastPass.ts`
- Create: `apps/web/src/screens/memory/StateBadge.tsx`, `apps/web/src/screens/atrium/{AtriumScreen,AtriumBody,FreshnessCard,SourceBars,PopulationTable,SynthesisSection}.tsx`
- Modify: `apps/web/src/router/routeTree.ts`, `apps/web/src/components/shell/navItems.ts`, `apps/web/src/types/NavItem.ts`
- Test: `apps/web/src/selectors/freshnessState.test.ts`, `apps/web/src/screens/atrium/AtriumScreen.test.tsx`

**Interfaces:**

- Consumes: `atriumViewSchema`, `AtriumView`, `FlowStageState` (contract); `useTrend`, `TrendSection` (Task 8); `validateSystemSearch` (its `range` is `24h | 7d | 30d`); `useMediaQuery`, `ConnectionIndicator`, `formatDuration`, `formatCount`.
- Produces:
  - `freshnessState(at: number | null, policyMs: number, now: number): FlowStageState` (Tasks 10 and 11 reuse it)
  - `FRESHNESS_LABELS: Record<FlowStageState, string>` = `{ ok: 'Fresh', warn: 'Behind', down: 'Stalled', unknown: 'Not measured' }`
  - `<StateBadge state />` — a coloured dot plus its label (the label always carries the state).
  - Route `/atrium` (lazy, `?range=`), nav item `Atrium` after `Orbit`.

- [ ] **Step 1: Write the failing tests.**

`apps/web/src/selectors/freshnessState.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { freshnessState } from './freshnessState'

describe('freshnessState', () => {
  it.each([
    [null, 'unknown'],
    [10_000, 'ok'],
    [8_999, 'warn'],
    [8_000, 'warn'],
    [7_999, 'down'],
  ] as const)('reads %s', (at, expected) => {
    expect(freshnessState(at, 1000, 10_000)).toBe(expected)
  })
})
```

`apps/web/src/screens/atrium/AtriumScreen.test.tsx`:

```tsx
import type { AtriumView, MetricHistory } from '@orbit/contract'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'

const NOW = 1_790_000_000_000
const view: AtriumView = {
  now: NOW,
  writtenAt: NOW - 60_000,
  refreshIntervalMs: 3_600_000,
  records: {
    total: 40,
    bySource: [
      { source: 'source-a', count: 30 },
      { source: 'source-b', count: 10 },
    ],
  },
  archiveAt: NOW - 600_000,
  refreshAt: NOW - 3 * 3_600_000,
  contentAt: null,
  populations: [
    { model: 'model-a', intended: 5, indexed: 3 },
    { model: 'model-b', intended: 2, indexed: 2 },
  ],
  synthesis: {
    finishedAt: NOW - 900_000,
    durationMs: 300_000,
    producer: 'task',
    conversations: 4,
    synthesized: 3,
    skipped: 0,
    failed: 0,
    deferred: 1,
  },
}
const history: MetricHistory = { now: NOW, from: NOW - 86_400_000, runs: [], series: [] }
const serve = (atrium: unknown, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string) =>
      Promise.resolve(
        path.startsWith('/api/atrium')
          ? Response.json(atrium, { status })
          : Response.json(history),
      ),
    ),
  )
}

describe('AtriumScreen', () => {
  it('shows sources, freshness, the last pass and unindexed populations', async () => {
    serve(view)
    const { container } = await renderAt('/atrium')
    const sources = await screen.findByRole('region', {
      name: 'Records per source',
    })
    expect(sources).toHaveTextContent('source-a')
    expect(sources).toHaveTextContent('30')
    const freshness = screen.getByRole('region', { name: 'Freshness' })
    expect(within(freshness).getAllByText('Fresh')).toHaveLength(1)
    expect(within(freshness).getByText('Behind')).toBeInTheDocument()
    expect(within(freshness).getByText('Not measured')).toBeInTheDocument()
    const missing = screen.getByRole('region', { name: 'Not in the index' })
    expect(missing).toHaveTextContent('model-a')
    expect(missing).not.toHaveTextContent('model-b')
    expect(screen.getByRole('region', { name: 'Synthesis' })).toHaveTextContent(
      '3 synthesized',
    )
    expect(
      await screen.findByRole('slider', {
        name: 'Synthesized and deferred per bucket',
      }),
    ).toBeInTheDocument()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
  it('says so when atrium cannot be read', async () => {
    serve({ error: 'unavailable' }, 503)
    await renderAt('/atrium')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not read atrium.',
    )
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/web && pnpm vitest run src/selectors/freshnessState.test.ts src/screens/atrium` — Expected: FAIL (no route `/atrium`, modules missing).

- [ ] **Step 3: Implement the shared freshness pieces.**

`apps/web/src/selectors/freshnessState.ts`:

```ts
import type { FlowStageState } from '@orbit/contract'

// Spec 7 item 3: ok within policy, warn past it, down past twice.
export const freshnessState = (
  at: number | null,
  policyMs: number,
  now: number,
): FlowStageState => {
  if (at === null) return 'unknown'
  const age = now - at
  if (age <= policyMs) return 'ok'
  return age <= 2 * policyMs ? 'warn' : 'down'
}
```

`apps/web/src/labels/freshnessLabels.ts`:

```ts
import type { FlowStageState } from '@orbit/contract'

export const FRESHNESS_LABELS: Record<FlowStageState, string> = {
  ok: 'Fresh',
  warn: 'Behind',
  down: 'Stalled',
  unknown: 'Not measured',
}
```

`apps/web/src/charts/stateDots.ts`:

```ts
import type { FlowStageState } from '@orbit/contract'

// Status colours, reserved for state and always shown with a label.
export const STATE_DOTS: Record<FlowStageState, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  down: 'bg-down',
  unknown: 'bg-unknown',
}
```

`apps/web/src/types/StateBadgeProps.ts`:

```ts
import type { FlowStageState } from '@orbit/contract'

export type StateBadgeProps = { readonly state: FlowStageState }
```

`apps/web/src/screens/memory/StateBadge.tsx`:

```tsx
import { STATE_DOTS } from '../../charts/stateDots'
import { FRESHNESS_LABELS } from '../../labels/freshnessLabels'
import type { StateBadgeProps } from '../../types/StateBadgeProps'

export const StateBadge = ({ state }: StateBadgeProps) => (
  <span className="text-ink inline-flex items-center gap-1.5 text-xs">
    <span
      aria-hidden="true"
      className={`size-2 rounded-full ${STATE_DOTS[state]}`}
    />
    {FRESHNESS_LABELS[state]}
  </span>
)
```

- [ ] **Step 4: Implement the atrium model.**

`apps/web/src/labels/atriumLabels.ts`:

```ts
export const ATRIUM_LABELS = {
  title: 'Atrium',
  loading: 'loading',
  unavailable: 'Could not read atrium.',
  freshness: 'Freshness',
  archive: 'Archive',
  refresh: 'Index refresh',
  content: 'Newest content',
  written: 'status written',
  ago: 'ago',
  never: 'never',
  within: 'policy',
  sources: 'Records per source',
  records: 'records',
  missing: 'Not in the index',
  model: 'Model',
  intended: 'Intended',
  indexed: 'Indexed',
  notIndexed: 'Missing',
  allIndexed: 'Every population is fully indexed.',
  synthesis: 'Synthesis',
  noPass: 'No synthesis pass has been published yet.',
  trend: 'Synthesized and deferred',
  trendChart: 'Synthesized and deferred per bucket',
} as const
```

`apps/web/src/charts/atriumTrendSpecs.ts`:

```ts
import type { TrendSpec } from '../types/TrendSpec'

export const ATRIUM_TREND_SPECS: readonly TrendSpec[] = [
  { key: 'atrium.synth_synthesized', label: 'synthesized' },
  { key: 'atrium.synth_deferred', label: 'deferred' },
]
```

`apps/web/src/types/FreshnessRow.ts`:

```ts
import type { FlowStageState } from '@orbit/contract'

export type FreshnessRow = {
  readonly name: string
  readonly at: number | null
  readonly policyMs: number
  readonly state: FlowStageState
}
```

`apps/web/src/selectors/selectFreshnessRows.ts`:

```ts
import type { AtriumView } from '@orbit/contract'

import { ATRIUM_LABELS } from '../labels/atriumLabels'
import type { FreshnessRow } from '../types/FreshnessRow'
import { freshnessState } from './freshnessState'

// Archive and refresh against 2 x the refresh interval (spec 3.1); newest
// content against 3 days (spec 7.4).
export const selectFreshnessRows = (view: AtriumView): FreshnessRow[] => {
  const twice = 2 * view.refreshIntervalMs
  return [
    { name: ATRIUM_LABELS.archive, at: view.archiveAt, policyMs: twice },
    { name: ATRIUM_LABELS.refresh, at: view.refreshAt, policyMs: twice },
    { name: ATRIUM_LABELS.content, at: view.contentAt, policyMs: 259_200_000 },
  ].map((row) => ({
    ...row,
    state: freshnessState(row.at, row.policyMs, view.now),
  }))
}
```

`apps/web/src/types/AtriumModel.ts`:

```ts
import type { AtriumView } from '@orbit/contract'

import type { HistoryRange } from './HistoryRange'
import type { TrendState } from './TrendState'

export type AtriumModel = {
  readonly view: AtriumView | null
  readonly failed: boolean
  readonly isPhone: boolean
  readonly trend: TrendState
  readonly range: HistoryRange
  readonly setRange: (next: HistoryRange) => void
}
```

`apps/web/src/hooks/useAtriumModel.ts`:

```ts
import { atriumViewSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { apiJson } from '../api/apiJson'
import { ATRIUM_TREND_SPECS } from '../charts/atriumTrendSpecs'
import type { AtriumModel } from '../types/AtriumModel'
import { validateSystemSearch } from '../validators/validateSystemSearch'
import { useMediaQuery } from './useMediaQuery'
import { useTrend } from './useTrend'

export const useAtriumModel = (): AtriumModel => {
  const { range } = validateSystemSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const query = useQuery({
    queryKey: ['atrium'],
    queryFn: async () => apiJson('/api/atrium', atriumViewSchema),
    refetchInterval: 60_000,
  })
  const view = query.data ?? null
  return {
    view,
    failed: query.isError && view === null,
    isPhone,
    trend: useTrend('atrium', range, ATRIUM_TREND_SPECS),
    range,
    setRange: (next) =>
      void navigate({ to: '/atrium', search: { range: next } }),
  }
}
```

`apps/web/src/formatters/formatLastPass.ts`:

```ts
import type { AtriumView } from '@orbit/contract'

import { formatCount } from './formatCount'
import { formatDuration } from './formatDuration'

// "3 synthesized · 1 deferred · 0 failed · 0 skipped of 4, 15m ago, took 5m"
export const formatLastPass = (
  pass: NonNullable<AtriumView['synthesis']>,
  now: number,
): string =>
  [
    `${formatCount(pass.synthesized)} synthesized`,
    `${formatCount(pass.deferred)} deferred`,
    `${formatCount(pass.failed)} failed`,
    `${formatCount(pass.skipped)} skipped of ${formatCount(pass.conversations)}`,
  ].join(' · ') +
  `, ${formatDuration(now - pass.finishedAt)} ago, took ${formatDuration(pass.durationMs)}`
```

- [ ] **Step 5: Implement the sections.** Props types, one file each:

```ts
// apps/web/src/types/FreshnessCardProps.ts
import type { AtriumView } from '@orbit/contract'

export type FreshnessCardProps = { readonly view: AtriumView }
```

```ts
// apps/web/src/types/SourceBarsProps.ts
import type { AtriumView } from '@orbit/contract'

export type SourceBarsProps = { readonly records: AtriumView['records'] }
```

```ts
// apps/web/src/types/PopulationTableProps.ts
import type { AtriumView } from '@orbit/contract'

export type PopulationTableProps = {
  readonly populations: AtriumView['populations']
}
```

```ts
// apps/web/src/types/SynthesisSectionProps.ts
import type { AtriumView } from '@orbit/contract'

import type { AtriumModel } from './AtriumModel'

export type SynthesisSectionProps = {
  readonly view: AtriumView
  readonly model: AtriumModel
}
```

```ts
// apps/web/src/types/AtriumBodyProps.ts
import type { AtriumView } from '@orbit/contract'

import type { AtriumModel } from './AtriumModel'

export type AtriumBodyProps = {
  readonly view: AtriumView
  readonly model: AtriumModel
}
```

`apps/web/src/screens/atrium/FreshnessCard.tsx`:

```tsx
import { formatDuration } from '../../formatters/formatDuration'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import { selectFreshnessRows } from '../../selectors/selectFreshnessRows'
import type { FreshnessCardProps } from '../../types/FreshnessCardProps'
import { StateBadge } from '../memory/StateBadge'

export const FreshnessCard = ({ view }: FreshnessCardProps) => (
  <section
    aria-label={ATRIUM_LABELS.freshness}
    className="border-line bg-panel space-y-3 rounded-xl border p-4"
  >
    <h2 className="text-lg font-semibold">{ATRIUM_LABELS.freshness}</h2>
    <dl className="divide-line divide-y text-sm">
      {selectFreshnessRows(view).map((row) => (
        <div key={row.name} className="flex flex-wrap items-center gap-x-3 py-2">
          <dt className="min-w-32">{row.name}</dt>
          <dd className="tabular-nums">
            {row.at === null
              ? ATRIUM_LABELS.never
              : `${formatDuration(view.now - row.at)} ${ATRIUM_LABELS.ago}`}
          </dd>
          <dd className="text-muted text-xs">
            {ATRIUM_LABELS.within} {formatDuration(row.policyMs)}
          </dd>
          <dd className="ml-auto">
            <StateBadge state={row.state} />
          </dd>
        </div>
      ))}
    </dl>
    <p className="text-muted text-xs">
      {ATRIUM_LABELS.written} {formatDuration(view.now - view.writtenAt)}{' '}
      {ATRIUM_LABELS.ago}
    </p>
  </section>
)
```

`apps/web/src/screens/atrium/SourceBars.tsx`:

```tsx
import { formatCount } from '../../formatters/formatCount'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { SourceBarsProps } from '../../types/SourceBarsProps'

// Numbers are printed beside each bar, so no table is needed to read them.
export const SourceBars = ({ records }: SourceBarsProps) => (
  <section
    aria-label={ATRIUM_LABELS.sources}
    className="border-line bg-panel space-y-3 rounded-xl border p-4"
  >
    <h2 className="text-lg font-semibold">{ATRIUM_LABELS.sources}</h2>
    <p className="text-muted text-sm">
      {formatCount(records.total)} {ATRIUM_LABELS.records}
    </p>
    <ul className="space-y-2 text-sm">
      {records.bySource.map(({ source, count }) => (
        <li key={source} className="space-y-1">
          <div className="flex justify-between gap-3">
            <span className="font-mono">{source}</span>
            <span className="tabular-nums">{formatCount(count)}</span>
          </div>
          <div aria-hidden="true" className="bg-line h-1.5 rounded-full">
            <div
              className="bg-series-1 h-full rounded-full"
              style={{
                width: `${String((100 * count) / Math.max(1, records.total))}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  </section>
)
```

`apps/web/src/screens/atrium/PopulationTable.tsx`:

```tsx
import { formatCount } from '../../formatters/formatCount'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { PopulationTableProps } from '../../types/PopulationTableProps'

export const PopulationTable = ({ populations }: PopulationTableProps) => {
  const missing = populations.filter((p) => p.intended > p.indexed)
  return (
    <section
      aria-label={ATRIUM_LABELS.missing}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{ATRIUM_LABELS.missing}</h2>
      {missing.length === 0 ? (
        <p className="text-muted text-sm">{ATRIUM_LABELS.allIndexed}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead className="text-muted text-left text-xs">
              <tr>
                <th scope="col" className="py-1 pr-3 font-normal">{ATRIUM_LABELS.model}</th>
                <th scope="col" className="py-1 pr-3 text-right font-normal">{ATRIUM_LABELS.intended}</th>
                <th scope="col" className="py-1 pr-3 text-right font-normal">{ATRIUM_LABELS.indexed}</th>
                <th scope="col" className="py-1 text-right font-normal">{ATRIUM_LABELS.notIndexed}</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {missing.map((p) => (
                <tr key={p.model}>
                  <th scope="row" className="py-1 pr-3 text-left font-mono font-normal">{p.model}</th>
                  <td className="py-1 pr-3 text-right">{formatCount(p.intended)}</td>
                  <td className="py-1 pr-3 text-right">{formatCount(p.indexed)}</td>
                  <td className="py-1 text-right">{formatCount(p.intended - p.indexed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
```

`apps/web/src/screens/atrium/SynthesisSection.tsx`:

```tsx
import { formatLastPass } from '../../formatters/formatLastPass'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { SynthesisSectionProps } from '../../types/SynthesisSectionProps'
import { TrendSection } from '../memory/TrendSection'

// The last pass from synthesis.json; the trend is orbit's own samples of it
// (a per-pass ledger needs atrium support, spec 7 item 4).
export const SynthesisSection = ({ view, model }: SynthesisSectionProps) => (
  <section
    aria-label={ATRIUM_LABELS.synthesis}
    className="space-y-3"
  >
    <h2 className="text-lg font-semibold">{ATRIUM_LABELS.synthesis}</h2>
    <p className="text-sm">
      {view.synthesis === null
        ? ATRIUM_LABELS.noPass
        : formatLastPass(view.synthesis, view.now)}
    </p>
    <TrendSection
      title={ATRIUM_LABELS.trend}
      chartLabel={ATRIUM_LABELS.trendChart}
      trend={model.trend}
      range={model.range}
      setRange={model.setRange}
    />
  </section>
)
```

`apps/web/src/screens/atrium/AtriumBody.tsx`:

```tsx
import type { AtriumBodyProps } from '../../types/AtriumBodyProps'
import { FreshnessCard } from './FreshnessCard'
import { PopulationTable } from './PopulationTable'
import { SourceBars } from './SourceBars'
import { SynthesisSection } from './SynthesisSection'

export const AtriumBody = ({ view, model }: AtriumBodyProps) => (
  <>
    <div className="grid gap-4 md:grid-cols-2">
      <FreshnessCard view={view} />
      <SourceBars records={view.records} />
    </div>
    <SynthesisSection view={view} model={model} />
    <PopulationTable populations={view.populations} />
  </>
)
```

`apps/web/src/screens/atrium/AtriumScreen.tsx`:

```tsx
import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useAtriumModel } from '../../hooks/useAtriumModel'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import { AtriumBody } from './AtriumBody'

export const AtriumScreen = () => {
  const model = useAtriumModel()
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {ATRIUM_LABELS.title}
        </h1>
        {model.isPhone ? <ConnectionIndicator /> : null}
      </header>
      {model.failed ? <p role="alert">{ATRIUM_LABELS.unavailable}</p> : null}
      {model.view === null && !model.failed && (
        <p className="text-muted">{ATRIUM_LABELS.loading}</p>
      )}
      {model.view !== null && <AtriumBody view={model.view} model={model} />}
    </main>
  )
}
```

- [ ] **Step 6: Route and navigation.**

`apps/web/src/router/atriumRoute.ts`:

```ts
import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateSystemSearch } from '../validators/validateSystemSearch'
import { shellRoute } from './shellRoute'

// Lazy, like the Worker route: chart code stays off the initial route.
export const atriumRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/atrium',
  validateSearch: validateSystemSearch,
  component: lazyRouteComponent(
    async () => import('../screens/atrium/AtriumScreen'),
    'AtriumScreen',
  ),
})
```

`routeTree.ts`: add `atriumRoute` to the shell children. `NavItem.ts`: `to` becomes `'/' | '/atrium' | '/worker' | '/system'`. `navItems.ts`: insert `{ to: '/atrium', label: 'Atrium' }` after Orbit.

- [ ] **Step 7: Run.** `cd apps/web && pnpm vitest run` — Expected: PASS (the shell and palette tests list the new nav item; update any test that asserts the exact nav list to include `Atrium`).

- [ ] **Step 8: Format, gate the package, commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci)
git add apps/web/src
git commit -m "feat(web): atrium screen with freshness, sources, synthesis and index gaps"
```

---

### Task 10: Clips screen

**Files:**

- Create: `apps/web/src/router/clipsRoute.ts`, `apps/web/src/hooks/useClipsModel.ts`, `apps/web/src/types/{ClipsModel,FunnelGroupSpec,FunnelRow,ClipsBodyProps,ClipsFunnelProps,IntakeSectionProps,OldestListProps,DoctorListProps}.ts`, `apps/web/src/charts/{clipsTrendSpecs,funnelGroups,intakeFills}.ts`, `apps/web/src/selectors/{selectFunnel,selectIntakeColumns}.ts`, `apps/web/src/formatters/formatUtcDay.ts`, `apps/web/src/labels/clipsLabels.ts`
- Create: `apps/web/src/screens/clips/{ClipsScreen,ClipsBody,ClipsFunnel,IntakeSection,OldestList,DoctorList}.tsx`
- Modify: `apps/web/src/router/routeTree.ts`, `apps/web/src/components/shell/navItems.ts`, `apps/web/src/types/NavItem.ts`
- Test: `apps/web/src/selectors/clipsSelectors.test.ts`, `apps/web/src/screens/clips/ClipsScreen.test.tsx`

**Interfaces:**

- Consumes: `clipsViewSchema`, `ClipsView` (Task 5); `useTrend`, `TrendSection` (Task 8); `StackedColumns`, `ACTIVITY_CHART_HEIGHT`, `validateSystemSearch`, `formatDuration`, `formatCount`.
- Produces:
  - `FUNNEL_GROUPS: readonly FunnelGroupSpec[]` (D8) and `selectFunnel(view: ClipsView): FunnelRow[]` with `FunnelRow = { id: string; label: string; count: number; broken: boolean }`
  - `selectIntakeColumns(intake: ClipsView['intake']): StackColumn[]` (one `captured` segment per UTC day)
  - Route `/clips` (lazy, `?range=`), nav item `Clips` after `Atrium`.

- [ ] **Step 1: Write the failing tests.**

`apps/web/src/selectors/clipsSelectors.test.ts`:

```ts
import type { ClipsView } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { selectFunnel } from './selectFunnel'
import { selectIntakeColumns } from './selectIntakeColumns'

const view: ClipsView = {
  now: 1_790_000_000_000,
  total: 13,
  states: [
    { state: 'pending', count: 3, oldestAt: null },
    { state: 'needs-claude', count: 1, oldestAt: null },
    { state: 'synthesized', count: 1, oldestAt: null },
    { state: 'reconciliation-pending', count: 2, oldestAt: null },
    { state: 'reconciled', count: 4, oldestAt: null },
    { state: 'unreadable', count: 1, oldestAt: null },
    { state: 'archived', count: 1, oldestAt: null },
  ],
  intake: { days: [{ day: '2026-10-02', count: 2 }], undated: 0 },
  doctor: { ok: true, checks: [] },
  capture: null,
}

describe('selectFunnel', () => {
  it('groups states in funnel order and lists unknown states after', () => {
    expect(selectFunnel(view)).toEqual([
      { id: 'pending', label: 'pending', count: 3, broken: false },
      { id: 'review', label: 'need review', count: 1, broken: false },
      { id: 'reconciling', label: 'in reconciliation', count: 3, broken: false },
      { id: 'reconciled', label: 'reconciled', count: 4, broken: false },
      { id: 'broken', label: 'broken', count: 1, broken: true },
      { id: 'archived', label: 'archived', count: 1, broken: false },
    ])
  })
})

describe('selectIntakeColumns', () => {
  it('makes one UTC day column per intake day', () => {
    const start = Date.parse('2026-10-02T00:00:00Z')
    expect(selectIntakeColumns(view.intake)).toEqual([
      {
        start,
        end: start + 86_400_000,
        segments: [{ key: 'captured', count: 2 }],
        total: 2,
      },
    ])
  })
})
```

`apps/web/src/screens/clips/ClipsScreen.test.tsx`:

```tsx
import type { ClipsView, MetricHistory } from '@orbit/contract'
import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'

const NOW = 1_790_000_000_000
const view: ClipsView = {
  now: NOW,
  total: 9,
  states: [
    { state: 'pending', count: 3, oldestAt: NOW - 2 * 86_400_000 },
    { state: 'needs-claude', count: 1, oldestAt: null },
    { state: 'reconciled', count: 5, oldestAt: null },
  ],
  intake: {
    days: [
      { day: '2026-09-20', count: 1 },
      { day: '2026-09-21', count: 3 },
    ],
    undated: 1,
  },
  doctor: {
    ok: false,
    checks: [{ name: 'archive', ok: false, code: 'archive_public_remote' }],
  },
  capture: { count: 2, oldestAt: NOW - 3_600_000 },
}
const history: MetricHistory = { now: NOW, from: NOW - 86_400_000, runs: [], series: [] }
const serve = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string) =>
      Promise.resolve(
        Response.json(path.startsWith('/api/clips') ? view : history),
      ),
    ),
  )
}

describe('ClipsScreen', () => {
  it('draws the funnel, intake, oldest waiting and failing checks', async () => {
    serve()
    const { container } = await renderAt('/clips')
    const funnel = await screen.findByRole('region', { name: 'Funnel' })
    const stages = within(funnel).getAllByRole('listitem')
    expect(stages[0]).toHaveTextContent('capture API')
    expect(stages[0]).toHaveTextContent('2 waiting')
    expect(stages[1]).toHaveTextContent('pending3')
    expect(funnel).toHaveTextContent('no count surface')
    expect(
      screen.getByRole('slider', { name: 'Clips captured per day' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 without a capture date')).toBeInTheDocument()
    const oldest = screen.getByRole('region', { name: 'Oldest waiting' })
    expect(oldest).toHaveTextContent('pending')
    expect(oldest).toHaveTextContent('2d')
    expect(screen.getByRole('region', { name: 'Doctor' })).toHaveTextContent(
      'archive_public_remote',
    )
    expect(
      await screen.findByRole('slider', {
        name: 'Pending and needing review per bucket',
      }),
    ).toBeInTheDocument()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
```

(`'pending3'`: `ClipsFunnel` renders a row's label and count as adjacent elements with no text between them.)

- [ ] **Step 2: Run to see them fail.** `cd apps/web && pnpm vitest run src/selectors/clipsSelectors.test.ts src/screens/clips` — Expected: FAIL.

- [ ] **Step 3: Implement labels, data and selectors.**

`apps/web/src/labels/clipsLabels.ts`:

```ts
export const CLIPS_LABELS = {
  title: 'Clips',
  loading: 'loading',
  unavailable: 'Could not read clips.',
  funnel: 'Funnel',
  funnelList: 'Funnel stages',
  captureLane: 'capture API',
  waiting: 'waiting',
  oldest: 'oldest',
  unmeasuredLanes:
    'The browser clipper and newsletter lanes have no count surface yet.',
  groups: {
    pending: 'pending',
    review: 'need review',
    reconciling: 'in reconciliation',
    reconciled: 'reconciled',
    broken: 'broken',
  },
  intake: 'Intake per day',
  intakeChart: 'Clips captured per day',
  captured: 'captured',
  undated: 'without a capture date',
  oldestWaiting: 'Oldest waiting',
  nothingWaiting: 'Nothing is waiting.',
  doctor: 'Doctor',
  allPass: 'All checks pass.',
  backlog: 'Backlog',
  backlogChart: 'Pending and needing review per bucket',
} as const
```

`apps/web/src/types/FunnelGroupSpec.ts`:

```ts
import type { CLIPS_LABELS } from '../labels/clipsLabels'

export type FunnelGroupSpec = {
  readonly id: keyof typeof CLIPS_LABELS.groups
  readonly states: readonly string[]
}
```

`apps/web/src/types/FunnelRow.ts`:

```ts
export type FunnelRow = {
  readonly id: string
  readonly label: string
  readonly count: number
  readonly broken: boolean
}
```

`apps/web/src/charts/funnelGroups.ts`:

```ts
import type { FunnelGroupSpec } from '../types/FunnelGroupSpec'

// D8: clips' derived states in the order a clip moves through them.
export const FUNNEL_GROUPS: readonly FunnelGroupSpec[] = [
  { id: 'pending', states: ['pending'] },
  { id: 'review', states: ['needs-claude'] },
  {
    id: 'reconciling',
    states: ['synthesized', 'locally-stale', 'reconciliation-pending'],
  },
  { id: 'reconciled', states: ['reconciled'] },
  { id: 'broken', states: ['inconsistent', 'unreadable'] },
]
```

`apps/web/src/selectors/selectFunnel.ts`:

```ts
import type { ClipsView } from '@orbit/contract'

import { FUNNEL_GROUPS } from '../charts/funnelGroups'
import { CLIPS_LABELS } from '../labels/clipsLabels'
import type { FunnelRow } from '../types/FunnelRow'

export const selectFunnel = (view: ClipsView): FunnelRow[] => {
  const sum = (states: readonly string[]): number =>
    view.states
      .filter((s) => states.includes(s.state))
      .reduce((total, s) => total + s.count, 0)
  const grouped = new Set(FUNNEL_GROUPS.flatMap((group) => group.states))
  return [
    ...FUNNEL_GROUPS.map((group) => ({
      id: group.id,
      label: CLIPS_LABELS.groups[group.id],
      count: sum(group.states),
      broken: group.id === 'broken',
    })),
    ...view.states
      .filter((s) => !grouped.has(s.state))
      .map((s) => ({ id: s.state, label: s.state, count: s.count, broken: false })),
  ]
}
```

`apps/web/src/selectors/selectIntakeColumns.ts`:

```ts
import type { ClipsView } from '@orbit/contract'

import type { StackColumn } from '../types/StackColumn'

// clips counts intake per UTC day.
export const selectIntakeColumns = (
  intake: ClipsView['intake'],
): StackColumn[] =>
  intake.days.map(({ day, count }) => {
    const start = Date.parse(`${day}T00:00:00Z`)
    return {
      start,
      end: start + 86_400_000,
      segments: [{ key: 'captured', count }],
      total: count,
    }
  })
```

`apps/web/src/charts/intakeFills.ts`:

```ts
export const INTAKE_FILLS: Readonly<Record<string, string>> = {
  captured: 'fill-series-1',
}
```

`apps/web/src/charts/clipsTrendSpecs.ts`:

```ts
import type { TrendSpec } from '../types/TrendSpec'

export const CLIPS_TREND_SPECS: readonly TrendSpec[] = [
  { key: 'clips.pending', label: 'pending' },
  { key: 'clips.needs_claude', label: 'need review' },
]
```

`apps/web/src/formatters/formatUtcDay.ts`:

```ts
export const formatUtcDay = (ms: number): string =>
  new Date(ms).toISOString().slice(0, 10)
```

`apps/web/src/types/ClipsModel.ts`:

```ts
import type { ClipsView } from '@orbit/contract'

import type { HistoryRange } from './HistoryRange'
import type { TrendState } from './TrendState'

export type ClipsModel = {
  readonly view: ClipsView | null
  readonly failed: boolean
  readonly isPhone: boolean
  readonly trend: TrendState
  readonly range: HistoryRange
  readonly setRange: (next: HistoryRange) => void
}
```

`apps/web/src/hooks/useClipsModel.ts`:

```ts
import { clipsViewSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { apiJson } from '../api/apiJson'
import { CLIPS_TREND_SPECS } from '../charts/clipsTrendSpecs'
import type { ClipsModel } from '../types/ClipsModel'
import { validateSystemSearch } from '../validators/validateSystemSearch'
import { useMediaQuery } from './useMediaQuery'
import { useTrend } from './useTrend'

export const useClipsModel = (): ClipsModel => {
  const { range } = validateSystemSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const query = useQuery({
    queryKey: ['clips'],
    queryFn: async () => apiJson('/api/clips', clipsViewSchema),
    refetchInterval: 60_000,
  })
  const view = query.data ?? null
  return {
    view,
    failed: query.isError && view === null,
    isPhone,
    trend: useTrend('clips', range, CLIPS_TREND_SPECS),
    range,
    setRange: (next) => void navigate({ to: '/clips', search: { range: next } }),
  }
}
```

(If jscpd flags `useClipsModel` against `useAtriumModel`, extract `useDetailModel(path, schema, component, specs, to)` returning the shared shape and make both hooks one-line calls.)

- [ ] **Step 4: Implement the sections.** Props types:

```ts
// apps/web/src/types/ClipsFunnelProps.ts
import type { ClipsView } from '@orbit/contract'

import type { FunnelRow } from './FunnelRow'

export type ClipsFunnelProps = {
  readonly rows: readonly FunnelRow[]
  readonly capture: ClipsView['capture']
  readonly now: number
}
```

```ts
// apps/web/src/types/IntakeSectionProps.ts
import type { ClipsView } from '@orbit/contract'

export type IntakeSectionProps = { readonly intake: ClipsView['intake'] }
```

```ts
// apps/web/src/types/OldestListProps.ts
import type { ClipsView } from '@orbit/contract'

export type OldestListProps = {
  readonly states: ClipsView['states']
  readonly now: number
}
```

```ts
// apps/web/src/types/DoctorListProps.ts
import type { ClipsView } from '@orbit/contract'

export type DoctorListProps = { readonly doctor: ClipsView['doctor'] }
```

```ts
// apps/web/src/types/ClipsBodyProps.ts
import type { ClipsView } from '@orbit/contract'

import type { ClipsModel } from './ClipsModel'

export type ClipsBodyProps = {
  readonly view: ClipsView
  readonly model: ClipsModel
}
```

`apps/web/src/screens/clips/ClipsFunnel.tsx`:

```tsx
import { formatCount } from '../../formatters/formatCount'
import { formatDuration } from '../../formatters/formatDuration'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import type { ClipsFunnelProps } from '../../types/ClipsFunnelProps'

// Broken wears the warn colour and always its label (spec 7.1).
export const ClipsFunnel = ({ rows, capture, now }: ClipsFunnelProps) => {
  const widest = Math.max(1, ...rows.map((row) => row.count))
  return (
    <section
      aria-label={CLIPS_LABELS.funnel}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{CLIPS_LABELS.funnel}</h2>
      <ol aria-label={CLIPS_LABELS.funnelList} className="space-y-2 text-sm">
        {capture === null ? null : (
          <li className="flex flex-wrap justify-between gap-x-3">
            <span>{CLIPS_LABELS.captureLane}</span>
            <span className="tabular-nums">
              {formatCount(capture.count)} {CLIPS_LABELS.waiting}
              {capture.oldestAt === null
                ? ''
                : `, ${CLIPS_LABELS.oldest} ${formatDuration(now - capture.oldestAt)}`}
            </span>
          </li>
        )}
        {rows.map((row) => (
          <li key={row.id} className="space-y-1">
            <div className="flex justify-between gap-3">
              <span>{row.label}</span>
              <span className="tabular-nums">{formatCount(row.count)}</span>
            </div>
            <div aria-hidden="true" className="bg-line h-1.5 rounded-full">
              <div
                className={`h-full rounded-full ${row.broken ? 'bg-warn' : 'bg-series-1'}`}
                style={{ width: `${String((100 * row.count) / widest)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
      <p className="text-muted text-xs">{CLIPS_LABELS.unmeasuredLanes}</p>
    </section>
  )
}
```

`apps/web/src/screens/clips/IntakeSection.tsx`:

```tsx
import { useMemo } from 'react'

import { ACTIVITY_CHART_HEIGHT } from '../../charts/activityChartHeight'
import { INTAKE_FILLS } from '../../charts/intakeFills'
import { formatCount } from '../../formatters/formatCount'
import { formatUtcDay } from '../../formatters/formatUtcDay'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import { TREND_LABELS } from '../../labels/trendLabels'
import { selectIntakeColumns } from '../../selectors/selectIntakeColumns'
import type { IntakeSectionProps } from '../../types/IntakeSectionProps'
import { StackedColumns } from '../worker/StackedColumns'

export const IntakeSection = ({ intake }: IntakeSectionProps) => {
  const columns = useMemo(() => selectIntakeColumns(intake), [intake])
  const describe = (c: (typeof columns)[number]) =>
    `${formatCount(c.total)} ${CLIPS_LABELS.captured}, ${formatUtcDay(c.start)}`
  return (
    <section
      aria-label={CLIPS_LABELS.intake}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{CLIPS_LABELS.intake}</h2>
      <StackedColumns
        columns={columns}
        bucketMs={86_400_000}
        fills={INTAKE_FILLS}
        label={CLIPS_LABELS.intakeChart}
        height={ACTIVITY_CHART_HEIGHT}
        describe={describe}
        renderTooltip={(c) => <span className="whitespace-nowrap">{describe(c)}</span>}
      />
      <details className="text-sm">
        <summary className="text-muted cursor-pointer">
          {TREND_LABELS.showTable}
        </summary>
        <ul className="mt-2 text-xs tabular-nums">
          {columns.toReversed().map((c) => (
            <li key={c.start}>{describe(c)}</li>
          ))}
        </ul>
      </details>
      <p className="text-muted text-xs">
        {formatCount(intake.undated)} {CLIPS_LABELS.undated}
      </p>
    </section>
  )
}
```

`apps/web/src/screens/clips/OldestList.tsx`:

```tsx
import { formatDuration } from '../../formatters/formatDuration'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import type { OldestListProps } from '../../types/OldestListProps'

// Ages of the oldest item per waiting state; reconciled is not waiting.
export const OldestList = ({ states, now }: OldestListProps) => {
  const waiting = states.flatMap((s) =>
    s.state === 'reconciled' || s.count === 0 || s.oldestAt === null
      ? []
      : [{ state: s.state, ageMs: now - s.oldestAt }],
  )
  return (
    <section
      aria-label={CLIPS_LABELS.oldestWaiting}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{CLIPS_LABELS.oldestWaiting}</h2>
      {waiting.length === 0 ? (
        <p className="text-muted text-sm">{CLIPS_LABELS.nothingWaiting}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {waiting.map((w) => (
            <li key={w.state} className="flex justify-between gap-3">
              <span className="font-mono">{w.state}</span>
              <span className="tabular-nums">{formatDuration(w.ageMs)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
```

`apps/web/src/screens/clips/DoctorList.tsx`:

```tsx
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import type { DoctorListProps } from '../../types/DoctorListProps'

// Check names and codes are identifiers from clips, shown verbatim.
export const DoctorList = ({ doctor }: DoctorListProps) => {
  const failing = doctor.checks.filter((check) => !check.ok)
  return (
    <section
      aria-label={CLIPS_LABELS.doctor}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{CLIPS_LABELS.doctor}</h2>
      {failing.length === 0 ? (
        <p className="text-muted text-sm">{CLIPS_LABELS.allPass}</p>
      ) : (
        <ul className="space-y-1 font-mono text-sm">
          {failing.map((check) => (
            <li key={check.name}>
              {check.name} <span className="text-muted">{check.code}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
```

`apps/web/src/screens/clips/ClipsBody.tsx`:

```tsx
import { useMemo } from 'react'

import { CLIPS_LABELS } from '../../labels/clipsLabels'
import { selectFunnel } from '../../selectors/selectFunnel'
import type { ClipsBodyProps } from '../../types/ClipsBodyProps'
import { TrendSection } from '../memory/TrendSection'
import { ClipsFunnel } from './ClipsFunnel'
import { DoctorList } from './DoctorList'
import { IntakeSection } from './IntakeSection'
import { OldestList } from './OldestList'

export const ClipsBody = ({ view, model }: ClipsBodyProps) => {
  const rows = useMemo(() => selectFunnel(view), [view])
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <ClipsFunnel rows={rows} capture={view.capture} now={view.now} />
        <OldestList states={view.states} now={view.now} />
      </div>
      <IntakeSection intake={view.intake} />
      <TrendSection
        title={CLIPS_LABELS.backlog}
        chartLabel={CLIPS_LABELS.backlogChart}
        trend={model.trend}
        range={model.range}
        setRange={model.setRange}
      />
      <DoctorList doctor={view.doctor} />
    </>
  )
}
```

`apps/web/src/screens/clips/ClipsScreen.tsx`:

```tsx
import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useClipsModel } from '../../hooks/useClipsModel'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import { ClipsBody } from './ClipsBody'

export const ClipsScreen = () => {
  const model = useClipsModel()
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {CLIPS_LABELS.title}
        </h1>
        {model.isPhone ? <ConnectionIndicator /> : null}
      </header>
      {model.failed ? <p role="alert">{CLIPS_LABELS.unavailable}</p> : null}
      {model.view === null && !model.failed && (
        <p className="text-muted">{CLIPS_LABELS.loading}</p>
      )}
      {model.view !== null && <ClipsBody view={model.view} model={model} />}
    </main>
  )
}
```

- [ ] **Step 5: Route and navigation.** `apps/web/src/router/clipsRoute.ts`:

```ts
import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateSystemSearch } from '../validators/validateSystemSearch'
import { shellRoute } from './shellRoute'

export const clipsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/clips',
  validateSearch: validateSystemSearch,
  component: lazyRouteComponent(
    async () => import('../screens/clips/ClipsScreen'),
    'ClipsScreen',
  ),
})
```

Add it to `routeTree.ts`; `NavItem['to']` gains `'/clips'`; `navItems.ts` gets `{ to: '/clips', label: 'Clips' }` after Atrium.

- [ ] **Step 6: Run.** `cd apps/web && pnpm vitest run` — Expected: PASS.

- [ ] **Step 7: Format, gate the package, commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci)
git add apps/web/src
git commit -m "feat(web): clips screen with funnel, intake, oldest waiting and doctor"
```

---
### Task 11: Memory flow screen: stage list and stage panel

**Files:**

- Create: `apps/web/src/router/memoryRoute.ts`, `apps/web/src/validators/validateMemorySearch.ts`, `apps/web/src/hooks/useMemoryFlow.ts`, `apps/web/src/types/{MemorySearch,FlowStage,MemoryFlowModel,StageButtonProps,StageListProps,StagePanelProps,StagePartProps,StageEdgesProps,MemoryFlowBodyProps}.ts`, `apps/web/src/labels/{flowLabels,flowStageLabels}.ts`, `apps/web/src/formatters/{formatStageName,formatRate}.ts`
- Create: `apps/web/src/screens/memory/{MemoryFlowScreen,MemoryFlowBody,StageButton,StageList,StagePanel,StageFacts,StageValues,StageEdges}.tsx`
- Modify: `apps/web/src/router/routeTree.ts`, `apps/web/src/components/shell/navItems.ts`, `apps/web/src/types/NavItem.ts`
- Test: `apps/web/src/validators/validateMemorySearch.test.ts`, `apps/web/src/screens/memory/MemoryFlowScreen.test.tsx`

**Interfaces:**

- Consumes: `memoryFlowSchema`, `MemoryFlow`, `FLOW_STAGE_IDS`, `FlowStageId` (Tasks 6, 7); `StateBadge`, `FRESHNESS_LABELS` (Task 9); `METRIC_LABELS`, `PENDING_LABELS`, `formatDuration`, `formatCount`, `useMediaQuery`.
- Produces:
  - `validateMemorySearch(search): { stage?: FlowStageId }` — `?stage=` holds the selected stage (spec 7: filtered views in the URL).
  - `type FlowStage = MemoryFlow['stages'][number]`; `type MemoryFlowModel = { flow: MemoryFlow | null; failed: boolean; isPhone: boolean; animate: boolean; selected: FlowStage | null; select: (id: FlowStageId | null) => void }`
  - `FLOW_STAGE_LABELS: Record<FlowStageId, { title: string; explanation: string }>`
  - `<StageButton stage selected onSelect />` named `"<title>: <state>[, <n> <backlog label>]"` (Task 12 puts it inside each canvas node).
  - `formatRate(perHour: number): string`
  - Route `/memory` (lazy), nav item `Memory` after `Orbit`.

- [ ] **Step 1: Write the failing tests.**

`apps/web/src/validators/validateMemorySearch.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { validateMemorySearch } from './validateMemorySearch'

describe('validateMemorySearch', () => {
  it('keeps a known stage and drops anything else', () => {
    expect(validateMemorySearch({ stage: 'index' })).toEqual({ stage: 'index' })
    expect(validateMemorySearch({ stage: 'nowhere' })).toEqual({})
    expect(validateMemorySearch({})).toEqual({})
  })
})
```

`apps/web/src/screens/memory/MemoryFlowScreen.test.tsx`:

```tsx
import {
  FLOW_STAGE_IDS,
  type FlowStageId,
  type MemoryFlow,
} from '@orbit/contract'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { mediaMatches } from '../../test/mediaMatches'
import { renderAt } from '../../test/renderAt'

const NOW = 1_790_000_000_000
type Stage = MemoryFlow['stages'][number]
const stage = (id: FlowStageId, overrides: Partial<Stage> = {}): Stage => ({
  id,
  component: 'atrium',
  state: 'unknown',
  freshAt: null,
  policyMs: null,
  label: null,
  lastRunAt: null,
  backlog: null,
  metrics: [],
  pending: [],
  ...overrides,
})
const index = stage('index', {
  state: 'ok',
  freshAt: NOW - 1_800_000,
  policyMs: 7_200_000,
  label: 'com.example.refresh',
  lastRunAt: NOW - 1_800_000,
  backlog: { key: 'atrium.not_indexed', value: 2 },
  metrics: [{ key: 'atrium.not_indexed', value: 2 }],
  pending: [{ key: 'atrium.not_indexed', count: 2, oldestAt: null }],
})
const flow: MemoryFlow = {
  now: NOW,
  stages: FLOW_STAGE_IDS.map((id) => (id === 'index' ? index : stage(id))),
  edges: [{ from: 'index', to: 'retrieval', perHour: 2.5, flowing: true }],
}
const serve = (body: unknown, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Promise.resolve(Response.json(body, { status }))),
  )
}

describe('MemoryFlowScreen on a phone', () => {
  it('lists every stage and opens the selected one in a panel', async () => {
    mediaMatches.add('(max-width: 767px)')
    serve(flow)
    const { container, router } = await renderAt('/memory')
    const list = await screen.findByRole('list', { name: 'Stages' })
    expect(within(list).getAllByRole('button')).toHaveLength(8)
    expect(
      screen.getByRole('button', { name: 'Session-stop hook: Not measured' }),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Index: Fresh, 2 not indexed' }),
    )
    const panel = await screen.findByRole('complementary', { name: 'Index' })
    expect(router.state.location.search).toEqual({ stage: 'index' })
    expect(panel).toHaveTextContent('30m ago')
    expect(panel).toHaveTextContent('policy 2h')
    expect(panel).toHaveTextContent('com.example.refresh')
    expect(panel).toHaveTextContent('2 records not indexed')
    expect(panel).toHaveTextContent('2.5 per hour')
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
    fireEvent.click(within(panel).getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole('complementary')).toBeNull()
    })
  })
  it('opens on the stage the URL names', async () => {
    mediaMatches.add('(max-width: 767px)')
    serve(flow)
    await renderAt('/memory?stage=index')
    expect(
      await screen.findByRole('complementary', { name: 'Index' }),
    ).toBeInTheDocument()
  })
  it('says so when the flow cannot be read', async () => {
    mediaMatches.add('(max-width: 767px)')
    serve({ error: 'internal' }, 500)
    await renderAt('/memory')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not read the memory flow.',
    )
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/web && pnpm vitest run src/validators/validateMemorySearch.test.ts src/screens/memory/MemoryFlowScreen.test.tsx` — Expected: FAIL.

- [ ] **Step 3: Implement search, model and labels.**

`apps/web/src/types/MemorySearch.ts`:

```ts
import type { FlowStageId } from '@orbit/contract'

export type MemorySearch = { readonly stage?: FlowStageId }
```

`apps/web/src/validators/validateMemorySearch.ts`:

```ts
import { FLOW_STAGE_IDS } from '@orbit/contract'
import { z } from 'zod'

import type { MemorySearch } from '../types/MemorySearch'

export const validateMemorySearch = (
  search: Record<string, unknown>,
): MemorySearch => {
  const stage = z.enum(FLOW_STAGE_IDS).safeParse(search['stage'])
  return stage.success ? { stage: stage.data } : {}
}
```

`apps/web/src/types/FlowStage.ts`:

```ts
import type { MemoryFlow } from '@orbit/contract'

export type FlowStage = MemoryFlow['stages'][number]
```

`apps/web/src/types/MemoryFlowModel.ts`:

```ts
import type { FlowStageId, MemoryFlow } from '@orbit/contract'

import type { FlowStage } from './FlowStage'

export type MemoryFlowModel = {
  readonly flow: MemoryFlow | null
  readonly failed: boolean
  readonly isPhone: boolean
  readonly animate: boolean
  readonly selected: FlowStage | null
  readonly select: (id: FlowStageId | null) => void
}
```

`apps/web/src/hooks/useMemoryFlow.ts`:

```ts
import { memoryFlowSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { apiJson } from '../api/apiJson'
import type { MemoryFlowModel } from '../types/MemoryFlowModel'
import { validateMemorySearch } from '../validators/validateMemorySearch'
import { useMediaQuery } from './useMediaQuery'

export const useMemoryFlow = (): MemoryFlowModel => {
  const { stage } = validateMemorySearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const query = useQuery({
    queryKey: ['memory-flow'],
    queryFn: async () => apiJson('/api/memory/flow', memoryFlowSchema),
    refetchInterval: 60_000,
  })
  const flow = query.data ?? null
  return {
    flow,
    failed: query.isError && flow === null,
    isPhone,
    animate: !reduced,
    selected: flow?.stages.find((s) => s.id === stage) ?? null,
    select: (id) =>
      void navigate({ to: '/memory', search: id === null ? {} : { stage: id } }),
  }
}
```

`apps/web/src/labels/flowStageLabels.ts`:

```ts
import type { FlowStageId } from '@orbit/contract'

// Plain-language explanations for the side panel (spec 3.3, 7 item 3).
export const FLOW_STAGE_LABELS: Record<
  FlowStageId,
  { readonly title: string; readonly explanation: string }
> = {
  archive: {
    title: 'Archive',
    explanation:
      "Agent sessions are exported into the conversation archive, hourly through atrium's refresh job.",
  },
  episodes: {
    title: 'Session-stop hook',
    explanation:
      'When a session ends, the stop hook records an episode for it if one is owed. orbit can only age this stage by a launchd label registered for it.',
  },
  synthesis: {
    title: 'Synthesis',
    explanation:
      'Atrium synthesis turns the remaining sessions into episodes on a schedule, through lanes that include the worker. Deferred sessions wait for a later pass.',
  },
  clips: {
    title: 'Clips',
    explanation:
      'Clips arrive through the browser clipper, the capture API and newsletter harvest, are triaged and graded through the worker, and are ingested into brain pages behind a validator.',
  },
  curation: {
    title: 'Curation',
    explanation:
      'Atrium curation turns episodes into claim ledgers and review sheets; a person edits brain pages from them.',
  },
  brain: {
    title: 'Brain upkeep',
    explanation:
      'Brain index, lint and graph keep the links between pages healthy.',
  },
  index: {
    title: 'Index',
    explanation:
      'Atrium refresh ingests the archive, synthesis and brain notes and embeds them. A record that is not in the index cannot be retrieved.',
  },
  retrieval: {
    title: 'Retrieval',
    explanation:
      'Context returns to sessions through the prompt hook and the MCP tools. Its freshness is the age of the newest indexed content.',
  },
}
```

`apps/web/src/labels/flowLabels.ts`:

```ts
export const FLOW_LABELS = {
  title: 'Memory flow',
  loading: 'loading',
  unavailable: 'Could not read the memory flow.',
  stages: 'Stages',
  canvas: 'Memory flow diagram',
  close: 'Close',
  freshness: 'Freshness',
  ago: 'ago',
  noInstant: 'no instant measured',
  policy: 'policy',
  label: 'launchd label',
  noLabel: 'No launchd label is registered for this stage.',
  lastRun: 'last run',
  noRun: 'no run observed',
  metrics: 'Metrics',
  pending: 'Pending',
  oldest: 'oldest',
  flowsTo: 'Flows to',
  perHour: 'per hour',
  notMeasured: 'not measured',
} as const
```

`apps/web/src/formatters/formatRate.ts`:

```ts
// One decimal under 10 per hour, whole numbers above.
export const formatRate = (perHour: number): string =>
  perHour < 10 ? perHour.toFixed(1) : String(Math.round(perHour))
```

`apps/web/src/formatters/formatStageName.ts`:

```ts
import { FLOW_STAGE_LABELS } from '../labels/flowStageLabels'
import { FRESHNESS_LABELS } from '../labels/freshnessLabels'
import { METRIC_LABELS } from '../labels/metricLabels'
import type { FlowStage } from '../types/FlowStage'
import { formatCount } from './formatCount'

// "Index: Fresh, 2 not indexed": the visible title first (label in name).
export const formatStageName = (stage: FlowStage): string => {
  const head = `${FLOW_STAGE_LABELS[stage.id].title}: ${FRESHNESS_LABELS[stage.state]}`
  return stage.backlog === null
    ? head
    : `${head}, ${formatCount(stage.backlog.value)} ${METRIC_LABELS[stage.backlog.key]}`
}
```

- [ ] **Step 4: Implement the components.** Props types:

```ts
// apps/web/src/types/StageButtonProps.ts
import type { FlowStageId } from '@orbit/contract'

import type { FlowStage } from './FlowStage'

export type StageButtonProps = {
  readonly stage: FlowStage
  readonly selected: boolean
  readonly onSelect: (id: FlowStageId | null) => void
}
```

```ts
// apps/web/src/types/StageListProps.ts
import type { FlowStageId } from '@orbit/contract'

import type { FlowStage } from './FlowStage'

export type StageListProps = {
  readonly stages: readonly FlowStage[]
  readonly selectedId: FlowStageId | null
  readonly onSelect: (id: FlowStageId | null) => void
}
```

```ts
// apps/web/src/types/StagePanelProps.ts
import type { MemoryFlow } from '@orbit/contract'

import type { FlowStage } from './FlowStage'

export type StagePanelProps = {
  readonly stage: FlowStage
  readonly flow: MemoryFlow
  readonly onClose: () => void
}
```

```ts
// apps/web/src/types/StagePartProps.ts
import type { FlowStage } from './FlowStage'

export type StagePartProps = { readonly stage: FlowStage; readonly now: number }
```

```ts
// apps/web/src/types/StageEdgesProps.ts
import type { MemoryFlow } from '@orbit/contract'

export type StageEdgesProps = { readonly edges: MemoryFlow['edges'] }
```

```ts
// apps/web/src/types/MemoryFlowBodyProps.ts
import type { MemoryFlow } from '@orbit/contract'

import type { MemoryFlowModel } from './MemoryFlowModel'

export type MemoryFlowBodyProps = {
  readonly flow: MemoryFlow
  readonly model: MemoryFlowModel
}
```

`apps/web/src/screens/memory/StageButton.tsx`:

```tsx
import { formatCount } from '../../formatters/formatCount'
import { formatStageName } from '../../formatters/formatStageName'
import { FLOW_STAGE_LABELS } from '../../labels/flowStageLabels'
import { METRIC_LABELS } from '../../labels/metricLabels'
import type { StageButtonProps } from '../../types/StageButtonProps'
import { StateBadge } from './StateBadge'

// Pressing the selected stage again closes its panel.
export const StageButton = ({ stage, selected, onSelect }: StageButtonProps) => (
  <button
    type="button"
    aria-pressed={selected}
    aria-label={formatStageName(stage)}
    onClick={() => {
      onSelect(selected ? null : stage.id)
    }}
    className="border-line bg-panel hover:border-muted aria-pressed:border-accent flex w-full flex-col items-start gap-1 rounded-xl border p-3 text-left"
  >
    <span className="font-medium">{FLOW_STAGE_LABELS[stage.id].title}</span>
    <StateBadge state={stage.state} />
    {stage.backlog === null ? null : (
      <span className="text-muted text-xs tabular-nums">
        {formatCount(stage.backlog.value)} {METRIC_LABELS[stage.backlog.key]}
      </span>
    )}
  </button>
)
```

`apps/web/src/screens/memory/StageList.tsx`:

```tsx
import { FLOW_LABELS } from '../../labels/flowLabels'
import type { StageListProps } from '../../types/StageListProps'
import { StageButton } from './StageButton'

// The flow in stage order (spec 3.3), for phones (D12).
export const StageList = ({ stages, selectedId, onSelect }: StageListProps) => (
  <ol aria-label={FLOW_LABELS.stages} className="space-y-2">
    {stages.map((stage) => (
      <li key={stage.id}>
        <StageButton
          stage={stage}
          selected={stage.id === selectedId}
          onSelect={onSelect}
        />
      </li>
    ))}
  </ol>
)
```

`apps/web/src/screens/memory/StageFacts.tsx`:

```tsx
import { formatDuration } from '../../formatters/formatDuration'
import { FLOW_LABELS } from '../../labels/flowLabels'
import type { StagePartProps } from '../../types/StagePartProps'
import { StateBadge } from './StateBadge'

export const StageFacts = ({ stage, now }: StagePartProps) => (
  <dl className="space-y-2 text-sm">
    <div>
      <dt className="text-muted text-xs">{FLOW_LABELS.freshness}</dt>
      <dd className="flex flex-wrap items-center gap-x-2">
        <StateBadge state={stage.state} />
        <span className="tabular-nums">
          {stage.freshAt === null
            ? FLOW_LABELS.noInstant
            : `${formatDuration(now - stage.freshAt)} ${FLOW_LABELS.ago}`}
        </span>
        {stage.policyMs === null ? null : (
          <span className="text-muted text-xs">
            {FLOW_LABELS.policy} {formatDuration(stage.policyMs)}
          </span>
        )}
      </dd>
    </div>
    <div>
      <dt className="text-muted text-xs">{FLOW_LABELS.label}</dt>
      <dd>
        {stage.label === null ? (
          FLOW_LABELS.noLabel
        ) : (
          <>
            <span className="font-mono">{stage.label}</span>{' '}
            <span className="text-muted text-xs">
              {FLOW_LABELS.lastRun}{' '}
              {stage.lastRunAt === null
                ? FLOW_LABELS.noRun
                : `${formatDuration(now - stage.lastRunAt)} ${FLOW_LABELS.ago}`}
            </span>
          </>
        )}
      </dd>
    </div>
  </dl>
)
```

`apps/web/src/screens/memory/StageValues.tsx`:

```tsx
import { formatCount } from '../../formatters/formatCount'
import { formatDuration } from '../../formatters/formatDuration'
import { FLOW_LABELS } from '../../labels/flowLabels'
import { METRIC_LABELS } from '../../labels/metricLabels'
import { PENDING_LABELS } from '../../labels/pendingLabels'
import type { StagePartProps } from '../../types/StagePartProps'

export const StageValues = ({ stage, now }: StagePartProps) => (
  <>
    {stage.metrics.length === 0 ? null : (
      <ul aria-label={FLOW_LABELS.metrics} className="space-y-1 text-sm">
        {stage.metrics.map((m) => (
          <li key={m.key} className="flex justify-between gap-3">
            <span>{METRIC_LABELS[m.key]}</span>
            <span className="tabular-nums">{formatCount(m.value)}</span>
          </li>
        ))}
      </ul>
    )}
    {stage.pending.length === 0 ? null : (
      <ul aria-label={FLOW_LABELS.pending} className="space-y-1 text-sm">
        {stage.pending.map((p) => (
          <li key={p.key}>
            {formatCount(p.count)} {PENDING_LABELS[p.key]}
            {p.oldestAt === null
              ? ''
              : `, ${FLOW_LABELS.oldest} ${formatDuration(now - p.oldestAt)}`}
          </li>
        ))}
      </ul>
    )}
  </>
)
```

`apps/web/src/screens/memory/StageEdges.tsx`:

```tsx
import { formatRate } from '../../formatters/formatRate'
import { FLOW_LABELS } from '../../labels/flowLabels'
import { FLOW_STAGE_LABELS } from '../../labels/flowStageLabels'
import type { StageEdgesProps } from '../../types/StageEdgesProps'

export const StageEdges = ({ edges }: StageEdgesProps) =>
  edges.length === 0 ? null : (
    <ul aria-label={FLOW_LABELS.flowsTo} className="space-y-1 text-sm">
      {edges.map((edge) => (
        <li key={edge.to} className="flex justify-between gap-3">
          <span>{FLOW_STAGE_LABELS[edge.to].title}</span>
          <span className="text-muted tabular-nums">
            {edge.perHour === null
              ? FLOW_LABELS.notMeasured
              : `${formatRate(edge.perHour)} ${FLOW_LABELS.perHour}`}
          </span>
        </li>
      ))}
    </ul>
  )
```

`apps/web/src/screens/memory/StagePanel.tsx`:

```tsx
import { FLOW_LABELS } from '../../labels/flowLabels'
import { FLOW_STAGE_LABELS } from '../../labels/flowStageLabels'
import type { StagePanelProps } from '../../types/StagePanelProps'
import { StageEdges } from './StageEdges'
import { StageFacts } from './StageFacts'
import { StageValues } from './StageValues'

export const StagePanel = ({ stage, flow, onClose }: StagePanelProps) => {
  const { title, explanation } = FLOW_STAGE_LABELS[stage.id]
  return (
    <aside
      aria-label={title}
      className="border-line bg-panel space-y-4 rounded-xl border p-4"
    >
      <header className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-ink text-sm"
        >
          {FLOW_LABELS.close}
        </button>
      </header>
      <p className="text-sm">{explanation}</p>
      <StageFacts stage={stage} now={flow.now} />
      <StageValues stage={stage} now={flow.now} />
      <StageEdges edges={flow.edges.filter((e) => e.from === stage.id)} />
    </aside>
  )
}
```

`apps/web/src/screens/memory/MemoryFlowBody.tsx`:

```tsx
import type { MemoryFlowBodyProps } from '../../types/MemoryFlowBodyProps'
import { StageList } from './StageList'
import { StagePanel } from './StagePanel'

export const MemoryFlowBody = ({ flow, model }: MemoryFlowBodyProps) => (
  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <StageList
      stages={flow.stages}
      selectedId={model.selected?.id ?? null}
      onSelect={model.select}
    />
    {model.selected === null ? null : (
      <StagePanel
        stage={model.selected}
        flow={flow}
        onClose={() => {
          model.select(null)
        }}
      />
    )}
  </div>
)
```

`apps/web/src/screens/memory/MemoryFlowScreen.tsx`:

```tsx
import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useMemoryFlow } from '../../hooks/useMemoryFlow'
import { FLOW_LABELS } from '../../labels/flowLabels'
import { MemoryFlowBody } from './MemoryFlowBody'

export const MemoryFlowScreen = () => {
  const model = useMemoryFlow()
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {FLOW_LABELS.title}
        </h1>
        {model.isPhone ? <ConnectionIndicator /> : null}
      </header>
      {model.failed ? <p role="alert">{FLOW_LABELS.unavailable}</p> : null}
      {model.flow === null && !model.failed && (
        <p className="text-muted">{FLOW_LABELS.loading}</p>
      )}
      {model.flow !== null && <MemoryFlowBody flow={model.flow} model={model} />}
    </main>
  )
}
```

- [ ] **Step 5: Route and navigation.** `apps/web/src/router/memoryRoute.ts`:

```ts
import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateMemorySearch } from '../validators/validateMemorySearch'
import { shellRoute } from './shellRoute'

// Lazy: the flow route chunk is budgeted at 250 KB on its own (spec 11).
export const memoryRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/memory',
  validateSearch: validateMemorySearch,
  component: lazyRouteComponent(
    async () => import('../screens/memory/MemoryFlowScreen'),
    'MemoryFlowScreen',
  ),
})
```

Add it to `routeTree.ts`; `NavItem['to']` gains `'/memory'`; `navItems.ts` gets `{ to: '/memory', label: 'Memory' }` directly after Orbit, so the order is Orbit, Memory, Atrium, Clips, Worker, System.

- [ ] **Step 6: Run.** `cd apps/web && pnpm vitest run` — Expected: PASS.

- [ ] **Step 7: Format, gate the package, commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci)
git add apps/web/src
git commit -m "feat(web): memory flow screen with stage list and stage panel"
```

---

### Task 12: Memory flow canvas (React Flow) with throughput particles

**Files:**

- Modify: `apps/web/package.json` and `pnpm-lock.yaml` (`@xyflow/react` 12.12.0), `apps/web/.size-limit.json`
- Create: `apps/web/src/types/{StageNodeData,StageNodeType,FlowEdgeData,FlowEdgeType,FlowGraph,FlowCanvasProps}.ts`, `apps/web/src/charts/{flowLayout,particleDurationS}.ts`, `apps/web/src/selectors/selectFlowGraph.ts`
- Create: `apps/web/src/screens/memory/{FlowCanvas,StageNode,FlowEdge,flowNodeTypes,flowEdgeTypes}.tsx`
- Modify: `apps/web/src/screens/memory/MemoryFlowBody.tsx`
- Test: `apps/web/src/selectors/selectFlowGraph.test.ts`, `apps/web/src/screens/memory/FlowEdge.test.tsx`, `apps/web/src/screens/memory/MemoryFlowScreen.desktop.test.tsx`

**Interfaces:**

- Consumes: `MemoryFlow`, `FlowStage`, `MemoryFlowModel`, `StageButton`, `formatRate` (Task 11); `@xyflow/react` 12.12.0: `ReactFlow`, `Handle`, `Position`, `BaseEdge`, `getBezierPath`, types `Node`, `Edge`, `NodeProps`, `EdgeProps`; CSS `@xyflow/react/dist/base.css` (v12 injects no runtime `<style>`, so the CSP holds).
- Produces:
  - `particleDurationS(perHour: number | null): number | null` — `null` for no rate; otherwise `60 / perHour` clamped to `[1.5, 12]` seconds (D6).
  - `selectFlowGraph(flow, selectedId, onSelect, animate): { nodes: StageNodeType[]; edges: FlowEdgeType[] }` — `durationS` is `null` unless `animate` and the edge is `flowing`.
  - `<FlowCanvas flow selectedId onSelect animate />`, a `group` named `Memory flow diagram`.

- [ ] **Step 1: Add the dependency.** `cd apps/web && pnpm add @xyflow/react@^12.12.0` — then `pnpm audit:check` (Expected: no new advisory at moderate or above).

- [ ] **Step 2: Write the failing tests.**

`apps/web/src/selectors/selectFlowGraph.test.ts`:

```ts
import type { MemoryFlow } from '@orbit/contract'
import { describe, expect, it, vi } from 'vitest'

import { particleDurationS } from '../charts/particleDurationS'
import { selectFlowGraph } from './selectFlowGraph'

const stage = (id: 'archive' | 'synthesis') => ({
  id,
  component: 'atrium' as const,
  state: 'ok' as const,
  freshAt: null,
  policyMs: null,
  label: null,
  lastRunAt: null,
  backlog: null,
  metrics: [],
  pending: [],
})
const flow: MemoryFlow = {
  now: 0,
  stages: [stage('archive'), stage('synthesis')],
  edges: [{ from: 'archive', to: 'synthesis', perHour: 24, flowing: true }],
}

describe('particleDurationS', () => {
  it.each([
    [null, null],
    [0, null],
    [24, 2.5],
    [1000, 1.5],
    [1, 12],
  ] as const)('maps %s per hour to %s s', (rate, seconds) => {
    expect(particleDurationS(rate)).toBe(seconds)
  })
})

describe('selectFlowGraph', () => {
  it('places stage nodes and animates only flowing edges when motion is allowed', () => {
    const onSelect = vi.fn()
    const graph = selectFlowGraph(flow, 'archive', onSelect, true)
    expect(graph.nodes.map((n) => [n.id, n.type, n.data.selected])).toEqual([
      ['archive', 'stage', true],
      ['synthesis', 'stage', false],
    ])
    expect(graph.edges[0]).toMatchObject({
      id: 'archive>synthesis',
      source: 'archive',
      target: 'synthesis',
      type: 'flow',
      data: { perHour: 24, durationS: 2.5 },
    })
    expect(
      selectFlowGraph(flow, null, onSelect, false).edges[0]?.data?.durationS,
    ).toBeNull()
  })
})
```

`apps/web/src/screens/memory/FlowEdge.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FlowEdge } from './FlowEdge'

vi.mock('@xyflow/react', () => ({
  BaseEdge: () => null,
  getBezierPath: () => ['M0,0 L10,10', 5, 5],
}))

const edge = (durationS: number | null, perHour: number | null) => (
  <svg>
    <FlowEdge
      id="archive>synthesis"
      source="archive"
      target="synthesis"
      sourceX={0}
      sourceY={0}
      targetX={10}
      targetY={10}
      sourcePosition={'right' as never}
      targetPosition={'left' as never}
      data={{ perHour, durationS }}
    />
  </svg>
)

describe('FlowEdge', () => {
  it('moves one particle per measured interval and labels the rate', () => {
    const { container } = render(edge(2.5, 24))
    expect(container.querySelector('animateMotion')).toHaveAttribute(
      'dur',
      '2.5s',
    )
    expect(container).toHaveTextContent('24/h')
  })
  it('draws no particle without a flowing rate', () => {
    const { container } = render(edge(null, null))
    expect(container.querySelector('animateMotion')).toBeNull()
    expect(container).not.toHaveTextContent('/h')
  })
})
```

`apps/web/src/screens/memory/MemoryFlowScreen.desktop.test.tsx`:

```tsx
import {
  FLOW_STAGE_IDS,
  type MemoryFlow,
} from '@orbit/contract'
import { fireEvent, screen, within } from '@testing-library/react'
import type { ComponentType } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderAt } from '../../test/renderAt'

type FakeNode = { id: string; type: string; data: unknown }
type FakeFlowProps = {
  nodes: readonly FakeNode[]
  nodeTypes: Readonly<Record<string, ComponentType<FakeNode>>>
}

// jsdom cannot lay out React Flow; the fake renders each node's component.
vi.mock('@xyflow/react', async () => {
  const { createElement } = await import('react')
  return {
    ReactFlow: ({ nodes, nodeTypes }: FakeFlowProps) =>
      createElement(
        'div',
        null,
        nodes.map((node) => {
          const NodeView = nodeTypes[node.type]
          return NodeView === undefined
            ? null
            : createElement(NodeView, { key: node.id, ...node })
        }),
      ),
    Handle: () => null,
    Position: { Left: 'left', Right: 'right' },
    BaseEdge: () => null,
    getBezierPath: () => ['M0,0 L10,10', 5, 5],
  }
})

const flow: MemoryFlow = {
  now: 1_790_000_000_000,
  stages: FLOW_STAGE_IDS.map((id) => ({
    id,
    component: 'atrium',
    state: 'unknown',
    freshAt: null,
    policyMs: null,
    label: null,
    lastRunAt: null,
    backlog: null,
    metrics: [],
    pending: [],
  })),
  edges: [],
}

describe('MemoryFlowScreen on a desktop', () => {
  it('draws the stages on the canvas and opens a panel from a node', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve(Response.json(flow))),
    )
    await renderAt('/memory')
    const canvas = await screen.findByRole('group', {
      name: 'Memory flow diagram',
    })
    expect(within(canvas).getAllByRole('button')).toHaveLength(8)
    fireEvent.click(
      within(canvas).getByRole('button', { name: 'Curation: Not measured' }),
    )
    expect(
      await screen.findByRole('complementary', { name: 'Curation' }),
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run to see them fail.** `cd apps/web && pnpm vitest run src/selectors/selectFlowGraph.test.ts src/screens/memory` — Expected: FAIL (modules missing; the desktop test finds the list, not a canvas).

- [ ] **Step 4: Implement the graph data.**

```ts
// apps/web/src/types/StageNodeData.ts
import type { FlowStageId } from '@orbit/contract'

import type { FlowStage } from './FlowStage'

export type StageNodeData = {
  readonly stage: FlowStage
  readonly selected: boolean
  readonly onSelect: (id: FlowStageId | null) => void
}
```

```ts
// apps/web/src/types/StageNodeType.ts
import type { Node } from '@xyflow/react'

import type { StageNodeData } from './StageNodeData'

export type StageNodeType = Node<StageNodeData, 'stage'>
```

```ts
// apps/web/src/types/FlowEdgeData.ts
export type FlowEdgeData = {
  readonly perHour: number | null
  readonly durationS: number | null
}
```

```ts
// apps/web/src/types/FlowEdgeType.ts
import type { Edge } from '@xyflow/react'

import type { FlowEdgeData } from './FlowEdgeData'

export type FlowEdgeType = Edge<FlowEdgeData, 'flow'>
```

```ts
// apps/web/src/types/FlowGraph.ts
import type { FlowEdgeType } from './FlowEdgeType'
import type { StageNodeType } from './StageNodeType'

export type FlowGraph = {
  readonly nodes: StageNodeType[]
  readonly edges: FlowEdgeType[]
}
```

```ts
// apps/web/src/types/FlowCanvasProps.ts
import type { FlowStageId, MemoryFlow } from '@orbit/contract'

export type FlowCanvasProps = {
  readonly flow: MemoryFlow
  readonly selectedId: FlowStageId | null
  readonly onSelect: (id: FlowStageId | null) => void
  readonly animate: boolean
}
```

`apps/web/src/charts/flowLayout.ts`:

```ts
import type { FlowStageId } from '@orbit/contract'

// Left to right in spec 3.3 order; fitView scales it to the canvas.
export const FLOW_LAYOUT: Record<FlowStageId, { x: number; y: number }> = {
  archive: { x: 0, y: 160 },
  clips: { x: 0, y: 400 },
  episodes: { x: 260, y: 40 },
  synthesis: { x: 260, y: 240 },
  curation: { x: 520, y: 40 },
  brain: { x: 520, y: 400 },
  index: { x: 780, y: 240 },
  retrieval: { x: 1040, y: 240 },
}
```

`apps/web/src/charts/particleDurationS.ts`:

```ts
// One particle crosses every 60 / perHour s, so the rate is proportional to
// throughput within 1.5-12 s (D6); no rate, no particle.
export const particleDurationS = (perHour: number | null): number | null =>
  perHour === null || perHour <= 0
    ? null
    : Math.min(12, Math.max(1.5, 60 / perHour))
```

`apps/web/src/selectors/selectFlowGraph.ts`:

```ts
import type { FlowStageId, MemoryFlow } from '@orbit/contract'

import { FLOW_LAYOUT } from '../charts/flowLayout'
import { particleDurationS } from '../charts/particleDurationS'
import type { FlowGraph } from '../types/FlowGraph'

export const selectFlowGraph = (
  flow: MemoryFlow,
  selectedId: FlowStageId | null,
  onSelect: (id: FlowStageId | null) => void,
  animate: boolean,
): FlowGraph => ({
  nodes: flow.stages.map((stage) => ({
    id: stage.id,
    type: 'stage',
    position: FLOW_LAYOUT[stage.id],
    data: { stage, selected: stage.id === selectedId, onSelect },
    draggable: false,
    selectable: false,
  })),
  edges: flow.edges.map((edge) => ({
    id: `${edge.from}>${edge.to}`,
    source: edge.from,
    target: edge.to,
    type: 'flow',
    data: {
      perHour: edge.perHour,
      durationS:
        animate && edge.flowing ? particleDurationS(edge.perHour) : null,
    },
  })),
})
```

- [ ] **Step 5: Implement the canvas components.**

`apps/web/src/screens/memory/StageNode.tsx`:

```tsx
import { Handle, type NodeProps, Position } from '@xyflow/react'

import type { StageNodeType } from '../../types/StageNodeType'
import { StageButton } from './StageButton'

// Handles exist only to anchor edges; nothing can be connected.
export const StageNode = ({ data }: NodeProps<StageNodeType>) => (
  <div className="w-52">
    <Handle
      type="target"
      position={Position.Left}
      isConnectable={false}
      className="opacity-0"
    />
    <StageButton
      stage={data.stage}
      selected={data.selected}
      onSelect={data.onSelect}
    />
    <Handle
      type="source"
      position={Position.Right}
      isConnectable={false}
      className="opacity-0"
    />
  </div>
)
```

`apps/web/src/screens/memory/FlowEdge.tsx`:

```tsx
import { BaseEdge, type EdgeProps, getBezierPath } from '@xyflow/react'

import { formatRate } from '../../formatters/formatRate'
import type { FlowEdgeType } from '../../types/FlowEdgeType'

// The rate is printed on the edge; the particle encodes it as motion (7.1).
export const FlowEdge = (props: EdgeProps<FlowEdgeType>) => {
  const [path, labelX, labelY] = getBezierPath(props)
  const perHour = props.data?.perHour ?? null
  const durationS = props.data?.durationS ?? null
  return (
    <>
      <BaseEdge id={props.id} path={path} className="stroke-line" />
      {perHour === null ? null : (
        <text
          x={labelX}
          y={labelY - 6}
          textAnchor="middle"
          className="fill-muted text-[10px]"
        >
          {`${formatRate(perHour)}/h`}
        </text>
      )}
      {durationS === null ? null : (
        <circle r={3} className="fill-accent">
          <animateMotion
            dur={`${String(durationS)}s`}
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      )}
    </>
  )
}
```

`apps/web/src/screens/memory/flowNodeTypes.tsx`:

```tsx
import { StageNode } from './StageNode'

// Module constants: React Flow re-mounts nodes when these objects change.
export const FLOW_NODE_TYPES = { stage: StageNode }
```

`apps/web/src/screens/memory/flowEdgeTypes.tsx`:

```tsx
import { FlowEdge } from './FlowEdge'

export const FLOW_EDGE_TYPES = { flow: FlowEdge }
```

`apps/web/src/screens/memory/FlowCanvas.tsx`:

```tsx
import '@xyflow/react/dist/base.css'

import { ReactFlow } from '@xyflow/react'
import { useMemo } from 'react'

import { FLOW_LABELS } from '../../labels/flowLabels'
import { selectFlowGraph } from '../../selectors/selectFlowGraph'
import type { FlowCanvasProps } from '../../types/FlowCanvasProps'
import { FLOW_EDGE_TYPES } from './flowEdgeTypes'
import { FLOW_NODE_TYPES } from './flowNodeTypes'

// A fixed diagram: no drag, pan, zoom or connect; nodes hold real buttons.
export const FlowCanvas = (props: FlowCanvasProps) => {
  const { flow, selectedId, onSelect, animate } = props
  const graph = useMemo(
    () => selectFlowGraph(flow, selectedId, onSelect, animate),
    [flow, selectedId, onSelect, animate],
  )
  return (
    <div
      role="group"
      aria-label={FLOW_LABELS.canvas}
      className="border-line bg-panel h-[32rem] w-full overflow-hidden rounded-xl border"
    >
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={FLOW_NODE_TYPES}
        edgeTypes={FLOW_EDGE_TYPES}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  )
}
```

`MemoryFlowBody.tsx`: replace the `<StageList … />` element with

```tsx
    {model.isPhone ? (
      <StageList
        stages={flow.stages}
        selectedId={model.selected?.id ?? null}
        onSelect={model.select}
      />
    ) : (
      <FlowCanvas
        flow={flow}
        selectedId={model.selected?.id ?? null}
        onSelect={model.select}
        animate={model.animate}
      />
    )}
```

and import `FlowCanvas`. `useMemoryFlow`'s `select` is a fresh function each render, so `FlowCanvas`'s memo recomputes per render; that is eight nodes and nine edges, so leave it.

- [ ] **Step 6: Budget the flow chunk.** Append to `apps/web/.size-limit.json`:

```json
  {
    "name": "flow route (brotli)",
    "path": "../server/dist/public/assets/MemoryFlowScreen-*.js",
    "limit": "250 KB"
  }
```

- [ ] **Step 7: Run.** `cd apps/web && pnpm vitest run && pnpm size` — Expected: PASS; size-limit reports the initial route under 150 KB and the flow route under 250 KB (the 2026-10-02 probe measured xyflow plus recharts at 126.6 KB, so xyflow alone is well inside).

- [ ] **Step 8: Format, gate the package, commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci && pnpm check:quality)
git add apps/web/package.json apps/web/.size-limit.json apps/web/src pnpm-lock.yaml
git commit -m "feat(web): memory flow canvas with throughput particles"
```

---

### Task 13: End-to-end coverage and close-out

**Files:**

- Modify: `e2e/fixtures/bin/clips.mjs`, `e2e/globalSetup.ts` (a `stage` on one launchd label)
- Create: `e2e/specs/memoryScreens.spec.ts`
- Modify: `e2e/specs/widths.spec.ts`, `e2e/specs/a11y.spec.ts`
- Modify: `TODO.md`, `TODO_LOG.md`

**Interfaces:**

- Consumes: every route and screen above; `signIn(page)`; the fixture engines pattern (`e2e/fixtures/bin/*.mjs` copied into `engines/<name>/bin/<name>` by `globalSetup`).
- Produces: e2e proof that each screen paints its data at desktop, 768 px and 375 px in both schemes without sideways scroll or axe violations, and that no content string reaches a screen.

- [ ] **Step 1: Enrich the fixtures.** Replace `e2e/fixtures/bin/clips.mjs`:

```js
#!/usr/bin/env node
const day = (ago) =>
  new Date(Date.now() - ago * 86_400_000).toISOString().slice(0, 10)
const docs = {
  'status --json': {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    total: 9,
    states: {
      pending: 3,
      'needs-claude': 1,
      'reconciliation-pending': 1,
      reconciled: 4,
    },
    oldestAt: {
      pending: '2026-10-01T00:00:00.000Z',
      'needs-claude': null,
      'reconciliation-pending': null,
    },
    intake: {
      days: [
        { day: day(2), count: 1 },
        { day: day(1), count: 3 },
        { day: day(0), count: 2 },
      ],
      undated: 1,
    },
  },
  'doctor --json': {
    schemaVersion: 1,
    ok: true,
    checks: [{ name: 'paths', ok: true, code: 'ok' }],
  },
}
const doc = docs[process.argv.slice(2).join(' ')]
if (doc === undefined) process.exit(64)
process.stdout.write(JSON.stringify(doc))
```

In `e2e/globalSetup.ts`, give the `com.example.nightly` label `stage: 'curation'`.

- [ ] **Step 2: Write the spec.** `e2e/specs/memoryScreens.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('draws the memory flow and opens a stage panel', async ({ page }) => {
  await signIn(page)
  await page.getByRole('link', { name: 'Memory' }).first().click()
  await expect(page).toHaveURL(/\/memory$/)
  await expect(
    page.getByRole('group', { name: 'Memory flow diagram' }),
  ).toBeVisible()
  await page.getByRole('button', { name: /^Index: Fresh/ }).click()
  await expect(page).toHaveURL(/\/memory\?stage=index$/)
  const index = page.getByRole('complementary', { name: 'Index' })
  await expect(index).toContainText('2 records not indexed')
  await page.getByRole('button', { name: /^Curation:/ }).click()
  await expect(
    page.getByRole('complementary', { name: 'Curation' }),
  ).toContainText('com.example.nightly')
  await expect(
    page.getByRole('button', { name: 'Session-stop hook: Not measured' }),
  ).toBeVisible()
})

test('atrium shows sources, freshness, synthesis and index gaps', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/atrium')
  await expect(
    page.getByRole('region', { name: 'Records per source' }),
  ).toContainText('source-a')
  await expect(page.getByRole('region', { name: 'Freshness' })).toContainText(
    'Fresh',
  )
  await expect(
    page.getByRole('region', { name: 'Not in the index' }),
  ).toContainText('model-a')
  await expect(page.getByRole('region', { name: 'Synthesis' })).toContainText(
    '3 synthesized',
  )
  await expect(
    page.getByRole('slider', { name: 'Synthesized and deferred per bucket' }),
  ).toBeVisible()
})

test('clips shows the funnel, intake, oldest waiting and doctor, no content', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/clips')
  const funnel = page.getByRole('region', { name: 'Funnel' })
  await expect(funnel.getByRole('listitem')).toHaveCount(5)
  await expect(funnel).toContainText('in reconciliation')
  await expect(
    page.getByRole('slider', { name: 'Clips captured per day' }),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Oldest waiting' }),
  ).toContainText('pending')
  await expect(page.getByRole('region', { name: 'Doctor' })).toContainText(
    'All checks pass.',
  )
  await expect(page.getByText('notes/a')).toHaveCount(0)
})
```

(The e2e instance configures no capture service, so the funnel holds the five groups and no capture lane.)

- [ ] **Step 3: Widths and axe.** In `widths.spec.ts` change the path list to `['/', '/memory', '/atrium', '/clips', '/worker', '/system']`. In `a11y.spec.ts`, inside the scheme `describe`, add:

```ts
    test('memory flow, atrium and clips have no axe violations', async ({
      page,
    }) => {
      await signIn(page)
      await page.goto('/memory')
      await expect(
        page.getByRole('group', { name: 'Memory flow diagram' }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.goto('/atrium')
      await expect(page.getByRole('region', { name: 'Freshness' })).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.goto('/clips')
      await expect(page.getByRole('region', { name: 'Funnel' })).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    })
```

- [ ] **Step 4: Run.** From the root: `pnpm build && pnpm exec playwright test -c e2e/playwright.config.ts` — Expected: PASS for every spec. If axe reports a React Flow internal (for example its screen-reader description node), fix it through React Flow's own props (`ariaLabelConfig`) rather than disabling the rule, and re-run. Open the screenshots under `test-results/screens/` for `/memory`, `/atrium` and `/clips` at 375 and 768 px in both schemes and check nothing overlaps.

- [ ] **Step 5: Close the backlog item.** Move the `Plan and build 1b` line from `TODO.md` to `TODO_LOG.md` under the current year and month, marked `[x]`, with the evidence: the commit range of Tasks 1-13 and `pnpm gate` passing. Keep the two Task 1 items (atrium doctor panel, context inspector) open in `TODO.md`.

- [ ] **Step 6: Gate, commit, push.**

```bash
pnpm exec prettier --write e2e TODO.md TODO_LOG.md
pnpm gate
git add e2e TODO.md TODO_LOG.md
git commit -m "test(e2e): memory flow, atrium and clips screens at every width"
git push origin main
```

Expected: `pnpm gate` green (lefthook runs it again on push).

---

## Owner steps after this plan

These touch instance data, so they stay out of this public repository:

- Add `"stage": "<id>"` to the launchd registry entries in the instance `orbit.json` whose jobs drive a stage (the atrium refresh job: `index`; the synthesis job: `synthesis`; brain maintenance: `brain`; a curation job if one exists: `curation`), so those stages show their label and last run.
- Review the three screens on the phone over the tailnet address against live data, in both schemes, and record anything that reads wrong in the private instance's orbit backlog.

## Self-review notes

- **Spec coverage.** Spec 2 (1b screens admitted per engine contract): Atrium doctor and context inspector deferred with backlog items (Task 1, D1, D2). 3.1 freshness (atrium 2 x refresh interval): Tasks 7, 9. 3.3 eight stages as data with backlog metric, freshness instant, policy and label: Tasks 6, 7. 4 budget: only the measured commands run (Task 5 uses the 1a table's two clips subcommands); atrium is read from files. 5.2 two-slot detail pool and 5.4 per-cadence cache: Task 4 (`memoryPool`, `createTtlCache`), Tasks 5 and 7. 5.7 history and unknown periods: Tasks 2, 8. 6.6 content: identifier checks in Tasks 4, 5, 7 and the e2e content assertion in Task 13. 7 item 3 (flow, particles, side panel), item 4 (records per source, freshness, synthesis trend, populations), item 6 (funnel, intake per day, oldest ages): Tasks 9-12. 7.1 chart and motion rules, 7.3 interaction (slider, Escape, table, half-opacity on range change): Tasks 8, 12. 9 (Testing Library, vitest-axe on every screen, flow tested against a mocked React Flow, Playwright per screen): Tasks 8-13. 11 (codeality limits, lazy routes, flow chunk 250 KB): every task, Task 12.
- **Placeholder scan.** No TBD or "similar to" steps; two hedges remain by design, both naming the exact fallback: a possible jscpd duplicate (Tasks 8, 10) and React Flow axe internals (Task 13).
- **Type consistency.** `AtriumDocuments`, `AtriumDeps`, `ClipsDocuments`, `ClipsReader`, `FlowInputs`, `FlowStageSpec`, `MemoryFlow`, `TrendModel`, `TrendState`, `FlowStage`, `MemoryFlowModel` keep one definition each and the same field names in every task that uses them; `memoryPool` is created once in Task 4 and reused in Tasks 5 and 7; `buildHandler` gains `engines` in Task 5 only.
