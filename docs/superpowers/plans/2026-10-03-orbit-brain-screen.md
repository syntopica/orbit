# orbit Brain screen (sub-project 1c) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Brain screen: a WebGL graph of brain pages and links (colour by type or community, size by degree, orphans highlighted, type filters, search, a depth 1-3 local view), a page view with the rendered page and its links, related-unlinked suggestions on demand, and lint and doctor side panels, all behind session-guarded detail routes.

**Architecture:** Sub-project 1 is three plans: 1a (done) the engine table and four adapters; 1b (in progress elsewhere) the Memory flow, Atrium and Clips screens; **1c** (this plan) the Brain screen. 1c teaches the engine table one validated placeholder (`{pageId}`) and leading-argument lookup, adds four detail routes over `brain graph`, `brain graph --related`, `brain page` and `brain lint`/`doctor` (`/api/brain/graph|related|page|checks`), and a lazy `/brain` route that draws the graph with sigma 3 through `@react-sigma/core`, lays it out with ForceAtlas2 and Louvain in orbit's own module worker, and renders a page with `react-markdown` without raw HTML. Pure modules (graph model, colours, sizes, neighbourhoods, layout) carry the logic and are unit-tested; sigma is mocked only at its React boundary.

**Tech Stack:** Node 26, Hono, TypeScript, zod 4, React 19, TanStack Router and Query, sigma 3.0.3, graphology 0.26.0, graphology-layout-forceatlas2 0.10.1, graphology-communities-louvain 2.0.2, @react-sigma/core 5.0.6 (the versions the 2026-10-02 bundle probe measured), react-markdown 10.1.0, remark-gfm 4.0.1, Tailwind 4, Vitest 5, Testing Library, vitest-axe, Playwright with axe.

**Spec:** `docs/superpowers/specs/2026-10-01-orbit-design.md` (sections 2, 3.1, 4, 5.1, 5.3, 5.4, 6.6, 7 item 5, 7.1, 9, 11, 13). Task 1 adds revision 9 with the decisions below; executors read both.

**Depends on 1b.** Start only after 1b's Tasks 1-13 are merged. This plan consumes from 1b: revision 8 of the spec (section 7.4), `memoryPool` in `createApp` (1b Task 4), `createTtlCache` (1b Task 4), `buildHandler`'s `engines` parameter (1b Task 5), `toCheckRows` (`apps/server/src/clipsView/toCheckRows.ts`, 1b Task 5), `useTrend`, `TrendSection`, `TrendSpec` (1b Task 8), `DoctorList` (`apps/web/src/screens/clips/DoctorList.tsx`, 1b Task 10), the nav items 1b adds, and 1b's `widths.spec.ts`/`a11y.spec.ts` edits. Nothing 1b builds is rebuilt here.

## Global Constraints

- Codeality strict (spec 11): one primary unit per file, `max-lines` 100 per production file and 200 per test file, `max-lines-per-function` 50, `complexity` 10, `--max-warnings 0`; never `eslint-disable`. A constant, type or helper that is not the file's export goes in its own file (`code-policy/no-hidden-top-level-declarations`); `src/**/*.test.ts(x)` files are exempt.
- Content (spec 6.6): page ids, titles, bodies, sources and links are content. They appear only in the four `/api/brain/*` detail responses, fetched on demand by a signed-in session; never in snapshots, events, the SSE stream, the history store, logs, error responses or audit records. The client never persists them: no localStorage, IndexedDB or service worker; every brain query has `gcTime: 0`, so it is dropped when its screen (or the palette) unmounts.
- Server errors are fixed JSON (spec 8): `400 {"error":"bad_request"}`, `404 {"error":"not_found"}`, `503 {"error":"unavailable"}`; engine output is never echoed or logged.
- Subprocesses (spec 5.3): `shell: false`, only argument lists the engine table names, one placeholder kind (`{pageId}`) filled only with a value that passes `pageIdSchema`; 10 s per command, 8 MB output cap.
- Detail calls (spec 5.2, 5.4): 1b's `memoryPool` (two slots, FIFO, timeout from enqueue); results cached in memory for the brain cadence (60 s), pages per id (at most 16 ids).
- Budget (spec 4, measured): `brain graph --json --no-html` median 1.14 s, max 1.95 s at load average about 35; lint 0.43 s; doctor 0.5 s. Task 1 measures `--related` and `page` before any route ships. The graph is fetched when the screen opens and never polled.
- Markdown (spec 6.6): `react-markdown` without `rehype-raw`; external links `target="_blank" rel="noopener noreferrer"`; images render as their alt text.
- CSP stays `default-src 'self'` (spec 6.5): no `blob:` worker, no injected `<style>`.
- Bundle (spec 11): initial route at most 150 KB brotli; the Brain route chunk plus its layout worker at most 250 KB brotli, loaded lazily.
- Shell (spec 7): 375 px and 768 px widths without sideways scroll; axe clean in both schemes; `prefers-reduced-motion` disables camera animation.
- Public repository: fixtures and docs use placeholders (`notes/a`, `topic`, `com.example.*`).
- Format per package (`pnpm exec prettier --write .` inside `apps/server`, `apps/web`, `packages/contract`) before `pnpm gate`; root and package Prettier configs order imports differently. Commit per task. Do not push until Task 14, and then only with `pnpm gate` green.

## Decisions on open product questions

The spec leaves these readings open; Task 1 records them as revision 9.

