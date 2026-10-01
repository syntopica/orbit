# orbit - design

Status: draft for review. Scope of this spec: sub-project 0 (Base) and
sub-project 1 (Memory). Later sub-projects get their own specs.

## 1. Purpose

One control panel for a Syntopica instance: see what every component is
doing, what failed, what is waiting for a human, and how the memory stack
moves information from agent sessions back into agent sessions. Act on it
where an action is safe and owned by the component.

orbit is an engine: a public repository with no instance data. Everything it
shows is discovered at runtime from the instance under `SYNTOPICA_DATA`.

### Success criteria

1. An operator who has never read the components' code can answer, from orbit
   alone: how a session becomes a retrievable episode, where each stage is now,
   and what is stuck.
2. Every component configured in the instance has a health state, its key
   counts, its pending items and its recent events on one screen, refreshed
   live, within 5 s of a change for the worker and 60 s for the slowest
   adapter.
3. A failing adapter degrades its own card to `down` with a reason; nothing
   else on the page breaks.
4. The panel is reachable from the operator's phone over the tailnet and from
   no other network.
5. The whole repository passes the codeality strict gate (section 11) on every
   commit.

### Non-goals (this spec)

- Worker job explorer, failures, results and actions: sub-project 2.
- Unified pending board across every TODO and inbox: sub-project 3.
- Cross-component actions beyond the ones listed in section 8: sub-project 5.
- Editing instance configuration from the UI.
- Multi-user accounts. One operator, several sessions.

## 2. Decomposition

| # | Sub-project | Content |
| --- | --- | --- |
| 0 | Base | Repository, contract, adapter runtime, server, auth, SSE, shell UI, Orbit home, System screen |
| 1 | Memory | Memory flow, Atrium, Brain (live graph), Clips screens; engine `--json` prerequisites |
| 2 | Worker | Jobs, failures, results with content view, nodes, executors, costs, worker actions |
| 3 | Pending | One triage board over TODOs, inboxes, curation proposals, lint |
| 4 | Remote | Tailscale serve, QR pairing, mobile polish |
| 5 | Actions | Cross-component actions: refresh, ingest, graph rebuild, launchd kickstart |

Sub-projects 0 and 1 ship together; 4's auth primitives (sessions, pairing)
are built in 0 because every later screen depends on them.

## 3. Components observed

The Syntopica components orbit reads in sub-projects 0 and 1. Each is a
separate engine with its own CLI; orbit never opens another engine's
database.

| Component | Role in the memory stack | State (instance-relative) | Read surface |
| --- | --- | --- | --- |
| agents | Owns the canonical conversation archive (layer 1) | `conversations/` | `conversations:doctor` |
| atrium | Disposable index and retrieval over archive, synthesis and notes | `atrium/` (index, synthesis registry, curation ledgers, proposals) | `atrium status`, `doctor`, `context --json` |
| brain | Curated markdown pages with `[[links]]` | `brain/` (pages, inbox, `log.md`, `index.md`) | `brain lint`, `doctor`, `graph`, `find --json` |
| clips | Capture-to-cited-pages pipeline | `clips/`, `clips-inbox/` | `clips status`, `doctor`, `audit` |
| capture | Phone URL inbox (remote service) | remote | HTTP API with bearer token |
| worker | Job processor running the AI passes | `worker/` | HTTP API `/v1/*`, CLI `--json` |
| launchd | Scheduled and kept-alive jobs of every component | user LaunchAgents | `launchctl print` |

### End-to-end memory flow (what screen "Memory flow" draws)

1. Sessions (Claude Code, Codex, Cursor, others) are exported into the
   archive by agents, hourly through atrium's refresh job.
2. The session-stop hook records an episode for sessions that owe one.
3. Atrium synthesis turns remaining sessions into episodes on a schedule,
   through lanes that include the worker.
4. Clips arrive through three lanes (browser clipper repository, capture API,
   newsletter harvest), are triaged and graded through the worker, and are
   ingested into brain pages behind a validator.
5. Atrium curation turns episodes into claim ledgers and proposals; the
   operator promotes proposals into brain pages.
6. Brain index, lint and graph maintain link health.
7. Atrium refresh ingests archive, synthesis and brain notes and embeds them.
8. Retrieval returns to sessions through the prompt hook and the MCP tools.

The stage list and edges are data in orbit (`flow-stages`), not code, so a
new stage is one entry. Each stage names the adapter metric that measures its
backlog and the timestamp that measures its freshness.

## 4. Engine prerequisites

orbit parses no human-readable output. Before an adapter ships, its engine
gains a machine-readable surface, in its own repository, under that
repository's rules:

| Engine | Command | Shape (minimum) |
| --- | --- | --- |
| atrium | `atrium status --json` | records per source; archive, refresh and content ages; per-population registry/intended/indexed; synthesis last pass (synthesized, deferred) |
| atrium | `atrium doctor --json` | checks with `name`, `ok`, `detail` |
| atrium | `atrium proposals --json` | proposal id, title, created, source episode count |
| brain | `brain lint --json` | issues with `page`, `code`, `message`; `index_stale` |
| brain | `brain doctor --json` | checks with `name`, `ok`, `detail` |
| brain | `brain graph --json` | nodes (`id`, `type`, `title`, `degree`), edges, orphans, dangling, related-unlinked pairs |
| clips | `clips status --json` | counts per state; per-day intake |
| clips | `clips doctor --json` | checks with `name`, `ok`, `detail` |

Each JSON output carries `"schemaVersion": 1`. orbit's adapter rejects an
unknown major version with health `down`, reason `engine_schema_unsupported`.

## 5. Architecture

pnpm workspace, TypeScript everywhere.

```
apps/web          Vite + React SPA (codeality vite-react-app template)
apps/server       Hono on Node: API, SSE, static files, adapters
packages/contract zod schemas shared by server and web
```

### 5.1 Adapter contract

Every adapter implements one interface, defined in `packages/contract`:

```ts
type Health = { state: 'ok' | 'warn' | 'down' | 'unknown'; reason: string | null }
type Metric = { key: string; label: string; value: number; unit: string | null; at: string }
type Pending = { key: string; label: string; count: number; oldestAt: string | null; resolveHint: string }
type OrbitEvent = { id: string; at: string; component: string; kind: string; summary: string; severity: 'info' | 'warn' | 'error' }
type Snapshot = { component: string; health: Health; metrics: Metric[]; pending: Pending[]; events: OrbitEvent[]; observedAt: string }
```

An adapter is `{ id, cadenceMs, detect(instance), read(instance, signal) }`.
`detect` returns false when the component is not configured, and the
component is then absent from the UI. `read` returns a `Snapshot` and must
finish within its timeout (default 15 s); a timeout or a thrown error yields a
`down` snapshot with an allowlisted reason code.

Adapters run in the server's scheduler at their cadence (worker 2 s, launchd
10 s, atrium/brain/clips 60 s, capture 120 s). Snapshots are kept in memory;
the last good snapshot is kept beside a `down` one so the UI can show stale
data with its age.

Subprocesses are started with `execFile` (no shell), a fixed argument list, a
timeout, a maximum output size (default 8 MB) and an environment that passes
`SYNTOPICA_DATA` and `PATH` only. The output is validated with the engine's
zod schema before use.

### 5.2 Detail endpoints

Screens that need more than a snapshot (the brain graph, a page body, a
proposal, an atrium query) call detail endpoints, each backed by one adapter
function with the same timeout and validation rules. Results are cached per
key for the adapter's cadence.

### 5.3 Live updates

`GET /api/stream` is a Server-Sent Events stream. On connect it sends every
current snapshot; afterwards it sends a snapshot only when its content hash
changes, and each new event. A heartbeat comment every 15 s keeps proxies
open. The client reconnects with `Last-Event-ID`; the server keeps a ring of
the last 500 events to replay.

### 5.4 Observation history

Heartbeat strips, freshness trends and synthesis pass history need more than
the current snapshot. orbit keeps its own append-only store,
`SYNTOPICA_DATA/orbit/history.sqlite3`, holding metadata only: per adapter
and metric, `(component, key, value, at)`; per launchd label,
`(label, exit_code, pid, at)` recorded on every change; and audited actions.
No content is ever written there. Raw rows are kept 7 days, hourly rollups
90 days. The store is orbit's own state and the only database orbit writes.

### 5.5 Instance discovery

The server reads `syntopica.config.json` (and the `syntopica.local.json`
overlay) from `SYNTOPICA_DATA` at start and on change. Engine paths come from
`engines.<name>.path`. orbit's own settings live under an `orbit` section:
listen port, allowed tailnet logins, adapter cadence overrides.

## 6. Security

- **Bind.** The server listens on `127.0.0.1` only. Remote access is
  `tailscale serve` in front of it (sub-project 4); orbit never binds a
  non-loopback address.
- **Sessions.** Every `/api/*` request needs a session. A session is opened
  by presenting the orbit admin token (created by `orbit token create`,
  stored hashed under `SYNTOPICA_DATA/orbit/`) or a one-time pairing code
  (`orbit pair`, 5 min, single use, shown as a QR code). The session is a
  random 256-bit value in a cookie with `HttpOnly; Secure; SameSite=Strict;
  Path=/`, stored hashed with a 7-day sliding expiry; `orbit sessions list`
  and `orbit sessions revoke` manage them.
