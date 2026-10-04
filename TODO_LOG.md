# TODO log

Closed work, newest first, grouped by year and month. Each entry names the
result and the evidence. Active work lives in `TODO.md`.

## 2026

### October

- 2026-10-04 [x] Step-up exemption for the machine itself: `orbit.json`
  `remotePort` makes orbit listen on a second loopback port for Tailscale Serve;
  requests whose socket arrived on `port` skip the action step-up, requests on
  `remotePort` and every request without one still step up. The listener is read
  from the socket's local port, never a header. `orbit doctor` fails when Serve
  proxies to `port` beside a `remotePort`. Evidence: `requireStepUp.test.ts`,
  `startServer.remote.test.ts`, `checkTailscaleServe.test.ts`, server gate
  green.
- 2026-10-04 [x] Action outcomes survive a restart: runs live in the history
  database (`action_runs`, content-free, newest 50) and a run still `started` at
  startup becomes `interrupted`. Evidence: `createActionStore.restart.test.ts`,
  gate green.
- 2026-10-04 [x] Action step-up: launchd run/restart, engine actions and worker
  cancel/retry/ack answer 403 `step_up_required` unless the admin token was
  re-entered on the session in the last five minutes; the confirmation dialogs
  ask for it and retry. A first version exempted loopback by `Host`; a request
  through Tailscale Serve with `Host: 127.0.0.1:8790` skipped the step-up
  (reproduced live), so it now applies to every session. Evidence:
  `requireStepUp.test.ts`, `ActionButton.test.tsx`, `WorkerJobStepUp.test.tsx`.
- 2026-10-04 [x] Backlog warnings: `orbit.json` `warnings.pendingBlocked` and
  `warnings.clipsOldestDays` turn a healthy pending or clips card `warn` with
  the new reason `backlog`; without them counts never warn. Replaces the blocked
  design-review item on thresholds. Evidence: `backlogHealth.test.ts`,
  `clipsOldestOver.test.ts`, adapter tests, gate green.
- 2026-10-04 [x] Tests under load: the web tests that hit vitest's 5 s limit are
  CPU-bound jsdom route renders (slowest 1.2 s at load 28; the three that failed
  take 0.1-0.6 s) and wait on no real timer or process, so the web suite's
  `testTimeout` is 15 s; the server keeps 5 s. Evidence: verbose durations, gate
  green.
- 2026-10-04 [x] Detail pool bounded: TODO files and the clips aggregate are
  read outside the pool (they start no process), and at most 8 live requests
  wait for a slot; one more is refused `lagging` at once. Evidence:
  `createSlotQueue.test.ts`, `runLocalSource.test.ts`, gate green.
- 2026-10-04 [x] Poller health: `GET /api/poller` and the "Orbit polling" list
  on System show each loop's state, last success, duration, failures in a row
  and next tick; `orbit watch`, run every 300 s by its own LaunchAgent, restarts
  an orbit that stops answering on loopback after 2 misses. Evidence:
  `createPollerRegistry.test.ts`, `runWatch.test.ts`, `watchCommand.test.ts`,
  live `/api/poller` answered 7 loops, first watcher pass exited 0.
- 2026-10-04 [x] Tailnet identity: `orbit doctor` now says an empty
  `allowedLogins` refuses every request carrying a Tailscale login, which is
  what the guard does (spec 6.5); sessions remain the only authentication.

- 2026-10-04 [x] Atrium doctor panel (spec 7.4): `GET /api/atrium` reads the
  optional `doctor.json` that atrium's refresh job publishes, answers codes,
  severities and staleness (2 x the refresh interval), and a `broken` check
  turns the atrium component `warn` (`check_failed`); the Atrium screen reuses
  the doctor list and says when nothing is published yet. Evidence: route,
  schema and screen tests; `pnpm gate` green.
