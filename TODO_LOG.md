# TODO log

Closed work, newest first, grouped by year and month. Each entry names the
result and the evidence. Active work lives in `TODO.md`.

## 2026

### October

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
