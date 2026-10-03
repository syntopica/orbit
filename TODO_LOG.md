# TODO log

Closed work, newest first, grouped by year and month. Each entry names the
result and the evidence. Active work lives in `TODO.md`.

## 2026

### October

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
