# orbit - design

Status: draft, revision 7 (after adversarial review rounds 1 to 3 and the
implementation of sub-project 0). Scope: sub-project 0 (Base) and sub-project 1
(Memory). Later sub-projects get their own specs.

### Change log

**Revision 5 (implementation of sub-project 0).** What building the Base
decided differently from revision 4, applied in place in the sections named:

- 5.1: the ref charset admits `_`.
- 5.3: the engine command table is deferred to sub-project 1; sub-project 0
  runs only `launchctl` and `plutil`.
- 5.5: the SSE heartbeat is a named `ping` event; the client resyncs when it
  replaces a dropped stream.
- 5.7: launchd observations are kept 90 days (the latest per label is never
  pruned); metric samples stay at 7 days.
- 5.8: missed-run windows, yearly jobs and keepalive health as built.
- 7.2 (new): heartbeat strips are SVG, with exact bucket states, ranges and
  precedence; the history route returns the server's `now`; the command
  palette and home pulse implementation notes.
- 11, 13: the Vite dev proxy rewrites `Origin`; uPlot is not used in
  sub-project 0.

**Revision 6 (worker screen).** 7.3 (new): the Worker screen, its
`GET /api/worker` detail route, the diagnosis rules, and event refs and
folded runs in the home ticker.

**Revision 7 (worker activity charts).** 7.3: `GET /api/worker/activity`,
the Worker screen's range control, activity, per-queue, failure and
OpenRouter charts with progressive disclosure, and the lazy Worker route;
7.1: chart palette and mark rules; 13: visx replaces Recharts for panels.

**Revision 4.** After adversarial review rounds 1 to 3.

## 1. Purpose

One control panel for a Syntopica instance: see what every component is doing,
what failed, what is waiting for a human, and how the memory stack moves
information from agent sessions back into agent sessions.

orbit is an engine: a public repository with no instance data. Everything it
shows is discovered at runtime from the instance under `SYNTOPICA_DATA`.

Sub-projects 0 and 1 are **read-only**. orbit writes only its own state
(section 5.6). Actions on other components belong to sub-project 5.

### Success criteria

1. An operator who has never read the components' code can answer, from orbit
   alone: how a session becomes a retrievable episode, where each stage is now,
   and what is stuck.
2. Every component in the first-release set (section 3.1) shows a health
   state, key metrics, pending items and recent events, within the freshness
   target of its row in that table.
3. A component that is configured but failing shows `down` with a reason code,
   and its last good data greyed with its age; nothing else on the page is
   affected, and no other adapter is delayed.
4. The panel is reachable from the operator's devices over the tailnet HTTPS
   address and from no other network.
5. The repository passes `pnpm gate` (section 11) on every pushed commit.

### Non-goals (this spec)

- Any write to another component, including curation proposal review and
  brain graph rebuilds (sub-project 5).
- Worker job explorer, failures, results, content view and actions
  (sub-project 2).
- Unified pending board across every TODO and inbox (sub-project 3).
- Editing instance configuration from the UI.
- Multi-user accounts. One operator, several sessions.

## 2. Decomposition

| # | Sub-project | Content |
| --- | --- | --- |
| 0 | Base | Repository and gate, contract, adapter runtime, server, auth and pairing, SSE, history store, shell UI, Orbit home, System screen; adapters: launchd, worker summary, synthetic |
| 1 | Memory | Engine prerequisites; adapters atrium, brain, clips, capture; screens Memory flow, Atrium, Brain, Clips |
| 2 | Worker | Jobs, failures, results with content view and `secret` reveal, nodes, executors, costs, worker actions |
| 3 | Pending | One triage board over TODOs, inboxes, curation proposals, lint |
| 4 | Remote | Mobile polish, phone-specific layouts beyond the responsive shell |
| 5 | Actions | Writes through engine APIs: proposal review (after Atrium specifies a review API), graph rebuild, launchd kickstart, refresh, ingest |

Sub-project 0 ships before any sub-project 1 screen. Each sub-project 1 screen
is admitted only when its engine contract (section 4) has landed in the engine
and its full-instance benchmark meets its budget.

## 3. Components

orbit never opens another engine's database and never parses human-readable
output.

| Component | Role in the memory stack | Read surface |
| --- | --- | --- |
| agents | Owns the canonical conversation archive | via atrium status (archive age) |
| atrium | Disposable index and retrieval over archive, synthesis and notes | `atrium/status/{refresh,synthesis}.json` written by atrium (section 4), `atrium doctor --json`, `atrium context --json` |
| brain | Curated markdown pages with `[[links]]` | `brain lint --json`, `brain doctor --json`, `brain graph --json` |
| clips | Capture-to-cited-pages pipeline | `clips status --json`, `clips doctor --json` |
| capture | Phone URL inbox, a remote service | its HTTP API, count endpoint (section 4) |
| worker | Job processor running the AI passes | its HTTP API `GET /v1/status` |
| launchd | Scheduled and kept-alive jobs | `launchctl print`, the plists named in orbit's label registry |