- **D1 Page view content.** The page view shows the page's rendered body, a fixed set of frontmatter fields (`title`, `type`, `updated`, `summary`, `sources`), its outbound links (with whether each target exists) and its inbound links, to any signed-in session (orbit has one operator, spec 1 non-goals). Other frontmatter keys are never forwarded by the route. The body is the engine's, capped at 1 MiB, with `truncated` shown. This is the only place orbit shows page text; the graph route carries ids, types, degrees and orphan flags only (the engine already leaves titles out).
- **D2 One placeholder.** An engine table argument may be exactly `{pageId}`. The runner accepts a requested argument in that position only when it passes `pageIdSchema`; any other `{...}` argument in the table is a configuration error. `orbit doctor` skips entries with a placeholder (it has no id to run them with) and runs the rest.
- **D3 Leading-argument lookup.** A caller may name a listed entry by its leading arguments; the runner then runs the table's full entry. `['doctor', '--json']` therefore runs the table's `['doctor', '--json', '--skip', 'credentials']`, and `['graph', '--json', '--related']` runs `['graph', '--json', '--related', '--limit', '50']`. An exact match wins; zero or several candidates are refused (`check_failed`). The appended arguments come from `orbit.json`, never from the caller. This also repairs the brain and clips adapters, which ask for `['doctor', '--json']` while the instance table lists the `--skip credentials` form.
- **D4 Page id pattern.** `pageIdSchema`: at most 256 characters, `<dir>[/<dir>...]/<stem>`, ASCII letters, digits, `_` and `-` (dots also inside the stem), no segment starting with `.` or `-`. It is checked before an id reaches the engine (which validates again against its page roots). Graph nodes whose ids fail it are left out and counted as `skipped`; the screen says how many.
- **D5 Fetch policy.** The graph and the checks are fetched when the screen opens (client `staleTime: Infinity`, no refetch interval, no refetch on focus) and cached 60 s on the server. Related pairs load only when asked. A page loads when selected. Nothing on this screen polls.
- **D6 Related pairs.** The table fixes the limit at 50. The panel lists pairs involving the selected page first, then the rest; each side is a link that selects that page.
- **D7 Colour.** By type: types ranked by page count (ties by name) take series slots 1-5, every other type shares slot 6. Types are instance vocabulary, so no fixed table can live in this public engine; ranking keeps the five largest distinguishable and the legend always names the mapping. By community: Louvain communities ranked by size the same way. Orphans (no inbound link, the engine's definition) wear the warn colour with the legend label "Orphan" while "Highlight orphans" is on (default on). The selected page wears the accent colour.
- **D8 Size.** Node size is `min(16, 2 + 1.5 * sqrt(degree))`, degree as the engine counts it (distinct linked pages either way).
- **D9 Layout.** ForceAtlas2 (300 iterations, inferred settings, Barnes-Hut above 1000 nodes) and Louvain run in orbit's own module worker from the same origin: the forceatlas2 package's bundled worker starts from a `blob:` URL, which the CSP refuses. Nodes start on a circle in index order and Louvain uses a seeded generator, so the same graph always lays out the same way. The local view reuses global positions and fits the camera to the visible nodes.
- **D10 Local view.** "View" is Whole graph or 1, 2, 3 steps around the selected page (breadth-first over links in either direction); without a selection the step choices are disabled with a hint. Type filters apply in both views; the selected page is always visible.
- **D11 State in the URL** (spec 7): `/brain?page=&depth=&color=&orphans=&hide=&range=`. The page id is in the URL so a selection can be linked; the URL never leaves orbit (`Referrer-Policy: no-referrer`).
- **D12 Accessibility.** The canvas is a `role="img"` with a summary name. Every page is reachable without a pointer through "Find a page" (an input with a datalist of ids) and the "Show pages" table, whose rows select pages. Without WebGL, or if the layout fails, the screen says so and the list, page view and panels still work.
- **D13 Side panels.** Lint lists issues grouped by code with each page as a link; Doctor reuses 1b's `DoctorList`; a lint trend (`brain.lint_issues`, `brain.doctor_failing`) uses 1b's `TrendSection`.
- **D14 Palette.** The command palette lists brain pages when it opens (spec 7: "navigation to any ... page"), reading the same graph query; the entries are dropped when it closes.
- **D15 Phone.** Under 768 px the graph is full width at 60 % of the viewport height and the panels stack below it; the tab bar's labels shrink to fit seven items.
- **D16 Static graph retired.** After this plan lands, the instance's separate static graph LaunchAgent is retired by the owner (owner steps); orbit is the graph viewer.

## File structure

Contract (`packages/contract/src`): `schemas/{pageIdSchema,brainGraphSchema,brainRelatedSchema,brainPageSchema,brainChecksSchema}.ts`, `types/{BrainGraph,BrainRelated,BrainPage,BrainChecks}.ts`, `index.ts`.

Server (`apps/server/src`):
- `engines/` — `pageIdPlaceholder.ts`, `argMatches.ts`, `resolveListedArgs.ts`, `hasPlaceholder.ts`; `engineTableSchema.ts`, `createEngineRunner.ts` modified; `sameArgs.ts` deleted.
- `cli/checks/runEngineCommands.ts` modified.
- `adapters/brain/` — `brainGraphDocumentSchema.ts`, `brainRelatedDocumentSchema.ts`, `brainPageDocumentSchema.ts`, `readBrainChecks.ts`, `readBrainGraph.ts`, `readBrainRelated.ts`, `readBrainPage.ts`; `createBrainAdapter.ts` modified.
- `scheduler/createKeyedTtlCache.ts`.
- `brainView/` — `isPageId.ts`, `textOrNull.ts`, `toSources.ts`, `toBrainGraph.ts`, `toBrainRelated.ts`, `toBrainPage.ts`, `toBrainChecks.ts`.
- `cli/buildBrainReaders.ts`; `cli/buildHandler.ts` modified.
- `http/routes/` — `getBrainDetail.ts`, `getBrainPage.ts`, `registerBrainRoutes.ts`; `http/createApp.ts` modified.
- `types/` — `BrainGraphDocument.ts`, `BrainRelatedDocument.ts`, `BrainPageDocument.ts`, `BrainPageFound.ts`, `BrainChecksDocuments.ts`, `BrainReaders.ts`, `BrainDetailView.ts`; `AppDeps.ts` modified.
- `test/buildTestApp.ts` modified.

Web (`apps/web/src`):
- Graph model: `selectors/{buildGraphModel,neighbourhood,visibleNodes,toNodeAttributes,selectBrainGraph,selectTypeLegend,toggleHidden,relatedFor,groupIssues}.ts`, `charts/{untypedType,rankSlots,typeSlots,communitySlots,nodeSize,nodeColor,seriesSwatches,depthOptions}.ts`, `graph/{toGraph,hasWebGl,sigmaSettings,readGraphPalette}.ts`.
- Layout: `layout/{seededRandom,computeLayout,layoutWorker,createLayoutWorker,requestLayout}.ts`, `schemas/layoutResultSchema.ts`, `hooks/useGraphLayout.ts`.
- State and data: `validators/{validateBrainSearch,readGraphDepth}.ts`, `selectors/{withPage,selectNodeStyle}.ts`, `hooks/{useBrainSearch,useBrainView,useGraphPalette,useBrainPage,useBrainRelated,useBrainChecks,usePalettePages}.ts`, `formatters/{formatGraphSummary,linkWikiPages,internalPageOf}.ts`, `labels/brainLabels.ts`, `charts/brainTrendSpecs.ts`, `router/brainRoute.ts`.
- Screens: `screens/brain/{BrainScreen,BrainBody,BrainSide,GraphStage,GraphCanvas,GraphLoader,GraphEvents,GraphFocus,GraphLegend,PageList,GraphControls,TypeFilter,DepthControl,PageSearch,PagePanel,PageMarkdown,markdownComponents,PageLinks,PageLink,RelatedPanel,LintPanel,ChecksSection}.tsx`; `components/shell/{PalettePages}.tsx`.
- Types: `types/{GraphModel,GraphPalette,NodeColorInput,NodeStyleOptions,GraphNodeAttributes,GraphEdgeAttributes,LayoutRequest,LayoutResult,LayoutState,GraphDepth,ColorMode,BrainSearch,BrainSearchPatch,BrainSearchModel,BrainView,BrainPageState,BrainRelatedState,BrainChecksState,TypeLegendEntry,IssueGroup,PalettePagesState}.ts` and one `*Props.ts` per component.
- Test helpers: `test/{SyncLayoutWorker,fakeReactSigma,fakeLayoutWorkerModule,brainGraphFixture,stubBrainFetch}.ts(x)`.
- Shell: `components/shell/{navItems,TabBar,PaletteList}.tsx`, `types/{NavItem,CommandPaletteModel}.ts`, `hooks/useCommandPalette.ts`, `router/routeTree.ts`, `styles.css`; `.size-limit.json`, `vite.config.ts`, `vitest.config.ts`, `knip.config.ts`, `package.json`.

E2E: `e2e/fixtures/bin/brain.mjs`, `e2e/globalSetup.ts`, `e2e/specs/brain.spec.ts`, `e2e/specs/widths.spec.ts`, `e2e/specs/a11y.spec.ts`.

Docs: `docs/superpowers/specs/2026-10-01-orbit-design.md`, `docs/measurements/2026-10-03-brain-detail-commands.md`, `TODO.md`, `TODO_LOG.md`.

---
### Task 1: Measurements, spec revision 9 and backlog

**Files:**

- Create: `docs/measurements/2026-10-03-brain-detail-commands.md`
- Modify: `docs/superpowers/specs/2026-10-01-orbit-design.md` (status line, change log, section 5.3, new section 7.5)
- Modify: `TODO.md`

**Interfaces:**

- Produces: the measured budget for every brain command the screen runs, and decisions D1-D16 as spec text that every later task argues from.

- [ ] **Step 1: Measure the two on-demand commands** on the full instance under orbit's environment (spec 4: p95 2 s, under 300 MB RSS). From the brain checkout named in the instance's `syntopica.config.json`:

```bash
ID="$(env -i PATH="$PATH" HOME="$HOME" SYNTOPICA_DATA="$SYNTOPICA_DATA" bin/brain graph --json --no-html | jq -r '.nodes[0].id')"
for i in $(seq 10); do
  env -i PATH="$PATH" HOME="$HOME" SYNTOPICA_DATA="$SYNTOPICA_DATA" \
    /usr/bin/time -l bin/brain graph --json --related --limit 50 2>&1 >/dev/null \
    | awk '/real/ {r=$1} /maximum resident/ {m=$1} END {print r, m}'
done > /tmp/brain-related.times
for i in $(seq 10); do
  env -i PATH="$PATH" HOME="$HOME" SYNTOPICA_DATA="$SYNTOPICA_DATA" \
    /usr/bin/time -l bin/brain page --json --id "$ID" 2>&1 >/dev/null \
    | awk '/real/ {r=$1} /maximum resident/ {m=$1} END {print r, m}'
done > /tmp/brain-page.times
uptime
```

Expected: every `real` under 2.0 s and every RSS under 314572800 bytes. If either command misses the budget, stop and report to the owner: spec 4 then requires the file pattern instead of a detail call, and this plan must change first.

- [ ] **Step 2: Record the numbers** in `docs/measurements/2026-10-03-brain-detail-commands.md` (timings and memory only: no page id, page count or other instance value):

```markdown
# Brain detail commands against the spec 4 budget

Date: 2026-10-03. Ten runs each on the full instance, under orbit's
environment allowlist (`PATH`, `HOME`, `SYNTOPICA_DATA`), measured with
`/usr/bin/time -l`. Budget: p95 2 s and under 300 MB RSS.

| Command | Median | Max (p95 of 10) | Max RSS | Load average | Verdict |
| --- | --- | --- | --- | --- | --- |
| `brain graph --json --no-html` | 1.14 s | 1.95 s | <from 1a notes> | about 35 | pass, at the edge under load |
| `brain graph --json --related --limit 50` | <median> | <max> | <max RSS> | <uptime> | <pass/fail> |
| `brain page --json --id <id>` | <median> | <max> | <max RSS> | <uptime> | <pass/fail> |

The graph is fetched when the Brain screen opens and cached 60 s on the
server; it is never polled. `--related` and `page` are on-demand detail calls.
```

Replace every `<...>` with the measured value from Step 1 (`sort -n` the first column for the median; RSS in MB, rounded up). The graph row's RSS comes from the 1a measurement notes; if they lack it, measure it with the same loop and `graph --json --no-html`.

- [ ] **Step 3: Bump the status line.** Replace `Status: draft, revision 8` with `Status: draft, revision 9`.

- [ ] **Step 4: Add the change log entry** directly above `**Revision 8 (memory screens).**`:

```markdown
**Revision 9 (brain screen).** 5.3: one validated argument placeholder
(`{pageId}`) and leading-argument lookup in the engine table. 7.5 (new): the
routes `GET /api/brain/graph|related|page|checks`, the page id pattern, the
graph's colour, size, layout and local view, the page view's content, and the
fetch policy (open, cache, never poll).
```

- [ ] **Step 5: Amend section 5.3.** After the bullet that ends `a missing or non-executable file is \`not_found\`.`, add:

```markdown
- An argument in the table may be exactly `{pageId}`, the only placeholder.
  The runner accepts a requested argument in that position only when it
  matches the page id pattern (section 7.5); any other `{...}` argument is a
  configuration error. A caller may name a listed entry by its leading
  arguments, and the runner then runs the table's whole entry (for example
  `doctor --json` runs the listed `doctor --json --skip credentials`); an exact
  match wins, and zero or several candidates are refused. Appended arguments
  come from the table, never from the caller. `orbit doctor` skips entries
  that hold a placeholder.
```

- [ ] **Step 6: Add section 7.5** after the end of section 7.4 (before `### 7.1 Visual language`):

```markdown
### 7.5 Brain screen

**Routes.** Four session-guarded detail routes run brain commands through the
engine table under the detail pool, each cached in memory for the brain
cadence (60 s): `GET /api/brain/graph` (`graph --json --no-html`, 10 s),
`GET /api/brain/related` (`graph --json --related`, the table fixing
`--limit 50`, 10 s), `GET /api/brain/page?id=<id>` (`page --json --id <id>`,
10 s, cached per id for at most 16 ids) and `GET /api/brain/checks` (`lint
--json` then `doctor --json`, 15 s). A page id is at most 256 ASCII
characters, `<dir>[/<dir>...]/<stem>` of letters, digits, `_` and `-` (dots
also inside the stem), no segment starting with `.` or `-`; an id outside it
is a 400 and never reaches the engine. The engine's `page_not_found` is a 404
and `invalid_page_id` a 400; anything else that fails is a fixed 503.

The graph answers `{ now, nodes: [{ id, type, degree, orphan }], edges:
[[source, target]], dangling, skipped }` with edges as node indices; a node
whose id fails the pattern is left out with its edges and counted in
`skipped`; a type that is not an identifier is `null`. Related answers
`{ now, total, pairs: [{ left, right, score }] }`. A page answers its id,
`title`, `type`, `updated`, `summary`, `sources`, `body`, `truncated`, outbound
links (`target`, `exists`) and inbound links; no other frontmatter key is
forwarded. Checks answer `{ now, pageCount, indexStale, issues: [{ page, code
}], doctor: { ok, checks } }`, issues capped at 500.

**Fetching.** The graph and checks load when the screen opens and are never
polled; related pairs load when asked; a page loads when selected. Every brain
query is dropped when its screen unmounts (section 6.6).

**Graph.** sigma draws the pages; ForceAtlas2 (300 iterations) and Louvain
run in orbit's own module worker, started from a circle in index order with a
seeded generator, so a graph always lays out the same way. Size is
`min(16, 2 + 1.5 * sqrt(degree))`. Colour is by type (types ranked by page
count take series slots 1-5, the rest share slot 6) or by community (ranked by
size the same way); orphans wear the warn colour labelled "Orphan" while
highlighted, and the selected page the accent colour. Type filters hide
pages; the local view shows 1-3 steps around the selected page over links in
either direction and reuses the global positions. The canvas is an image with
a summary name; "Find a page" and a "Show pages" table reach every page
without a pointer, and both still work without WebGL.

**Page view.** The selected page's rendered body (Markdown without raw HTML,
images as their alt text, external links in a new tab with
`rel="noopener noreferrer"`, `[[dir/page]]` links selecting that page), the
fixed frontmatter fields above, and its outbound and inbound links. Related
pairs list the selected page's pairs first. Side panels: lint issues grouped
by code with each page selectable, failing doctor checks, and a lint trend
from orbit's history. The selection, view depth, colour mode, orphan
highlight, hidden types and trend range are kept in the URL.
```

- [ ] **Step 7: Update the backlog.** In `TODO.md`, replace the `Plan and build 1c` item with:

```markdown
- [~] Build 1c: Brain screen (plan
      `docs/superpowers/plans/2026-10-03-orbit-brain-screen.md`). Detail
      command budget measured in
      `docs/measurements/2026-10-03-brain-detail-commands.md`.
```

- [ ] **Step 8: Format and commit.**

```bash
pnpm exec prettier --write docs/superpowers/specs/2026-10-01-orbit-design.md docs/measurements/2026-10-03-brain-detail-commands.md TODO.md
git add docs/superpowers/specs/2026-10-01-orbit-design.md docs/measurements/2026-10-03-brain-detail-commands.md TODO.md
git commit -m "docs(spec): brain screen routes, placeholders and decisions (revision 9)"
```

---

### Task 2: Page id and brain view contract

**Files:**

- Create: `packages/contract/src/schemas/{pageIdSchema,brainGraphSchema,brainRelatedSchema,brainPageSchema,brainChecksSchema}.ts`
- Create: `packages/contract/src/types/{BrainGraph,BrainRelated,BrainPage,BrainChecks}.ts`
- Modify: `packages/contract/src/index.ts`
- Test: `packages/contract/src/schemas/brainSchemas.test.ts`

**Interfaces:**

- Consumes: `identifierSchema`, `countSchema`.
- Produces:
  - `pageIdSchema` (zod string, D4).
  - `brainGraphSchema` / `type BrainGraph = { now: number; nodes: { id: string; type: string | null; degree: number; orphan: boolean }[]; edges: [number, number][]; dangling: number; skipped: number }`
  - `brainRelatedSchema` / `type BrainRelated = { now: number; total: number; pairs: { left: string; right: string; score: number }[] }`
  - `brainPageSchema` / `type BrainPage = { id: string; title: string | null; type: string | null; updated: string | null; summary: string | null; sources: string[]; body: string; truncated: boolean; outbound: { target: string; exists: boolean }[]; inbound: string[] }`
  - `brainChecksSchema` / `type BrainChecks = { now: number; pageCount: number; indexStale: boolean; issues: { page: string; code: string }[]; doctor: { ok: boolean; checks: { name: string; ok: boolean; code: string }[] } }`
  - All exported from `@orbit/contract`.

- [ ] **Step 1: Write the failing test.** `packages/contract/src/schemas/brainSchemas.test.ts`:

```ts
import { brainChecksSchema } from './brainChecksSchema'
import { brainGraphSchema } from './brainGraphSchema'
import { brainPageSchema } from './brainPageSchema'
import { brainRelatedSchema } from './brainRelatedSchema'
import { pageIdSchema } from './pageIdSchema'

const NOW = 1_790_000_000_000

describe('pageIdSchema', () => {
  it.each(['notes/a', 'notes/sub/b-2', 'notes/v1.2', 'a_b/c_d'])(
    'accepts %s',
    (id) => {
      expect(pageIdSchema.safeParse(id).success).toBe(true)
    },
  )
  it.each([
    'notes',
    '/notes/a',
    'notes/../a',
    'notes/.hidden',
    'notes/-rf',
    '-x/a',
    'notes/a b',
    'notes\\a',
    'notes/ñ',
    `notes/${'a'.repeat(260)}`,
  ])('refuses %s', (id) => {
    expect(pageIdSchema.safeParse(id).success).toBe(false)
  })
})

describe('brain view schemas', () => {
  it('accepts a graph with index edges and refuses a bad id or type', () => {
    const graph = {
      now: NOW,
      nodes: [
        { id: 'notes/a', type: 'topic', degree: 1, orphan: true },
        { id: 'notes/b', type: null, degree: 1, orphan: false },
      ],
      edges: [[1, 0]],
      dangling: 2,
      skipped: 0,
    }
    expect(brainGraphSchema.parse(graph)).toEqual(graph)
    const badId = { ...graph, nodes: [{ ...graph.nodes[0], id: 'x' }] }
    expect(brainGraphSchema.safeParse(badId).success).toBe(false)
    const badType = { ...graph, nodes: [{ ...graph.nodes[0], type: 'a b' }] }
    expect(brainGraphSchema.safeParse(badType).success).toBe(false)
  })
  it('accepts related pairs of page ids', () => {
    const related = {
      now: NOW,
      total: 3,
      pairs: [{ left: 'notes/a', right: 'notes/b', score: 1.5 }],
    }
    expect(brainRelatedSchema.parse(related)).toEqual(related)
  })
  it('accepts a page and refuses an outbound target outside the pattern', () => {
    const page = {
      id: 'notes/a',
      title: 'A',
      type: 'topic',
      updated: '2026-10-01',
      summary: null,
      sources: ['https://example.com/x'],
      body: '# A',
      truncated: false,
      outbound: [{ target: 'notes/b', exists: true }],
      inbound: ['notes/c'],
    }
    expect(brainPageSchema.parse(page)).toEqual(page)
    const bad = { ...page, outbound: [{ target: '../x', exists: false }] }
    expect(brainPageSchema.safeParse(bad).success).toBe(false)
  })
  it('accepts checks with identifier codes only', () => {
    const checks = {
      now: NOW,
      pageCount: 3,
      indexStale: false,
      issues: [{ page: 'notes/a', code: 'dangling_link' }],
      doctor: { ok: true, checks: [{ name: 'paths', ok: true, code: 'ok' }] },
    }
    expect(brainChecksSchema.parse(checks)).toEqual(checks)
    const bad = { ...checks, issues: [{ page: 'notes/a', code: 'see log' }] }
    expect(brainChecksSchema.safeParse(bad).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run to see it fail.** `cd packages/contract && pnpm vitest run src/schemas/brainSchemas.test.ts` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement.**

`packages/contract/src/schemas/pageIdSchema.ts`:

```ts
import { z } from 'zod'

// A brain page id as orbit accepts it (spec 7.5): `<dir>[/<dir>...]/<stem>`
// in ASCII. No segment starts with `.` or `-`, so an id can neither climb out
// of a page root nor read as an option; anything else never reaches the
// engine, which validates again against its configured roots.
export const pageIdSchema = z
  .string()
  .max(256)
  .regex(
    /^[A-Za-z0-9_][A-Za-z0-9_-]*(?:\/[A-Za-z0-9_][A-Za-z0-9_-]*)*\/[A-Za-z0-9_][A-Za-z0-9_.-]*$/,
  )
```

`packages/contract/src/schemas/brainGraphSchema.ts`:

```ts
import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'
import { pageIdSchema } from './pageIdSchema'

// GET /api/brain/graph (spec 7.5). Page ids are content: detail route only.
export const brainGraphSchema = z.object({
  now: z.number(),
  nodes: z.array(
    z.object({
      id: pageIdSchema,
      type: identifierSchema.nullable(),
      degree: countSchema,
      orphan: z.boolean(),
    }),
  ),
  edges: z.array(z.tuple([countSchema, countSchema])),
  dangling: countSchema,
  skipped: countSchema,
})
```

`packages/contract/src/schemas/brainRelatedSchema.ts`:

```ts
import { z } from 'zod'

import { countSchema } from './countSchema'
import { pageIdSchema } from './pageIdSchema'

export const brainRelatedSchema = z.object({
  now: z.number(),
  total: countSchema,
  pairs: z.array(
    z.object({
      left: pageIdSchema,
      right: pageIdSchema,
      score: z.number().nonnegative(),
    }),
  ),
})
```

`packages/contract/src/schemas/brainPageSchema.ts`:

```ts
import { z } from 'zod'

import { identifierSchema } from './identifierSchema'
import { pageIdSchema } from './pageIdSchema'

// One page (spec 7.5, D1): a fixed set of frontmatter fields, never the rest.
export const brainPageSchema = z.object({
  id: pageIdSchema,
  title: z.string().max(512).nullable(),
  type: identifierSchema.nullable(),
  updated: z.string().max(64).nullable(),
  summary: z.string().max(2048).nullable(),
  sources: z.array(z.string().max(1024)).max(200),
  body: z.string(),
  truncated: z.boolean(),
  outbound: z.array(z.object({ target: pageIdSchema, exists: z.boolean() })),
  inbound: z.array(pageIdSchema),
})
```

`packages/contract/src/schemas/brainChecksSchema.ts`:

```ts
import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'
import { pageIdSchema } from './pageIdSchema'

export const brainChecksSchema = z.object({
  now: z.number(),
  pageCount: countSchema,
  indexStale: z.boolean(),
  issues: z
    .array(z.object({ page: pageIdSchema, code: identifierSchema }))
    .max(500),
  doctor: z.object({
    ok: z.boolean(),
    checks: z.array(
      z.object({ name: identifierSchema, ok: z.boolean(), code: identifierSchema }),
    ),
  }),
})
```

`packages/contract/src/types/BrainGraph.ts` (and the same shape for the other three, each over its own schema):

```ts
import type { z } from 'zod'

import type { brainGraphSchema } from '../schemas/brainGraphSchema'

export type BrainGraph = z.infer<typeof brainGraphSchema>
```

`packages/contract/src/types/BrainRelated.ts`:

```ts
import type { z } from 'zod'

import type { brainRelatedSchema } from '../schemas/brainRelatedSchema'

export type BrainRelated = z.infer<typeof brainRelatedSchema>
```

`packages/contract/src/types/BrainPage.ts`:

```ts
import type { z } from 'zod'

import type { brainPageSchema } from '../schemas/brainPageSchema'

export type BrainPage = z.infer<typeof brainPageSchema>
```

`packages/contract/src/types/BrainChecks.ts`:

```ts
import type { z } from 'zod'

import type { brainChecksSchema } from '../schemas/brainChecksSchema'

export type BrainChecks = z.infer<typeof brainChecksSchema>
```

In `packages/contract/src/index.ts` add, keeping the file's alphabetical grouping:

```ts
export { brainChecksSchema } from './schemas/brainChecksSchema'
export { brainGraphSchema } from './schemas/brainGraphSchema'
export { brainPageSchema } from './schemas/brainPageSchema'
export { brainRelatedSchema } from './schemas/brainRelatedSchema'
export { pageIdSchema } from './schemas/pageIdSchema'
export type { BrainChecks } from './types/BrainChecks'
export type { BrainGraph } from './types/BrainGraph'
export type { BrainPage } from './types/BrainPage'
export type { BrainRelated } from './types/BrainRelated'
```

- [ ] **Step 4: Run.** `cd packages/contract && pnpm vitest run` — Expected: PASS.

- [ ] **Step 5: Format, gate the package, commit.**

```bash
(cd packages/contract && pnpm exec prettier --write . && pnpm check:ci)
git add packages/contract/src
git commit -m "feat(contract): page id pattern and brain detail views"
```

---

### Task 3: Engine table placeholder and leading-argument lookup

**Files:**

- Create: `apps/server/src/engines/{pageIdPlaceholder,argMatches,resolveListedArgs,hasPlaceholder}.ts`
- Modify: `apps/server/src/engines/engineTableSchema.ts`, `apps/server/src/engines/createEngineRunner.ts`, `apps/server/src/cli/checks/runEngineCommands.ts`
- Delete: `apps/server/src/engines/sameArgs.ts` (its only caller is replaced)
- Test: `apps/server/src/engines/resolveListedArgs.test.ts`, `apps/server/src/engines/engineTableSchema.test.ts`; extend `apps/server/src/engines/createEngineRunner.test.ts` and `apps/server/src/cli/checks/checkEngines.test.ts`

**Interfaces:**

- Consumes: `pageIdSchema` (Task 2), `ResolvedEngine`, `ProcessError`.
- Produces:
  - `PAGE_ID_PLACEHOLDER = '{pageId}'`
  - `argMatches(listed: string, requested: string): boolean`
  - `resolveListedArgs(subcommands: readonly (readonly string[])[], requested: readonly string[]): readonly string[] | null` — the arguments to run, or `null` to refuse (D2, D3).
  - `hasPlaceholder(args: readonly string[]): boolean`
  - `createEngineRunner` keeps its signature; it now runs `resolveListedArgs(...)` and refuses `null` with `ProcessError('check_failed')`.
  - `runEngineCommands` skips entries with a placeholder.

- [ ] **Step 1: Write the failing tests.**

`apps/server/src/engines/resolveListedArgs.test.ts`:

```ts
import { resolveListedArgs } from './resolveListedArgs'

const table = [
  ['lint', '--json'],
  ['doctor', '--json', '--skip', 'credentials'],
  ['graph', '--json', '--no-html'],
  ['graph', '--json', '--related', '--limit', '50'],
  ['page', '--json', '--id', '{pageId}'],
]

describe('resolveListedArgs', () => {
  it('runs an exact entry as requested', () => {
    expect(resolveListedArgs(table, ['lint', '--json'])).toEqual([
      'lint',
      '--json',
    ])
  })
  it('completes a unique leading match from the table', () => {
    expect(resolveListedArgs(table, ['doctor', '--json'])).toEqual([
      'doctor',
      '--json',
      '--skip',
      'credentials',
    ])
    expect(resolveListedArgs(table, ['graph', '--json', '--related'])).toEqual(
      ['graph', '--json', '--related', '--limit', '50'],
    )
  })
  it('refuses an ambiguous, unknown or longer request', () => {
    expect(resolveListedArgs(table, ['graph', '--json'])).toBeNull()
    expect(resolveListedArgs(table, ['index'])).toBeNull()
    expect(resolveListedArgs(table, ['lint', '--json', '--fix'])).toBeNull()
  })
  it('fills the placeholder only with a valid page id', () => {
    expect(
      resolveListedArgs(table, ['page', '--json', '--id', 'notes/a']),
    ).toEqual(['page', '--json', '--id', 'notes/a'])
    for (const id of ['../etc/passwd', '--json', 'notes/a b', '{pageId}'])
      expect(resolveListedArgs(table, ['page', '--json', '--id', id])).toBeNull()
  })
  it('never completes a request into an unfilled placeholder', () => {
    expect(resolveListedArgs(table, ['page', '--json'])).toBeNull()
  })
})
```

`apps/server/src/engines/engineTableSchema.test.ts`:

```ts
import { engineTableSchema } from './engineTableSchema'

describe('engineTableSchema', () => {
  it('accepts the page id placeholder as a whole argument', () => {
    const table = {
      brain: {
        command: 'bin/brain',
        subcommands: [['page', '--json', '--id', '{pageId}']],
      },
    }
    expect(engineTableSchema.safeParse(table).success).toBe(true)
  })
  it('refuses any other placeholder', () => {
    for (const arg of ['{path}', '{pageId}x', '{}'])
      expect(
        engineTableSchema.safeParse({
          brain: { command: 'bin/brain', subcommands: [['page', arg]] },
        }).success,
      ).toBe(false)
  })
})
```

Append to `apps/server/src/engines/createEngineRunner.test.ts`, inside its `describe`:

```ts
  it('runs the full listed entry for a leading request', async () => {
    const seen: RunRequest[] = []
    const run = createEngineRunner(
      { ...engine, subcommands: [['doctor', '--json', '--skip', 'credentials']] },
      async (request) => {
        seen.push(request)
        return await Promise.resolve({ code: 0, stdout: '{}' })
      },
    )
    await run(['doctor', '--json'], new AbortController().signal)
    expect(seen[0]?.args).toEqual(['doctor', '--json', '--skip', 'credentials'])
  })
  it('refuses a placeholder value outside the page id pattern', async () => {
    const run = createEngineRunner(
      { ...engine, subcommands: [['page', '--json', '--id', '{pageId}']] },
      async () => {
        throw new Error('must not run')
      },
    )
    await expect(
      run(['page', '--json', '--id', '../x'], new AbortController().signal),
    ).rejects.toMatchObject({ reason: 'check_failed' })
  })
```

Append to `apps/server/src/cli/checks/checkEngines.test.ts`, inside its `describe`:

```ts
  it('skips entries that hold a placeholder', async () => {
    const bin = await writeFakeBin('tool', `echo '{"schemaVersion":1}'`)
    const state = await openTestState({
      engines: {
        brain: {
          command: 'tool',
          subcommands: [
            ['lint', '--json'],
            ['page', '--json', '--id', '{pageId}'],
          ],
        },
      },
    })
    const ready = {
      ...state,
      instance: { ...state.instance, engines: { brain: { path: dirname(bin) } } },
    }
    expect(await checkEngines(ready)).toMatchObject({
      level: 'ok',
      detail: '1 engine commands ran',
    })
    state.close()
  })
```

- [ ] **Step 2: Run to see them fail.** `cd apps/server && pnpm vitest run src/engines src/cli/checks/checkEngines.test.ts` — Expected: FAIL (modules not found; the leading-request and skip tests fail on the current runner).

- [ ] **Step 3: Implement.**

`apps/server/src/engines/pageIdPlaceholder.ts`:

```ts
// The only argument placeholder the engine table accepts (spec 5.3).
export const PAGE_ID_PLACEHOLDER = '{pageId}'
```

`apps/server/src/engines/argMatches.ts`:

```ts
import { pageIdSchema } from '@orbit/contract'

import { PAGE_ID_PLACEHOLDER } from './pageIdPlaceholder'

// A listed argument matches itself; the placeholder matches a valid page id.
export const argMatches = (listed: string, requested: string): boolean =>
  listed === PAGE_ID_PLACEHOLDER
    ? pageIdSchema.safeParse(requested).success
    : listed === requested
```

`apps/server/src/engines/hasPlaceholder.ts`:

```ts
import { PAGE_ID_PLACEHOLDER } from './pageIdPlaceholder'

export const hasPlaceholder = (args: readonly string[]): boolean =>
  args.includes(PAGE_ID_PLACEHOLDER)
```

`apps/server/src/engines/resolveListedArgs.ts`:

```ts
import { argMatches } from './argMatches'
import { hasPlaceholder } from './hasPlaceholder'

// D3: an exact entry runs as requested; a request naming one entry by its
// leading arguments runs that entry whole. The appended tail comes from the
// table, never from the caller, and is never an unfilled placeholder.
export const resolveListedArgs = (
  subcommands: readonly (readonly string[])[],
  requested: readonly string[],
): readonly string[] | null => {
  const candidates = subcommands.filter(
    (listed) =>
      requested.length <= listed.length &&
      requested.every((arg, index) => argMatches(listed[index] ?? '', arg)),
  )
  if (candidates.some((listed) => listed.length === requested.length))
    return requested
  const [only, ...others] = candidates
  if (only === undefined || others.length > 0) return null
  const tail = only.slice(requested.length)
  return hasPlaceholder(tail) ? null : [...requested, ...tail]
}
```

`apps/server/src/engines/engineTableSchema.ts` — refine each argument:

```ts
import { z } from 'zod'

import { PAGE_ID_PLACEHOLDER } from './pageIdPlaceholder'

// Per engine: the command (relative to the engine's checkout from the
// instance config, or absolute), the argument lists orbit may run, and extra
// environment variables beyond the allowlist (spec 5.3). `{pageId}` is the
// only placeholder; any other `{...}` argument is refused.
export const engineTableSchema = z.partialRecord(
  z.enum(['brain', 'clips']),
  z
    .object({
      command: z.string().min(1),
      subcommands: z
        .array(
          z
            .array(
              z
                .string()
                .min(1)
                .refine(
                  (arg) => !/^\{.*\}$/.test(arg) || arg === PAGE_ID_PLACEHOLDER,
                ),
            )
            .min(1),
        )
        .min(1),
      env: z
        .record(z.string().regex(/^[A-Z][A-Z0-9_]*$/), z.string())
        .default({}),
    })
    .strict(),
)
```

`apps/server/src/engines/createEngineRunner.ts`:

```ts
import { buildChildEnv } from '../process/buildChildEnv'
import { ProcessError } from '../process/ProcessError'
import type { EngineRunner } from '../types/EngineRunner'
import type { ResolvedEngine } from '../types/ResolvedEngine'
import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { resolveListedArgs } from './resolveListedArgs'

// Only argument lists the table names ever run (spec 5.3); a placeholder is
// filled only with a valid page id, and a leading request runs its entry whole.
export const createEngineRunner =
  (
    engine: ResolvedEngine,
    run: (request: RunRequest) => Promise<RunResult>,
  ): EngineRunner =>
  async (requested, signal) => {
    const args = resolveListedArgs(engine.subcommands, requested)
    if (args === null) throw new ProcessError('check_failed')
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

Delete `apps/server/src/engines/sameArgs.ts` (`git rm`); nothing else imports it.

`apps/server/src/cli/checks/runEngineCommands.ts`:

```ts
import { hasPlaceholder } from '../../engines/hasPlaceholder'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import { schemaVersionSchema } from '../../engines/schemaVersionSchema'
import { ProcessError } from '../../process/ProcessError'
import type { EngineRunner } from '../../types/EngineRunner'

// Runs each argument list once, judged by stdout like the adapters. An entry
// with a placeholder needs a value doctor does not have, so it is skipped.
export const runEngineCommands = async (
  run: EngineRunner | undefined,
  subcommands: readonly (readonly string[])[],
): Promise<number> => {
  if (run === undefined) throw new ProcessError('not_found')
  const runnable = subcommands.filter((args) => !hasPlaceholder(args))
  for (const args of runnable) {
    const result = await run(args, AbortSignal.timeout(15_000))
    parseEngineDocument(result, schemaVersionSchema)
  }
  return runnable.length
}
```

- [ ] **Step 4: Run.** `cd apps/server && pnpm vitest run` — Expected: PASS, including the unchanged brain and clips adapter tests.

- [ ] **Step 5: Format, gate the package, commit.**

```bash
(cd apps/server && pnpm exec prettier --write . && pnpm check:ci)
git add -A apps/server/src/engines apps/server/src/cli/checks
git commit -m "feat(engines): page id placeholder and leading-argument lookup"
```

---
### Task 4: Brain engine readers and caches

**Files:**

- Create: `apps/server/src/adapters/brain/{brainGraphDocumentSchema,brainRelatedDocumentSchema,brainPageDocumentSchema,readBrainChecks,readBrainGraph,readBrainRelated,readBrainPage}.ts`
- Create: `apps/server/src/types/{BrainGraphDocument,BrainRelatedDocument,BrainPageDocument,BrainPageFound,BrainChecksDocuments,BrainReaders}.ts`
- Create: `apps/server/src/scheduler/createKeyedTtlCache.ts`, `apps/server/src/cli/buildBrainReaders.ts`
- Modify: `apps/server/src/adapters/brain/createBrainAdapter.ts`
- Test: `apps/server/src/adapters/brain/readBrainDocuments.test.ts`, `apps/server/src/scheduler/createKeyedTtlCache.test.ts`, `apps/server/src/cli/buildBrainReaders.test.ts`

**Interfaces:**

- Consumes: `EngineRunner`, `parseEngineDocument`, `brainLintSchema`, `doctorDocumentSchema`, `createFailedEngineRunner`, `createTtlCache<T>(ttlMs, now)` (1b Task 4).
- Produces:
  - Engine document types: `BrainGraphDocument` (`{ schemaVersion: 1; nodes: { id: string; type: string; degree: number }[]; edges: { source: string; target: string }[]; orphans: string[]; dangling: { page: string; target: string }[] }`), `BrainRelatedDocument` (`{ schemaVersion: 1; total: number; pairs: { left: string; right: string; score: number }[] }`), `BrainPageDocument` (the page document or `{ schemaVersion: 1; error: 'page_not_found' | 'invalid_page_id' }`), `BrainPageFound` (the page branch), `BrainChecksDocuments = { lint; doctor }`.
  - `readBrainChecks(run, signal): Promise<BrainChecksDocuments>` (`lint --json`, then `doctor --json`, which the table completes, D3); `readBrainGraph(run, signal)` (`graph --json --no-html`); `readBrainRelated(run, signal)` (`graph --json --related`); `readBrainPage(run, id, signal)` (`page --json --id <id>`).
  - `createKeyedTtlCache<T>(ttlMs: number, now: () => number, maxKeys: number): (key: string, load: () => Promise<T>) => Promise<T>`
  - `type BrainReaders = { graph(signal): Promise<BrainGraphDocument>; related(signal): Promise<BrainRelatedDocument>; page(id, signal): Promise<BrainPageDocument>; checks(signal): Promise<BrainChecksDocuments> }`
  - `buildBrainReaders(run: EngineRunner | undefined, configured: boolean, cadenceMs: number, now?: () => number): BrainReaders | null`

- [ ] **Step 1: Write the failing tests.**

`apps/server/src/adapters/brain/readBrainDocuments.test.ts`:

```ts
import type { EngineRunner } from '../../types/EngineRunner'
import { readBrainChecks } from './readBrainChecks'
import { readBrainGraph } from './readBrainGraph'
import { readBrainPage } from './readBrainPage'
import { readBrainRelated } from './readBrainRelated'

const docs: Record<string, { code: number; doc: unknown }> = {
  'lint --json': {
    code: 0,
    doc: { schemaVersion: 1, pageCount: 2, indexStale: false, issues: [] },
  },
  'doctor --json': { code: 0, doc: { schemaVersion: 1, ok: true, checks: [] } },
  'graph --json --no-html': {
    code: 0,
    doc: {
      schemaVersion: 1,
      nodes: [{ id: 'notes/a', type: 'topic', degree: 0 }],
      edges: [],
      orphans: ['notes/a'],
      dangling: [],
    },
  },
  'graph --json --related': {
    code: 0,
    doc: { schemaVersion: 1, total: 0, pairs: [] },
  },
  'page --json --id notes/a': {
    code: 0,
    doc: {
      schemaVersion: 1,
      id: 'notes/a',
      frontmatter: { title: 'A' },
      body: 'Body',
      truncated: false,
      links: { outbound: [], inbound: [] },
    },
  },
  'page --json --id notes/none': {
    code: 1,
    doc: { schemaVersion: 1, error: 'page_not_found' },
  },
}
const seen: string[] = []
const run: EngineRunner = async (args) => {
  const key = args.join(' ')
  seen.push(key)
  const entry = docs[key]
  return await Promise.resolve(
    entry === undefined
      ? { code: 64, stdout: '' }
      : { code: entry.code, stdout: JSON.stringify(entry.doc) },
  )
}
const signal = new AbortController().signal

describe('brain readers', () => {
  it('reads lint then doctor', async () => {
    const checks = await readBrainChecks(run, signal)
    expect(checks.lint.pageCount).toBe(2)
    expect(checks.doctor.ok).toBe(true)
    expect(seen.slice(-2)).toEqual(['lint --json', 'doctor --json'])
  })
  it('reads the graph and related documents', async () => {
    expect((await readBrainGraph(run, signal)).orphans).toEqual(['notes/a'])
    expect((await readBrainRelated(run, signal)).total).toBe(0)
  })
  it('reads a page, and an error document whatever the exit code', async () => {
    const page = await readBrainPage(run, 'notes/a', signal)
    expect('body' in page && page.body).toBe('Body')
    expect(await readBrainPage(run, 'notes/none', signal)).toEqual({
      schemaVersion: 1,
      error: 'page_not_found',
    })
  })
})
```

`apps/server/src/scheduler/createKeyedTtlCache.test.ts`:

```ts
import { createKeyedTtlCache } from './createKeyedTtlCache'

describe('createKeyedTtlCache', () => {
  it('caches per key for its ttl and shares a load in flight', async () => {
    let clock = 0
    const cache = createKeyedTtlCache<string>(1000, () => clock, 2)
    const load = vi.fn(async (value: string) => Promise.resolve(value))
    await Promise.all([cache('a', async () => load('A')), cache('a', async () => load('A'))])
    expect(load).toHaveBeenCalledTimes(1)
    expect(await cache('b', async () => load('B'))).toBe('B')
    clock = 999
    expect(await cache('a', async () => load('A2'))).toBe('A')
    clock = 1000
    expect(await cache('a', async () => load('A3'))).toBe('A3')
  })
  it('evicts the oldest key past its limit and never caches a failure', async () => {
    const cache = createKeyedTtlCache<number>(60_000, () => 0, 2)
    await cache('a', async () => Promise.resolve(1))
    await cache('b', async () => Promise.resolve(2))
    await cache('c', async () => Promise.resolve(3))
    expect(await cache('a', async () => Promise.resolve(10))).toBe(10)
    await expect(
      cache('d', async () => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom')
    expect(await cache('d', async () => Promise.resolve(4))).toBe(4)
  })
})
```

`apps/server/src/cli/buildBrainReaders.test.ts`:

```ts
import type { EngineRunner } from '../types/EngineRunner'
import { buildBrainReaders } from './buildBrainReaders'

const signal = new AbortController().signal
const graph = {
  schemaVersion: 1,
  nodes: [],
  edges: [],
  orphans: [],
  dangling: [],
}

describe('buildBrainReaders', () => {
  it('is null when brain is not configured', () => {
    expect(buildBrainReaders(undefined, false, 60_000)).toBeNull()
  })
  it('reads not_found when configured but unresolved', async () => {
    const readers = buildBrainReaders(undefined, true, 60_000)
    await expect(readers?.graph(signal)).rejects.toMatchObject({
      reason: 'not_found',
    })
  })
  it('serves the graph from cache within the cadence', async () => {
    const run = vi.fn<EngineRunner>(async () =>
      Promise.resolve({ code: 0, stdout: JSON.stringify(graph) }),
    )
    const readers = buildBrainReaders(run, true, 60_000, () => 0)
    await readers?.graph(signal)
    await readers?.graph(signal)
    expect(run).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/server && pnpm vitest run src/adapters/brain src/scheduler/createKeyedTtlCache.test.ts src/cli/buildBrainReaders.test.ts` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the documents.**

`apps/server/src/adapters/brain/brainGraphDocumentSchema.ts`:

```ts
import { z } from 'zod'

// `brain graph --json --no-html` (brain bf94e87): writes nothing, no titles.
export const brainGraphDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      degree: z.number().int().nonnegative(),
    }),
  ),
  edges: z.array(z.object({ source: z.string(), target: z.string() })),
  orphans: z.array(z.string()),
  dangling: z.array(z.object({ page: z.string(), target: z.string() })),
})
```

`apps/server/src/adapters/brain/brainRelatedDocumentSchema.ts`:

```ts
import { z } from 'zod'

// `brain graph --json --related --limit N`: the top N pairs, best first.
export const brainRelatedDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  total: z.number().int().nonnegative(),
  pairs: z.array(
    z.object({ left: z.string(), right: z.string(), score: z.number() }),
  ),
})
```

`apps/server/src/adapters/brain/brainPageDocumentSchema.ts`:

```ts
import { z } from 'zod'

// `brain page --json --id <id>`: the page (exit 0) or a fixed error (exit 1).
export const brainPageDocumentSchema = z.union([
  z.object({
    schemaVersion: z.literal(1),
    error: z.enum(['page_not_found', 'invalid_page_id']),
  }),
  z.object({
    schemaVersion: z.literal(1),
    id: z.string(),
    frontmatter: z.record(z.string(), z.unknown()),
    body: z.string(),
    truncated: z.boolean(),
    links: z.object({
      outbound: z.array(z.object({ target: z.string(), exists: z.boolean() })),
      inbound: z.array(z.string()),
    }),
  }),
])
```

Types, each one line over its schema:

```ts
// apps/server/src/types/BrainGraphDocument.ts
import type { z } from 'zod'

import type { brainGraphDocumentSchema } from '../adapters/brain/brainGraphDocumentSchema'

export type BrainGraphDocument = z.infer<typeof brainGraphDocumentSchema>
```

```ts
// apps/server/src/types/BrainRelatedDocument.ts
import type { z } from 'zod'

import type { brainRelatedDocumentSchema } from '../adapters/brain/brainRelatedDocumentSchema'

export type BrainRelatedDocument = z.infer<typeof brainRelatedDocumentSchema>
```

```ts
// apps/server/src/types/BrainPageDocument.ts
import type { z } from 'zod'

import type { brainPageDocumentSchema } from '../adapters/brain/brainPageDocumentSchema'

export type BrainPageDocument = z.infer<typeof brainPageDocumentSchema>
```

```ts
// apps/server/src/types/BrainPageFound.ts
import type { BrainPageDocument } from './BrainPageDocument'

export type BrainPageFound = Extract<BrainPageDocument, { body: string }>
```

```ts
// apps/server/src/types/BrainChecksDocuments.ts
import type { z } from 'zod'

import type { brainLintSchema } from '../adapters/brain/brainLintSchema'
import type { doctorDocumentSchema } from '../engines/doctorDocumentSchema'

export type BrainChecksDocuments = {
  readonly lint: z.infer<typeof brainLintSchema>
  readonly doctor: z.infer<typeof doctorDocumentSchema>
}
```

```ts
// apps/server/src/types/BrainReaders.ts
import type { BrainChecksDocuments } from './BrainChecksDocuments'
import type { BrainGraphDocument } from './BrainGraphDocument'
import type { BrainPageDocument } from './BrainPageDocument'
import type { BrainRelatedDocument } from './BrainRelatedDocument'

export type BrainReaders = {
  readonly graph: (signal: AbortSignal) => Promise<BrainGraphDocument>
  readonly related: (signal: AbortSignal) => Promise<BrainRelatedDocument>
  readonly page: (id: string, signal: AbortSignal) => Promise<BrainPageDocument>
  readonly checks: (signal: AbortSignal) => Promise<BrainChecksDocuments>
}
```

- [ ] **Step 4: Implement the readers.**

`apps/server/src/adapters/brain/readBrainChecks.ts`:

```ts
import { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { BrainChecksDocuments } from '../../types/BrainChecksDocuments'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainLintSchema } from './brainLintSchema'

// Shared by the adapter and the checks route. `doctor --json` names the
// table's doctor entry, which may carry `--skip` arguments (spec 5.3).
export const readBrainChecks = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<BrainChecksDocuments> => {
  const lint = parseEngineDocument(
    await run(['lint', '--json'], signal),
    brainLintSchema,
  )
  const doctor = parseEngineDocument(
    await run(['doctor', '--json'], signal),
    doctorDocumentSchema,
  )
  return { lint, doctor }
}
```

`apps/server/src/adapters/brain/readBrainGraph.ts`:

```ts
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { BrainGraphDocument } from '../../types/BrainGraphDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainGraphDocumentSchema } from './brainGraphDocumentSchema'

export const readBrainGraph = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<BrainGraphDocument> =>
  parseEngineDocument(
    await run(['graph', '--json', '--no-html'], signal),
    brainGraphDocumentSchema,
  )
```

`apps/server/src/adapters/brain/readBrainRelated.ts`:

```ts
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { BrainRelatedDocument } from '../../types/BrainRelatedDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainRelatedDocumentSchema } from './brainRelatedDocumentSchema'

// The table fixes `--limit`; orbit never chooses it (D6).
export const readBrainRelated = async (
  run: EngineRunner,
  signal: AbortSignal,
): Promise<BrainRelatedDocument> =>
  parseEngineDocument(
    await run(['graph', '--json', '--related'], signal),
    brainRelatedDocumentSchema,
  )
```

`apps/server/src/adapters/brain/readBrainPage.ts`:

```ts
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { BrainPageDocument } from '../../types/BrainPageDocument'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainPageDocumentSchema } from './brainPageDocumentSchema'

// The id is one argument, checked by the runner against the page id pattern.
export const readBrainPage = async (
  run: EngineRunner,
  id: string,
  signal: AbortSignal,
): Promise<BrainPageDocument> =>
  parseEngineDocument(
    await run(['page', '--json', '--id', id], signal),
    brainPageDocumentSchema,
  )
```

In `apps/server/src/adapters/brain/createBrainAdapter.ts`, replace the two `parseEngineDocument` calls with `const { lint, doctor } = await readBrainChecks(deps.run, signal)` and drop the imports this leaves unused (`doctorDocumentSchema`, `parseEngineDocument`, `brainLintSchema`). Its existing tests must pass unchanged.

- [ ] **Step 5: Implement the cache and the readers' wiring.**

`apps/server/src/scheduler/createKeyedTtlCache.ts`:

```ts
// Per-key detail cache (spec 5.4): each key is held for the adapter's
// cadence, the oldest key is evicted past `maxKeys`, calls in flight for one
// key share a load, and a failure is never cached.
export const createKeyedTtlCache = <T>(
  ttlMs: number,
  now: () => number,
  maxKeys: number,
): ((key: string, load: () => Promise<T>) => Promise<T>) => {
  const held = new Map<string, { readonly value: T; readonly at: number }>()
  const flights = new Map<string, Promise<T>>()
  return async (key, load) => {
    const entry = held.get(key)
    if (entry !== undefined && now() - entry.at < ttlMs) return entry.value
    const pending = flights.get(key)
    if (pending !== undefined) return pending
    const flight = load()
      .then((value) => {
        held.delete(key)
        held.set(key, { value, at: now() })
        const oldest = held.keys().next()
        if (held.size > maxKeys && oldest.done !== true) held.delete(oldest.value)
        return value
      })
      .finally(() => {
        flights.delete(key)
      })
    flights.set(key, flight)
    return flight
  }
}
```

`apps/server/src/cli/buildBrainReaders.ts`:

```ts
import { readBrainChecks } from '../adapters/brain/readBrainChecks'
import { readBrainGraph } from '../adapters/brain/readBrainGraph'
import { readBrainPage } from '../adapters/brain/readBrainPage'
import { readBrainRelated } from '../adapters/brain/readBrainRelated'
import { createFailedEngineRunner } from '../adapters/createFailedEngineRunner'
import { createKeyedTtlCache } from '../scheduler/createKeyedTtlCache'
import { createTtlCache } from '../scheduler/createTtlCache'
import type { BrainChecksDocuments } from '../types/BrainChecksDocuments'
import type { BrainGraphDocument } from '../types/BrainGraphDocument'
import type { BrainPageDocument } from '../types/BrainPageDocument'
import type { BrainReaders } from '../types/BrainReaders'
import type { BrainRelatedDocument } from '../types/BrainRelatedDocument'
import type { EngineRunner } from '../types/EngineRunner'

// The brain detail reads (spec 7.5), each cached for the brain cadence; pages
// per id, at most 16. Configured but unresolved reads fail not_found.
export const buildBrainReaders = (
  run: EngineRunner | undefined,
  configured: boolean,
  cadenceMs: number,
  now: () => number = Date.now,
): BrainReaders | null => {
  if (!configured) return null
  const runner = run ?? createFailedEngineRunner
  const graph = createTtlCache<BrainGraphDocument>(cadenceMs, now)
  const related = createTtlCache<BrainRelatedDocument>(cadenceMs, now)
  const checks = createTtlCache<BrainChecksDocuments>(cadenceMs, now)
  const pages = createKeyedTtlCache<BrainPageDocument>(cadenceMs, now, 16)
  return {
    graph: async (signal) => graph(async () => readBrainGraph(runner, signal)),
    related: async (signal) =>
      related(async () => readBrainRelated(runner, signal)),
    checks: async (signal) =>
      checks(async () => readBrainChecks(runner, signal)),
    page: async (id, signal) =>
      pages(id, async () => readBrainPage(runner, id, signal)),
  }
}
```

- [ ] **Step 6: Run.** `cd apps/server && pnpm vitest run` — Expected: PASS.

- [ ] **Step 7: Format, gate the package, commit.**

```bash
(cd apps/server && pnpm exec prettier --write . && pnpm check:ci)
git add apps/server/src
git commit -m "feat(brain): engine readers for graph, related, page and checks"
```

---
### Task 5: Graph, related and checks routes

**Files:**

- Create: `apps/server/src/brainView/{isPageId,toBrainGraph,toBrainRelated,toBrainChecks}.ts`
- Create: `apps/server/src/types/BrainDetailView.ts`, `apps/server/src/http/routes/{getBrainDetail,registerBrainRoutes}.ts`
- Modify: `apps/server/src/types/AppDeps.ts`, `apps/server/src/http/createApp.ts`, `apps/server/src/test/buildTestApp.ts`, `apps/server/src/cli/buildHandler.ts`
- Test: `apps/server/src/http/routes/brainRoutes.test.ts`

**Interfaces:**

- Consumes: `BrainReaders`, `buildBrainReaders` (Task 4); `BrainGraph`, `BrainRelated`, `BrainChecks`, `pageIdSchema` (Task 2); `identifierOrNull`, `isIdentifier` (`apps/server/src/workerView/`); `toCheckRows(doctor)` (1b Task 5, `apps/server/src/clipsView/toCheckRows.ts`: the doctor document's checks whose name and code are identifiers); `memoryPool` and the `engines` parameter of `buildHandler` (1b Tasks 4, 5).
- Produces:
  - `isPageId(value: string): boolean`
  - `toBrainGraph(doc: BrainGraphDocument, now: number): BrainGraph`, `toBrainRelated(doc: BrainRelatedDocument, now: number): BrainRelated`, `toBrainChecks(docs: BrainChecksDocuments, now: number): BrainChecks`
  - `type BrainDetailView = BrainGraph | BrainRelated | BrainChecks`
  - `getBrainDetail<T, V extends BrainDetailView>(read, toView, pool, now, timeoutMs): Handler`
  - `registerBrainRoutes(api: Hono<OrbitEnv>, brain: BrainReaders | null, pool: DetailPool, now: () => number): void` — Task 6 adds the page route inside it.
  - `AppDeps.brain: BrainReaders | null`; routes `GET /api/brain/graph`, `/api/brain/related`, `/api/brain/checks`.

- [ ] **Step 1: Write the failing test.** `apps/server/src/http/routes/brainRoutes.test.ts`:

```ts
import {
  brainChecksSchema,
  brainGraphSchema,
  brainRelatedSchema,
} from '@orbit/contract'

import { ProcessError } from '../../process/ProcessError'
import { buildTestApp } from '../../test/buildTestApp'
import type { BrainReaders } from '../../types/BrainReaders'

const graphDoc = {
  schemaVersion: 1 as const,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1 },
    { id: 'notes/b', type: 'bad type', degree: 2 },
    { id: '../escape', type: 'topic', degree: 1 },
  ],
  edges: [
    { source: 'notes/b', target: 'notes/a' },
    { source: 'notes/b', target: '../escape' },
  ],
  orphans: ['notes/b'],
  dangling: [{ page: 'notes/a', target: 'notes/gone' }],
}
const readers = (over: Partial<BrainReaders> = {}): { brain: BrainReaders } => ({
  brain: {
    graph: async () => Promise.resolve(graphDoc),
    related: async () =>
      Promise.resolve({
        schemaVersion: 1 as const,
        total: 2,
        pairs: [
          { left: 'notes/a', right: 'notes/b', score: 2.5 },
          { left: 'notes/a', right: 'bad id', score: 1 },
        ],
      }),
    page: async () => Promise.reject(new Error('unused')),
    checks: async () =>
      Promise.resolve({
        lint: {
          schemaVersion: 1 as const,
          pageCount: 2,
          indexStale: true,
          issues: [
            { page: 'notes/a', code: 'dangling_link' },
            { page: 'notes/a', code: 'free text' },
          ],
        },
        doctor: {
          schemaVersion: 1 as const,
          ok: false,
          checks: [{ name: 'paths', ok: false, code: 'paths_missing' }],
        },
      }),
    ...over,
  },
})

describe('brain detail routes', () => {
  it('answers the graph with index edges, orphan flags and skipped ids', async () => {
    const res = await buildTestApp(readers()).get('/api/brain/graph')
    expect(res.status).toBe(200)
    const graph = brainGraphSchema.parse(await res.json())
    expect(graph.nodes).toEqual([
      { id: 'notes/a', type: 'topic', degree: 1, orphan: false },
      { id: 'notes/b', type: null, degree: 2, orphan: true },
    ])
    expect(graph.edges).toEqual([[1, 0]])
    expect([graph.dangling, graph.skipped, graph.now]).toEqual([
      1,
      1,
      1_790_000_000_000,
    ])
  })
  it('answers related pairs of valid ids only', async () => {
    const res = await buildTestApp(readers()).get('/api/brain/related')
    const related = brainRelatedSchema.parse(await res.json())
    expect(related.pairs).toEqual([
      { left: 'notes/a', right: 'notes/b', score: 2.5 },
    ])
    expect(related.total).toBe(2)
  })
  it('answers checks with identifier codes only', async () => {
    const res = await buildTestApp(readers()).get('/api/brain/checks')
    const checks = brainChecksSchema.parse(await res.json())
    expect(checks.issues).toEqual([{ page: 'notes/a', code: 'dangling_link' }])
    expect(checks.indexStale).toBe(true)
    expect(checks.doctor.checks).toEqual([
      { name: 'paths', ok: false, code: 'paths_missing' },
    ])
  })
  it('answers a fixed 503 when brain is absent or failing', async () => {
    const off = await buildTestApp().get('/api/brain/graph')
    expect(off.status).toBe(503)
    const failing = await buildTestApp(
      readers({
        graph: async () => Promise.reject(new ProcessError('exit_nonzero')),
      }),
    ).get('/api/brain/graph')
    expect(failing.status).toBe(503)
    expect(await failing.json()).toEqual({ error: 'unavailable' })
  })
})
```

- [ ] **Step 2: Run to see it fail.** `cd apps/server && pnpm vitest run src/http/routes/brainRoutes.test.ts` — Expected: FAIL (type error on `brain`, then 404s).

- [ ] **Step 3: Implement the views.**

`apps/server/src/brainView/isPageId.ts`:

```ts
import { pageIdSchema } from '@orbit/contract'

export const isPageId = (value: string): boolean =>
  pageIdSchema.safeParse(value).success
```

`apps/server/src/brainView/toBrainGraph.ts`:

```ts
import type { BrainGraph } from '@orbit/contract'

import type { BrainGraphDocument } from '../types/BrainGraphDocument'
import { identifierOrNull } from '../workerView/identifierOrNull'
import { isPageId } from './isPageId'

// D4: nodes whose ids fail the pattern are left out with their edges and
// counted; edges become index pairs; dangling links are a count only.
export const toBrainGraph = (
  doc: BrainGraphDocument,
  now: number,
): BrainGraph => {
  const kept = doc.nodes.filter((node) => isPageId(node.id))
  const index = new Map(kept.map((node, position) => [node.id, position]))
  const orphans = new Set(doc.orphans)
  const edges = doc.edges.flatMap(({ source, target }) => {
    const from = index.get(source)
    const to = index.get(target)
    return from === undefined || to === undefined
      ? []
      : [[from, to] as [number, number]]
  })
  return {
    now,
    nodes: kept.map((node) => ({
      id: node.id,
      type: identifierOrNull(node.type),
      degree: node.degree,
      orphan: orphans.has(node.id),
    })),
    edges,
    dangling: doc.dangling.length,
    skipped: doc.nodes.length - kept.length,
  }
}
```

`apps/server/src/brainView/toBrainRelated.ts`:

```ts
import type { BrainRelated } from '@orbit/contract'

import type { BrainRelatedDocument } from '../types/BrainRelatedDocument'
import { isPageId } from './isPageId'

export const toBrainRelated = (
  doc: BrainRelatedDocument,
  now: number,
): BrainRelated => ({
  now,
  total: doc.total,
  pairs: doc.pairs
    .filter(
      (pair) => isPageId(pair.left) && isPageId(pair.right) && pair.score >= 0,
    )
    .map(({ left, right, score }) => ({ left, right, score })),
})
```

`apps/server/src/brainView/toBrainChecks.ts`:

```ts
import type { BrainChecks } from '@orbit/contract'

import { toCheckRows } from '../clipsView/toCheckRows'
import type { BrainChecksDocuments } from '../types/BrainChecksDocuments'
import { isIdentifier } from '../workerView/isIdentifier'
import { isPageId } from './isPageId'

// Issue codes and check names are identifiers; a row that fails is dropped.
export const toBrainChecks = (
  { lint, doctor }: BrainChecksDocuments,
  now: number,
): BrainChecks => ({
  now,
  pageCount: lint.pageCount,
  indexStale: lint.indexStale,
  issues: lint.issues
    .filter((issue) => isPageId(issue.page) && isIdentifier(issue.code))
    .slice(0, 500)
    .map(({ page, code }) => ({ page, code })),
  doctor: { ok: doctor.ok, checks: toCheckRows(doctor) },
})
```

- [ ] **Step 4: Implement the routes and wiring.**

`apps/server/src/types/BrainDetailView.ts`:

```ts
import type { BrainChecks, BrainGraph, BrainRelated } from '@orbit/contract'

export type BrainDetailView = BrainGraph | BrainRelated | BrainChecks
```

`apps/server/src/http/routes/getBrainDetail.ts`:

```ts
import type { Handler } from 'hono'

import type { BrainDetailView } from '../../types/BrainDetailView'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'

// One brain read under the detail pool; fixed JSON on any failure, so engine
// output never reaches a response (spec 8).
export const getBrainDetail =
  <T, V extends BrainDetailView>(
    read: ((signal: AbortSignal) => Promise<T>) | null,
    toView: (doc: T, now: number) => V,
    pool: DetailPool,
    now: () => number,
    timeoutMs: number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const doc = await pool.run(read, timeoutMs).catch(() => null)
    return doc === null
      ? c.json({ error: 'unavailable' }, 503)
      : c.json(toView(doc, now()))
  }
```

`apps/server/src/http/routes/registerBrainRoutes.ts`:

```ts
import type { Hono } from 'hono'

import { toBrainChecks } from '../../brainView/toBrainChecks'
import { toBrainGraph } from '../../brainView/toBrainGraph'
import { toBrainRelated } from '../../brainView/toBrainRelated'
import type { BrainReaders } from '../../types/BrainReaders'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { getBrainDetail } from './getBrainDetail'

// Spec 7.5: the graph and related pairs (one command, 10 s each) and the
// checks (lint then doctor, 15 s), all under the memory detail pool.
export const registerBrainRoutes = (
  api: Hono<OrbitEnv>,
  brain: BrainReaders | null,
  pool: DetailPool,
  now: () => number,
): void => {
  api.get(
    '/brain/graph',
    getBrainDetail(brain?.graph ?? null, toBrainGraph, pool, now, 10_000),
  )
  api.get(
    '/brain/related',
    getBrainDetail(brain?.related ?? null, toBrainRelated, pool, now, 10_000),
  )
  api.get(
    '/brain/checks',
    getBrainDetail(brain?.checks ?? null, toBrainChecks, pool, now, 15_000),
  )
}
```

`AppDeps.ts`: add `readonly brain: BrainReaders | null` (import the type). `buildTestApp.ts`: add `brain: null,` to the defaults before `...overrides`. `createApp.ts`: after the memory routes 1b added, before `api.all('*', ...)`:

```ts
  registerBrainRoutes(api, deps.brain, memoryPool, deps.now)
```

`buildHandler.ts`: in the `createApp` call (beside 1b's `clips:`):

```ts
    brain: buildBrainReaders(
      engines['brain'],
      config.engines.brain !== undefined,
      config.cadenceMs.brain ?? 60_000,
    ),
```

- [ ] **Step 5: Run.** `cd apps/server && pnpm vitest run` — Expected: PASS.

- [ ] **Step 6: Format, gate the package, commit.**

```bash
(cd apps/server && pnpm exec prettier --write . && pnpm check:ci)
git add apps/server/src
git commit -m "feat(brain): graph, related and checks detail routes"
```

---

### Task 6: Page route

**Files:**

- Create: `apps/server/src/brainView/{textOrNull,toSources,toBrainPage}.ts`, `apps/server/src/http/routes/getBrainPage.ts`
- Modify: `apps/server/src/http/routes/registerBrainRoutes.ts`
- Test: `apps/server/src/http/routes/brainPage.test.ts`

**Interfaces:**

- Consumes: `BrainReaders.page`, `BrainPageFound` (Task 4), `isPageId` (Task 5), `pageIdSchema`, `BrainPage` (Task 2), `identifierOrNull`.
- Produces:
  - `textOrNull(value: unknown, max: number): string | null`, `toSources(value: unknown): string[]`
  - `toBrainPage(id: string, doc: BrainPageFound): BrainPage`
  - `getBrainPage(read: BrainReaders['page'] | null, pool: DetailPool): Handler` — `GET /api/brain/page?id=<id>`: 400 for an id outside the pattern or the engine's `invalid_page_id`, 404 for `page_not_found`, 503 otherwise failing.

- [ ] **Step 1: Write the failing test.** `apps/server/src/http/routes/brainPage.test.ts`:

```ts
import { brainPageSchema } from '@orbit/contract'

import { buildTestApp } from '../../test/buildTestApp'
import type { BrainPageDocument } from '../../types/BrainPageDocument'
import type { BrainReaders } from '../../types/BrainReaders'

const found: BrainPageDocument = {
  schemaVersion: 1,
  id: 'notes/a',
  frontmatter: {
    title: 'A page',
    type: 'topic',
    updated: '2026-10-01',
    summary: 7,
    sources: ['https://example.com/x', 3],
    token: 'never forwarded',
  },
  body: '# A\n\nSee [[notes/b]].',
  truncated: false,
  links: {
    outbound: [
      { target: 'notes/b', exists: true },
      { target: 'bad target', exists: false },
    ],
    inbound: ['notes/c', '../x'],
  },
}
const asked: string[] = []
const app = (page: BrainReaders['page']) =>
  buildTestApp({
    brain: {
      graph: async () => Promise.reject(new Error('unused')),
      related: async () => Promise.reject(new Error('unused')),
      checks: async () => Promise.reject(new Error('unused')),
      page,
    },
  })
const reading = (doc: BrainPageDocument): BrainReaders['page'] =>
  async (id) => {
    asked.push(id)
    return await Promise.resolve(doc)
  }

describe('GET /api/brain/page', () => {
  it('answers the fixed frontmatter fields, body and valid links', async () => {
    const res = await app(reading(found)).get('/api/brain/page?id=notes/a')
    expect(res.status).toBe(200)
    const body: unknown = await res.json()
    const page = brainPageSchema.parse(body)
    expect(page).toEqual({
      id: 'notes/a',
      title: 'A page',
      type: 'topic',
      updated: '2026-10-01',
      summary: null,
      sources: ['https://example.com/x'],
      body: '# A\n\nSee [[notes/b]].',
      truncated: false,
      outbound: [{ target: 'notes/b', exists: true }],
      inbound: ['notes/c'],
    })
    expect(JSON.stringify(body)).not.toContain('never forwarded')
  })
  it('refuses an id outside the pattern before running anything', async () => {
    asked.length = 0
    for (const id of ['', '..%2Fx', 'notes%2F.env', 'notes%2F-rf']) {
      const res = await app(reading(found)).get(`/api/brain/page?id=${id}`)
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'bad_request' })
    }
    expect(asked).toEqual([])
  })
  it('maps engine errors to 404, 400 and a fixed 503', async () => {
    const missing = await app(
      reading({ schemaVersion: 1, error: 'page_not_found' }),
    ).get('/api/brain/page?id=notes/none')
    expect([missing.status, await missing.json()]).toEqual([
      404,
      { error: 'not_found' },
    ])
    const invalid = await app(
      reading({ schemaVersion: 1, error: 'invalid_page_id' }),
    ).get('/api/brain/page?id=other/a')
    expect(invalid.status).toBe(400)
    const failing = await app(async () =>
      Promise.reject(new Error('boom')),
    ).get('/api/brain/page?id=notes/a')
    expect([failing.status, await failing.json()]).toEqual([
      503,
      { error: 'unavailable' },
    ])
  })
})
```

- [ ] **Step 2: Run to see it fail.** `cd apps/server && pnpm vitest run src/http/routes/brainPage.test.ts` — Expected: FAIL with 404 `not_found` from the catch-all route.

- [ ] **Step 3: Implement.**

`apps/server/src/brainView/textOrNull.ts`:

```ts
// A frontmatter value shown as text: strings only, cut to `max` characters.
export const textOrNull = (value: unknown, max: number): string | null =>
  typeof value === 'string' ? value.slice(0, max) : null
```

`apps/server/src/brainView/toSources.ts`:

```ts
// The `sources` frontmatter list: strings only, at most 200 of 1024 characters.
export const toSources = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .slice(0, 200)
        .map((item) => item.slice(0, 1024))
    : []
```

`apps/server/src/brainView/toBrainPage.ts`:

```ts
import type { BrainPage } from '@orbit/contract'

import type { BrainPageFound } from '../types/BrainPageFound'
import { identifierOrNull } from '../workerView/identifierOrNull'
import { isPageId } from './isPageId'
import { textOrNull } from './textOrNull'
import { toSources } from './toSources'

// D1: the fixed frontmatter fields only; links outside the page id pattern
// are dropped so every link the screen draws can be requested in turn.
export const toBrainPage = (id: string, doc: BrainPageFound): BrainPage => {
  const front = doc.frontmatter
  return {
    id,
    title: textOrNull(front['title'], 512),
    type: identifierOrNull(textOrNull(front['type'], 128)),
    updated: textOrNull(front['updated'], 64),
    summary: textOrNull(front['summary'], 2048),
    sources: toSources(front['sources']),
    body: doc.body,
    truncated: doc.truncated,
    outbound: doc.links.outbound
      .filter((link) => isPageId(link.target))
      .map(({ target, exists }) => ({ target, exists })),
    inbound: doc.links.inbound.filter((other) => isPageId(other)),
  }
}
```

`apps/server/src/http/routes/getBrainPage.ts`:

```ts
import { pageIdSchema } from '@orbit/contract'
import type { Handler } from 'hono'

import { toBrainPage } from '../../brainView/toBrainPage'
import type { BrainReaders } from '../../types/BrainReaders'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'

// An id outside the pattern never reaches the engine (spec 7.5). Content is
// in the 200 response only; every failure is fixed JSON.
export const getBrainPage =
  (read: BrainReaders['page'] | null, pool: DetailPool): Handler<OrbitEnv, string> =>
  async (c) => {
    const id = pageIdSchema.safeParse(c.req.query('id'))
    if (!id.success) return c.json({ error: 'bad_request' }, 400)
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const doc = await pool
      .run(async (signal) => read(id.data, signal), 10_000)
      .catch(() => null)
    if (doc === null) return c.json({ error: 'unavailable' }, 503)
    if ('error' in doc)
      return doc.error === 'page_not_found'
        ? c.json({ error: 'not_found' }, 404)
        : c.json({ error: 'bad_request' }, 400)
    return c.json(toBrainPage(id.data, doc))
  }
```

In `registerBrainRoutes.ts`, import `getBrainPage` and add as the last route:

```ts
  api.get('/brain/page', getBrainPage(brain?.page ?? null, pool))
```

and extend the comment's first line to `// Spec 7.5: the graph and related pairs (one command, 10 s each), a page (10 s)`.

- [ ] **Step 4: Run.** `cd apps/server && pnpm vitest run` — Expected: PASS.

- [ ] **Step 5: Format, gate the package, commit.**

```bash
(cd apps/server && pnpm exec prettier --write . && pnpm check:ci)
git add apps/server/src
git commit -m "feat(brain): page detail route with fixed fields and id checks"
```

---
### Task 7: Graph model, colours, sizes and neighbourhoods

**Files:**

- Modify: `apps/web/package.json`, `pnpm-lock.yaml` (graph libraries)
- Create: `apps/web/src/types/{GraphModel,GraphPalette,NodeColorInput,NodeStyleOptions,GraphNodeAttributes,GraphEdgeAttributes,LayoutResult,ColorMode}.ts`
- Create: `apps/web/src/selectors/{buildGraphModel,neighbourhood,visibleNodes,toNodeAttributes}.ts`, `apps/web/src/charts/{untypedType,rankSlots,typeSlots,communitySlots,nodeSize,nodeColor}.ts`, `apps/web/src/graph/toGraph.ts`
- Test: `apps/web/src/selectors/graphModel.test.ts`, `apps/web/src/charts/graphStyle.test.ts`, `apps/web/src/graph/toGraph.test.ts`

**Interfaces:**

- Consumes: `BrainGraph` (Task 2).
- Produces:
  - `type GraphModel = { ids; types; degree; orphan; edges; neighbours; typeNames; indexOf }` (index-aligned; `types[i]` is the node's type or `UNTYPED`; `typeNames` sorted by name; `indexOf: ReadonlyMap<string, number>`)
  - `type LayoutResult = { x: readonly number[]; y: readonly number[]; community: readonly number[] }`
  - `type GraphPalette = { scheme: 'light' | 'dark'; series: readonly string[]; warn: string; accent: string; line: string; ink: string }`
  - `type ColorMode = 'type' | 'community'`; `type NodeStyleOptions = { colorBy: ColorMode; highlightOrphans: boolean; selected: number | null; visible: readonly boolean[] }`
  - `type GraphNodeAttributes = { label: string; x: number; y: number; size: number; color: string; hidden: boolean }`; `type GraphEdgeAttributes = { color: string; size: number; hidden: boolean }`
  - `UNTYPED = '(untyped)'`; `buildGraphModel(graph: BrainGraph): GraphModel`; `neighbourhood(neighbours, start, depth): ReadonlySet<number>`; `visibleNodes(model, hidden: readonly string[], focus: number | null, depth: number): readonly boolean[]`
  - `rankSlots<K>(keys: readonly K[], compare: (a: K, b: K) => number): ReadonlyMap<K, number>`; `typeSlots(types: readonly string[]): ReadonlyMap<string, number>`; `communitySlots(community: readonly number[]): readonly number[]`; `nodeSize(degree: number): number`; `nodeColor(input: NodeColorInput, palette: GraphPalette): string`
  - `toNodeAttributes(model, layout, options, palette): GraphNodeAttributes[]`; `toGraph(model, attributes, palette): Graph<GraphNodeAttributes, GraphEdgeAttributes>`

- [ ] **Step 1: Add the graph libraries** (the versions the bundle probe measured):

```bash
cd apps/web
pnpm add sigma@3.0.3 graphology@0.26.0 graphology-layout-forceatlas2@0.10.1 graphology-communities-louvain@2.0.2 @react-sigma/core@5.0.6
pnpm add -D graphology-types@0.24.8
pnpm audit:check
```

Expected: installed; no new advisory at moderate or above.

- [ ] **Step 2: Write the failing tests.**

`apps/web/src/selectors/graphModel.test.ts`:

```ts
import type { BrainGraph } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { UNTYPED } from '../charts/untypedType'
import { buildGraphModel } from './buildGraphModel'
import { neighbourhood } from './neighbourhood'
import { visibleNodes } from './visibleNodes'

// a - b - c - d, and e alone; b links back to a.
const graph: BrainGraph = {
  now: 0,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1, orphan: false },
    { id: 'notes/b', type: 'topic', degree: 2, orphan: false },
    { id: 'notes/c', type: 'project', degree: 2, orphan: false },
    { id: 'notes/d', type: null, degree: 1, orphan: false },
    { id: 'notes/e', type: 'project', degree: 0, orphan: true },
  ],
  edges: [
    [0, 1],
    [1, 0],
    [1, 2],
    [2, 3],
    [3, 3],
  ],
  dangling: 0,
  skipped: 0,
}

describe('buildGraphModel', () => {
  it('builds index-aligned arrays with undirected neighbours', () => {
    const model = buildGraphModel(graph)
    expect(model.types).toEqual(['topic', 'topic', 'project', UNTYPED, 'project'])
    expect(model.neighbours).toEqual([[1], [0, 2], [1, 3], [2], []])
    expect(model.typeNames).toEqual([UNTYPED, 'project', 'topic'])
    expect(model.indexOf.get('notes/c')).toBe(2)
  })
})

describe('neighbourhood', () => {
  it('walks up to depth steps in either direction', () => {
    const { neighbours } = buildGraphModel(graph)
    expect([...neighbourhood(neighbours, 0, 1)].toSorted((a, b) => a - b)).toEqual([0, 1])
    expect([...neighbourhood(neighbours, 0, 3)].toSorted((a, b) => a - b)).toEqual([0, 1, 2, 3])
    expect([...neighbourhood(neighbours, 4, 3)]).toEqual([4])
  })
})

describe('visibleNodes', () => {
  const model = buildGraphModel(graph)
  it('hides filtered types but never the focus', () => {
    expect(visibleNodes(model, ['topic'], 0, 0)).toEqual([
      true,
      false,
      true,
      true,
      true,
    ])
  })
  it('limits a local view to the neighbourhood of the focus', () => {
    expect(visibleNodes(model, [], 1, 1)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ])
    expect(visibleNodes(model, [], null, 2)).toEqual([true, true, true, true, true])
  })
})
```

`apps/web/src/charts/graphStyle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import type { GraphPalette } from '../types/GraphPalette'
import { communitySlots } from './communitySlots'
import { nodeColor } from './nodeColor'
import { nodeSize } from './nodeSize'
import { typeSlots } from './typeSlots'

const palette: GraphPalette = {
  scheme: 'dark',
  series: ['#s1', '#s2', '#s3', '#s4', '#s5', '#s6'],
  warn: '#warn',
  accent: '#accent',
  line: '#line',
  ink: '#ink',
}

describe('typeSlots', () => {
  it('ranks types by page count, ties by name, and folds the rest into 6', () => {
    const types = ['t', 't', 't', 'p', 'p', 'b', 'a', 'c', 'd', 'e']
    expect([...typeSlots(types)]).toEqual([
      ['t', 1],
      ['p', 2],
      ['a', 3],
      ['b', 4],
      ['c', 5],
      ['d', 6],
      ['e', 6],
    ])
  })
})

describe('communitySlots', () => {
  it('ranks communities by size and maps each node to its slot', () => {
    expect(communitySlots([7, 7, 3, 3, 3, 9])).toEqual([2, 2, 1, 1, 1, 3])
  })
})

describe('nodeSize', () => {
  it('grows with the square root of degree and caps at 16', () => {
    expect(nodeSize(0)).toBe(2)
    expect(nodeSize(4)).toBe(5)
    expect(nodeSize(10_000)).toBe(16)
  })
})

describe('nodeColor', () => {
  const base = { slot: 2, orphan: false, selected: false, highlightOrphans: true }
  it('uses selection, then the orphan highlight, then the series slot', () => {
    expect(nodeColor({ ...base, selected: true, orphan: true }, palette)).toBe(
      '#accent',
    )
    expect(nodeColor({ ...base, orphan: true }, palette)).toBe('#warn')
    expect(
      nodeColor({ ...base, orphan: true, highlightOrphans: false }, palette),
    ).toBe('#s2')
    expect(nodeColor({ ...base, slot: 9 }, palette)).toBe('#s6')
  })
})
```

`apps/web/src/graph/toGraph.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { buildGraphModel } from '../selectors/buildGraphModel'
import { toNodeAttributes } from '../selectors/toNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'
import { toGraph } from './toGraph'

const palette: GraphPalette = {
  scheme: 'dark',
  series: ['#s1', '#s2', '#s3', '#s4', '#s5', '#s6'],
  warn: '#warn',
  accent: '#accent',
  line: '#line',
  ink: '#ink',
}
const model = buildGraphModel({
  now: 0,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1, orphan: true },
    { id: 'notes/b', type: 'project', degree: 1, orphan: false },
  ],
  edges: [
    [1, 0],
    [0, 1],
  ],
  dangling: 0,
  skipped: 0,
})
const layout = { x: [1, 2], y: [3, 4], community: [5, 5] }

describe('toNodeAttributes', () => {
  it('places, sizes and colours nodes by type or community', () => {
    const byType = toNodeAttributes(
      model,
      layout,
      { colorBy: 'type', highlightOrphans: false, selected: null, visible: [true, false] },
      palette,
    )
    expect(byType).toEqual([
      { label: 'notes/a', x: 1, y: 3, size: 3.5, color: '#s2', hidden: false },
      { label: 'notes/b', x: 2, y: 4, size: 3.5, color: '#s1', hidden: true },
    ])
    const byCommunity = toNodeAttributes(
      model,
      layout,
      { colorBy: 'community', highlightOrphans: true, selected: 1, visible: [true, true] },
      palette,
    )
    expect(byCommunity.map((node) => node.color)).toEqual(['#warn', '#accent'])
  })
})

describe('toGraph', () => {
  it('merges both directions into one undirected edge, hidden with a hidden end', () => {
    const attributes = toNodeAttributes(
      model,
      layout,
      { colorBy: 'type', highlightOrphans: false, selected: null, visible: [true, false] },
      palette,
    )
    const graph = toGraph(model, attributes, palette)
    expect([graph.order, graph.size]).toEqual([2, 1])
    expect(graph.getEdgeAttributes(graph.edges()[0] ?? '')).toEqual({
      color: '#line',
      size: 1,
      hidden: true,
    })
    expect(graph.getNodeAttribute('notes/a', 'x')).toBe(1)
  })
})
```

(`typeSlots` ranks `'project'` and `'topic'` by count 1 each, ties by name, so `project` takes slot 1 and `topic` slot 2.)

- [ ] **Step 3: Run to see them fail.** `cd apps/web && pnpm vitest run src/selectors/graphModel.test.ts src/charts/graphStyle.test.ts src/graph/toGraph.test.ts` — Expected: FAIL, modules not found.

- [ ] **Step 4: Implement the types.**

```ts
// apps/web/src/types/GraphModel.ts
// Index-aligned arrays over the graph route's nodes (spec 7.5).
export type GraphModel = {
  readonly ids: readonly string[]
  readonly types: readonly string[]
  readonly degree: readonly number[]
  readonly orphan: readonly boolean[]
  readonly edges: readonly (readonly [number, number])[]
  readonly neighbours: readonly (readonly number[])[]
  readonly typeNames: readonly string[]
  readonly indexOf: ReadonlyMap<string, number>
}
```

```ts
// apps/web/src/types/LayoutResult.ts
export type LayoutResult = {
  readonly x: readonly number[]
  readonly y: readonly number[]
  readonly community: readonly number[]
}
```

```ts
// apps/web/src/types/GraphPalette.ts
// Resolved colour values: WebGL cannot read CSS variables.
export type GraphPalette = {
  readonly scheme: 'light' | 'dark'
  readonly series: readonly string[]
  readonly warn: string
  readonly accent: string
  readonly line: string
  readonly ink: string
}
```

```ts
// apps/web/src/types/ColorMode.ts
export type ColorMode = 'type' | 'community'
```

```ts
// apps/web/src/types/NodeStyleOptions.ts
import type { ColorMode } from './ColorMode'

export type NodeStyleOptions = {
  readonly colorBy: ColorMode
  readonly highlightOrphans: boolean
  readonly selected: number | null
  readonly visible: readonly boolean[]
}
```

```ts
// apps/web/src/types/NodeColorInput.ts
export type NodeColorInput = {
  readonly slot: number
  readonly orphan: boolean
  readonly selected: boolean
  readonly highlightOrphans: boolean
}
```

```ts
// apps/web/src/types/GraphNodeAttributes.ts
export type GraphNodeAttributes = {
  readonly label: string
  readonly x: number
  readonly y: number
  readonly size: number
  readonly color: string
  readonly hidden: boolean
}
```

```ts
// apps/web/src/types/GraphEdgeAttributes.ts
export type GraphEdgeAttributes = {
  readonly color: string
  readonly size: number
  readonly hidden: boolean
}
```

- [ ] **Step 5: Implement the model and style modules.**

`apps/web/src/charts/untypedType.ts`:

```ts
// Stands in for a null type; parentheses never occur in an identifier, so it
// cannot collide with a real type name.
export const UNTYPED = '(untyped)'
```

`apps/web/src/selectors/buildGraphModel.ts`:

```ts
import type { BrainGraph } from '@orbit/contract'

import { UNTYPED } from '../charts/untypedType'
import type { GraphModel } from '../types/GraphModel'

// Neighbours ignore link direction and self-links (D10).
export const buildGraphModel = (graph: BrainGraph): GraphModel => {
  const ids = graph.nodes.map((node) => node.id)
  const types = graph.nodes.map((node) => node.type ?? UNTYPED)
  const neighbours = ids.map(() => new Set<number>())
  for (const [source, target] of graph.edges) {
    if (source !== target) {
      neighbours[source]?.add(target)
      neighbours[target]?.add(source)
    }
  }
  return {
    ids,
    types,
    degree: graph.nodes.map((node) => node.degree),
    orphan: graph.nodes.map((node) => node.orphan),
    edges: graph.edges,
    neighbours: neighbours.map((set) => [...set].toSorted((a, b) => a - b)),
    typeNames: [...new Set(types)].toSorted((a, b) => a.localeCompare(b)),
    indexOf: new Map(ids.map((id, index) => [id, index])),
  }
}
```

`apps/web/src/selectors/neighbourhood.ts`:

```ts
// Breadth-first from `start`, up to `depth` steps, the start included.
export const neighbourhood = (
  neighbours: readonly (readonly number[])[],
  start: number,
  depth: number,
): ReadonlySet<number> => {
  const seen = new Set([start])
  let frontier = [start]
  for (let step = 0; step < depth; step += 1) {
    frontier = frontier.flatMap((node) =>
      (neighbours[node] ?? []).filter((next) => !seen.has(next)),
    )
    for (const node of frontier) seen.add(node)
  }
  return seen
}
```

`apps/web/src/selectors/visibleNodes.ts`:

```ts
import type { GraphModel } from '../types/GraphModel'
import { neighbourhood } from './neighbourhood'

// D10: type filters apply in both views; a local view needs a focus; the
// focus itself is always visible.
export const visibleNodes = (
  model: GraphModel,
  hidden: readonly string[],
  focus: number | null,
  depth: number,
): readonly boolean[] => {
  const hiddenTypes = new Set(hidden)
  const local =
    focus === null || depth === 0
      ? null
      : neighbourhood(model.neighbours, focus, depth)
  return model.types.map(
    (type, index) =>
      index === focus ||
      ((local === null || local.has(index)) && !hiddenTypes.has(type)),
  )
}
```

`apps/web/src/charts/rankSlots.ts`:

```ts
// D7: keys ranked by how often they occur (ties by `compare`) take series
// slots 1-5; every later key shares slot 6.
export const rankSlots = <K>(
  keys: readonly K[],
  compare: (a: K, b: K) => number,
): ReadonlyMap<K, number> => {
  const counts = new Map<K, number>()
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1)
  const ranked = [...counts].toSorted(
    ([a, countA], [b, countB]) => countB - countA || compare(a, b),
  )
  return new Map(ranked.map(([key], index) => [key, Math.min(index + 1, 6)]))
}
```

`apps/web/src/charts/typeSlots.ts`:

```ts
import { rankSlots } from './rankSlots'

export const typeSlots = (
  types: readonly string[],
): ReadonlyMap<string, number> =>
  rankSlots(types, (a, b) => a.localeCompare(b))
```

`apps/web/src/charts/communitySlots.ts`:

```ts
import { rankSlots } from './rankSlots'

// Communities have no names, so their size rank is their only stable order.
export const communitySlots = (
  community: readonly number[],
): readonly number[] => {
  const slots = rankSlots(community, (a, b) => a - b)
  return community.map((id) => slots.get(id) ?? 6)
}
```

`apps/web/src/charts/nodeSize.ts`:

```ts
// D8: area grows with degree, capped so hubs never hide their neighbours.
export const nodeSize = (degree: number): number =>
  Math.min(16, 2 + 1.5 * Math.sqrt(degree))
```

`apps/web/src/charts/nodeColor.ts`:

```ts
import type { GraphPalette } from '../types/GraphPalette'
import type { NodeColorInput } from '../types/NodeColorInput'

// Selection wins, then the orphan highlight (a state: the warn colour, always
// named in the legend), then the node's series slot.
export const nodeColor = (
  input: NodeColorInput,
  palette: GraphPalette,
): string => {
  if (input.selected) return palette.accent
  if (input.orphan && input.highlightOrphans) return palette.warn
  return palette.series[input.slot - 1] ?? palette.series[5] ?? palette.line
}
```

`apps/web/src/selectors/toNodeAttributes.ts`:

```ts
import { communitySlots } from '../charts/communitySlots'
import { nodeColor } from '../charts/nodeColor'
import { nodeSize } from '../charts/nodeSize'
import { typeSlots } from '../charts/typeSlots'
import type { GraphModel } from '../types/GraphModel'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'
import type { LayoutResult } from '../types/LayoutResult'
import type { NodeStyleOptions } from '../types/NodeStyleOptions'

export const toNodeAttributes = (
  model: GraphModel,
  layout: LayoutResult,
  options: NodeStyleOptions,
  palette: GraphPalette,
): GraphNodeAttributes[] => {
  const byType = typeSlots(model.types)
  const byCommunity = communitySlots(layout.community)
  return model.ids.map((id, index) => ({
    label: id,
    x: layout.x[index] ?? 0,
    y: layout.y[index] ?? 0,
    size: nodeSize(model.degree[index] ?? 0),
    color: nodeColor(
      {
        slot:
          options.colorBy === 'type'
            ? (byType.get(model.types[index] ?? '') ?? 6)
            : (byCommunity[index] ?? 6),
        orphan: model.orphan[index] === true,
        selected: options.selected === index,
        highlightOrphans: options.highlightOrphans,
      },
      palette,
    ),
    hidden: options.visible[index] !== true,
  }))
}
```

`apps/web/src/graph/toGraph.ts`:

```ts
import Graph from 'graphology'

import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphModel } from '../types/GraphModel'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'

// The graph sigma draws: undirected, so a link in each direction is one edge;
// an edge is hidden when either end is.
export const toGraph = (
  model: GraphModel,
  attributes: readonly GraphNodeAttributes[],
  palette: GraphPalette,
): Graph<GraphNodeAttributes, GraphEdgeAttributes> => {
  const graph = new Graph<GraphNodeAttributes, GraphEdgeAttributes>({
    type: 'undirected',
  })
  model.ids.forEach((id, index) => {
    const node = attributes[index]
    if (node !== undefined) graph.addNode(id, node)
  })
  for (const [source, target] of model.edges) {
    const from = model.ids[source]
    const to = model.ids[target]
    if (from !== undefined && to !== undefined && from !== to)
      graph.mergeEdge(from, to, {
        color: palette.line,
        size: 1,
        hidden:
          attributes[source]?.hidden !== false ||
          attributes[target]?.hidden !== false,
      })
  }
  return graph
}
```

- [ ] **Step 6: Run.** `cd apps/web && pnpm vitest run src/selectors/graphModel.test.ts src/charts/graphStyle.test.ts src/graph/toGraph.test.ts` — Expected: PASS.

- [ ] **Step 7: Format, gate the package, commit.** (`knip` reports the new modules as unused until Task 9 imports them; run only lint, types and tests here.)

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm lint && pnpm type-check && pnpm vitest run)
git add apps/web/package.json apps/web/src pnpm-lock.yaml
git commit -m "feat(web): brain graph model, colours, sizes and neighbourhoods"
```

---
### Task 8: Layout and communities in a module worker

**Files:**

- Create: `apps/web/src/types/{LayoutRequest,LayoutState,HeldLayout}.ts`
- Create: `apps/web/src/layout/{seededRandom,computeLayout,layoutWorker,createLayoutWorker,requestLayout}.ts`, `apps/web/src/schemas/layoutResultSchema.ts`, `apps/web/src/hooks/useGraphLayout.ts`
- Create: `apps/web/src/test/{SyncLayoutWorker,fakeLayoutWorkerModule}.ts`
- Modify: `apps/web/vite.config.ts` (`worker.format`), `apps/web/vitest.config.ts` (coverage exclude), `apps/web/knip.config.ts` (worker entry), `apps/web/eslint.config.ts` (only if Step 7 requires it)
- Test: `apps/web/src/layout/computeLayout.test.ts`, `apps/web/src/layout/requestLayout.test.ts`, `apps/web/src/hooks/useGraphLayout.test.tsx`

**Interfaces:**

- Consumes: `GraphModel`, `LayoutResult` (Task 7).
- Produces:
  - `type LayoutRequest = { order: number; edges: readonly (readonly [number, number])[]; seed: number }`; `type LayoutState = { layout: LayoutResult | null; failed: boolean }`
  - `seededRandom(seed: number): () => number`; `computeLayout(request: LayoutRequest): LayoutResult`
  - `createLayoutWorker(): Worker` (module worker, same origin); `requestLayout(createWorker: () => Worker, request: LayoutRequest): Promise<LayoutResult>` (validates the answer, terminates the worker)
  - `useGraphLayout(model: GraphModel | null): LayoutState`
  - Test helpers: `SyncLayoutWorker` (answers on a microtask with `computeLayout`), `fakeLayoutWorkerModule` (`{ createLayoutWorker }` for `vi.mock`).

- [ ] **Step 1: Write the failing tests.**

`apps/web/src/layout/computeLayout.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { computeLayout } from './computeLayout'
import { seededRandom } from './seededRandom'

// Two triangles joined by one edge: 0-1-2 and 3-4-5, with 2-3.
const edges: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 0],
  [3, 4],
  [4, 5],
  [5, 3],
  [2, 3],
]

describe('seededRandom', () => {
  it('repeats for a seed and stays in [0, 1)', () => {
    const a = seededRandom(7)
    const b = seededRandom(7)
    const values = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(values)
    for (const value of values) expect(value >= 0 && value < 1).toBe(true)
  })
})

describe('computeLayout', () => {
  it('lays out the same graph the same way, with finite positions', () => {
    const first = computeLayout({ order: 6, edges, seed: 1 })
    expect(computeLayout({ order: 6, edges, seed: 1 })).toEqual(first)
    expect(first.x).toHaveLength(6)
    expect([...first.x, ...first.y].every(Number.isFinite)).toBe(true)
  })
  it('finds the two triangles as two communities', () => {
    const { community } = computeLayout({ order: 6, edges, seed: 1 })
    expect(community[0]).toBe(community[1])
    expect(community[3]).toBe(community[4])
    expect(community[0]).not.toBe(community[3])
  })
  it('gives each node of an edgeless graph its own community', () => {
    expect(computeLayout({ order: 3, edges: [], seed: 1 }).community).toEqual([
      0, 1, 2,
    ])
    expect(computeLayout({ order: 0, edges: [], seed: 1 })).toEqual({
      x: [],
      y: [],
      community: [],
    })
  })
})
```

`apps/web/src/layout/requestLayout.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { requestLayout } from './requestLayout'

// A worker that answers with whatever `reply` returns, or fails.
const fakeWorker = (reply: (request: unknown) => unknown, fail = false) => {
  const listeners = new Map<string, (event: { data?: unknown }) => void>()
  const worker = {
    terminated: false,
    addEventListener: (type: string, listener: (event: { data?: unknown }) => void) => {
      listeners.set(type, listener)
    },
    postMessage: (request: unknown) => {
      queueMicrotask(() => {
        if (fail) listeners.get('error')?.({})
        else listeners.get('message')?.({ data: reply(request) })
      })
    },
    terminate: () => {
      worker.terminated = true
    },
  }
  return worker
}
const request = { order: 2, edges: [], seed: 1 }

describe('requestLayout', () => {
  it('posts the request, validates the answer and terminates the worker', async () => {
    const worker = fakeWorker(() => ({ x: [0, 1], y: [1, 0], community: [0, 1] }))
    const layout = await requestLayout(() => worker as unknown as Worker, request)
    expect(layout).toEqual({ x: [0, 1], y: [1, 0], community: [0, 1] })
    expect(worker.terminated).toBe(true)
  })
  it('rejects a malformed or short answer and a worker error', async () => {
    const short = fakeWorker(() => ({ x: [0], y: [0], community: [0] }))
    await expect(
      requestLayout(() => short as unknown as Worker, request),
    ).rejects.toThrow('layout_invalid')
    const broken = fakeWorker(() => null, true)
    await expect(
      requestLayout(() => broken as unknown as Worker, request),
    ).rejects.toThrow('layout_failed')
    expect(broken.terminated).toBe(true)
  })
})
```

`apps/web/src/hooks/useGraphLayout.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { buildGraphModel } from '../selectors/buildGraphModel'
import { useGraphLayout } from './useGraphLayout'

vi.mock('../layout/createLayoutWorker', async () => {
  const { fakeLayoutWorkerModule } = await import('../test/fakeLayoutWorkerModule')
  return fakeLayoutWorkerModule
})

const model = buildGraphModel({
  now: 0,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1, orphan: false },
    { id: 'notes/b', type: 'topic', degree: 1, orphan: false },
  ],
  edges: [[0, 1]],
  dangling: 0,
  skipped: 0,
})