- 2026-10-04 [x] Atrium context inspector (spec 7 item 4, 7.4): `{query}`
  placeholder for one bounded free argument (1 to 500 characters after trim, no
  control characters, one argv element after `--`), `atrium` engine table entry
  `context --json --lane words -- {query}`, `POST /api/atrium/context` (session,
  CSRF, 10 per minute per session, 5 s under the memory pool, fixed error codes,
  query never logged or echoed), and a query form with labelled blocks, trust
  badges, sizes and warnings. Evidence: route tests with a fake atrium binary,
  component tests, e2e; `pnpm gate` green.
- 2026-10-04 [x] Sub-project 5 (Actions), spec
  `2026-10-04-orbit-actions-design.md`: run a scheduled LaunchAgent now or
  restart a resident one from System, engine actions listed in
  `engines.<name>.actions`, confirmation dialogs, single flight, 10 per minute
  per session, `action.*` events with exit code and duration only, orbit's own
  restart refused; run history kept in memory (last 50). Evidence: `pnpm gate`
  green (56 e2e).
- 2026-10-04 [x] Sub-project 4 (Remote), spec
  `2026-10-04-orbit-remote-design.md`: phone bar with Orbit, Memory, Worker,
  Pending and a More sheet (focus trapped, Escape closes), icons and untruncated
  labels, web app manifest and touch icons without a service worker, safe-area
  insets, focusable scrollers on wide tables. Evidence: `pnpm gate` green (54
  e2e), screenshots at 375 px dark and light.
- 2026-10-04 [x] Sub-project 3 (Pending), spec
  `2026-10-04-orbit-pending-design.md`: `/api/pending` and the `/pending` board
  over the TODO files in `pending.todoFiles`, brain lint, unacknowledged worker
  failures and clips counts, with URL filters, client-side search, plain-text
  detail and source status (17d8601). Evidence: `pnpm gate` green (49 e2e);
  live: 13 TODO files and 3 engine sources, 429 items.
- 2026-10-04 [x] Sub-project 2 (Worker), spec
  `2026-10-04-orbit-worker-design.md`: Costs and Executors panels over
  `/v1/costs` and `/v1/quality` (8590805); job browser, attempt waterfall,
  content view with Reveal for personal and mail and a 5-minute admin-token
  step-up for secret, 60 s auto-hide, cancel, retry and ack with confirmation
  and audit events (72c4e5e); running attempts carry null token counts
  (62e8f6c). Evidence: `pnpm gate` green (45 e2e); live: costs 63 rows, quality
  43 executors, job detail 200, sensitive content without Reveal 403.
- 2026-10-04 [x] Orbit polish: every 3D label has a leader line and anchor dot
  to its own sphere, placed away from neighbouring spheres; the light-theme core
  is a lit accent sphere; the Memory flow layout has no edge crossings (pure
  segment-intersection test). Evidence: `pnpm gate` green (34 e2e), commit
  b522c0a.
- 2026-10-03 [x] Brain screen (sub-project 1c): engine table `{pageId}`
  placeholder, brain graph, related, page and checks routes, sigma graph with
  ForceAtlas2 and Louvain in a Vite module worker, filters, local view, page
  view without raw HTML, lint and doctor panels, palette pages. Evidence: plan
  `docs/superpowers/plans/2026-10-03-orbit-brain-screen.md`, measurements
  `docs/measurements/2026-10-03-brain-detail-commands.md`, `pnpm gate` green
  with e2e 34/34; Brain route plus worker 97.08 kB brotli of 250.
- 2026-10-03 [x] Memory screens (sub-project 1b): history metrics route, atrium
  and clips detail routes, memory flow route, shared trend chart, Atrium, Clips
  and Memory flow screens with a React Flow canvas and a phone stage list. React
  Flow nodes need `pointer-events-auto` when neither selectable nor draggable,
  and zod's `jitless` config must load before any chunk that builds schemas, or
  its `new Function` probe trips the CSP. Evidence: plan
  `docs/superpowers/plans/2026-10-03-orbit-memory-screens.md`, `pnpm gate` green
  with e2e 27/27, screenshots at 375 and 1280 px in both schemes.