### 3.1 First-release set and freshness targets

| Component | Sub-project | Cadence | Freshness target |
| --- | --- | --- | --- |
| launchd | 0 | 10 s | 20 s |
| worker (summary: health, queue counts, cooldowns) | 0 | 5 s | 10 s |
| capture (undrained count) | 1 | 120 s | 240 s |
| atrium | 1 | 60 s (reads a file) | 2 x the engine's own refresh interval for index data; 120 s for orbit's read |
| brain | 1 | 60 s | 120 s |
| clips | 1 | 60 s | 120 s |

Freshness target = maximum age of the data on screen while the component is
healthy. Data older than its target turns the card `warn` (`stale`).

### 3.2 Configured, absent, unavailable

- **Not configured**: the instance names no such component (no engine path,
  no label registry entry, no API address). The component is absent from the
  UI.
- **Configured but unavailable**: configured, yet its CLI, file or API cannot
  be read. The component is shown `down` with a reason code.
- A `brain` or `clips` entry in `orbit.json` whose instance configuration has
  no checkout path, or whose command does not resolve, reads `down not_found`:
  configured in `orbit.json` means configured, not absent.

### 3.3 End-to-end memory flow (what "Memory flow" draws)

1. Sessions are exported into the archive by agents, hourly through atrium's
   refresh job.
2. The session-stop hook records an episode for sessions that owe one.
3. Atrium synthesis turns remaining sessions into episodes on a schedule,
   through lanes that include the worker.
4. Clips arrive through three lanes (browser clipper repository, capture API,
   newsletter harvest), are triaged and graded through the worker, and are
   ingested into brain pages behind a validator.
5. Atrium curation turns episodes into claim ledgers and review sheets; a
   human edits brain pages from them.
6. Brain index, lint and graph maintain link health.
7. Atrium refresh ingests archive, synthesis and brain notes and embeds them.
8. Retrieval returns to sessions through the prompt hook and the MCP tools.

Stages and edges are data in orbit (`flow-stages`), not code. Each stage names
the metric that measures its backlog, the timestamp that measures its
freshness, its freshness policy (maximum age) and its launchd label if any.

## 4. Engine prerequisites (sub-project 1)

Each lands in its own engine repository under that repository's rules, with a
fixture from the public synthetic instance. Every JSON document carries
`"schemaVersion": 1`; orbit marks an unknown major version `down` with
`engine_schema_unsupported`.

**Performance budget.** Any command orbit polls must finish within p95 2 s and
use under 300 MB RSS on the full instance, measured before its adapter ships.
A command that cannot meet it is not polled: the engine writes the document to
a file at the end of work it already does, and orbit reads the file.

| Engine | Surface | Shape (minimum) | How it meets the budget |
| --- | --- | --- | --- |
| atrium | `atrium/status/refresh.json`, written only by the refresh job at its end | records per source; archive, refresh and content ages; per-population registry/intended/indexed; `writtenAt` | written by a job that already runs; orbit reads a file |
| atrium | `atrium/status/synthesis.json`, written only by the synthesis job at its end | last pass: synthesized, deferred, started, finished; `writtenAt` | same |
| atrium | `atrium doctor --json` | checks `name`, `ok`, `code` | benchmarked; on-demand only if over budget |
| atrium | `atrium context --json` | existing contract | on-demand detail call only |
| brain | `brain lint --json` | issues `page`, `code`; `indexStale` | benchmarked |
| brain | `brain doctor --json` | checks `name`, `ok`, `code` | benchmarked |
| brain | `brain graph --json --no-html` | read-only: nodes (`id`, `type`, `degree`), edges, orphans, dangling; never writes `graph.html` | benchmarked; related-unlinked pairs excluded |
| brain | `brain graph --json --related --limit N` | top N related-unlinked pairs | on-demand detail call; benchmarked separately |
| brain | `brain page --json --id <id>` | one page's frontmatter, body and links; `id` validated against the configured page roots, no path traversal, body capped at 1 MB | on-demand detail call |
| clips | `clips status --json` | counts per state; intake per day | benchmarked |
| clips | `clips doctor --json` | checks `name`, `ok`, `code` | benchmarked |
| capture | `GET /api/captures/count` (bearer) | `{ "data": { "schemaVersion": 1, "count": n, "oldestAt": t } }` (`oldestAt` may carry any offset; orbit normalises it to UTC, or null when unparseable) | one indexed query on the service |