describe('useGraphLayout', () => {
  it('waits for a model, then answers its layout', async () => {
    const { result, rerender } = renderHook(
      ({ current }) => useGraphLayout(current),
      { initialProps: { current: null as typeof model | null } },
    )
    expect(result.current).toEqual({ layout: null, failed: false })
    rerender({ current: model })
    await waitFor(() => {
      expect(result.current.layout?.x).toHaveLength(2)
    })
    expect(result.current.failed).toBe(false)
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/web && pnpm vitest run src/layout src/hooks/useGraphLayout.test.tsx` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the layout.**

```ts
// apps/web/src/types/LayoutRequest.ts
// Indices only: the worker never needs page ids.
export type LayoutRequest = {
  readonly order: number
  readonly edges: readonly (readonly [number, number])[]
  readonly seed: number
}
```

```ts
// apps/web/src/types/LayoutState.ts
import type { LayoutResult } from './LayoutResult'

export type LayoutState = {
  readonly layout: LayoutResult | null
  readonly failed: boolean
}
```

```ts
// apps/web/src/types/HeldLayout.ts
import type { GraphModel } from './GraphModel'
import type { LayoutState } from './LayoutState'

// A layout answer kept with the model it was computed for.
export type HeldLayout = {
  readonly model: GraphModel
  readonly state: LayoutState
}
```

`apps/web/src/layout/seededRandom.ts`:

```ts
// Park-Miller: deterministic and free of bitwise operators, so a layout and
// its communities repeat exactly for the same graph (D9).
export const seededRandom = (seed: number): (() => number) => {
  let state = (Math.abs(Math.trunc(seed)) % 2_147_483_646) + 1
  return () => {
    state = (state * 16_807) % 2_147_483_647
    return (state - 1) / 2_147_483_646
  }
}
```

`apps/web/src/layout/computeLayout.ts`:

```ts
import Graph from 'graphology'
import louvain from 'graphology-communities-louvain'
import forceAtlas2 from 'graphology-layout-forceatlas2'

import type { LayoutRequest } from '../types/LayoutRequest'
import type { LayoutResult } from '../types/LayoutResult'
import { seededRandom } from './seededRandom'

// Runs inside the layout worker (D9). Nodes start on a circle in index order
// and Louvain draws from a seeded generator, so a graph always lays out the
// same way. An edgeless graph has one community per node.
export const computeLayout = (request: LayoutRequest): LayoutResult => {
  const { order } = request
  if (order === 0) return { x: [], y: [], community: [] }
  const graph = new Graph<{ x: number; y: number }>({ type: 'undirected' })
  for (let index = 0; index < order; index += 1) {
    const angle = (2 * Math.PI * index) / order
    graph.addNode(String(index), {
      x: 100 * Math.cos(angle),
      y: 100 * Math.sin(angle),
    })
  }
  for (const [source, target] of request.edges)
    if (source !== target && Math.max(source, target) < order)
      graph.mergeEdge(String(source), String(target))
  forceAtlas2.assign(graph, {
    iterations: 300,
    settings: {
      ...forceAtlas2.inferSettings(graph),
      barnesHutOptimize: order > 1000,
    },
  })
  const communities: Readonly<Record<string, number>> =
    graph.size === 0 ? {} : louvain(graph, { rng: seededRandom(request.seed) })
  const keys = graph.nodes()
  return {
    x: keys.map((key) => graph.getNodeAttribute(key, 'x')),
    y: keys.map((key) => graph.getNodeAttribute(key, 'y')),
    community: keys.map((key, index) => communities[key] ?? index),
  }
}
```

(`graph.nodes()` returns keys in insertion order, which is index order.)

`apps/web/src/layout/layoutWorker.ts` (the worker entry point):

```ts
import type { LayoutRequest } from '../types/LayoutRequest'
import { computeLayout } from './computeLayout'

self.addEventListener('message', (event: MessageEvent<LayoutRequest>) => {
  self.postMessage(computeLayout(event.data), {})
})
```

(The DOM lib types `self.postMessage` as the window's; the `(message, options)` overload type-checks and is the worker's own signature too.)

`apps/web/src/layout/createLayoutWorker.ts`:

```ts
// A module worker from orbit's own origin: the forceatlas2 package's bundled
// worker starts from a blob: URL, which the CSP (default-src 'self') refuses.
export const createLayoutWorker = (): Worker =>
  new Worker(new URL('./layoutWorker.ts', import.meta.url), { type: 'module' })
```

`apps/web/src/schemas/layoutResultSchema.ts`:

```ts
import { z } from 'zod'

// zod 4 numbers refuse NaN and Infinity, so a diverged layout fails here.
export const layoutResultSchema = z.object({
  x: z.array(z.number()),
  y: z.array(z.number()),
  community: z.array(z.number().int()),
})
```

`apps/web/src/layout/requestLayout.ts`:

```ts
import { layoutResultSchema } from '../schemas/layoutResultSchema'
import type { LayoutRequest } from '../types/LayoutRequest'
import type { LayoutResult } from '../types/LayoutResult'

// One request per worker: the answer is validated against the request's
// order, and the worker is terminated whatever happens.
export const requestLayout = async (
  createWorker: () => Worker,
  request: LayoutRequest,
): Promise<LayoutResult> =>
  new Promise((resolve, reject) => {
    const worker = createWorker()
    worker.addEventListener('message', (event: MessageEvent<unknown>) => {
      worker.terminate()
      const parsed = layoutResultSchema.safeParse(event.data)
      const fits =
        parsed.success &&
        [parsed.data.x, parsed.data.y, parsed.data.community].every(
          (values) => values.length === request.order,
        )
      if (fits) resolve(parsed.data)
      else reject(new Error('layout_invalid'))
    })
    worker.addEventListener('error', () => {
      worker.terminate()
      reject(new Error('layout_failed'))
    })
    worker.postMessage(request)
  })
```

`apps/web/src/hooks/useGraphLayout.ts`:

```ts
import { useEffect, useState } from 'react'

import { createLayoutWorker } from '../layout/createLayoutWorker'
import { requestLayout } from '../layout/requestLayout'
import type { GraphModel } from '../types/GraphModel'
import type { HeldLayout } from '../types/HeldLayout'
import type { LayoutState } from '../types/LayoutState'

// One layout per graph model; an answer for an older model is ignored.
export const useGraphLayout = (model: GraphModel | null): LayoutState => {
  const [held, setHeld] = useState<HeldLayout | null>(null)
  useEffect(() => {
    if (model === null) return undefined
    let live = true
    const run = async (): Promise<void> => {
      try {
        const layout = await requestLayout(createLayoutWorker, {
          order: model.ids.length,
          edges: model.edges,
          seed: 1,
        })
        if (live) setHeld({ model, state: { layout, failed: false } })
      } catch {
        if (live) setHeld({ model, state: { layout: null, failed: true } })
      }
    }
    void run()
    return () => {
      live = false
    }
  }, [model])
  return held !== null && held.model === model
    ? held.state
    : { layout: null, failed: false }
}
```

- [ ] **Step 4: Implement the test helpers.**

`apps/web/src/test/SyncLayoutWorker.ts`:

```ts
import { computeLayout } from '../layout/computeLayout'
import type { LayoutRequest } from '../types/LayoutRequest'

// Stands in for the module worker in jsdom: answers on a microtask with the
// real layout, so tests run computeLayout through the worker protocol.
export class SyncLayoutWorker {
  private readonly listeners = new Map<
    string,
    (event: { data: unknown }) => void
  >()

  addEventListener(
    type: string,
    listener: (event: { data: unknown }) => void,
  ): void {
    this.listeners.set(type, listener)
  }

  postMessage(request: LayoutRequest): void {
    queueMicrotask(() => {
      this.listeners.get('message')?.({ data: computeLayout(request) })
    })
  }

  terminate(): void {
    this.listeners.clear()
  }
}
```

`apps/web/src/test/fakeLayoutWorkerModule.ts`:

```ts
import { SyncLayoutWorker } from './SyncLayoutWorker'

// The `vi.mock` body for `layout/createLayoutWorker`.
export const fakeLayoutWorkerModule = {
  createLayoutWorker: (): Worker =>
    new SyncLayoutWorker() as unknown as Worker,
}
```

- [ ] **Step 5: Build configuration.** In `apps/web/vite.config.ts`, add beside `build`:

```ts
  // The layout worker imports graphology; ES output keeps it a module worker.
  worker: { format: 'es' },
```

In `apps/web/vitest.config.ts`, add `'src/layout/layoutWorker.ts'` to `coverage.exclude` (a worker entry point, like `src/main.tsx`; its body is `computeLayout`, tested directly). In `apps/web/knip.config.ts`, pass `entry: ['src/layout/layoutWorker.ts']` to `createKnipConfig` (knip does not follow `new URL(..., import.meta.url)`).

- [ ] **Step 6: Run.** `cd apps/web && pnpm vitest run src/layout src/hooks/useGraphLayout.test.tsx` — Expected: PASS.

- [ ] **Step 7: Lint the entry point.** `cd apps/web && pnpm lint`. If `code-policy/one-primary-unit` reports `src/layout/layoutWorker.ts` (an entry point exports nothing), add it to the existing entry-point block in `eslint.config.ts`, giving that block `files: ['src/main.tsx', 'src/main.ts', 'src/layout/layoutWorker.ts']` and the rule `'code-policy/one-primary-unit': 'off'` beside `'code-policy/atomic-file': 'off'`. That is the documented entry-point exception (spec 11), not a suppression. Re-run `pnpm lint` — Expected: no errors or warnings.

- [ ] **Step 8: Format and commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm type-check && pnpm vitest run)
git add apps/web
git commit -m "feat(web): graph layout and communities in a module worker"
```

---
### Task 9: Brain route, graph canvas, legend and page list

**Files:**

- Create: `apps/web/src/types/{GraphDepth,BrainSearch,BrainSearchPatch,BrainSearchModel,BrainView,TypeLegendEntry,GraphStageProps,GraphCanvasProps,GraphLoaderProps,GraphEventsProps,GraphFocusProps,GraphLegendProps,PageListProps,BrainBodyProps}.ts`
- Create: `apps/web/src/validators/{readGraphDepth,validateBrainSearch}.ts`, `apps/web/src/selectors/{withPage,selectNodeStyle,selectBrainGraph,selectTypeLegend}.ts`, `apps/web/src/graph/{hasWebGl,sigmaSettings,readGraphPalette}.ts`, `apps/web/src/hooks/{useBrainSearch,useGraphPalette,useBrainView}.ts`, `apps/web/src/formatters/formatGraphSummary.ts`, `apps/web/src/labels/brainLabels.ts`, `apps/web/src/charts/seriesSwatches.ts`, `apps/web/src/router/brainRoute.ts`
- Create: `apps/web/src/screens/brain/{BrainScreen,BrainBody,GraphStage,GraphCanvas,GraphLoader,GraphEvents,GraphFocus,GraphLegend,PageList}.tsx`
- Create: `apps/web/src/test/{fakeReactSigma.tsx,brainGraphFixture.ts,stubBrainFetch.ts}`
- Modify: `apps/web/src/router/routeTree.ts`, `apps/web/src/components/shell/navItems.ts`, `apps/web/src/types/NavItem.ts`, `apps/web/src/components/shell/TabBar.tsx`, `apps/web/src/styles.css`, `apps/web/.size-limit.json`
- Test: `apps/web/src/screens/brain/BrainScreen.test.tsx`, `apps/web/src/validators/validateBrainSearch.test.ts`, `apps/web/src/graph/graphBrowser.test.ts`

**Interfaces:**

- Consumes: everything in Tasks 7 and 8; `brainGraphSchema`, `pageIdSchema`, `BrainGraph` (Task 2); `apiJson`, `useMediaQuery`, `ConnectionIndicator`, `HistoryRange`; `renderAt(path)`.
- Produces:
  - `type GraphDepth = 0 | 1 | 2 | 3`; `type BrainSearch = { page?: string; depth: GraphDepth; color: ColorMode; orphans: boolean; hide: readonly string[]; range: HistoryRange }`; `type BrainSearchPatch = Partial<Omit<BrainSearch, 'page'>>`; `type BrainSearchModel = { search: BrainSearch; select(id: string | null): void; update(patch: BrainSearchPatch): void }`
  - `validateBrainSearch(search: Record<string, unknown>): BrainSearch`; `withPage(search, id: string | null): BrainSearch`
  - `type BrainView = { data: BrainGraph | null; model: GraphModel | null; graph: Graph<GraphNodeAttributes, GraphEdgeAttributes> | null; selected: number | null; palette: GraphPalette; communities: number; failed: boolean; layoutFailed: boolean }`
  - `useBrainSearch(): BrainSearchModel` (search memoised on the router's structurally shared search object); `useBrainView(search: BrainSearch): BrainView` (graph query `['brain', 'graph']`, `staleTime: Infinity`, `gcTime: 0`, no refetch on focus)
  - `BRAIN_LABELS` (every Brain string, including those Tasks 10-13 use)
  - `<BrainBody view brain />`, extended by Tasks 10-12; route `/brain` (lazy); nav item `Brain` after Atrium.
  - Test helpers: `fakeReactSigma` (the `vi.mock` body for `@react-sigma/core`, with `loaded`, `handlers`, `gotoNode` for assertions), `BRAIN_GRAPH` fixture (3 pages, 2 links, 1 orphan), `stubBrainFetch(routes)`.

- [ ] **Step 1: Write the failing tests.**

`apps/web/src/validators/validateBrainSearch.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { withPage } from '../selectors/withPage'
import { validateBrainSearch } from './validateBrainSearch'

describe('validateBrainSearch', () => {
  it('defaults every field', () => {
    expect(validateBrainSearch({})).toEqual({
      depth: 0,
      color: 'type',
      orphans: true,
      hide: [],
      range: '24h',
    })
  })
  it('keeps valid values and drops the rest', () => {
    expect(
      validateBrainSearch({
        page: 'notes/a',
        depth: 2,
        color: 'community',
        orphans: false,
        hide: ['topic', 3],
        range: '7d',
      }),
    ).toEqual({
      page: 'notes/a',
      depth: 2,
      color: 'community',
      orphans: false,
      hide: ['topic'],
      range: '7d',
    })
    expect(validateBrainSearch({ page: '../x', depth: 9 })).toEqual(
      validateBrainSearch({}),
    )
  })
  it('sets and clears the page', () => {
    const search = validateBrainSearch({ page: 'notes/a' })
    expect(withPage(search, 'notes/b').page).toBe('notes/b')
    expect('page' in withPage(search, null)).toBe(false)
  })
})
```

`apps/web/src/graph/graphBrowser.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'

import { hasWebGl } from './hasWebGl'
import { readGraphPalette } from './readGraphPalette'

describe('hasWebGl', () => {
  it('reports whether a WebGL context can be created', () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null)
    expect(hasWebGl()).toBe(false)
    getContext.mockReturnValueOnce({} as RenderingContext)
    expect(hasWebGl()).toBe(true)
  })
})

describe('readGraphPalette', () => {
  it('reads the theme tokens and falls back when one is missing', () => {
    document.documentElement.style.setProperty('--color-series-1', '#123456')
    const palette = readGraphPalette('light')
    expect(palette.scheme).toBe('light')
    expect(palette.series[0]).toBe('#123456')
    expect(palette.series).toHaveLength(6)
    expect(palette.warn).toBe('#fbbf24')
    document.documentElement.style.removeProperty('--color-series-1')
  })
})
```

`apps/web/src/screens/brain/BrainScreen.test.tsx`:

```tsx
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { hasWebGl } from '../../graph/hasWebGl'
import { BRAIN_GRAPH } from '../../test/brainGraphFixture'
import { fakeReactSigma } from '../../test/fakeReactSigma'
import { renderAt } from '../../test/renderAt'
import { stubBrainFetch } from '../../test/stubBrainFetch'

vi.mock('@react-sigma/core', async () => (await import('../../test/fakeReactSigma')).fakeReactSigma)
vi.mock('../../layout/createLayoutWorker', async () => (await import('../../test/fakeLayoutWorkerModule')).fakeLayoutWorkerModule)
vi.mock('../../graph/hasWebGl', () => ({ hasWebGl: vi.fn(() => true) }))

beforeEach(() => {
  fakeReactSigma.loaded.length = 0
  fakeReactSigma.gotoNode.mockClear()
  vi.mocked(hasWebGl).mockReturnValue(true)
})

describe('BrainScreen', () => {
  it('draws the laid-out graph and names it', async () => {
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    const { container } = await renderAt('/brain')
    expect(
      await screen.findByRole('img', {
        name: 'Brain graph: 3 pages, 2 links, 1 orphan',
      }),
    ).toBeInTheDocument()
    const graph = fakeReactSigma.loaded.at(-1) as { order: number; size: number }
    expect([graph.order, graph.size]).toEqual([3, 2])
    expect(screen.getByText('Orphan (no inbound links)')).toBeInTheDocument()
    const legend = screen.getByRole('region', { name: 'Legend' })
    expect(within(legend).getByText('topic')).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
  it('selects a page from the canvas and from the page list', async () => {
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    const { router } = await renderAt('/brain')
    await screen.findByRole('img', { name: /^Brain graph/ })
    fakeReactSigma.handlers['clickNode']?.({ node: 'notes/b' })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/b' })
    })
    await waitFor(() => {
      expect(fakeReactSigma.gotoNode).toHaveBeenCalledWith('notes/b', {
        duration: 300,
      })
    })
    fireEvent.click(screen.getByText('Show pages'))
    fireEvent.click(screen.getByRole('button', { name: 'notes/c' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/c' })
    })
  })
  it('keeps the page list without WebGL and says why', async () => {
    vi.mocked(hasWebGl).mockReturnValue(false)
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    await renderAt('/brain')
    expect(await screen.findByText(/no WebGL/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'notes/a' })).toBeInTheDocument()
  })
  it('says when the graph is unavailable', async () => {
    stubBrainFetch({ '/api/brain/graph': 503 })
    await renderAt('/brain')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The brain graph is unavailable',
    )
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/web && pnpm vitest run src/validators/validateBrainSearch.test.ts src/graph/graphBrowser.test.ts src/screens/brain` — Expected: FAIL, modules not found.

- [ ] **Step 3: Search state.**

```ts
// apps/web/src/types/GraphDepth.ts
// 0 is the whole graph; 1-3 are steps around the selected page (D10).
export type GraphDepth = 0 | 1 | 2 | 3
```

```ts
// apps/web/src/types/BrainSearch.ts
import type { ColorMode } from './ColorMode'
import type { GraphDepth } from './GraphDepth'
import type { HistoryRange } from './HistoryRange'

// D11: everything a Brain view needs to be linked again.
export type BrainSearch = {
  readonly page?: string
  readonly depth: GraphDepth
  readonly color: ColorMode
  readonly orphans: boolean
  readonly hide: readonly string[]
  readonly range: HistoryRange
}
```

```ts
// apps/web/src/types/BrainSearchPatch.ts
import type { BrainSearch } from './BrainSearch'

export type BrainSearchPatch = Partial<Omit<BrainSearch, 'page'>>
```

```ts
// apps/web/src/types/BrainSearchModel.ts
import type { BrainSearch } from './BrainSearch'
import type { BrainSearchPatch } from './BrainSearchPatch'

export type BrainSearchModel = {
  readonly search: BrainSearch
  readonly select: (id: string | null) => void
  readonly update: (patch: BrainSearchPatch) => void
}
```

`apps/web/src/validators/readGraphDepth.ts`:

```ts
import type { GraphDepth } from '../types/GraphDepth'

export const readGraphDepth = (value: unknown): GraphDepth =>
  value === 1 || value === 2 || value === 3 ? value : 0
```

`apps/web/src/validators/validateBrainSearch.ts`:

```ts
import { pageIdSchema } from '@orbit/contract'

import type { BrainSearch } from '../types/BrainSearch'
import { readGraphDepth } from './readGraphDepth'

// Invalid values fall back to defaults; a page id outside the pattern is
// dropped, so it never reaches the page route.
export const validateBrainSearch = (
  search: Record<string, unknown>,
): BrainSearch => {
  const page = pageIdSchema.safeParse(search['page'])
  const hide = search['hide']
  const range = search['range']
  return {
    ...(page.success ? { page: page.data } : {}),
    depth: readGraphDepth(search['depth']),
    color: search['color'] === 'community' ? 'community' : 'type',
    orphans: search['orphans'] !== false,
    hide: Array.isArray(hide)
      ? hide.filter((type): type is string => typeof type === 'string')
      : [],
    range: range === '7d' || range === '30d' ? range : '24h',
  }
}
```

`apps/web/src/selectors/withPage.ts`:

```ts
import type { BrainSearch } from '../types/BrainSearch'

export const withPage = (search: BrainSearch, id: string | null): BrainSearch => {
  const { depth, color, orphans, hide, range } = search
  return { depth, color, orphans, hide, range, ...(id === null ? {} : { page: id }) }
}
```

`apps/web/src/hooks/useBrainSearch.ts`:

```ts
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { withPage } from '../selectors/withPage'
import type { BrainSearch } from '../types/BrainSearch'
import type { BrainSearchModel } from '../types/BrainSearchModel'
import type { BrainSearchPatch } from '../types/BrainSearchPatch'
import { validateBrainSearch } from '../validators/validateBrainSearch'

// The router shares unchanged search objects structurally, so `search` keeps
// its identity until the URL changes and the graph is not rebuilt per render.
export const useBrainSearch = (): BrainSearchModel => {
  const raw = useSearch({ strict: false })
  const search = useMemo(() => validateBrainSearch(raw), [raw])
  const navigate = useNavigate()
  const go = useCallback(
    (next: BrainSearch) => {
      void navigate({ to: '/brain', search: next })
    },
    [navigate],
  )
  const select = useCallback(
    (id: string | null) => {
      go(withPage(search, id))
    },
    [go, search],
  )
  const update = useCallback(
    (patch: BrainSearchPatch) => {
      go({ ...search, ...patch })
    },
    [go, search],
  )
  return { search, select, update }
}
```

- [ ] **Step 4: Browser-facing graph pieces.**

`apps/web/src/graph/hasWebGl.ts`:

```ts
// D12: without WebGL the list, page view and panels still work.
export const hasWebGl = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) !== null
  } catch {
    return false
  }
}
```

`apps/web/src/graph/readGraphPalette.ts`:

```ts
import type { GraphPalette } from '../types/GraphPalette'

// WebGL needs colour values, so the theme tokens (spec 7.1) are read from the
// document; the fallbacks are the dark theme's values.
export const readGraphPalette = (scheme: 'light' | 'dark'): GraphPalette => {
  const style = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string): string =>
    style.getPropertyValue(name).trim() || fallback
  const series = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300']
  return {
    scheme,
    series: series.map((fallback, index) =>
      read(`--color-series-${String(index + 1)}`, fallback),
    ),
    warn: read('--color-warn', '#fbbf24'),
    accent: read('--color-accent', '#6ee7ff'),
    line: read('--color-line', '#1c2536'),
    ink: read('--color-ink', '#e6edf7'),
  }
}
```

`apps/web/src/hooks/useGraphPalette.ts`:

```ts
import { useMemo } from 'react'

import { readGraphPalette } from '../graph/readGraphPalette'
import type { GraphPalette } from '../types/GraphPalette'
import { useMediaQuery } from './useMediaQuery'

// Re-read when the colour scheme flips, so the canvas follows the theme.
export const useGraphPalette = (): GraphPalette => {
  const light = useMediaQuery('(prefers-color-scheme: light)')
  return useMemo(() => readGraphPalette(light ? 'light' : 'dark'), [light])
}
```

`apps/web/src/graph/sigmaSettings.ts`:

```ts
import type { Settings } from 'sigma/settings'

import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'

// Labels are page ids in the text token; edges are hairlines.
export const sigmaSettings = (
  palette: GraphPalette,
): Partial<Settings<GraphNodeAttributes, GraphEdgeAttributes>> => ({
  labelColor: { color: palette.ink },
  labelFont: 'Geist Sans, ui-sans-serif, sans-serif',
  labelSize: 12,
  labelRenderedSizeThreshold: 8,
  defaultEdgeColor: palette.line,
  renderEdgeLabels: false,
  zIndex: true,
})
```

`apps/web/src/selectors/selectNodeStyle.ts`:

```ts
import type { BrainSearch } from '../types/BrainSearch'
import type { GraphModel } from '../types/GraphModel'
import type { NodeStyleOptions } from '../types/NodeStyleOptions'
import { visibleNodes } from './visibleNodes'

export const selectNodeStyle = (
  model: GraphModel,
  search: BrainSearch,
  selected: number | null,
): NodeStyleOptions => ({
  colorBy: search.color,
  highlightOrphans: search.orphans,
  selected,
  visible: visibleNodes(model, search.hide, selected, search.depth),
})
```

`apps/web/src/selectors/selectBrainGraph.ts`:

```ts
import type Graph from 'graphology'

import { toGraph } from '../graph/toGraph'
import type { BrainSearch } from '../types/BrainSearch'
import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphModel } from '../types/GraphModel'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'
import type { LayoutResult } from '../types/LayoutResult'
import { selectNodeStyle } from './selectNodeStyle'
import { toNodeAttributes } from './toNodeAttributes'

export const selectBrainGraph = (
  model: GraphModel,
  layout: LayoutResult,
  search: BrainSearch,
  selected: number | null,
  palette: GraphPalette,
): Graph<GraphNodeAttributes, GraphEdgeAttributes> =>
  toGraph(
    model,
    toNodeAttributes(model, layout, selectNodeStyle(model, search, selected), palette),
    palette,
  )
```

```ts
// apps/web/src/types/BrainView.ts
import type { BrainGraph } from '@orbit/contract'
import type Graph from 'graphology'

import type { GraphEdgeAttributes } from './GraphEdgeAttributes'
import type { GraphModel } from './GraphModel'
import type { GraphNodeAttributes } from './GraphNodeAttributes'
import type { GraphPalette } from './GraphPalette'

export type BrainView = {
  readonly data: BrainGraph | null
  readonly model: GraphModel | null
  readonly graph: Graph<GraphNodeAttributes, GraphEdgeAttributes> | null
  readonly selected: number | null
  readonly palette: GraphPalette
  readonly communities: number
  readonly failed: boolean
  readonly layoutFailed: boolean
}
```

`apps/web/src/hooks/useBrainView.ts`:

```ts
import { brainGraphSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { apiJson } from '../api/apiJson'
import { buildGraphModel } from '../selectors/buildGraphModel'
import { selectBrainGraph } from '../selectors/selectBrainGraph'
import type { BrainSearch } from '../types/BrainSearch'
import type { BrainView } from '../types/BrainView'
import { useGraphLayout } from './useGraphLayout'
import { useGraphPalette } from './useGraphPalette'

// D5: fetched when the screen opens, never polled, dropped on unmount.
export const useBrainView = (search: BrainSearch): BrainView => {
  const query = useQuery({
    queryKey: ['brain', 'graph'],
    queryFn: async () => apiJson('/api/brain/graph', brainGraphSchema),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
  const data = query.data ?? null
  const model = useMemo(() => (data === null ? null : buildGraphModel(data)), [data])
  const { layout, failed: layoutFailed } = useGraphLayout(model)
  const palette = useGraphPalette()
  const page = search.page
  const selected =
    model === null || page === undefined ? null : (model.indexOf.get(page) ?? null)
  const graph = useMemo(
    () =>
      model === null || layout === null
        ? null
        : selectBrainGraph(model, layout, search, selected, palette),
    [model, layout, search, selected, palette],
  )
  return {
    data,
    model,
    graph,
    selected,
    palette,
    communities: layout === null ? 0 : new Set(layout.community).size,
    failed: query.isError && data === null,
    layoutFailed,
  }
}
```

- [ ] **Step 5: Labels, formatter and legend selector.**

`apps/web/src/labels/brainLabels.ts`:

```ts
// UI strings for the Brain screen (spec 7.5); no page content lives here.
export const BRAIN_LABELS = {
  title: 'Brain',
  loading: 'Loading the graph…',
  unavailable: 'The brain graph is unavailable. The Brain card on Orbit shows why.',
  graphRegion: 'Graph',
  layingOut: 'Laying out the graph…',
  noWebGl: 'This browser cannot draw the graph (no WebGL). Every page is in the list below.',
  layoutFailed: 'The graph layout failed. Every page is in the list below.',
  skipped: 'pages not shown: their ids fall outside the safe pattern',
  legend: 'Legend',
  untyped: 'untyped',
  otherTypes: 'other types',
  communities: 'communities; the five largest have their own colours',
  orphan: 'Orphan (no inbound links)',
  selected: 'Selected page',
  showPages: 'Show pages',
  pagesCaption: 'Every page in the graph',
  colPage: 'Page',
  colType: 'Type',
  colLinks: 'Linked pages',
  colOrphan: 'Orphan',
  yes: 'yes',
  no: 'no',
  controls: 'Graph controls',
  colorBy: 'Colour by',
  byType: 'Type',
  byCommunity: 'Community',
  highlightOrphans: 'Highlight orphans',
  types: 'Page types',
  view: 'View',
  wholeGraph: 'Whole graph',
  oneStep: '1 step',
  twoSteps: '2 steps',
  threeSteps: '3 steps',
  needsSelection: 'Select a page for a local view.',
  find: 'Find a page',
  pageRegion: 'Page',
  pageLoading: 'Loading the page…',
  pageMissing: 'This page no longer exists.',
  pageUnavailable: 'The page is unavailable.',
  truncated: 'This page is longer than 1 MiB; the rest is not shown.',
  updated: 'Updated',
  sources: 'Sources',
  outbound: 'Links to',
  inbound: 'Linked from',
  missingTarget: '(missing)',
  clearSelection: 'Clear selection',
  related: 'Related, not linked',
  showRelated: 'Show related pages',
  relatedLoading: 'Scoring related pages…',
  relatedUnavailable: 'Related pages are unavailable.',
  relatedNone: 'No related pages without a link.',
  relatedTotal: 'pairs qualify; the best 50 are listed',
  lint: 'Lint',
  lintNone: 'No lint issues.',
  indexStale: 'The index is stale; run brain index.',
  checksUnavailable: 'Lint and doctor results are unavailable.',
  trend: 'Lint over time',
  trendChart: 'Lint issues and failing checks per bucket',
  palettePages: 'Brain pages',
} as const
```

`apps/web/src/formatters/formatGraphSummary.ts`:

```ts
import type { BrainGraph } from '@orbit/contract'

import { formatCount } from './formatCount'

// The canvas's accessible name (D12).
export const formatGraphSummary = (graph: BrainGraph): string => {
  const pages = graph.nodes.length
  const links = graph.edges.length
  const orphans = graph.nodes.filter((node) => node.orphan).length
  return `Brain graph: ${formatCount(pages)} ${pages === 1 ? 'page' : 'pages'}, ${formatCount(links)} ${links === 1 ? 'link' : 'links'}, ${formatCount(orphans)} ${orphans === 1 ? 'orphan' : 'orphans'}`
}
```

`apps/web/src/charts/seriesSwatches.ts`:

```ts
// Legend swatches for series slots 1-6 (spec 7.1 tokens).
export const SERIES_SWATCHES = [
  'bg-series-1',
  'bg-series-2',
  'bg-series-3',
  'bg-series-4',
  'bg-series-5',
  'bg-series-6',
] as const
```

```ts
// apps/web/src/types/TypeLegendEntry.ts
// `name` null is the folded "other types" entry.
export type TypeLegendEntry = {
  readonly name: string | null
  readonly slot: number
  readonly count: number
}
```

`apps/web/src/selectors/selectTypeLegend.ts`:

```ts
import { typeSlots } from '../charts/typeSlots'
import type { TypeLegendEntry } from '../types/TypeLegendEntry'

// One entry per type in slots 1-5, then one for every type sharing slot 6.
export const selectTypeLegend = (
  types: readonly string[],
): TypeLegendEntry[] => {
  const slots = typeSlots(types)
  const count = (name: string): number =>
    types.filter((type) => type === name).length
  const named = [...slots]
    .filter(([, slot]) => slot < 6)
    .map(([name, slot]) => ({ name, slot, count: count(name) }))
  const folded = types.filter((type) => (slots.get(type) ?? 6) === 6).length
  return folded === 0 ? named : [...named, { name: null, slot: 6, count: folded }]
}
```

- [ ] **Step 6: The canvas components.** Props types (one file each):

```ts
// apps/web/src/types/GraphLoaderProps.ts
import type Graph from 'graphology'

import type { GraphEdgeAttributes } from './GraphEdgeAttributes'
import type { GraphNodeAttributes } from './GraphNodeAttributes'

export type GraphLoaderProps = {
  readonly graph: Graph<GraphNodeAttributes, GraphEdgeAttributes>
}
```

```ts
// apps/web/src/types/GraphEventsProps.ts
export type GraphEventsProps = { readonly onSelect: (id: string | null) => void }
```

```ts
// apps/web/src/types/GraphFocusProps.ts
export type GraphFocusProps = {
  readonly id: string | null
  readonly animate: boolean
}
```

```ts
// apps/web/src/types/GraphCanvasProps.ts
import type Graph from 'graphology'

import type { GraphEdgeAttributes } from './GraphEdgeAttributes'
import type { GraphNodeAttributes } from './GraphNodeAttributes'
import type { GraphPalette } from './GraphPalette'

export type GraphCanvasProps = {
  readonly graph: Graph<GraphNodeAttributes, GraphEdgeAttributes>
  readonly palette: GraphPalette
  readonly selectedId: string | null
  readonly onSelect: (id: string | null) => void
  readonly animate: boolean
}
```

```ts
// apps/web/src/types/GraphStageProps.ts
import type { BrainView } from './BrainView'

export type GraphStageProps = {
  readonly view: BrainView
  readonly selectedId: string | null
  readonly select: (id: string | null) => void
  readonly animate: boolean
}
```

`apps/web/src/screens/brain/GraphLoader.tsx`:

```tsx
import { useLoadGraph } from '@react-sigma/core'
import { useEffect } from 'react'

import type { GraphEdgeAttributes } from '../../types/GraphEdgeAttributes'
import type { GraphLoaderProps } from '../../types/GraphLoaderProps'
import type { GraphNodeAttributes } from '../../types/GraphNodeAttributes'

export const GraphLoader = ({ graph }: GraphLoaderProps) => {
  const loadGraph = useLoadGraph<GraphNodeAttributes, GraphEdgeAttributes>()
  useEffect(() => {
    loadGraph(graph)
  }, [graph, loadGraph])
  return null
}
```

`apps/web/src/screens/brain/GraphEvents.tsx`:

```tsx
import { useRegisterEvents } from '@react-sigma/core'
import { useEffect } from 'react'

import type { GraphEventsProps } from '../../types/GraphEventsProps'

// A click on a page selects it; a click on empty canvas clears the selection.
export const GraphEvents = ({ onSelect }: GraphEventsProps) => {
  const register = useRegisterEvents()
  useEffect(() => {
    register({
      clickNode: (event) => {
        onSelect(event.node)
      },
      clickStage: () => {
        onSelect(null)
      },
    })
  }, [register, onSelect])
  return null
}
```

`apps/web/src/screens/brain/GraphFocus.tsx`:

```tsx
import { useCamera, useSigma } from '@react-sigma/core'
import { useEffect } from 'react'

import type { GraphFocusProps } from '../../types/GraphFocusProps'

// The camera follows the selection; reduced motion jumps instead of gliding.
export const GraphFocus = ({ id, animate }: GraphFocusProps) => {
  const sigma = useSigma()
  const { gotoNode } = useCamera()
  useEffect(() => {
    if (id !== null && sigma.getGraph().hasNode(id))
      gotoNode(id, { duration: animate ? 300 : 0 })
  }, [id, animate, sigma, gotoNode])
  return null
}
```

`apps/web/src/screens/brain/GraphCanvas.tsx`:

```tsx
import '@react-sigma/core/lib/style.css'

import { SigmaContainer } from '@react-sigma/core'
import { useMemo } from 'react'

import { sigmaSettings } from '../../graph/sigmaSettings'
import type { GraphCanvasProps } from '../../types/GraphCanvasProps'
import { GraphEvents } from './GraphEvents'
import { GraphFocus } from './GraphFocus'
import { GraphLoader } from './GraphLoader'

// The only component that touches sigma; tests mock it at this boundary.
export const GraphCanvas = ({
  graph,
  palette,
  selectedId,
  onSelect,
  animate,
}: GraphCanvasProps) => {
  const settings = useMemo(() => sigmaSettings(palette), [palette])
  return (
    <SigmaContainer settings={settings} className="h-full w-full">
      <GraphLoader graph={graph} />
      <GraphEvents onSelect={onSelect} />
      <GraphFocus id={selectedId} animate={animate} />
    </SigmaContainer>
  )
}
```

`apps/web/src/screens/brain/GraphStage.tsx`:

```tsx
import { formatGraphSummary } from '../../formatters/formatGraphSummary'
import { hasWebGl } from '../../graph/hasWebGl'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { GraphStageProps } from '../../types/GraphStageProps'
import { GraphCanvas } from './GraphCanvas'

// D12: the canvas is an image with a summary name; without WebGL or a layout
// the screen says why and the list below still reaches every page.
export const GraphStage = ({ view, selectedId, select, animate }: GraphStageProps) => {
  if (!hasWebGl())
    return <p role="status" className="p-4 text-sm">{BRAIN_LABELS.noWebGl}</p>
  if (view.layoutFailed)
    return <p role="alert" className="p-4 text-sm">{BRAIN_LABELS.layoutFailed}</p>
  if (view.graph === null || view.data === null)
    return <p className="text-muted p-4 text-sm">{BRAIN_LABELS.layingOut}</p>
  return (
    <div role="img" aria-label={formatGraphSummary(view.data)} className="h-full w-full">
      <GraphCanvas
        graph={view.graph}
        palette={view.palette}
        selectedId={selectedId}
        onSelect={select}
        animate={animate}
      />
    </div>
  )
}
```

- [ ] **Step 7: Legend and page list.**

```ts
// apps/web/src/types/GraphLegendProps.ts
import type { ColorMode } from './ColorMode'
import type { GraphModel } from './GraphModel'

export type GraphLegendProps = {
  readonly model: GraphModel
  readonly colorBy: ColorMode
  readonly communities: number
  readonly highlightOrphans: boolean
}
```

```ts
// apps/web/src/types/PageListProps.ts
import type { GraphModel } from './GraphModel'

export type PageListProps = {
  readonly model: GraphModel
  readonly select: (id: string) => void
}
```

`apps/web/src/screens/brain/GraphLegend.tsx`:

```tsx
import { SERIES_SWATCHES } from '../../charts/seriesSwatches'
import { UNTYPED } from '../../charts/untypedType'
import { formatCount } from '../../formatters/formatCount'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { selectTypeLegend } from '../../selectors/selectTypeLegend'
import type { GraphLegendProps } from '../../types/GraphLegendProps'

// Every colour on the canvas is named here (spec 7.1: status colours always
// carry a label).
export const GraphLegend = ({ model, colorBy, communities, highlightOrphans }: GraphLegendProps) => (
  <section aria-label={BRAIN_LABELS.legend} className="text-sm">
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {colorBy === 'type' ? (
        selectTypeLegend(model.types).map((entry) => (
          <li key={entry.name ?? '(other)'} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2.5 rounded-full ${SERIES_SWATCHES[entry.slot - 1] ?? 'bg-series-6'}`} />
            {entry.name === null ? BRAIN_LABELS.otherTypes : entry.name === UNTYPED ? BRAIN_LABELS.untyped : entry.name}
            <span className="text-muted">{formatCount(entry.count)}</span>
          </li>
        ))
      ) : (
        <li>{formatCount(communities)} {BRAIN_LABELS.communities}</li>
      )}
      {highlightOrphans ? (
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="bg-warn size-2.5 rounded-full" />
          {BRAIN_LABELS.orphan}
        </li>
      ) : null}
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="bg-accent size-2.5 rounded-full" />
        {BRAIN_LABELS.selected}
      </li>
    </ul>
  </section>
)
```

If `sonarjs/no-nested-conditional` reports the label expression, move it into `apps/web/src/formatters/formatTypeName.ts` (`(name: string | null) => string`, same three cases) and call that.

`apps/web/src/screens/brain/PageList.tsx`:

```tsx
import { UNTYPED } from '../../charts/untypedType'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageListProps } from '../../types/PageListProps'

