# TODO

Active engine backlog. States: `[ ]` pending, `[~]` partial, `[!]` blocked,
`[x]` verified complete, `[-]` obsolete. Closed items move to `TODO_LOG.md`.
This repository is public: entries describe engine behaviour only.

## Config and adapters

- [!] Worker health stays `ok` unless the read itself fails
  (`summarizeWorker.ts`). Blocked on an owner decision: should stale or failing
  queues, all runners in cooldown, or zero nodes degrade it?

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