Each status file has exactly one writer and is published atomically: written
to a temporary file in the same directory, `fsync`ed, then renamed over the
target. orbit therefore never reads partial JSON, and no job can overwrite the
other's fields. A file whose `writtenAt` is older than its freshness policy is
reported `stale`.

Doctor checks carry a `code`, not free text, so orbit can display and store
them without content (section 6.6).

Curation proposals are not read in this spec: atrium today writes a manifest
and review sheet with `curate-propose` and leaves wiki edits to a human. A
proposal list and review API are specified in atrium first, then consumed by
sub-projects 3 and 5.

## 5. Architecture

pnpm workspace, TypeScript everywhere.

```
apps/web          Vite + React SPA (codeality vite-react-app template)
apps/server       Hono on Node: API, SSE, static files, adapters, CLI
packages/contract zod schemas shared by server and web
```

### 5.1 Adapter contract

Defined in `packages/contract`:

```ts
type HealthState = 'ok' | 'warn' | 'down'
type ReasonCode = 'stale' | 'timeout' | 'exit_nonzero' | 'output_too_large'
  | 'schema_invalid' | 'engine_schema_unsupported' | 'not_found'
  | 'unauthorized' | 'unreachable' | 'lagging' | 'check_failed'
  | 'permission_denied'
type Health = { state: HealthState; reason: ReasonCode | null }
type Metric = { key: MetricKey; value: number; at: string }
type Pending = { key: PendingKey; count: number; oldestAt: string | null }
type OrbitEvent = { at: string; component: ComponentId; kind: EventKind;
  severity: 'info' | 'warn' | 'error'; refs: Record<string, string | number> }
type Snapshot = { component: ComponentId; health: Health; metrics: Metric[];
  pending: Pending[]; events: OrbitEvent[]; observedAt: string;
  lastGood: Omit<Snapshot, 'lastGood'> | null }
```

`MetricKey`, `PendingKey` and `EventKind` are closed enums per component.
Labels, units, explanations and "where to resolve" hints are UI strings keyed
by those enums, not data from engines. Event `refs` hold opaque ids (job ids, attempt
ids, launchd labels from the registry), counts and closed codes only,
validated by a per-kind schema with string values capped at 64 characters and
matching `^[A-Za-z0-9_.:-]+$`, at most eight refs per event. Path-derived identifiers such as brain page ids
are content: they are never streamed, and are resolved only through
authenticated detail endpoints.

An adapter is `{ id, cadenceMs, timeoutMs, configured(instance), read(instance, signal) }`.

### 5.2 Scheduler

- **Single flight per adapter.** A tick that finds the previous read still
  running is skipped, never queued, and the snapshot is marked `lagging`.
  After a timeout the loop waits for the aborted read to settle for at most
  ten times the adapter's timeout; a read that ignores its abort longer than
  that is abandoned so the adapter keeps polling.
- **Backoff.** After a failed read the next attempt waits cadence x 2^n,
  capped at 10 x cadence; a success resets it.
- **Bounded subprocesses, no shared polling slot.** Polling is already capped
  at one subprocess per adapter by single flight, so polling needs no shared
  pool: the total is bounded by the number of adapters, and one adapter's hang
  can only skip its own ticks. Detail calls have their own pool of 2 slots,
  FIFO, timeout counted from enqueue, and never touch polling.
- **Isolation test.** With any number of other adapters hung, every healthy
  adapter's tick starts within 100 ms of schedule. A hung adapter's skipped
  ticks mark it `lagging`, and its data turns `stale` once past its freshness
  target.

### 5.3 Subprocesses

- Sub-project 0 runs only two commands, `launchctl` and `plutil`, whose
  absolute paths are the `orbit.json` keys `launchd.launchctl` and
  `launchd.plutil` (defaults `/bin/launchctl` and `/usr/bin/plutil`). The engine
  command table described below is deferred to sub-project 1, where the first
  engine CLIs (atrium, brain, clips) are read; it is not part of the
  sub-project 0 configuration.
- `engines.<name>.path` in the instance config is the engine's checkout
  directory, not an executable. orbit's engine table in `orbit.json` names,
  per engine, the command (a path relative to that checkout, or an absolute
  path) and the subcommands orbit may run; anything else is refused. The
  command is resolved once at start to an absolute path; a missing or
  non-executable file is `not_found`.
- `spawn` with `shell: false`, a fixed argument list, `detached: true` so the
  child leads its own process group; on timeout or abort the whole group gets
  `SIGTERM`, then `SIGKILL` after 5 s.
- Output cap 8 MB per stream; exceeding it kills the group with
  `output_too_large`.