- 2026-10-03 [x] Brain and clips health no longer read `check_failed` for a
  credentials check orbit cannot satisfy: the engines accept
  `doctor --json --skip NAME`, the table lists that form, and a request naming
  an entry by its leading arguments runs the whole entry
  (`resolveListedArgs.ts`, af65ec6). Evidence: `resolveListedArgs.test.ts`,
  `createEngineRunner.test.ts`; a live reading of brain doctor failing checks
  went from 1 to 0 after deploy.
- 2026-10-03 [x] Worker health degrades: `warn lagging` once the oldest queued
  job has waited over 24 h (`workerHealth.ts`, spec 3.2); zero nodes or queued
  work alone stay `ok` because nodes run only while idle. Evidence:
  `workerHealth.test.ts`.
- 2026-10-03 [x] Memory adapters (sub-project 1a): engine command table with a
  listed-only runner, engine documents judged by stdout whatever the exit code,
  adapters for brain, clips, atrium (published status files) and capture
  (undrained count, offsets normalised to UTC), `orbit doctor` engines and plist
  PATH checks, e2e satellites. Evidence: plan
  `docs/superpowers/plans/2026-10-03-orbit-memory-adapters.md`, commits
  2ddccf7..e75164a, `pnpm gate` green with e2e 20/20, final review Ready after
  one fix wave.
- 2026-10-03 [x] Audit table bounded: every `recordAudit` prunes rows older than
  90 days and keeps the newest 10,000 (`auth/pruneAudit.ts`). Evidence:
  `pruneAudit.test.ts`.
- 2026-10-03 [x] `shrinkToCap` deletes until under the cap and vacuums once.
  Evidence: `shrinkToCap.test.ts` "vacuums once after deleting down to the cap".
- 2026-10-03 [x] Rollups cover every hour since the newest rollup (all samples
  on the first run), so sleep gaps no longer leave holes. Evidence:
  `pruneBoundaries.test.ts` "fills the hours since the newest rollup after a
  long gap".
- 2026-10-03 [x] Pruning keeps, per label, the newest launchd observation at or
  before the 90-day cutoff as the missed-run baseline. Evidence:
  `pruneHistory.test.ts` "keeps the newest observation before the cutoff".
- 2026-10-03 [x] Event refs capped at eight (contract and spec); bad ref keys,
  every stream message variant and each `snapshotCore` cap are tested
  (`eventSchema.test.ts`, `streamMessageSchema.test.ts`,
  `snapshotCoreSchema.test.ts`).
- 2026-10-03 [x] Toasts announce through a polite live region (`role="status"`,
  `aria-live="polite"`). Evidence: `Toasts.test.tsx`.
- 2026-10-03 [x] Real meta description in `apps/web/index.html`; stale knip
  ignore of `@orbit/contract` removed (knip green).
- 2026-10-03 [x] 375 px and 768 px evidence: `e2e/specs/widths.spec.ts` renders
  every screen at both widths in both themes, asserts no sideways scroll and
  saves screenshots; reviewed. Found and fixed "1 idle queues".
- 2026-10-03 [x] Dropped Lighthouse check and its five advisory ids recorded in
  `apps/web/README.md`.
- 2026-10-03 [x] README gains Update and Uninstall steps.
- 2026-10-03 [x] Host header behind Tailscale Serve measured on a real tailnet
  (`docs/measurements/2026-10-03-tailscale-serve.md`): Serve forwards the client
  Host; a forged Host gets 421 from orbit. README notes it.
- 2026-10-03 [x] The public plan names `<codeality checkout>` instead of a local
  path.
- 2026-10-03 [x] Hub dedupe hashes snapshots without per-read timestamps
  (`metrics[].at`, `pending[].oldestAt`, `lastGood.observedAt`) and stores
  `lastGood` without events (`hub/snapshotHash.ts`, `hub/withoutEvents.ts`).
  Evidence: `createHub.test.ts` "ignores read timestamps", "stores lastGood
  without its events"; `pnpm gate` green.
- 2026-10-03 [x] A timed-out read that never settles no longer halts its adapter
  loop: the wait is bounded at ten timeouts (`settleWithin.ts`, spec 5.2
  updated); a stop still waits so restarts never overlap. Evidence:
  `createAdapterLoop.test.ts` "resumes after a read that never settles".