// D12: the keyboard and screen-reader path to every page, WebGL or not.
export const PageList = ({ model, select }: PageListProps) => (
  <details className="border-line bg-panel rounded-xl border p-4">
    <summary className="cursor-pointer font-semibold">{BRAIN_LABELS.showPages}</summary>
    <div className="mt-3 max-h-96 overflow-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{BRAIN_LABELS.pagesCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{BRAIN_LABELS.colPage}</th>
            <th scope="col">{BRAIN_LABELS.colType}</th>
            <th scope="col">{BRAIN_LABELS.colLinks}</th>
            <th scope="col">{BRAIN_LABELS.colOrphan}</th>
          </tr>
        </thead>
        <tbody>
          {model.ids.map((id, index) => (
            <tr key={id}>
              <td>
                <button type="button" className="font-mono hover:underline" onClick={() => { select(id) }}>
                  {id}
                </button>
              </td>
              <td>{model.types[index] === UNTYPED ? BRAIN_LABELS.untyped : model.types[index]}</td>
              <td>{model.degree[index]}</td>
              <td>{model.orphan[index] === true ? BRAIN_LABELS.yes : BRAIN_LABELS.no}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
)
```

- [ ] **Step 8: Body, screen and route.**

```ts
// apps/web/src/types/BrainBodyProps.ts
import type { BrainSearchModel } from './BrainSearchModel'
import type { BrainView } from './BrainView'

export type BrainBodyProps = {
  readonly view: BrainView
  readonly brain: BrainSearchModel
}
```

`apps/web/src/screens/brain/BrainBody.tsx` (Tasks 10-12 replace it with fuller versions):

```tsx
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { BrainBodyProps } from '../../types/BrainBodyProps'
import { GraphLegend } from './GraphLegend'
import { GraphStage } from './GraphStage'
import { PageList } from './PageList'

export const BrainBody = ({ view, brain }: BrainBodyProps) => {
  const animate = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const { search, select } = brain
  return (
    <div className="min-w-0 space-y-4">
      <section aria-label={BRAIN_LABELS.graphRegion} className="border-line bg-panel h-[60vh] overflow-hidden rounded-xl border md:h-[70vh]">
        <GraphStage view={view} selectedId={view.selected === null ? null : (search.page ?? null)} select={select} animate={animate} />
      </section>
      {view.data !== null && view.data.skipped > 0 ? (
        <p className="text-muted text-sm">{view.data.skipped} {BRAIN_LABELS.skipped}</p>
      ) : null}
      {view.model !== null ? (
        <>
          <GraphLegend model={view.model} colorBy={search.color} communities={view.communities} highlightOrphans={search.orphans} />
          <PageList model={view.model} select={select} />
        </>
      ) : null}
    </div>
  )
}
```

`apps/web/src/screens/brain/BrainScreen.tsx`:

```tsx
import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useBrainSearch } from '../../hooks/useBrainSearch'
import { useBrainView } from '../../hooks/useBrainView'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { BrainBody } from './BrainBody'

export const BrainScreen = () => {
  const brain = useBrainSearch()
  const view = useBrainView(brain.search)
  const isPhone = useMediaQuery('(max-width: 767px)')
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{BRAIN_LABELS.title}</h1>
        {isPhone ? <ConnectionIndicator /> : null}
      </header>
      {view.failed ? <p role="alert">{BRAIN_LABELS.unavailable}</p> : null}
      {view.data === null && !view.failed ? (
        <p className="text-muted">{BRAIN_LABELS.loading}</p>
      ) : null}
      {view.data !== null ? <BrainBody view={view} brain={brain} /> : null}
    </main>
  )
}
```

`apps/web/src/router/brainRoute.ts`:

```ts
import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { validateBrainSearch } from '../validators/validateBrainSearch'
import { shellRoute } from './shellRoute'

// Lazy: sigma, graphology and the Markdown renderer stay off the initial
// route; the chunk is budgeted at 250 KB with its worker (spec 11).
export const brainRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/brain',
  validateSearch: validateBrainSearch,
  component: lazyRouteComponent(
    async () => import('../screens/brain/BrainScreen'),
    'BrainScreen',
  ),
})
```

Add `brainRoute` to the shell children in `routeTree.ts`. `NavItem['to']` gains `'/brain'`; in `navItems.ts` insert `{ to: '/brain', label: 'Brain' }` directly after Atrium, so the order is Orbit, Memory, Atrium, Brain, Clips, Worker, System. In `TabBar.tsx`, change the link class to `text-muted min-w-0 flex-1 truncate px-1 py-3 text-center text-xs` so seven tabs fit 375 px (D15). If `Shell.test.tsx` asserts the list of nav labels, add `Brain` in that position.

In `apps/web/src/styles.css`, after the `:focus-visible` rule:

```css
/* sigma's stylesheet paints the canvas white; let the panel show through. */
div.react-sigma {
  --sigma-background-color: transparent;
}
```

Append to `apps/web/.size-limit.json`:

```json
  {
    "name": "brain route and layout worker (brotli)",
    "path": [
      "../server/dist/public/assets/BrainScreen-*.js",
      "../server/dist/public/assets/layoutWorker-*.js"
    ],
    "limit": "250 KB"
  }