- Environment: an allowlist (`PATH`, `HOME`, `SYNTOPICA_DATA`, `LANG`) plus the
  extra variables each engine declares in orbit's engine table (for example a
  uv cache directory). `orbit doctor` runs every engine command once with its
  exact environment and reports failures.
- Detail calls with user input (`atrium context`) cap the query at 500
  characters and pass it as one argument, never interpolated.

### 5.4 Detail endpoints

Screens needing more than a snapshot (brain graph, a page body, related pairs,
an atrium context query) call detail endpoints backed by one adapter function
under the same subprocess rules. Results are cached per key for the adapter's
cadence, in memory only.

### 5.5 Live updates (SSE)

- `GET /api/stream`. Every message, snapshot or event, carries a monotonically
  increasing stream id.
- On connect without `Last-Event-ID`: the current snapshot of every component,
  then a `sync` message carrying the last id; the client renders only after
  `sync`.
- On reconnect with `Last-Event-ID` inside the ring (last 1000 messages): the
  missed messages in order. Outside the ring or after a server restart: a
  `resync` message followed by the full snapshot set and `sync`.
- A snapshot message is sent only when its content hash changes. Heartbeat:
  every 15 s the server sends a named event, `event: ping` with `data: 1` and
  no `id:` line. It is not a comment line, because comments never reach the
  client's `EventSource` and so cannot feed its watchdog; an empty data buffer
  is not dispatched by browsers, hence `data: 1`; and with no `id:` the
  client's `Last-Event-ID` stays that of the last real message.
- The client's watchdog marks the stream stale after 45 s without a message or
  `ping`. When the browser gives up on a stream and the client opens a
  replacement `EventSource`, that source carries no `Last-Event-ID`, so the
  server sends a full opening without `resync`. The client therefore applies a
  synthetic `resync` on that source's first open, which drops the state it
  holds so the fresh opening never duplicates it.
- Stream ids start at the server's start time in milliseconds, so a restart
  always numbers above every id issued before it.
- Each ping re-validates the session; a revoked or expired session ends the
  stream, and the client's probe then routes to login.
- Snapshots and events carry no content (section 6.6).

### 5.6 orbit's own state

All under `SYNTOPICA_DATA/orbit/`, the only place orbit writes:

- `orbit.json`: orbit's settings and the authoritative file for them (listen
  port, allowed hosts, allowed tailnet logins, engine table with extra
  environment, launchd label registry, cadence overrides). `syntopica.config.json`
  is read for engine paths only and is never modified; its schema stays
  unchanged.
- `auth.sqlite3`: hashed admin token, hashed sessions, hashed pairing codes,
  rate-limit counters.
- `history.sqlite3`: observation history (section 5.7).

Files are created `0600`, the directory `0700`.

### 5.7 Observation history

- Tables: metric samples `(component, key, value, at)`; launchd observations
  `(label, pid, runs, last_exit, at)`, written only when a value changes;
  hourly rollups unique on `(component, key, hour)`; orbit run intervals
  `(started, stopped)`.
- Only enum keys, numbers, codes and timestamps are stored.
- WAL mode, `PRAGMA wal_autocheckpoint` default, a `wal_checkpoint(TRUNCATE)`
  after each hourly prune.
- Hourly prune: metric samples older than 7 days; launchd observations older
  than 90 days, except that each label's latest observation is never pruned
  (observations are written only on change, so a quiet label's newest row can
  be arbitrarily old and is still its baseline); rollups and run intervals
  older than 90 days. Hard cap 200 MB: past it, oldest raw rows are deleted
  first.
- Periods outside an orbit run interval are "no observation" and drawn as
  unknown, never as healthy or failed.

### 5.8 launchd

- Labels come only from the registry in `orbit.json`: component, label, role
  (`scheduled` or `keepalive`), plist path.
- Schedules are read from the plist (`StartInterval`, `StartCalendarInterval`)
  with `plutil -convert json -o -`.
- `launchctl print gui/<uid>/<label>` gives state, pid, run count and last
  exit; parsed with a tested parser over captured fixtures, failing closed to
  `schema_invalid` on an unrecognised format.
- A scheduled run is "missed" only when orbit observed the whole expected
  window and the run count did not increase; otherwise no miss is claimed and
  the bucket is drawn `idle` (section 7.2).
  The expected window is 1.5 x the schedule period (`StartInterval`, or the
  smallest period implied by `StartCalendarInterval`: a month field 366 days, a
  day field 31 days, a weekday 7 days, an hour 1 day, a minute 1 hour). A
  monthly calendar job's window therefore reaches 46.5 days before the end of
  the bucket, so the history read looks back 47 days before the start of the
  chosen range. Observations are kept 90 days (section 5.7), so a yearly
  calendar job's window is never covered and such a job is never claimed
  missed.