- **Tailnet identity.** When the request carries `Tailscale-User-Login`, it
  must be in `orbit.allowedLogins`; otherwise 403. This is defence in depth,
  not the primary check, because a loopback client can forge the header.
- **CSRF.** Mutating requests require a matching `Origin` and the header
  `X-Orbit: 1`.
- **Headers.** Strict CSP with no third-party origins, `frame-ancestors
  'none'`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store` on every
  API response.
- **Content.** Page bodies, proposal bodies and atrium query results are
  content. They are fetched on demand, never put in the event stream, never
  logged, and never persisted by the client (no localStorage, no service
  worker cache). Job content and the `secret` reveal belong to sub-project 2,
  which inherits these rules.
- **Credentials.** orbit reads tokens it needs (worker admin token, capture
  token) from the instance at call time and never returns them to the
  client. Errors carry reason codes only.
- **Rate limits.** Session creation and pairing are limited to 10 attempts
  per minute.

## 7. Screens

All screens share a shell: left rail on desktop, bottom tab bar under 768 px,
command palette (`Cmd-K` / `Ctrl-K`) that both navigates (any component,
stage, page or proposal) and runs the actions of section 8, filtered views
encoded in the URL so they can be bookmarked, connection indicator (live, stale,
offline), toast on any component turning `down`.

1. **Orbit (home).** Components as satellites around a core, each with a
   health ring, one headline metric and a pulse whose rate follows activity.
   Below: a pending strip (one chip per non-zero `Pending`, sorted by age) and
   a live event ticker. On a phone the orbit collapses to a list of cards.
2. **Memory flow.** The stages of section 3 drawn as a directed flow. Each
   stage is treated as an asset with a freshness policy (a maximum age per
   stage, declared in `flow-stages`): it shows its backlog, its last run and
   a freshness badge that turns warn and then down as the age passes the
   policy. Edges animate particles at a rate proportional to measured
   throughput, and stop when a stage is stale. Selecting a stage opens a side panel with a plain-language
   explanation of what the stage does, its metrics, its pending items and the
   launchd job that drives it.
3. **Atrium.** Records per source, index/archive/refresh freshness, synthesis
   pass history (synthesized vs deferred), populations not in the index, the
   curation proposals list with a detail view, and a context inspector: a
   query playground that runs `atrium context --json` and shows exactly what
   a session would receive, split into labelled blocks (episodes, notes) with
   their sizes against the injection budget.
4. **Brain.** A live WebGL graph of pages and links: colour by page type,
   size by degree, orphans highlighted, filters by type and by search, focus
   mode on a node's neighbourhood at depth 1-3, community colouring
   (Louvain), and a global/local toggle. Selecting a node shows the rendered page,
   its inbound and outbound links and its related-unlinked suggestions. Side
   panels: lint issues, doctor checks, inbox, recent `log.md` entries.
5. **Clips.** A funnel of capture lanes into pending, needs-review and
   reconciled, intake per day, and the oldest stuck items.
6. **System.** Every LaunchAgent belonging to a configured component as one
   row: label, running pid, schedule, and a heartbeat strip of ticks coloured
   by exit code (missed scheduled runs shown explicitly) over 24 h / 7 d /
   30 d from the history store; every engine's doctor checks.

### 7.1 Visual language

- Dark default (near-black with a blue tint), light theme available; theme
  tokens as CSS variables.
- Accents: electric cyan for activity, violet for memory, semantic ok / warn
  / down colours checked for WCAG AA contrast in both themes.
- Type: Geist for text, Geist Mono for numbers and ids, self-hosted.
- Motion: a faint background grid, glow only on live elements, numeric
  tweening, pulses tied to real cadence. `prefers-reduced-motion` turns
  animation off.
- No decoration without data: every animated element encodes a measured
  value.

## 8. Actions in scope

Actions are explicit, confirmed in the UI, and executed by the owning engine's
CLI; orbit never edits another engine's files.

| Action | Executes | Screen |
| --- | --- | --- |
| Rebuild brain graph | `brain graph --json` (refreshes cache) | Brain |
| Promote / reject a curation proposal | atrium's proposal command | Atrium |
| Re-run an engine doctor | the engine's `doctor --json` | System |

Each action is an audited event (who, what, when, outcome code). Anything
else is sub-project 5.

## 9. Error handling

- Adapter error: `down` snapshot with reason code from a closed set
  (`timeout`, `exit_nonzero`, `output_too_large`, `schema_invalid`,
  `engine_schema_unsupported`, `not_found`, `unauthorized`, `unreachable`).
  The UI shows the last good snapshot greyed with its age.
- Stream loss: the client shows `offline`, retries with backoff, and replays
  from `Last-Event-ID`.
- Server errors return `{ "error": "<code>" }` only.

## 10. Testing

- **Contract:** every engine `--json` schema has a fixture taken from a
  synthetic instance (the public test-data instance), validated in tests.
- **Server:** Vitest unit tests per adapter with fake `execFile` and fake
  clock; integration tests for auth, CSRF, headers, SSE replay and adapter
  isolation (one adapter hanging does not delay others).
- **Web:** Vitest + Testing Library per component, `vitest-axe` on every
  screen.
- **End to end:** Playwright against the server running on the synthetic
  instance: login, pairing, each screen paints its data, a forced adapter
  failure shows `down` without breaking the page.
- **Visual:** `ui-quality` measurements and a screenshot review per screen
  at desktop and phone widths, both themes.

## 11. Quality gate (codeality strict)

- Templates: `apps/web` from codeality `vite-react-app`; `apps/server` and
  `packages/contract` from `ts-package`. Shared `@syntopica/eslint-config`,
  `prettier-config`, `tsconfig`, `quality-config` unmodified.
- No `eslint-disable`, no suppression baseline, `--max-warnings 0`. The only
  rule overrides are the template's own (entry points, declaration files).
- One exported unit per file (`code-policy/atomic-file`).
- type-coverage 100 %, test coverage at least 90 % lines and branches,
  ratchet only upward.
- knip and jscpd clean; dependency-cruiser forbids `web -> server`,
  `adapter -> adapter`, and anything importing `apps/*` from
  `packages/contract`.
- gitleaks, `baseline-audit --level moderate`, `size-limit` on the web bundle.
- One command, `pnpm gate`, runs `check:ci`, `check:quality` and
  `check:security` for every workspace package; lefthook runs it before push
  and CI runs it on every push. Nothing is pushed red.

## 12. Deployment

- `orbit serve` runs the server; `launchd/com.syntopica.orbit.plist.template`
  runs it as a user LaunchAgent with `KeepAlive`.
- The web bundle is built by `pnpm build` into `apps/server/dist/public`,
  never committed.
- `orbit doctor` checks: instance found, config valid, each detected engine
  CLI resolvable, token present, port free.

## 13. Open items for planning

- Exact atrium proposal command names (to be read from atrium before its
  adapter task).
- Whether `brain graph --json` computes related-unlinked pairs within the 60 s
  budget on the full instance; otherwise it becomes an on-demand detail call.
- Library versions: confirmed against current documentation (Context7) when
  the plan is written; section 14 names the choices.

## 14. Inspiration and library choices

Surveyed 2026-10-01. Adopted in this spec:

| Source | Idea | Where |
| --- | --- | --- |
| Dagster | Stages as assets with freshness policies | Memory flow |
| React Flow examples | Particles along edges scaled by throughput | Memory flow |
| Uptime Kuma | Heartbeat strip per check with range selector | System |
| Letta ADE | Context-window inspector in labelled blocks | Atrium |
| Quartz graph | Local depth-N graph beside the global graph | Brain |
| Linear, Vercel | Keyboard-first lists, Cmd-K that runs actions | Shell |
| Trigger.dev | Filtered views stored in the URL | Shell |
| Glance | Column layout that collapses cleanly on a phone | Orbit home |

Recorded for later sub-projects: Inngest/Temporal attempt waterfall with
ladder fallback reasons (2); Helicone cost rollups per executor, queue and
day (2); Langfuse judge-score trends with click-through to the judge run (2);
Beszel/Hatchet node cards with slot use and sparklines (2); Vibe Kanban
board-plus-detail split pane (3); Phoenix embedding projection of the index
and Zep/Graphiti bi-temporal facts with a time slider (later, needs engine
support).

Library choices:

- Graph: sigma 3 with graphology (ForceAtlas2 in a web worker, Louvain,
  neighbourhood queries) through `@react-sigma/core`. Handles the brain's
  hundreds to low thousands of nodes with readable labels.
- Flow diagram: `@xyflow/react` with custom stage nodes and animated edges.
- Charts: Recharts for panels; uPlot for dense live sparklines and heartbeat
  strips.
- Command palette: `cmdk`.
- Data and routing: TanStack Query and TanStack Router; Motion for animation;
  Tailwind 4 from the codeality template.