```

- [ ] **Step 9: Test helpers.**

`apps/web/src/test/fakeReactSigma.tsx`:

```tsx
import type { ReactNode } from 'react'
import { vi } from 'vitest'

// The `vi.mock` body for '@react-sigma/core' (spec 9: graph components are
// tested against a mocked sigma). It records loaded graphs, camera moves and
// the handlers sigma would call, and draws nothing.
export const fakeReactSigma = {
  loaded: [] as unknown[],
  handlers: {} as Record<string, ((event: { node: string }) => void) | undefined>,
  gotoNode: vi.fn(),
  SigmaContainer: ({ children }: { readonly children?: ReactNode }) => (
    <div data-testid="sigma">{children}</div>
  ),
  useLoadGraph: () => (graph: unknown) => {
    fakeReactSigma.loaded.push(graph)
  },
  useRegisterEvents:
    () => (handlers: Record<string, (event: { node: string }) => void>) => {
      Object.assign(fakeReactSigma.handlers, handlers)
    },
  useCamera: () => ({ gotoNode: fakeReactSigma.gotoNode }),
  useSigma: () => ({ getGraph: () => ({ hasNode: () => true }) }),
}
```

`apps/web/src/test/brainGraphFixture.ts`:

```ts
import type { BrainGraph } from '@orbit/contract'