- A `keepalive` job is healthy while it has a pid; with no pid it is failing,
  and the launchd card turns `warn` with `check_failed`, not `down`. Exit codes
  are not consulted for keepalive jobs. A `scheduled` job is failing when it has
  no pid and a non-zero last exit; a label launchd does not know is failing too.

## 6. Security

### 6.1 Access path

- orbit listens on `127.0.0.1` only.
- The canonical address on every device, the Mac included, is the tailnet
  HTTPS address published by `tailscale serve` in front of the loopback port.
  `http://127.0.0.1:<port>` exists for `orbit` CLI calls and development.
- **Host allowlist.** Every request's `Host` must be `127.0.0.1:<port>`,
  `localhost:<port>` or a tailnet name listed in `orbit.json`; anything else is
  rejected with 421 before routing. This blocks DNS rebinding.

### 6.2 Sessions

- Every `/api/*` route needs a session except two:
  `POST /api/session` (admin token) and `POST /api/pair` (pairing code).
- The admin token is 256 bits from the OS CSPRNG, created by
  `orbit token create`, shown once, stored as a SHA-256 hash.
- A session is 256 random bits in the cookie `__Host-orbit_session` with
  `HttpOnly; Secure; SameSite=Strict; Path=/`, stored hashed, sliding expiry 7
  days, absolute expiry 30 days. `orbit sessions list|revoke` manage them.
- The two unauthenticated routes return the same `401 {"error":"unauthorized"}`
  for every failure, reveal no token or session state, and are rate limited
  per source address and globally (section 6.4).

### 6.3 Pairing

- `orbit pair` (local CLI only) creates an invitation: a public 64-bit id and
  a 128-bit secret, both random, stored as id plus secret hash with a 5-minute
  expiry. It prints a QR code of `https://<tailnet-name>/pair#<id>.<secret>`
  plus the same URL as text. Both parts are in the fragment so they never reach
  proxies or logs; the page posts them to `POST /api/pair`.
- Failed secrets are counted against the invitation id; after 5 failures the
  invitation is invalidated. Redemption is atomic: one transaction checks the
  secret, marks the invitation used and creates the session.

### 6.4 Rate limits

`POST /api/session` and `POST /api/pair`: 5 per minute per source address, 30
per minute globally, counted in `auth.sqlite3` so a restart does not reset
them.

### 6.5 Request integrity

- **Origin.** Every cookie-authenticated request, `GET` and the SSE stream
  included, must carry an `Origin` (or, for same-origin `GET`, a
  `Sec-Fetch-Site: same-origin`) matching an allowed host.
- **CSRF.** Mutating requests additionally require `X-Orbit: 1`.
- **Tailnet identity.** `Tailscale-User-Login` is never proof of identity,
  because a loopback client can forge it. If present and not in
  `orbit.json` `allowedLogins`, the request is refused with 403. Sessions
  remain the only authentication.
- **Headers.** CSP `default-src 'self'` with no third-party origins,
  `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`,
  `Cache-Control: no-store` on every API response.

### 6.6 Content

- Content is anything an engine stores about the operator's life or work:
  page titles and bodies, episode text, query results, clip titles, job
  payloads.
- Content appears only in detail endpoint responses, fetched on demand. It
  never appears in snapshots, events, the SSE stream, the history store,
  logs, error responses or audit records.
- The client never persists content: no localStorage, IndexedDB or service
  worker cache; TanStack Query entries holding content are garbage-collected
  when their screen unmounts.
- Markdown is rendered without raw HTML (no `rehype-raw`), links get
  `rel="noopener noreferrer"`, and remote images are blocked by the CSP.
- Credentials orbit needs (worker admin token, capture token) are read from
  the instance at call time, never returned to the client, never logged.

## 7. Screens

All screens share a shell: left rail on desktop, bottom tab bar under 768 px,
a command palette (`Cmd-K` / `Ctrl-K`) for navigation to any component,
stage, page or screen, filtered views encoded in the URL, a connection
indicator (live, stale, offline), and a toast when a component turns `down`.

**Sub-project 0**

1. **Orbit (home).** Components as satellites around a core, each with a
   health ring, one headline metric and a pulse whose rate follows its update
   cadence. Below: a pending strip (one chip per non-zero `Pending`, oldest
   first) and a live event ticker. Under 768 px the orbit becomes a list of
   cards.
2. **System.** One row per registered launchd label: component, role,
   schedule, pid, and a heartbeat strip of observations coloured by exit code,
   unknown periods grey, over 24 h / 7 d / 30 d (section 7.2).

**Sub-project 1** (each admitted per section 2)