- 2026-10-03 [x] Ticker rows are keyed by stream id: the hub keeps recent events
  as `EventMessage`s with their own ids, the opening sends each with its id, and
  the web state keeps messages. Evidence: `EventTicker.test.tsx` "renders
  identical events as separate rows" with no React key warning.
- 2026-10-03 [x] Home shows "Waiting for the first readings" until `sync`, not
  while there are no cards. Evidence: `HomeScreen.states.test.tsx` "stops
  waiting at sync even with no components".
- 2026-10-03 [x] Config: `launchctl`/`plutil` must be absolute, `worker.url`
  only http/https, `cadenceMs.synthetic` honoured (timeout 2x, freshness 5x).
  Evidence: `loadOrbitConfig.test.ts`, `buildAdapters.test.ts`.
- 2026-10-03 [x] Synthetic adapter helpers moved to `apps/server/src/test/`.
- 2026-10-03 [x] Token-file EACCES/EPERM maps to new reason `permission_denied`
  (contract, spec 5.1, web label). Evidence:
  `createWorkerAdapter.token.test.ts`.
- 2026-10-03 [x] `readPlistTemplate` stops at the workspace root
  (`pnpm-workspace.yaml`). Evidence: `readPlistTemplate.test.ts` "stops at the
  workspace root".
- 2026-10-04 [x] The initial-route size budget covers the entry's static-import
  closure: `.size-limit.mjs` reads the entry from the built `index.html` and
  follows `from"./x.js"` and `import"./x.js"` edges (`size/entryClosure.mjs`),
  leaving dynamic `import()` out. Evidence: a synthetic build gives entry,
  shared and side-effect chunks without the lazy one; live 139.8 KB of 150 KB;
  `pnpm gate` green.
- 2026-10-04 [x] Web type coverage is 100 % and pinned there: the remaining
  sites were typed (zod-parsed search params, `instanceof` instead of casts, a
  typed uniform), the visx class component's `any` state is ignored with a
  reason, `src/test/**` helpers join the excluded test category, and
  `@syntopica/quality-config` 0.12.0 lets `--at-least 100` pin a repository
  above the shared floor. Evidence: `pnpm type-coverage` 20820 / 20820.
- 2026-10-04 [x] UI redesign pass with codeality-ui: the brain graph takes the
  full width with filters, legend and the selected page floating over it and the
  side panels in columns below; engine actions inline; one page width; dense
  pending groups with full titles; job, executor and failure lists on fixed grid
  columns; doctor severities as badges; addresses linked; the job list says when
  it was read; chart width read by a plain ResizeObserver so a first narrow
  measurement never sticks. Evidence: `codeality-ui check` 0 findings over 10
  routes x 2 viewports x 2 schemes, `pnpm gate` green.
- 2026-10-04 [x] Design review: brain graph labels on a sparse grid
  (`labelDensity` 0.5, `labelGridCellSize` 160, threshold 10) so the centre no
  longer collides. Evidence: brain screenshot, `pnpm gate` green.
- 2026-10-04 [-] Design review "phone navigation covers content": not a defect;
  the page already pads `6rem` plus the safe area below the fixed tab bar, and
  the bar only appears mid-page in full-page screenshots.
- 2026-10-04 [x] Design review, Pending: two-line titles on phone, search before
  the filters with the source chips folded, sources with the most blocked items
  first. Evidence: `sortSourcesByBlocked` test, `pnpm gate` green.
- 2026-10-04 [x] Design review, the rest: trend charts lead with each line's
  current value and its change in range; all-clear panels say when they were
  checked; job attempts are labelled with start, end and length, Retry is the
  primary action and acknowledge is explained; System groups services by
  component with the actions beside each row's state; on a phone the selected
  brain page sits right under the graph. Not done by decision: folding the
  worker's costs and executors (named sections already, read daily) and
  shrinking flat trend charts (already 120 px; flatness comes from scale).
  Evidence: `pnpm gate` green, `codeality-ui check` 0 findings.
