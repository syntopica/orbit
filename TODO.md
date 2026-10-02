# TODO

Active engine backlog. States: `[ ]` pending, `[~]` partial, `[!]` blocked,
`[x]` verified complete, `[-]` obsolete. Closed items move to `TODO_LOG.md`.
This repository is public: entries describe engine behaviour only.

## Live stream and hub

- [ ] Hub dedupe never fires for real adapters:
      `apps/server/src/hub/createHub.ts:33` blanks only the top-level
      `observedAt`, while `metrics[].at`, `pending.oldestAt` and
      `lastGood.observedAt` change on every read, so a snapshot is sent every
      tick (spec 5.5). Hash with those fields stripped.
- [ ] `lastGood.events` is not cleared when a snapshot is stored
      (`createHub.ts`, `createRecorder.ts:14`). Clear it together with the
      dedupe fix.
- [ ] A read that never settles halts its adapter loop
      (`apps/server/src/scheduler/createAdapterLoop.ts`). Every Base adapter
      settles on abort; add a hard limit before the first adapter that may not.
- [ ] Ticker key collides when two events share a timestamp and ref
      (`apps/web/src/screens/home/EventTicker.tsx:20`). Give events an id in the
      contract.
- [ ] Home "waiting for first readings" does not use the `synced` flag
      (`apps/web/src/screens`). Show it until the first `sync`.

## Config and adapters

- [ ] `launchd.launchctl` and `launchd.plutil` need not be absolute paths
      (`apps/server/src/config/orbitConfigSchema.ts:12-13`, spec 5.3). Add
      `.refine(isAbsolute)`.
- [ ] `worker.url` uses `z.url()`, which accepts non-http schemes
      (`orbitConfigSchema.ts:30`). Restrict it to http and https.
- [ ] `cadenceMs.synthetic` is accepted but ignored (`orbitConfigSchema.ts:33`).
      Honour it or reject it.
- [ ] `syntheticAdapter` and `syntheticCore` are test helpers living in
      `apps/server/src/scheduler/`. Move them under `apps/server/src/test/`.
- [ ] A token-file EACCES maps to `not_found`
      (`apps/server/src/adapters/worker/readWorkerToken.ts:11`). Map permission
      errors to a distinct reason.
- [ ] Worker health stays `ok` unless the read itself fails
      (`summarizeWorker.ts`). Decide whether stale or failing queues should
      degrade it.
- [ ] `readPlistTemplate` walks up to the filesystem root
      (`apps/server/src/launchd/readPlistTemplate.ts`). Stop at the first
      directory holding a `package.json`.

## State and history

- [ ] The audit table grows without bound, and refused attempts beyond the rate
      limit still write rows (`apps/server/src/http/routes/postSession.ts:23`,
      `postPair.ts:22`). Prune by age and row cap, or write one aggregated row
      per refused window.
- [ ] `shrinkToCap` runs `VACUUM` after every deleted round
      (`apps/server/src/history/shrinkToCap.ts:24`), blocking the event loop
      while over the cap. Delete until under the cap, then `VACUUM` once.
- [ ] Rollups recompute only the last 2 hours
      (`apps/server/src/history/rollupHours.ts`), so sleep gaps leave holes. Fix
      before anything reads rollups.
- [ ] Pruning drops the baseline a missed-run window needs. Keep, per label, the
      newest observation older than the cutoff
      (`apps/server/src/history/pruneHistory.ts`).

## Contract and tests

- [ ] `eventSchema` refs count is unbounded and a bad ref key is untested
      (`packages/contract/src`). Cap it and add the case.
- [ ] `streamMessageSchema` variants and `snapshotCore` caps are untested
      (`packages/contract/src`). Add one test per variant and cap.

## Web

- [ ] Record the dropped Lighthouse check and its five advisory ids in the web
      app's documentation (`apps/web`).
- [ ] No `aria-live` container for toasts
      (`apps/web/src/components/shell/Shell.tsx`, `hooks/useDownToasts.ts`). Add
      a polite live region.
- [ ] Stale template meta description in `apps/web/index.html:7`. Write the real
      one.
- [ ] No 375 px or 768 px screenshot evidence (spec 9). Capture and review both
      widths.
- [ ] Web type-coverage floor is 99 % while spec 11 says 100 %; seven
      strict-mode gaps sit in test files. Fix them and raise the floor to 100.
- [ ] Stale knip ignore of `@orbit/contract` and its comment in
      `apps/web/knip.config.ts`. Remove both.

## Docs and operations

- [ ] README has no update or uninstall (`launchctl bootout`) steps. Add both.
- [ ] Verify the Host header orbit sees behind a Serve proxy on a real tailnet,
      and record the result in the README.
- [ ] The public plan names a local checkout path ten times
      (`docs/superpowers/plans/2026-10-02-orbit-base.md`). Replace with
      `<codeality checkout>`.