3. **Memory flow.** The stages of section 3.3 as a directed flow. Each stage
   is an asset with a freshness policy: backlog, last run, freshness badge
   (`ok` within policy, `warn` past it, `down` past twice). Edge particles
   move at a rate proportional to measured throughput and stop when the
   upstream stage is stale. Selecting a stage opens a side panel with a
   plain-language explanation, its metrics, pending items and launchd label.
4. **Atrium.** Records per source, index/archive/refresh freshness, synthesis
   trend (synthesized and deferred as sampled from the status file at each
   read; a per-pass history needs a durable pass ledger in atrium and is out of
   scope),
   populations not in the index, doctor checks, and a context inspector:
   a query box running `atrium context --json`, showing what a session would
   receive as labelled blocks with their sizes.
5. **Brain.** WebGL graph of pages and links: colour by page type, size by
   degree, orphans highlighted, filters by type and search, a local view of a
   node's neighbourhood at depth 1-3, community colouring (Louvain) computed
   in a web worker. Selecting a node shows the rendered page and its links;
   related-unlinked suggestions load on demand. Side panels: lint, doctor.
6. **Clips.** Funnel from capture lanes into pending, needs-review and
   reconciled; intake per day; ages of the oldest stuck items.

### 7.2 Shell and System implementation

**Heartbeat strips** are rows of SVG rectangles, one per bucket, built on the
client from `GET /api/launchd/history`. Ranges and bucket counts: 24 h as
48 x 30 min, 7 d as 84 x 2 h, 30 d as 90 x 8 h. Bucket edges are half-open,
`[start, end)`, and the newest bucket ends at the server's `now`.

Each bucket takes exactly one state; the first rule that applies wins:

1. `unknown`: orbit did not run for the whole bucket (the bucket is not covered
   by run intervals, with 90 s of slack past a run's last touch, because orbit
   touches its run row every 60 s).
2. `failed`: for a `keepalive` job, no pid at the end of the bucket; for a
   `scheduled` job, a non-zero last exit in any observation inside the bucket
   or the last one before its end. A keepalive job is `ok` otherwise, and exit
   codes are not consulted for it.
3. `ok`: a scheduled job's run count increased inside the bucket.
4. `missed`: the scheduled job's expected window (section 5.8) was fully
   watched and the run count did not increase in it.
5. `idle`: none of the above (a scheduled job with nothing due).

`GET /api/launchd/history` returns the server's `now` (epoch ms) with the
observations and runs, and the strip is built against that value, not the
client clock. Clock skew, or the 60 s run-interval touch, therefore cannot push
the newest bucket past the 90 s coverage slack and turn it `unknown`.

**Command palette.** A plain dialog around cmdk's `Command`, not
`Command.Dialog`: Radix injects a runtime `<style>` element that the CSP
(`default-src 'self'`) blocks. The dialog traps Tab and restores focus on
close.

**Home pulse.** The satellite pulse is a CSS keyframe animation, not a Motion
component, to stay inside the bundle budget (section 11).

### 7.3 Worker screen

`GET /api/worker` is a session-guarded detail route over the worker's
`GET /v1/status`, read with the adapter's token and 1 MiB cap under its own
4 s abort (a two-slot pool, separate from the launchd one). It answers
`{ now, queues, nodes, cooldowns, failures }`: times as epoch ms, durations
as ms, allowlisted fields only. Queues sort by queued then failed, cooldowns
by time left, failures newest first (at most 50). Queue, runner, node and
model names, job ids and error codes are identifiers, not content: each must
match `^[\w.:/@+-]{1,128}$`. A row whose own name or id fails is dropped; a
secondary code that fails (an error, a block reason, a model) is blanked to
`null`. An unconfigured or unreachable worker answers a fixed 503.