// notes/b links to notes/a; notes/c links to notes/b and nothing links to it.
export const BRAIN_GRAPH: BrainGraph = {
  now: 1_790_000_000_000,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1, orphan: false },
    { id: 'notes/b', type: 'topic', degree: 2, orphan: false },
    { id: 'notes/c', type: 'project', degree: 1, orphan: true },
  ],
  edges: [
    [1, 0],
    [2, 1],
  ],
  dangling: 0,
  skipped: 0,
}
```

`apps/web/src/test/stubBrainFetch.ts`:

```ts
import { vi } from 'vitest'

// Each request answers the first route whose key prefixes its path: a number
// is a bare status, anything else JSON; other paths answer an empty 200.
export const stubBrainFetch = (routes: Readonly<Record<string, unknown>>): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      const key = Object.keys(routes).find((prefix) => input.startsWith(prefix))
      const body = key === undefined ? undefined : routes[key]
      if (typeof body === 'number')
        return Promise.resolve(new Response(null, { status: body }))
      if (body === undefined)
        return Promise.resolve(new Response(null, { status: 200 }))
      return Promise.resolve(Response.json(body))
    }),
  )
}
```

- [ ] **Step 10: Run.** `cd apps/web && pnpm vitest run` — Expected: PASS (the new tests and every existing one, including the shell and route tests with the new nav item).

- [ ] **Step 11: Format, gate the package, commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci)
git add apps/web
git commit -m "feat(web): brain route with the graph canvas, legend and page list"
```

Expected from `check:ci`: lint clean, knip clean (every module from Tasks 7-8 is now imported), size-limit reports the initial route under 150 KB and the brain route with its worker under 250 KB.

---
### Task 10: Graph controls: colour mode, orphans, type filters, local view, search

**Files:**

- Create: `apps/web/src/types/{GraphControlsProps,TypeFilterProps,DepthControlProps,PageSearchProps}.ts`, `apps/web/src/selectors/toggleHidden.ts`, `apps/web/src/charts/depthOptions.ts`
- Create: `apps/web/src/screens/brain/{GraphControls,TypeFilter,DepthControl,PageSearch}.tsx`
- Modify: `apps/web/src/screens/brain/BrainBody.tsx`
- Test: `apps/web/src/screens/brain/BrainControls.test.tsx`, `apps/web/src/selectors/toggleHidden.test.ts`

**Interfaces:**

- Consumes: `BrainSearchModel`, `GraphModel`, `BRAIN_LABELS`, `UNTYPED`, test helpers (Task 9).
- Produces:
  - `toggleHidden(hide: readonly string[], type: string): string[]`
  - `DEPTH_OPTIONS: readonly { depth: GraphDepth; label: string }[]`
  - `<GraphControls model brain />` — a region named "Graph controls" with "Colour by" (Type | Community radios), "Highlight orphans" (checkbox), "Page types" (one checkbox per type), "View" (Whole graph, 1-3 steps as pressed buttons; steps disabled without a selection) and "Find a page" (input with a datalist of ids; an exact id selects it).

- [ ] **Step 1: Write the failing tests.**

`apps/web/src/selectors/toggleHidden.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { toggleHidden } from './toggleHidden'

describe('toggleHidden', () => {
  it('hides a shown type and shows a hidden one', () => {
    expect(toggleHidden(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleHidden(['a', 'b'], 'a')).toEqual(['b'])
  })
})
```

`apps/web/src/screens/brain/BrainControls.test.tsx`:

```tsx
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BRAIN_GRAPH } from '../../test/brainGraphFixture'
import { fakeReactSigma } from '../../test/fakeReactSigma'
import { renderAt } from '../../test/renderAt'
import { stubBrainFetch } from '../../test/stubBrainFetch'

vi.mock('@react-sigma/core', async () => (await import('../../test/fakeReactSigma')).fakeReactSigma)
vi.mock('../../layout/createLayoutWorker', async () => (await import('../../test/fakeLayoutWorkerModule')).fakeLayoutWorkerModule)
vi.mock('../../graph/hasWebGl', () => ({ hasWebGl: () => true }))

type LoadedGraph = { getNodeAttribute: (id: string, name: string) => unknown }
const lastGraph = () => fakeReactSigma.loaded.at(-1) as LoadedGraph

beforeEach(() => {
  fakeReactSigma.loaded.length = 0
  stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
})

describe('graph controls', () => {
  it('switches the colour mode and the orphan highlight', async () => {
    const { router } = await renderAt('/brain')
    fireEvent.click(await screen.findByRole('radio', { name: 'Community' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ color: 'community' })
    })
    expect(await screen.findByText(/communities; the five largest/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Highlight orphans' }))
    await waitFor(() => {
      expect(screen.queryByText('Orphan (no inbound links)')).toBeNull()
    })
  })
  it('hides a type but keeps the selected page', async () => {
    await renderAt('/brain?page=notes%2Fb')
    fireEvent.click(await screen.findByRole('checkbox', { name: 'topic' }))
    await waitFor(() => {
      expect(lastGraph().getNodeAttribute('notes/a', 'hidden')).toBe(true)
    })
    expect(lastGraph().getNodeAttribute('notes/b', 'hidden')).toBe(false)
  })
  it('offers local steps only with a selection, then limits the view', async () => {
    const { router } = await renderAt('/brain')
    expect(await screen.findByRole('button', { name: '1 step' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Find a page'), {
      target: { value: 'notes/a' },
    })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/a' })
    })
    fireEvent.click(screen.getByRole('button', { name: '1 step' }))
    await waitFor(() => {
      expect(lastGraph().getNodeAttribute('notes/c', 'hidden')).toBe(true)
    })
    expect(lastGraph().getNodeAttribute('notes/b', 'hidden')).toBe(false)
    expect(screen.getByRole('button', { name: '1 step' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/web && pnpm vitest run src/selectors/toggleHidden.test.ts src/screens/brain/BrainControls.test.tsx` — Expected: FAIL (module not found; no radio named Community).

- [ ] **Step 3: Implement.**

`apps/web/src/selectors/toggleHidden.ts`:

```ts
export const toggleHidden = (hide: readonly string[], type: string): string[] =>
  hide.includes(type) ? hide.filter((other) => other !== type) : [...hide, type]
```

`apps/web/src/charts/depthOptions.ts`:

```ts
import { BRAIN_LABELS } from '../labels/brainLabels'
import type { GraphDepth } from '../types/GraphDepth'

export const DEPTH_OPTIONS: readonly { readonly depth: GraphDepth; readonly label: string }[] = [
  { depth: 0, label: BRAIN_LABELS.wholeGraph },
  { depth: 1, label: BRAIN_LABELS.oneStep },
  { depth: 2, label: BRAIN_LABELS.twoSteps },
  { depth: 3, label: BRAIN_LABELS.threeSteps },
]
```

Props types:

```ts
// apps/web/src/types/GraphControlsProps.ts
import type { BrainSearchModel } from './BrainSearchModel'
import type { GraphModel } from './GraphModel'

export type GraphControlsProps = {
  readonly model: GraphModel
  readonly brain: BrainSearchModel
}
```

```ts
// apps/web/src/types/TypeFilterProps.ts
import type { BrainSearchModel } from './BrainSearchModel'

export type TypeFilterProps = {
  readonly typeNames: readonly string[]
  readonly brain: BrainSearchModel
}
```

```ts
// apps/web/src/types/DepthControlProps.ts
import type { BrainSearchModel } from './BrainSearchModel'

export type DepthControlProps = {
  readonly hasSelection: boolean
  readonly brain: BrainSearchModel
}
```

```ts
// apps/web/src/types/PageSearchProps.ts
import type { GraphModel } from './GraphModel'

export type PageSearchProps = {
  readonly model: GraphModel
  readonly select: (id: string) => void
}
```

`apps/web/src/screens/brain/TypeFilter.tsx`:

```tsx
import { UNTYPED } from '../../charts/untypedType'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { toggleHidden } from '../../selectors/toggleHidden'
import type { TypeFilterProps } from '../../types/TypeFilterProps'

export const TypeFilter = ({ typeNames, brain }: TypeFilterProps) => (
  <fieldset className="flex flex-wrap gap-x-3 gap-y-1">
    <legend className="text-muted mb-1 text-xs">{BRAIN_LABELS.types}</legend>
    {typeNames.map((type) => (
      <label key={type} className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={!brain.search.hide.includes(type)}
          onChange={() => {
            brain.update({ hide: toggleHidden(brain.search.hide, type) })
          }}
        />
        {type === UNTYPED ? BRAIN_LABELS.untyped : type}
      </label>
    ))}
  </fieldset>
)
```

`apps/web/src/screens/brain/DepthControl.tsx`:

```tsx
import { useId } from 'react'

import { DEPTH_OPTIONS } from '../../charts/depthOptions'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { DepthControlProps } from '../../types/DepthControlProps'

// D10: steps around a page need a selected page; the hint says so.
export const DepthControl = ({ hasSelection, brain }: DepthControlProps) => {
  const hint = useId()
  return (
    <fieldset>
      <legend className="text-muted mb-1 text-xs">{BRAIN_LABELS.view}</legend>
      <div className="flex flex-wrap gap-1">
        {DEPTH_OPTIONS.map(({ depth, label }) => (
          <button
            key={depth}
            type="button"
            aria-pressed={brain.search.depth === depth}
            aria-describedby={hasSelection ? undefined : hint}
            disabled={depth > 0 && !hasSelection}
            onClick={() => {
              brain.update({ depth })
            }}
            className="border-line aria-pressed:bg-space rounded-lg border px-2 py-1 text-sm disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
      {hasSelection ? null : (
        <p id={hint} className="text-muted mt-1 text-xs">
          {BRAIN_LABELS.needsSelection}
        </p>
      )}
    </fieldset>
  )
}
```

`apps/web/src/screens/brain/PageSearch.tsx`:

```tsx
import { useId } from 'react'

import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageSearchProps } from '../../types/PageSearchProps'

// D12: a native combobox over every page id; an exact id selects that page.
export const PageSearch = ({ model, select }: PageSearchProps) => {
  const input = useId()
  const list = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={input} className="text-muted text-xs">
        {BRAIN_LABELS.find}
      </label>
      <input
        id={input}
        type="search"
        list={list}
        autoComplete="off"
        onChange={(event) => {
          const value = event.currentTarget.value
          if (model.indexOf.has(value)) select(value)
        }}
        className="border-line bg-space rounded-lg border px-2 py-1 font-mono text-sm"
      />
      <datalist id={list}>
        {model.ids.map((id) => (
          <option key={id} value={id} />
        ))}
      </datalist>
    </div>
  )
}
```

`apps/web/src/screens/brain/GraphControls.tsx`:

```tsx
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { GraphControlsProps } from '../../types/GraphControlsProps'
import { DepthControl } from './DepthControl'
import { PageSearch } from './PageSearch'
import { TypeFilter } from './TypeFilter'

export const GraphControls = ({ model, brain }: GraphControlsProps) => (
  <section
    aria-label={BRAIN_LABELS.controls}
    className="border-line bg-panel grid gap-4 rounded-xl border p-4 text-sm md:grid-cols-2"
  >
    <PageSearch model={model} select={brain.select} />
    <DepthControl hasSelection={brain.search.page !== undefined} brain={brain} />
    <fieldset className="flex flex-wrap items-center gap-3">
      <legend className="text-muted mb-1 text-xs">{BRAIN_LABELS.colorBy}</legend>
      {(['type', 'community'] as const).map((color) => (
        <label key={color} className="flex items-center gap-1.5">
          <input
            type="radio"
            name="brain-colour"
            checked={brain.search.color === color}
            onChange={() => {
              brain.update({ color })
            }}
          />
          {color === 'type' ? BRAIN_LABELS.byType : BRAIN_LABELS.byCommunity}
        </label>
      ))}
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={brain.search.orphans}
          onChange={() => {
            brain.update({ orphans: !brain.search.orphans })
          }}
        />
        {BRAIN_LABELS.highlightOrphans}
      </label>
    </fieldset>
    <TypeFilter typeNames={model.typeNames} brain={brain} />
  </section>
)
```

`apps/web/src/screens/brain/BrainBody.tsx` — render the controls above the graph:

```tsx
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { BrainBodyProps } from '../../types/BrainBodyProps'
import { GraphControls } from './GraphControls'
import { GraphLegend } from './GraphLegend'
import { GraphStage } from './GraphStage'
import { PageList } from './PageList'

export const BrainBody = ({ view, brain }: BrainBodyProps) => {
  const animate = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const { search, select } = brain
  return (
    <div className="min-w-0 space-y-4">
      {view.model !== null ? <GraphControls model={view.model} brain={brain} /> : null}
      <section aria-label={BRAIN_LABELS.graphRegion} className="border-line bg-panel h-[60vh] overflow-hidden rounded-xl border md:h-[70vh]">
        <GraphStage view={view} selectedId={view.selected === null ? null : (search.page ?? null)} select={select} animate={animate} />
      </section>
      {view.data !== null && view.data.skipped > 0 ? (
        <p className="text-muted text-sm">{view.data.skipped} {BRAIN_LABELS.skipped}</p>
      ) : null}
      {view.model !== null ? (
        <>
          <GraphLegend model={view.model} colorBy={search.color} communities={view.communities} highlightOrphans={search.orphans} />
          <PageList model={view.model} select={select} />
        </>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 4: Run.** `cd apps/web && pnpm vitest run src/screens/brain src/selectors/toggleHidden.test.ts` — Expected: PASS.

- [ ] **Step 5: Format, gate the package, commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci)
git add apps/web/src
git commit -m "feat(web): brain graph controls, type filters, local view and search"
```

---
### Task 11: Page view and related pages

**Files:**

- Modify: `apps/web/package.json`, `pnpm-lock.yaml` (`react-markdown`, `remark-gfm`)
- Create: `apps/web/src/types/{BrainPageState,BrainRelatedState,PagePanelProps,PageMarkdownProps,PageLinksProps,PageLinkProps,RelatedPanelProps}.ts`
- Create: `apps/web/src/formatters/{linkWikiPages,internalPageOf}.ts`, `apps/web/src/selectors/relatedFor.ts`, `apps/web/src/hooks/{useBrainPage,useBrainRelated}.ts`
- Create: `apps/web/src/screens/brain/{PagePanel,PageMarkdown,markdownComponents,PageLinks,PageLink,RelatedPanel}.tsx`
- Modify: `apps/web/src/screens/brain/BrainBody.tsx`
- Test: `apps/web/src/formatters/wikiLinks.test.ts`, `apps/web/src/selectors/relatedFor.test.ts`, `apps/web/src/screens/brain/BrainPage.test.tsx`

**Interfaces:**

- Consumes: `brainPageSchema`, `brainRelatedSchema`, `pageIdSchema`, `BrainPage`, `BrainRelated` (Task 2); `ApiError`, `apiJson`; `BrainSearch`, `withPage`, `BRAIN_LABELS`, test helpers (Task 9).
- Produces:
  - `linkWikiPages(markdown: string): string` — `[[dir/page]]` and `[[dir/page|label]]` become Markdown links to `/brain?page=<encoded id>`; a target outside the page id pattern becomes its plain label.
  - `internalPageOf(href: string | undefined): string | null` — the page id of such a link, else `null`.
  - `relatedFor(pairs: BrainRelated['pairs'], id: string | null): BrainRelated['pairs']` — pairs involving `id` first, order kept otherwise.
  - `useBrainPage(id: string | undefined): BrainPageState` (`{ page: BrainPage | null; loading: boolean; missing: boolean; failed: boolean }`, query `['brain', 'page', id]`, `gcTime: 0`, no retry); `useBrainRelated(enabled: boolean): BrainRelatedState` (`{ related: BrainRelated | null; loading: boolean; failed: boolean }`).
  - `<PagePanel id search select />` (a region named "Page"), `<RelatedPanel selectedId search />` (a region named "Related, not linked").

- [ ] **Step 1: Add the renderer.**

```bash
cd apps/web
pnpm add react-markdown@10.1.0 remark-gfm@4.0.1
pnpm audit:check
```

Expected: installed; no new advisory at moderate or above.

- [ ] **Step 2: Write the failing tests.**

`apps/web/src/formatters/wikiLinks.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { internalPageOf } from './internalPageOf'
import { linkWikiPages } from './linkWikiPages'

describe('linkWikiPages', () => {
  it('links valid page ids and keeps the label', () => {
    expect(linkWikiPages('See [[notes/a]] and [[notes/b|the B page]].')).toBe(
      'See [notes/a](/brain?page=notes%2Fa) and [the B page](/brain?page=notes%2Fb).',
    )
  })
  it('turns a target outside the pattern into plain text', () => {
    expect(linkWikiPages('[[../x|escape]] [[bad id]]')).toBe('escape bad id')
  })
})

describe('internalPageOf', () => {
  it('reads the page id of an in-screen link only', () => {
    expect(internalPageOf('/brain?page=notes%2Fa')).toBe('notes/a')
    expect(internalPageOf('/brain?page=..%2Fx')).toBeNull()
    expect(internalPageOf('https://example.com/brain?page=notes%2Fa')).toBeNull()
    expect(internalPageOf(undefined)).toBeNull()
  })
})
```

`apps/web/src/selectors/relatedFor.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { relatedFor } from './relatedFor'

const pairs = [
  { left: 'notes/b', right: 'notes/c', score: 3 },
  { left: 'notes/c', right: 'notes/a', score: 2 },
  { left: 'notes/a', right: 'notes/d', score: 1 },
]

describe('relatedFor', () => {
  it('puts the pairs of the selected page first', () => {
    expect(relatedFor(pairs, 'notes/a').map((pair) => pair.score)).toEqual([
      2, 1, 3,
    ])
    expect(relatedFor(pairs, null)).toEqual(pairs)
  })
})
```

`apps/web/src/screens/brain/BrainPage.test.tsx`:

```tsx
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { BRAIN_GRAPH } from '../../test/brainGraphFixture'
import { renderAt } from '../../test/renderAt'
import { stubBrainFetch } from '../../test/stubBrainFetch'

vi.mock('@react-sigma/core', async () => (await import('../../test/fakeReactSigma')).fakeReactSigma)
vi.mock('../../layout/createLayoutWorker', async () => (await import('../../test/fakeLayoutWorkerModule')).fakeLayoutWorkerModule)
vi.mock('../../graph/hasWebGl', () => ({ hasWebGl: () => true }))

const PAGE = {
  id: 'notes/a',
  title: 'A page',
  type: 'topic',
  updated: '2026-10-01',
  summary: 'What A is about.',
  sources: ['https://example.com/source'],
  body: '# Heading\n\nSee [[notes/b]], [[bad id|plain]] and [site](https://example.com).\n\n![a diagram](https://example.com/a.png)',
  truncated: true,
  outbound: [
    { target: 'notes/b', exists: true },
    { target: 'notes/gone', exists: false },
  ],
  inbound: ['notes/c'],
}
const RELATED = {
  now: 0,
  total: 2,
  pairs: [
    { left: 'notes/b', right: 'notes/c', score: 3 },
    { left: 'notes/c', right: 'notes/a', score: 2 },
  ],
}

beforeEach(() => {
  stubBrainFetch({
    '/api/brain/graph': BRAIN_GRAPH,
    '/api/brain/page?id=notes%2Fa': PAGE,
    '/api/brain/page?id=notes%2Fz': 404,
    '/api/brain/related': RELATED,
  })
})

describe('page view', () => {
  it('renders the page without raw HTML or remote images', async () => {
    const { container, router } = await renderAt('/brain?page=notes%2Fa')
    const panel = await screen.findByRole('region', { name: 'Page' })
    expect(await within(panel).findByRole('heading', { name: 'A page' })).toBeInTheDocument()
    expect(within(panel).getByText('What A is about.')).toBeInTheDocument()
    expect(within(panel).getByText(/longer than 1 MiB/)).toBeInTheDocument()
    const body = within(panel).getByRole('article')
    expect(within(body).getByRole('heading', { level: 3, name: 'Heading' })).toBeInTheDocument()
    expect(within(body).getByText(/plain/)).toBeInTheDocument()
    expect(within(body).getByRole('link', { name: 'site' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
    expect(within(body).getByText('a diagram')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
    expect(within(panel).getByText('(missing)')).toBeInTheDocument()
    fireEvent.click(within(body).getByRole('link', { name: 'notes/b' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/b' })
    })
    expect(await axe(container)).toHaveNoViolations()
  })
  it('says when the page no longer exists', async () => {
    await renderAt('/brain?page=notes%2Fz')
    expect(await screen.findByText('This page no longer exists.')).toBeInTheDocument()
  })
  it('loads related pages only when asked, the selected page first', async () => {
    await renderAt('/brain?page=notes%2Fa')
    await screen.findByRole('region', { name: 'Page' })
    const asked = () =>
      vi
        .mocked(fetch)
        .mock.calls.filter(([input]) => String(input).startsWith('/api/brain/related'))
    expect(asked()).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Show related pages' }))
    const panel = screen.getByRole('region', { name: 'Related, not linked' })
    const items = await within(panel).findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('notes/c')
    expect(items[0]).toHaveTextContent('notes/a')
    expect(asked()).toHaveLength(1)
  })
})
```

- [ ] **Step 3: Run to see them fail.** `cd apps/web && pnpm vitest run src/formatters/wikiLinks.test.ts src/selectors/relatedFor.test.ts src/screens/brain/BrainPage.test.tsx` — Expected: FAIL, modules not found.

- [ ] **Step 4: Implement the pure pieces.**

`apps/web/src/formatters/linkWikiPages.ts`:

```ts
import { pageIdSchema } from '@orbit/contract'

// `[[dir/page]]` and `[[dir/page|label]]` become in-screen links (spec 7.5);
// a target outside the page id pattern is left as its plain label.
export const linkWikiPages = (markdown: string): string =>
  markdown.replaceAll(
    /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g,
    (_match, target: string, label: string | undefined) => {
      const text = label ?? target
      return pageIdSchema.safeParse(target).success
        ? `[${text}](/brain?page=${encodeURIComponent(target)})`
        : text
    },
  )
```

`apps/web/src/formatters/internalPageOf.ts`:

```ts
import { pageIdSchema } from '@orbit/contract'

// The page id of a link `linkWikiPages` wrote, or null for any other href.
export const internalPageOf = (href: string | undefined): string | null => {
  const prefix = '/brain?page='
  if (href?.startsWith(prefix) !== true) return null
  const id = pageIdSchema.safeParse(decodeURIComponent(href.slice(prefix.length)))
  return id.success ? id.data : null
}
```

`apps/web/src/selectors/relatedFor.ts`:

```ts
import type { BrainRelated } from '@orbit/contract'

// D6: the selected page's pairs first; the engine's score order otherwise.
export const relatedFor = (
  pairs: BrainRelated['pairs'],
  id: string | null,
): BrainRelated['pairs'] => {
  const involves = (pair: BrainRelated['pairs'][number]): boolean =>
    pair.left === id || pair.right === id
  return [...pairs.filter(involves), ...pairs.filter((pair) => !involves(pair))]
}
```

- [ ] **Step 5: Implement the data hooks.**

```ts
// apps/web/src/types/BrainPageState.ts
import type { BrainPage } from '@orbit/contract'

export type BrainPageState = {
  readonly page: BrainPage | null
  readonly loading: boolean
  readonly missing: boolean
  readonly failed: boolean
}
```

```ts
// apps/web/src/types/BrainRelatedState.ts
import type { BrainRelated } from '@orbit/contract'

export type BrainRelatedState = {
  readonly related: BrainRelated | null
  readonly loading: boolean
  readonly failed: boolean
}
```

`apps/web/src/hooks/useBrainPage.ts`:

```ts
import { brainPageSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { ApiError } from '../api/ApiError'
import { apiJson } from '../api/apiJson'
import type { BrainPageState } from '../types/BrainPageState'

// Content (spec 6.6): fetched on selection, dropped when the screen unmounts.
export const useBrainPage = (id: string | undefined): BrainPageState => {
  const query = useQuery({
    queryKey: ['brain', 'page', id],
    queryFn: async () =>
      apiJson(`/api/brain/page?id=${encodeURIComponent(id ?? '')}`, brainPageSchema),
    enabled: id !== undefined,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  })
  const missing = query.error instanceof ApiError && query.error.status === 404
  return {
    page: query.data ?? null,
    loading: id !== undefined && query.isPending,
    missing,
    failed: query.isError && !missing,
  }
}
```

`apps/web/src/hooks/useBrainRelated.ts`:

```ts
import { brainRelatedSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import type { BrainRelatedState } from '../types/BrainRelatedState'

// D5: scored only when asked; the server caches one answer per cadence.
export const useBrainRelated = (enabled: boolean): BrainRelatedState => {
  const query = useQuery({
    queryKey: ['brain', 'related'],
    queryFn: async () => apiJson('/api/brain/related', brainRelatedSchema),
    enabled,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
  return {
    related: query.data ?? null,
    loading: enabled && query.isPending,
    failed: query.isError,
  }
}
```

- [ ] **Step 6: Implement the components.** Props types:

```ts
// apps/web/src/types/PagePanelProps.ts
import type { BrainSearch } from './BrainSearch'

export type PagePanelProps = {
  readonly id: string
  readonly search: BrainSearch
  readonly select: (id: string | null) => void
}
```

```ts
// apps/web/src/types/PageMarkdownProps.ts
import type { BrainSearch } from './BrainSearch'

export type PageMarkdownProps = {
  readonly body: string
  readonly search: BrainSearch
}
```

```ts
// apps/web/src/types/PageLinkProps.ts
import type { BrainSearch } from './BrainSearch'

export type PageLinkProps = {
  readonly id: string
  readonly search: BrainSearch
}
```

```ts
// apps/web/src/types/PageLinksProps.ts
import type { BrainPage } from '@orbit/contract'

import type { BrainSearch } from './BrainSearch'

export type PageLinksProps = {
  readonly page: BrainPage
  readonly search: BrainSearch
}
```

```ts
// apps/web/src/types/RelatedPanelProps.ts
import type { BrainSearch } from './BrainSearch'

export type RelatedPanelProps = {
  readonly selectedId: string | null
  readonly search: BrainSearch
}
```

`apps/web/src/screens/brain/PageLink.tsx`:

```tsx
import { Link } from '@tanstack/react-router'

import { withPage } from '../../selectors/withPage'
import type { PageLinkProps } from '../../types/PageLinkProps'

// A page id that selects that page, keeping the rest of the view.
export const PageLink = ({ id, search }: PageLinkProps) => (
  <Link to="/brain" search={withPage(search, id)} className="font-mono underline">
    {id}
  </Link>
)
```

`apps/web/src/screens/brain/markdownComponents.tsx`:

```tsx
import { Link } from '@tanstack/react-router'
import type { Components } from 'react-markdown'

import { internalPageOf } from '../../formatters/internalPageOf'
import { withPage } from '../../selectors/withPage'
import type { BrainSearch } from '../../types/BrainSearch'

// Spec 6.6: in-screen links select pages; other links open a new tab without
// an opener or referrer; images show their alt text (the CSP would block a
// remote image anyway). Page headings sit below the panel's own heading.
export const markdownComponents = (search: BrainSearch): Components => ({
  a: ({ href, children }) => {
    const id = internalPageOf(href)
    return id === null ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <Link to="/brain" search={withPage(search, id)}>
        {children}
      </Link>
    )
  },
  img: ({ alt }) => <span className="text-muted italic">{alt}</span>,
  h1: ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>,
  h2: ({ children }) => <h4 className="font-semibold">{children}</h4>,
  h3: ({ children }) => <h5 className="font-semibold">{children}</h5>,
  h4: ({ children }) => <h6 className="font-semibold">{children}</h6>,
  h5: ({ children }) => <h6 className="font-semibold">{children}</h6>,
  h6: ({ children }) => <h6 className="font-semibold">{children}</h6>,
})
```

`apps/web/src/screens/brain/PageMarkdown.tsx`:

```tsx
import { useMemo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { linkWikiPages } from '../../formatters/linkWikiPages'
import type { PageMarkdownProps } from '../../types/PageMarkdownProps'
import { markdownComponents } from './markdownComponents'

// No rehype-raw: HTML in a page is never rendered as HTML (spec 6.6).
export const PageMarkdown = ({ body, search }: PageMarkdownProps) => {
  const components = useMemo(() => markdownComponents(search), [search])
  return (
    <article className="min-w-0 space-y-3 text-sm leading-relaxed break-words [&_a]:underline [&_code]:font-mono [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {linkWikiPages(body)}
      </Markdown>
    </article>
  )
}
```

`apps/web/src/screens/brain/PageLinks.tsx`:

```tsx
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageLinksProps } from '../../types/PageLinksProps'
import { PageLink } from './PageLink'

export const PageLinks = ({ page, search }: PageLinksProps) => (
  <div className="grid gap-4 text-sm sm:grid-cols-2">
    <div>
      <h3 className="text-muted mb-1 text-xs">{BRAIN_LABELS.outbound}</h3>
      <ul className="space-y-1">
        {page.outbound.map((link) => (
          <li key={link.target}>
            {link.exists ? (
              <PageLink id={link.target} search={search} />
            ) : (
              <span className="font-mono">
                {link.target} <span className="text-muted">{BRAIN_LABELS.missingTarget}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
    <div>
      <h3 className="text-muted mb-1 text-xs">{BRAIN_LABELS.inbound}</h3>
      <ul className="space-y-1">
        {page.inbound.map((other) => (
          <li key={other}>
            <PageLink id={other} search={search} />
          </li>
        ))}
      </ul>
    </div>
  </div>
)
```

`apps/web/src/screens/brain/PagePanel.tsx`:

```tsx
import { useBrainPage } from '../../hooks/useBrainPage'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PagePanelProps } from '../../types/PagePanelProps'
import { PageLinks } from './PageLinks'
import { PageMarkdown } from './PageMarkdown'

// D1: the fixed frontmatter fields, the rendered body and the links.
export const PagePanel = ({ id, search, select }: PagePanelProps) => {
  const { page, loading, missing, failed } = useBrainPage(id)
  return (
    <section aria-label={BRAIN_LABELS.pageRegion} className="border-line bg-panel min-w-0 space-y-4 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold break-words">{page?.title ?? id}</h2>
        <button type="button" className="text-muted text-sm underline" onClick={() => { select(null) }}>
          {BRAIN_LABELS.clearSelection}
        </button>
      </div>
      {loading ? <p className="text-muted text-sm">{BRAIN_LABELS.pageLoading}</p> : null}
      {missing ? <p role="alert" className="text-sm">{BRAIN_LABELS.pageMissing}</p> : null}
      {failed ? <p role="alert" className="text-sm">{BRAIN_LABELS.pageUnavailable}</p> : null}
      {page === null ? null : (
        <>
          <p className="text-muted font-mono text-xs break-all">
            {[page.id, page.type, page.updated === null ? null : `${BRAIN_LABELS.updated} ${page.updated}`].filter(Boolean).join(' · ')}
          </p>
          {page.summary === null ? null : <p className="text-sm">{page.summary}</p>}
          {page.truncated ? <p className="text-warn text-sm">{BRAIN_LABELS.truncated}</p> : null}
          <PageMarkdown body={page.body} search={search} />
          {page.sources.length === 0 ? null : (
            <div className="text-sm">
              <h3 className="text-muted mb-1 text-xs">{BRAIN_LABELS.sources}</h3>
              <ul className="font-mono text-xs break-all">
                {page.sources.map((source) => <li key={source}>{source}</li>)}
              </ul>
            </div>
          )}
          <PageLinks page={page} search={search} />
        </>
      )}
    </section>
  )
}
```

If `complexity` exceeds 10 here, move the block after `{page === null ? null : (` into `apps/web/src/screens/brain/PageDetails.tsx` (props `{ page: BrainPage; search: BrainSearch }` in `types/PageDetailsProps.ts`) and render `<PageDetails page={page} search={search} />` in its place.

`apps/web/src/screens/brain/RelatedPanel.tsx`:

```tsx
import { useState } from 'react'

import { formatCount } from '../../formatters/formatCount'
import { useBrainRelated } from '../../hooks/useBrainRelated'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { relatedFor } from '../../selectors/relatedFor'
import type { RelatedPanelProps } from '../../types/RelatedPanelProps'
import { PageLink } from './PageLink'

// D5, D6: scored on request; the selected page's pairs first.
export const RelatedPanel = ({ selectedId, search }: RelatedPanelProps) => {
  const [asked, setAsked] = useState(false)
  const { related, loading, failed } = useBrainRelated(asked)
  return (
    <section aria-label={BRAIN_LABELS.related} className="border-line bg-panel space-y-3 rounded-xl border p-4 text-sm">
      <h2 className="text-lg font-semibold">{BRAIN_LABELS.related}</h2>
      {asked ? null : (
        <button type="button" className="border-line rounded-lg border px-3 py-1.5" onClick={() => { setAsked(true) }}>
          {BRAIN_LABELS.showRelated}
        </button>
      )}
      {loading ? <p className="text-muted">{BRAIN_LABELS.relatedLoading}</p> : null}
      {failed ? <p role="alert">{BRAIN_LABELS.relatedUnavailable}</p> : null}
      {related === null ? null : related.pairs.length === 0 ? (
        <p className="text-muted">{BRAIN_LABELS.relatedNone}</p>
      ) : (
        <>
          <p className="text-muted">{formatCount(related.total)} {BRAIN_LABELS.relatedTotal}</p>
          <ul className="space-y-1">
            {relatedFor(related.pairs, selectedId).map((pair) => (
              <li key={`${pair.left} ${pair.right}`} className="flex flex-wrap items-center gap-x-2">
                <PageLink id={pair.left} search={search} />
                <span aria-hidden="true">↔</span>
                <PageLink id={pair.right} search={search} />
                <span className="text-muted">{pair.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
```

If `sonarjs/no-nested-conditional` reports the `related === null ? ... : ... ? ... : ...` expression, move that expression into `apps/web/src/screens/brain/RelatedList.tsx` (props `{ related: BrainRelated; selectedId: string | null; search: BrainSearch }` in `types/RelatedListProps.ts`) with an early `return` for the empty case.

`apps/web/src/screens/brain/BrainBody.tsx` — the graph column and a side column:

```tsx
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { BrainBodyProps } from '../../types/BrainBodyProps'
import { GraphControls } from './GraphControls'
import { GraphLegend } from './GraphLegend'
import { GraphStage } from './GraphStage'
import { PageList } from './PageList'
import { PagePanel } from './PagePanel'
import { RelatedPanel } from './RelatedPanel'

// D15: two columns on wide screens; under them the side panels stack below.
export const BrainBody = ({ view, brain }: BrainBodyProps) => {
  const animate = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const { search, select } = brain
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-4">
        {view.model !== null ? <GraphControls model={view.model} brain={brain} /> : null}
        <section aria-label={BRAIN_LABELS.graphRegion} className="border-line bg-panel h-[60vh] overflow-hidden rounded-xl border md:h-[70vh]">
          <GraphStage view={view} selectedId={view.selected === null ? null : (search.page ?? null)} select={select} animate={animate} />
        </section>
        {view.data !== null && view.data.skipped > 0 ? (
          <p className="text-muted text-sm">{view.data.skipped} {BRAIN_LABELS.skipped}</p>
        ) : null}
        {view.model !== null ? (
          <>
            <GraphLegend model={view.model} colorBy={search.color} communities={view.communities} highlightOrphans={search.orphans} />
            <PageList model={view.model} select={select} />
          </>
        ) : null}
      </div>
      <div className="min-w-0 space-y-4">
        {search.page === undefined ? null : (
          <PagePanel key={search.page} id={search.page} search={search} select={select} />
        )}
        <RelatedPanel selectedId={search.page ?? null} search={search} />
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Run.** `cd apps/web && pnpm vitest run` — Expected: PASS.

- [ ] **Step 8: Format, gate the package, commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci)
git add apps/web/package.json apps/web/src pnpm-lock.yaml
git commit -m "feat(web): brain page view and related pages on demand"
```

Expected from `check:ci`: size-limit still under 250 KB for the brain route with its worker (react-markdown and remark-gfm land in that chunk).

---
### Task 12: Lint, doctor and lint trend panels

**Files:**

- Create: `apps/web/src/types/{BrainChecksState,IssueGroup,LintPanelProps,ChecksSectionProps,BrainSideProps}.ts`
- Create: `apps/web/src/hooks/useBrainChecks.ts`, `apps/web/src/selectors/groupIssues.ts`, `apps/web/src/charts/brainTrendSpecs.ts`
- Create: `apps/web/src/screens/brain/{LintPanel,ChecksSection,BrainSide}.tsx`
- Modify: `apps/web/src/screens/brain/BrainBody.tsx`
- Test: `apps/web/src/selectors/groupIssues.test.ts`, `apps/web/src/screens/brain/BrainChecks.test.tsx`

**Interfaces:**

- Consumes: `brainChecksSchema`, `BrainChecks` (Task 2); `PageLink`, `PagePanel`, `RelatedPanel` (Task 11); from 1b: `useTrend(component, range, specs)`, `<TrendSection title chartLabel trend range setRange />`, `TrendSpec`, `<DoctorList doctor />` (its `doctor` prop is `{ ok; checks: { name; ok; code }[] }`, the same shape as `BrainChecks['doctor']`), `METRIC_LABELS`.
- Produces:
  - `useBrainChecks(): BrainChecksState` (`{ checks: BrainChecks | null; failed: boolean }`, query `['brain', 'checks']`, loaded on open, never polled, `gcTime: 0`)
  - `groupIssues(issues: BrainChecks['issues']): IssueGroup[]` (`{ code; pages }`, largest group first, ties by code)
  - `BRAIN_TREND_SPECS: readonly TrendSpec[]` (`brain.lint_issues`, `brain.doctor_failing`)
  - `<LintPanel checks search />` (region "Lint"), `<ChecksSection brain />`, `<BrainSide brain />`

- [ ] **Step 1: Write the failing tests.**