The screen refetches every 15 s. Its diagnosis card asks "why is work
waiting?" only when something is queued and nothing is leased, running or
draining, and lists every cause found: each runner cooldown with its time
left (against the server's `now`); per node, a report older than 5 min (the
only cause given for that node), a person at the machine (last release
`user_active` and under 5 min idle, the worker's default idle threshold),
battery, memory pressure (the reported level or a pressure block reason), any
other block reason verbatim; or that no node has reported. Worker identifiers
are shown verbatim in monospace.

**Activity charts.** `GET /api/worker/activity?range=24h|7d` is a
session-guarded detail route over the coordinator's `GET /v1/activity` with
`hours=24|168`, under the same two-slot pool, 4 s abort, 1 MiB cap and fixed
503 as `/api/worker`; any other range is a 400. It answers
`{ now, since, bucketMs, rows }`, each row
`{ bucket, queue, provider, sampling, outcome, error, attempts, wallMs,
tokensIn, tokensOut }` (epoch ms and ms; buckets are 1 h up to 48 h and 6 h
beyond, epoch-aligned). A row whose queue, provider or outcome fails the
identifier rule is dropped; an error code that fails is blanked to `null`.
Aggregates only: no job id or content.

The screen holds one range control (24 hours | 7 days) in a single row above
the charts, kept in the URL as `?range=`, which scopes every chart below it.
Activity refetches every 60 s; a range change keeps the previous render at
half opacity until the new one lands. Production attempts exclude sampling
(shadow and judge) jobs, which are only counted. The charts:

1. **Activity**, under the diagnosis: stacked columns per bucket of
   production attempts, one segment per provider and failures as their own
   segment on top. The tooltip gives the bucket's local time range, the
   count per segment, the top three error codes, the mean wall time and the
   sampling attempts.
2. **Per-queue sparkline** in every queue row (table and phone list):
   succeeded production attempts per bucket. The queue name is a button
   (`aria-expanded`) that opens the queue's outcome counts, provider mix,
   mean wall time, tokens in and out, and top error codes for the range.
3. **Failures over time** in Recent failures: production failures per bucket
   by error code, each listed code in its fixed slot and every other code
   folded into "other".
4. **OpenRouter attempts today (UTC)**: a stat tile with a sparkline, all
   OpenRouter attempts (sampling included) since 00:00 UTC on the server
   clock. It says attempts, never requests of a limit: the provider quota is
   not known to orbit.

Detail is progressive: hover, tap or keyboard focus shows it, never a
standing label. Each chart is one tab stop, a `slider` over its buckets whose
value text is the bucket's numbers; arrow keys, Home and End move it, Escape
hides the tooltip. The hit target is the whole bucket band. Every chart's
numbers are also in a "Show table" disclosure, so a tooltip never gates a
value. The Worker route is lazy-loaded, keeping chart code off the initial
route.

The home ticker shows each event's refs after its label, and folds a
`launchd.stopped` directly preceded by the same label's `launchd.started`
within 5 min into one "ran" row.

### 7.1 Visual language

- Dark default (near-black with a blue tint), light theme; tokens as CSS
  variables.
- Accents: electric cyan for activity, violet for memory; ok / warn / down
  colours at WCAG AA contrast in both themes.
- Type: Geist and Geist Mono, self-hosted.
- Motion: faint background grid, glow only on live elements, numeric
  tweening, pulses tied to real cadence; `prefers-reduced-motion` disables
  animation.
- No decoration without data: every animated element encodes a measured value.
- Charts: categorical slots in a fixed order (the dataviz reference palette,
  slots 1-6, light and dark steps as theme tokens, validated against the
  panel surface in both schemes; the light slots under 3:1 rely on the table
  view). Providers map to slots by a fixed table (agy, openrouter, ollama,
  codex, cursor, other), never by rank; failure codes map by a fixed table
  (no_output, schema_violation, quota_wall, lease_lost, timeout,
  executor_error), never by rank, the folded rest grey. Status colours stay reserved for
  state and always carry a label (the `failed` segment). Columns at most
  24 px wide with a 4 px rounded data end, square at the baseline, a 2 px
  surface gap between segments and columns; 2 px lines; hairline solid
  gridlines; one y axis. Text wears text tokens, never a series colour.

## 8. Error handling

- Adapter failure: `down` with a `ReasonCode`; the UI keeps `lastGood` greyed
  with its age.
- Data older than its freshness target: `warn` with `stale`.
- Stream loss: `offline` indicator, reconnect with backoff, replay or resync
  per section 5.5.
- Server errors return `{ "error": "<code>" }` only.

## 9. Testing

- **Contract:** each engine document validated against a fixture from the
  public synthetic instance; parser tests over captured `launchctl print`
  fixtures.
- **Server:** unit tests per adapter with a fake process runner and fake
  clock; integration tests for Host allowlist, Origin, CSRF, rate limits,
  pairing atomicity, cookie flags, headers, SSE replay/resync, scheduler
  single flight, backoff, process-group kill and adapter isolation.
- **Web:** Vitest + Testing Library per component; graph and flow components
  tested against mocked sigma and React Flow instances; layout and analytics
  logic in pure modules; `vitest-axe` on every screen.
- **End to end:** Playwright against the server on the synthetic instance:
  login, pairing, each screen paints its data, a forced adapter failure shows
  `down` without affecting other cards, reduced motion.
- **Benchmarks:** each engine surface on the full instance before its adapter
  ships (section 4).
- **Visual:** `ui-quality` and a screenshot review per screen at desktop and
  phone widths, both themes.

## 10. Deployment

- `orbit serve` runs the server; `launchd/com.syntopica.orbit.plist.template`
  runs it as a user LaunchAgent with `KeepAlive`.
- `tailscale serve --bg --https=443 http://127.0.0.1:<port>` publishes it;
  `orbit doctor` checks that the published name is in the Host allowlist.
- `pnpm build` writes the web bundle into `apps/server/dist/public`; never
  committed.
- `orbit doctor`: instance found, `orbit.json` valid, each configured engine
  command runs under its environment, token present, port free, launchd
  registry labels exist.

## 11. Quality gate (codeality strict)

- Templates: `apps/web` from codeality `vite-react-app`; `apps/server` and
  `packages/contract` from `ts-package`. `@syntopica/eslint-config`,
  `prettier-config`, `tsconfig` and `quality-config` as shipped.
- Rules: `code-policy/one-primary-unit` and
  `code-policy/no-hidden-top-level-declarations` enabled at error everywhere,
  with only their documented exceptions (tests, declaration files, entry
  points). The deprecated `atomic-file` rule is not used.
- No `eslint-disable`, no suppression baseline, `--max-warnings 0`.
- Coverage: the templates' 80 % is raised to 90 % lines, branches, functions
  and statements in each package's Vitest config; ratchet upward only. No
  coverage exclusions beyond generated files and entry points.
- type-coverage 100 % in every package.
- knip and jscpd clean; dependency-cruiser forbids `apps/web -> apps/server`,
  any adapter importing another adapter, and `packages/contract` importing
  `apps/*`.
- Development: the Vite dev server proxies `/api` to the running server on
  `127.0.0.1:8790` and rewrites `Origin` to the server's own origin, because
  the server accepts only its own origins (section 6.5).
- Bundle budget (size-limit, brotli): initial route at most 150 KB; the graph
  route chunk and the flow route chunk at most 250 KB each, loaded lazily.
  The first plan task measures a prototype with sigma, graphology, React Flow
  and Recharts against these numbers and records the result before screens
  are built.
- Security: gitleaks, `baseline-audit --level moderate`.
- One root command, `pnpm gate`, runs `check:ci`, `check:quality` and
  `check:security` for every package plus the root. Lefthook `pre-push` runs
  `pnpm gate` in addition to the template's gitleaks hook; CI runs `pnpm gate`
  on every push. Nothing is pushed red.

## 12. Open items for planning

- Exact extra environment each engine CLI needs under orbit's allowlist
  (measured by `orbit doctor` during the plan).
- Whether `atrium doctor --json`, `brain lint --json` and `clips status --json`
  meet the 2 s budget, or need the file pattern.
- Library versions, confirmed against current documentation when the plan is
  written.

## 13. Inspiration and library choices

Surveyed 2026-10-01. Adopted in this spec:

| Source | Idea | Where |
| --- | --- | --- |
| Dagster | Stages as assets with freshness policies | Memory flow |
| React Flow examples | Particles along edges scaled by throughput | Memory flow |
| Uptime Kuma | Heartbeat strip per check with range selector | System |
| Letta ADE | Context-window inspector in labelled blocks | Atrium |
| Quartz graph | Local depth-N graph beside the global graph | Brain |
| Linear, Vercel | Keyboard-first lists and a command palette | Shell |
| Trigger.dev | Filtered views stored in the URL | Shell |
| Glance | Column layout that collapses cleanly on a phone | Orbit home |

Recorded for later sub-projects: Inngest/Temporal attempt waterfall with ladder
fallback reasons (2); Helicone cost rollups per executor, queue and day (2);
Langfuse judge-score trends with click-through to the judge run (2);
Beszel/Hatchet node cards with slot use and sparklines (2); Vibe Kanban
board-plus-detail split pane (3); command palette that runs actions (5);
Phoenix embedding projection of the index and Zep/Graphiti bi-temporal facts
with a time slider (later, needs engine support).

Library choices:

- Graph: sigma 3 with graphology (ForceAtlas2 and Louvain in a web worker,
  neighbourhood queries) through `@react-sigma/core`.
- Flow diagram: `@xyflow/react` with custom stage nodes and animated edges.
- Charts: visx (`@visx/scale`, `@visx/shape`, `@visx/tooltip`,
  `@visx/responsive`) for panels, replacing Recharts (revision 7): measured
  at about 24 KB brotli for the subset against 94.5 KB for Recharts 3.10.1,
  React-native, and full control over the mark specs of section 7.1.
  Heartbeat strips in sub-project 0 are SVG rectangles (section 7.2); uPlot
  stays the choice for dense metric charts in later sub-projects.
- Command palette: `cmdk`.
- Data and routing: TanStack Query and TanStack Router; Motion; Tailwind 4 from
  the template; `react-markdown` without raw HTML.