`apps/web/src/selectors/groupIssues.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { groupIssues } from './groupIssues'

describe('groupIssues', () => {
  it('groups pages by code, largest group first', () => {
    expect(
      groupIssues([
        { page: 'notes/a', code: 'missing_summary' },
        { page: 'notes/b', code: 'dangling_link' },
        { page: 'notes/c', code: 'dangling_link' },
      ]),
    ).toEqual([
      { code: 'dangling_link', pages: ['notes/b', 'notes/c'] },
      { code: 'missing_summary', pages: ['notes/a'] },
    ])
  })
})
```

`apps/web/src/screens/brain/BrainChecks.test.tsx`:

```tsx
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { BRAIN_GRAPH } from '../../test/brainGraphFixture'
import { renderAt } from '../../test/renderAt'
import { stubBrainFetch } from '../../test/stubBrainFetch'

vi.mock('@react-sigma/core', async () => (await import('../../test/fakeReactSigma')).fakeReactSigma)
vi.mock('../../layout/createLayoutWorker', async () => (await import('../../test/fakeLayoutWorkerModule')).fakeLayoutWorkerModule)
vi.mock('../../graph/hasWebGl', () => ({ hasWebGl: () => true }))

const NOW = 1_790_000_000_000
const CHECKS = {
  now: NOW,
  pageCount: 3,
  indexStale: true,
  issues: [
    { page: 'notes/a', code: 'dangling_link' },
    { page: 'notes/b', code: 'dangling_link' },
  ],
  doctor: { ok: false, checks: [{ name: 'paths', ok: false, code: 'paths_missing' }] },
}

describe('brain side panels', () => {
  it('shows lint by code, failing doctor checks and the lint trend', async () => {
    stubBrainFetch({
      '/api/brain/graph': BRAIN_GRAPH,
      '/api/brain/checks': CHECKS,
      '/api/history/metrics': { now: NOW, from: NOW - 86_400_000, runs: [], series: [] },
    })
    const { container, router } = await renderAt('/brain')
    const lint = await screen.findByRole('region', { name: 'Lint' })
    expect(await within(lint).findByText(/dangling_link/)).toHaveTextContent('2')
    expect(within(lint).getByText(/index is stale/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Doctor' })).toHaveTextContent(
      'paths paths_missing',
    )
    expect(screen.getByRole('region', { name: 'Lint over time' })).toBeInTheDocument()
    fireEvent.click(within(lint).getByText(/dangling_link/))
    fireEvent.click(within(lint).getByRole('link', { name: 'notes/b' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/b' })
    })
    expect(await axe(container)).toHaveNoViolations()
  })
  it('says when the checks are unavailable', async () => {
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH, '/api/brain/checks': 503 })
    await renderAt('/brain')
    expect(
      await screen.findByText('Lint and doctor results are unavailable.'),
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to see them fail.** `cd apps/web && pnpm vitest run src/selectors/groupIssues.test.ts src/screens/brain/BrainChecks.test.tsx` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement.**

```ts
// apps/web/src/types/BrainChecksState.ts
import type { BrainChecks } from '@orbit/contract'

export type BrainChecksState = {
  readonly checks: BrainChecks | null
  readonly failed: boolean
}
```

```ts
// apps/web/src/types/IssueGroup.ts
export type IssueGroup = { readonly code: string; readonly pages: readonly string[] }
```

```ts
// apps/web/src/types/LintPanelProps.ts
import type { BrainChecks } from '@orbit/contract'

import type { BrainSearch } from './BrainSearch'

export type LintPanelProps = {
  readonly checks: BrainChecks
  readonly search: BrainSearch
}
```

```ts
// apps/web/src/types/ChecksSectionProps.ts
import type { BrainSearchModel } from './BrainSearchModel'

export type ChecksSectionProps = { readonly brain: BrainSearchModel }
```

```ts
// apps/web/src/types/BrainSideProps.ts
import type { BrainSearchModel } from './BrainSearchModel'

export type BrainSideProps = { readonly brain: BrainSearchModel }
```

`apps/web/src/hooks/useBrainChecks.ts`:

```ts
import { brainChecksSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import type { BrainChecksState } from '../types/BrainChecksState'

// D5: loaded with the screen, never polled; issue page ids are content.
export const useBrainChecks = (): BrainChecksState => {
  const query = useQuery({
    queryKey: ['brain', 'checks'],
    queryFn: async () => apiJson('/api/brain/checks', brainChecksSchema),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
  return { checks: query.data ?? null, failed: query.isError }
}
```

`apps/web/src/selectors/groupIssues.ts`:

```ts
import type { BrainChecks } from '@orbit/contract'

import type { IssueGroup } from '../types/IssueGroup'

export const groupIssues = (issues: BrainChecks['issues']): IssueGroup[] => {
  const groups = new Map<string, string[]>()
  for (const { page, code } of issues)
    groups.set(code, [...(groups.get(code) ?? []), page])
  return [...groups]
    .map(([code, pages]) => ({ code, pages }))
    .toSorted((a, b) => b.pages.length - a.pages.length || a.code.localeCompare(b.code))
}
```

`apps/web/src/charts/brainTrendSpecs.ts`:

```ts
import { METRIC_LABELS } from '../labels/metricLabels'
import type { TrendSpec } from '../types/TrendSpec'

// A module constant, as useTrend requires (1b Task 8).
export const BRAIN_TREND_SPECS: readonly TrendSpec[] = [
  { key: 'brain.lint_issues', label: METRIC_LABELS['brain.lint_issues'] },
  { key: 'brain.doctor_failing', label: METRIC_LABELS['brain.doctor_failing'] },
]
```

`apps/web/src/screens/brain/LintPanel.tsx`:

```tsx
import { formatCount } from '../../formatters/formatCount'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { groupIssues } from '../../selectors/groupIssues'
import type { LintPanelProps } from '../../types/LintPanelProps'
import { PageLink } from './PageLink'

// D13: one disclosure per code; each page selects itself on the graph.
export const LintPanel = ({ checks, search }: LintPanelProps) => {
  const groups = groupIssues(checks.issues)
  return (
    <section aria-label={BRAIN_LABELS.lint} className="border-line bg-panel space-y-3 rounded-xl border p-4 text-sm">
      <h2 className="text-lg font-semibold">{BRAIN_LABELS.lint}</h2>
      {checks.indexStale ? <p className="text-warn">{BRAIN_LABELS.indexStale}</p> : null}
      {groups.length === 0 ? <p className="text-muted">{BRAIN_LABELS.lintNone}</p> : null}
      {groups.map((group) => (
        <details key={group.code}>
          <summary className="cursor-pointer font-mono">
            {group.code} <span className="text-muted">{formatCount(group.pages.length)}</span>
          </summary>
          <ul className="mt-1 space-y-1 pl-4">
            {group.pages.map((page) => (
              <li key={page}>
                <PageLink id={page} search={search} />
              </li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  )
}
```

`apps/web/src/screens/brain/ChecksSection.tsx`:

```tsx
import { BRAIN_TREND_SPECS } from '../../charts/brainTrendSpecs'
import { useBrainChecks } from '../../hooks/useBrainChecks'
import { useTrend } from '../../hooks/useTrend'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { ChecksSectionProps } from '../../types/ChecksSectionProps'
import { DoctorList } from '../clips/DoctorList'
import { TrendSection } from '../memory/TrendSection'
import { LintPanel } from './LintPanel'

// Doctor reuses the Clips panel as is: same shape, generic labels (D13).
export const ChecksSection = ({ brain }: ChecksSectionProps) => {
  const { checks, failed } = useBrainChecks()
  const trend = useTrend('brain', brain.search.range, BRAIN_TREND_SPECS)
  return (
    <>
      {failed ? <p role="alert" className="text-sm">{BRAIN_LABELS.checksUnavailable}</p> : null}
      {checks === null ? null : (
        <>
          <LintPanel checks={checks} search={brain.search} />
          <DoctorList doctor={checks.doctor} />
        </>
      )}
      <TrendSection
        title={BRAIN_LABELS.trend}
        chartLabel={BRAIN_LABELS.trendChart}
        trend={trend}
        range={brain.search.range}
        setRange={(range) => {
          brain.update({ range })
        }}
      />
    </>
  )
}
```

`apps/web/src/screens/brain/BrainSide.tsx`:

```tsx
import type { BrainSideProps } from '../../types/BrainSideProps'
import { ChecksSection } from './ChecksSection'
import { PagePanel } from './PagePanel'
import { RelatedPanel } from './RelatedPanel'

export const BrainSide = ({ brain }: BrainSideProps) => {
  const { search, select } = brain
  return (
    <div className="min-w-0 space-y-4">
      {search.page === undefined ? null : (
        <PagePanel key={search.page} id={search.page} search={search} select={select} />
      )}
      <RelatedPanel selectedId={search.page ?? null} search={search} />
      <ChecksSection brain={brain} />
    </div>
  )
}
```

`apps/web/src/screens/brain/BrainBody.tsx` — the side column becomes `BrainSide`:

```tsx
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { BrainBodyProps } from '../../types/BrainBodyProps'
import { BrainSide } from './BrainSide'
import { GraphControls } from './GraphControls'
import { GraphLegend } from './GraphLegend'
import { GraphStage } from './GraphStage'
import { PageList } from './PageList'

// D15: two columns on wide screens; under them the side panels stack below.
export const BrainBody = ({ view, brain }: BrainBodyProps) => {
  const animate = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const { search, select } = brain
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-4">
        {view.model !== null ? <GraphControls model={view.model} brain={brain} /> : null}
        <section aria-label={BRAIN_LABELS.graphRegion} className="border-line bg-panel h-[60vh] overflow-hidden rounded-xl border md:h-[70vh]">
          <GraphStage view={view} selectedId={view.selected === null ? null : (search.page ?? null)} select={select} animate={animate} />
        </section>
        {view.data !== null && view.data.skipped > 0 ? (
          <p className="text-muted text-sm">{view.data.skipped} {BRAIN_LABELS.skipped}</p>
        ) : null}
        {view.model !== null ? (
          <>
            <GraphLegend model={view.model} colorBy={search.color} communities={view.communities} highlightOrphans={search.orphans} />
            <PageList model={view.model} select={select} />
          </>
        ) : null}
      </div>
      <BrainSide brain={brain} />
    </div>
  )
}
```

- [ ] **Step 4: Run.** `cd apps/web && pnpm vitest run` — Expected: PASS, including the Task 9-11 screen tests (their unstubbed `/api/brain/checks` and history calls answer an empty 200, which the panels show as unavailable).

- [ ] **Step 5: Format, gate the package, commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci)
git add apps/web/src
git commit -m "feat(web): brain lint, doctor and lint trend panels"
```

---
### Task 13: Brain pages in the command palette

**Files:**

- Create: `apps/web/src/types/{PalettePagesState,PalettePagesProps}.ts`, `apps/web/src/hooks/usePalettePages.ts`, `apps/web/src/components/shell/PalettePages.tsx`
- Modify: `apps/web/src/types/CommandPaletteModel.ts`, `apps/web/src/hooks/useCommandPalette.ts`, `apps/web/src/components/shell/PaletteList.tsx`
- Test: `apps/web/src/components/shell/PalettePages.test.tsx`

**Interfaces:**

- Consumes: `brainGraphSchema` (Task 2), `apiJson`, `BRAIN_LABELS`, `BRAIN_GRAPH`, `stubBrainFetch`, `renderAt` (Task 9).
- Produces:
  - `usePalettePages(open: boolean): PalettePagesState` (`{ ids: readonly string[] }`): the graph query `['brain', 'graph']` (shared with the screen), enabled only while the palette is open, `gcTime: 0`, so the ids leave memory when it closes (D14).
  - `CommandPaletteModel.openPage(id: string): void` — closes the palette and navigates to `/brain?page=<id>`.
  - `<PalettePages palette />` — a cmdk group "Brain pages", one item per page id.

- [ ] **Step 1: Write the failing test.**

`apps/web/src/components/shell/PalettePages.test.tsx`:

```tsx
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BRAIN_GRAPH } from '../../test/brainGraphFixture'
import { renderAt } from '../../test/renderAt'
import { stubBrainFetch } from '../../test/stubBrainFetch'

vi.mock('@react-sigma/core', async () => (await import('../../test/fakeReactSigma')).fakeReactSigma)
vi.mock('../../layout/createLayoutWorker', async () => (await import('../../test/fakeLayoutWorkerModule')).fakeLayoutWorkerModule)
vi.mock('../../graph/hasWebGl', () => ({ hasWebGl: () => true }))

const graphCalls = () =>
  vi
    .mocked(fetch)
    .mock.calls.filter(([input]) => String(input) === '/api/brain/graph')

describe('palette pages', () => {
  it('lists brain pages only while open and opens the chosen one', async () => {
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    const { router } = await renderAt('/system')
    expect(graphCalls()).toHaveLength(0)
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.click(await screen.findByRole('option', { name: 'notes/c' }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/brain')
    })
    expect(router.state.location.search).toMatchObject({ page: 'notes/c' })
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).toBeNull()
  })
  it('keeps navigation working when the graph is unavailable', async () => {
    stubBrainFetch({ '/api/brain/graph': 503 })
    const { router } = await renderAt('/system')
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.click(await screen.findByRole('option', { name: 'Worker' }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/worker')
    })
  })
})
```

If `/system` needs more stubbed endpoints than `stubBrainFetch`'s empty 200 to render its heading, the test still holds: it only drives the shell's palette.

- [ ] **Step 2: Run to see it fail.** `cd apps/web && pnpm vitest run src/components/shell/PalettePages.test.tsx` — Expected: FAIL, no option named `notes/c`.

- [ ] **Step 3: Implement.**

```ts
// apps/web/src/types/PalettePagesState.ts
export type PalettePagesState = { readonly ids: readonly string[] }
```

```ts
// apps/web/src/types/PalettePagesProps.ts
import type { CommandPaletteModel } from './CommandPaletteModel'

export type PalettePagesProps = { readonly palette: CommandPaletteModel }
```

`apps/web/src/hooks/usePalettePages.ts`:

```ts
import { brainGraphSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import type { PalettePagesState } from '../types/PalettePagesState'

// D14: the same query as the Brain screen, only while the palette is open.
export const usePalettePages = (open: boolean): PalettePagesState => {
  const query = useQuery({
    queryKey: ['brain', 'graph'],
    queryFn: async () => apiJson('/api/brain/graph', brainGraphSchema),
    enabled: open,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
  return { ids: query.data?.nodes.map((node) => node.id) ?? [] }
}
```

`apps/web/src/types/CommandPaletteModel.ts`:

```ts
import type { NavItem } from './NavItem'

export type CommandPaletteModel = {
  readonly open: boolean
  readonly setOpen: (open: boolean) => void
  readonly go: (to: NavItem['to']) => void
  readonly openPage: (id: string) => void
  readonly signOut: () => void
}
```

In `apps/web/src/hooks/useCommandPalette.ts`, add to the returned object after `go`:

```ts
    openPage: (id) => {
      setOpen(false)
      void navigate({ to: '/brain', search: { page: id } })
    },
```

`brainRoute.validateSearch` fills the other search fields with their defaults.

`apps/web/src/components/shell/PalettePages.tsx`:

```tsx
import { Command } from 'cmdk'

import { usePalettePages } from '../../hooks/usePalettePages'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PalettePagesProps } from '../../types/PalettePagesProps'

export const PalettePages = ({ palette }: PalettePagesProps) => {
  const { ids } = usePalettePages(palette.open)
  if (ids.length === 0) return null
  return (
    <Command.Group heading={BRAIN_LABELS.palettePages}>
      {ids.map((id) => (
        <Command.Item
          key={id}
          value={id}
          onSelect={() => {
            palette.openPage(id)
          }}
          className="aria-selected:bg-space rounded-lg px-3 py-2 font-mono text-sm"
        >
          {id}
        </Command.Item>
      ))}
    </Command.Group>
  )
}
```

In `apps/web/src/components/shell/PaletteList.tsx`, import `PalettePages` and render `<PalettePages palette={palette} />` between the "Go to" and "Session" groups.

- [ ] **Step 4: Run.** `cd apps/web && pnpm vitest run` — Expected: PASS, including `Shell.test.tsx` (its unstubbed `/api/brain/graph` request fails quietly and the group stays hidden).

- [ ] **Step 5: Format, gate the package, commit.**

```bash
(cd apps/web && pnpm exec prettier --write . && pnpm check:ci)
git add apps/web/src
git commit -m "feat(web): brain pages in the command palette"
```

---
### Task 14: End-to-end checks, backlog and gate

**Files:**

- Modify: `e2e/fixtures/bin/brain.mjs`, `e2e/globalSetup.ts`, `e2e/specs/widths.spec.ts`, `e2e/specs/a11y.spec.ts`, `TODO.md`, `TODO_LOG.md`
- Create: `e2e/specs/brain.spec.ts`

**Interfaces:**

- Consumes: the whole stack from Tasks 1-13 through the built server; the fixture-engine pattern (`globalSetup` copies `e2e/fixtures/bin/<name>.mjs` to a fake engine root and lists its commands in the e2e `orbit.json`).
- Produces: the e2e proof that the brain table entries (placeholder and leading-argument lookup included) run end to end, and the closed backlog item.

- [ ] **Step 1: Teach the fixture engine the brain detail commands.** Replace `e2e/fixtures/bin/brain.mjs`:

```js
#!/usr/bin/env node
// Fixture brain engine: fixed documents keyed by the exact argument list.
const doctor = { schemaVersion: 1, ok: true, checks: [] }
const docs = {
  'lint --json': {
    schemaVersion: 1,
    pageCount: 3,
    indexStale: false,
    issues: [{ page: 'notes/a', code: 'dangling_link' }],
  },
  'doctor --json': doctor,
  'doctor --json --skip credentials': doctor,
  'graph --json --no-html': {
    schemaVersion: 1,
    nodes: [
      { id: 'notes/a', type: 'topic', degree: 1 },
      { id: 'notes/b', type: 'topic', degree: 2 },
      { id: 'notes/c', type: 'project', degree: 1 },
    ],
    edges: [
      { source: 'notes/b', target: 'notes/a' },
      { source: 'notes/c', target: 'notes/b' },
    ],
    orphans: ['notes/c'],
    dangling: [{ page: 'notes/a', target: 'notes/gone' }],
  },
  'graph --json --related --limit 50': {
    schemaVersion: 1,
    total: 1,
    pairs: [{ left: 'notes/a', right: 'notes/c', score: 2.5 }],
  },
  'page --json --id notes/a': {
    schemaVersion: 1,
    id: 'notes/a',
    frontmatter: {
      title: 'Fixture page A',
      type: 'topic',
      updated: '2026-10-01',
      summary: 'A fixture page.',
      sources: [],
      secret_note: 'never forwarded',
    },
    body: '# Overview\n\nLinks to [[notes/gone]] and nothing else.\n\n<script>alert(1)</script>',
    truncated: false,
    links: {
      outbound: [{ target: 'notes/gone', exists: false }],
      inbound: ['notes/b'],
    },
  },
}
const key = process.argv.slice(2).join(' ')
const doc = docs[key]
if (doc !== undefined) {
  process.stdout.write(JSON.stringify(doc))
} else if (key.startsWith('page --json --id ')) {
  process.stdout.write(JSON.stringify({ schemaVersion: 1, error: 'page_not_found' }))
  process.exit(1)
} else {
  process.exit(64)
}
```

- [ ] **Step 2: List the commands in the e2e table.** In `e2e/globalSetup.ts`, replace the brain entry's `subcommands` with the instance's shape, so the adapter's `['doctor', '--json']` reaches the `--skip` entry through leading-argument lookup (D3):

```ts
        brain: {
          command: 'bin/brain',
          subcommands: [
            ['lint', '--json'],
            ['doctor', '--json', '--skip', 'credentials'],
            ['graph', '--json', '--no-html'],
            ['graph', '--json', '--related', '--limit', '50'],
            ['page', '--json', '--id', '{pageId}'],
          ],
        },
```

- [ ] **Step 3: Write the e2e spec.** `e2e/specs/brain.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('draws the brain graph and opens a page without its raw HTML', async ({
  page,
}) => {
  await signIn(page)
  await expect(
    page.getByRole('img', { name: /^Brain: Healthy/ }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Brain' }).first().click()
  await expect(
    page.getByRole('img', { name: 'Brain graph: 3 pages, 2 links, 1 orphan' }),
  ).toBeVisible()
  await page.getByText('Show pages').click()
  await page.getByRole('button', { name: 'notes/a' }).click()
  await expect(page).toHaveURL(/page=notes%2Fa/)
  const panel = page.getByRole('region', { name: 'Page' })
  await expect(panel.getByRole('heading', { name: 'Fixture page A' })).toBeVisible()
  await expect(panel).toContainText('(missing)')
  await expect(panel).not.toContainText('never forwarded')
  expect(await page.locator('article script').count()).toBe(0)
  await expect(page.getByRole('region', { name: 'Lint' })).toContainText(
    'dangling_link',
  )
})

test('loads related pages on demand and answers a missing page', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/brain')
  await page.getByRole('button', { name: 'Show related pages' }).click()
  await expect(
    page.getByRole('region', { name: 'Related, not linked' }),
  ).toContainText('notes/c')
  await page.goto('/brain?page=notes%2Fz')
  await expect(page.getByText('This page no longer exists.')).toBeVisible()
})
```

The first test's opening assertion also proves D3 against the old mismatch: with only the `--skip` doctor entry listed, Brain reads Healthy instead of `warn check_failed`.

- [ ] **Step 4: Add the screen to the width and accessibility sweeps.** In `e2e/specs/widths.spec.ts`, add `'/brain'` to the list of paths (after any paths 1b added). In `e2e/specs/a11y.spec.ts`, append inside the test, after the System check:

```ts
      await page.goto('/brain?page=notes%2Fa')
      await expect(
        page.getByRole('heading', { name: 'Fixture page A' }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
```

Headless Chromium in Playwright provides WebGL through SwiftShader; if it does not on the runner, the screen shows its no-WebGL notice and the sweeps still check the list, panels and layout.

- [ ] **Step 5: Run the end-to-end suite.** Another checkout may hold the shared e2e port; `assertPortFree` fails fast if so — wait for it, never kill it.

```bash
pnpm --filter @orbit/server build && pnpm e2e
```

Expected: every spec passes, `brain.spec.ts` included, at 375 and 768 px in both themes.

- [ ] **Step 6: Close the backlog item.** In `TODO.md`, remove the 1c item, and change the brain doctor item from `[!]` to `[~]` with this text:

```markdown
- [~] Brain health read `warn check_failed` because the adapters asked for
  `doctor --json` while the table listed `doctor --json --skip credentials`.
  Leading-argument lookup (1c, spec 5.3) now runs the listed entry; confirm on
  the instance once its table carries the `--skip` entry (owner step in the 1c
  plan), then close.
```

Prepend under `### October` in `TODO_LOG.md`:

```markdown
- 2026-10-03 [x] Brain screen (sub-project 1c): `{pageId}` placeholder and
  leading-argument lookup in the engine table, `/api/brain/graph|related|page|checks`
  with keyed caches, lazy `/brain` route with a sigma graph laid out by
  ForceAtlas2 and Louvain in a module worker, page view without raw HTML,
  related pairs on demand, lint, doctor and trend panels, palette pages.
  Evidence: plan `docs/superpowers/plans/2026-10-03-orbit-brain-screen.md`,
  `pnpm gate` green, `brain.spec.ts` and the width and axe sweeps over `/brain`.
```

- [ ] **Step 7: Gate and commit.**

```bash
for dir in apps/server apps/web packages/contract; do (cd "$dir" && pnpm exec prettier --write .); done
pnpm exec prettier --write e2e TODO.md TODO_LOG.md
pnpm gate
git add e2e TODO.md TODO_LOG.md
git commit -m "test(e2e): brain screen, placeholder and lookup end to end"
```

Expected: `pnpm gate` green (lint, types, unit tests with coverage, size-limit, knip, jscpd, e2e). Push only when the coordinator says so; other checkouts share the e2e port.

---

## Owner steps (not code tasks)

These change the instance, not this repository; the instance values stay out of the public repo.

1. **List the brain detail commands on the instance.** In the instance `orbit.json`, set `engines.brain.subcommands` to `['lint','--json']`, `['doctor','--json','--skip','credentials']` (already there), `['graph','--json','--no-html']`, `['graph','--json','--related','--limit','50']` and `['page','--json','--id','{pageId}']`. Restart orbit, run `orbit doctor` (it skips the placeholder entry and runs the rest), and confirm the Brain satellite leaves `warn check_failed`. Then close the `[~]` doctor item in `TODO.md`.
2. **Retire the static graph LaunchAgent (D16).** Once `/brain` shows the graph on the instance:

   ```bash
   launchctl bootout "gui/$(id -u)/com.brain.graph"
   rm ~/Library/LaunchAgents/com.brain.graph.plist
   ```

   If the instance's orbit label registry lists `com.brain.graph`, remove it there too so System does not report it missing. Note the retirement in the private instance's worker/orbit log, not in this repository.
3. **Review on the phone.** Open `/brain` over the tailnet on a phone: the tab bar fits seven items, the graph pans and pinches, a tap selects a page and the panels stack below.

## Self-review

- **Spec coverage.** Spec 4 table rows for `graph --no-html`, `graph --related --limit N` and `page --id`: Tasks 1, 4. Spec 5.3 listed arguments only, one validated placeholder: Task 3 (D2, D3). Spec 5.4 detail endpoints cached per key for the cadence, in memory only: Tasks 4-6. Spec 6.6 content handling (no raw HTML, safe links, content dropped on unmount): Tasks 6, 11 (D1). Spec 7 item 5: colour by type (Task 7), size by degree (Task 7, D8), orphans highlighted (Tasks 7, 9), filters by type and search (Task 10), local view depth 1-3 (Tasks 7, 10, D10), Louvain in a web worker (Task 8, D9), rendered page and links on selection (Task 11), related pairs on demand (Task 11, D5-D6), lint and doctor side panels (Task 12, D13). Spec 7.1 tokens and labelled colours: Task 9 legend. Spec 9 tests (pure units, sigma mocked at its boundary, e2e with fixture engines, 375/768 px, axe): Tasks 7-14. Spec 11 budgets (route chunk, initial route untouched): Task 9 size-limit entry. Spec 7 palette navigation to any page: Task 13 (D14). Graph never polled: D5, Tasks 9 and 13 (`staleTime: Infinity`, no refetch). Static graph retirement: owner step 2.
- **1b boundary.** Nothing here builds the Memory flow, Atrium or Clips screens, the history route's component list, `useTrend`, `TrendSection`, `DoctorList` or `toCheckRows`; Tasks 5 and 12 consume them as declared dependencies.
- **Placeholder scan.** No "TBD" or "similar to Task N". The two `If ... reports` notes in Tasks 9 and 11 name the exact fallback file, props and change, should a lint rule fire on a nested conditional or complexity.
- **Type consistency.** `BrainGraph`, `BrainRelated`, `BrainPage`, `BrainChecks` (Task 2) are the shapes every route (Tasks 5-6) returns and every hook (Tasks 9, 11-13) parses. `GraphModel`, `LayoutResult`, `GraphPalette`, `ColorMode`, `NodeStyleOptions` (Task 7) are what `useGraphLayout` (Task 8) and `selectBrainGraph` (Task 9) pass along. `BrainSearch`, `BrainSearchModel` and `withPage` (Task 9) are the props of every control and panel in Tasks 10-12. The query key `['brain', 'graph']` is shared by `useBrainView` and `usePalettePages`, with the same schema and options.
