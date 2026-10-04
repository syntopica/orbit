# TODO

Active engine backlog. States: `[ ]` pending, `[~]` partial, `[!]` blocked,
`[x]` verified complete, `[-]` obsolete. Closed items move to `TODO_LOG.md`.
This repository is public: entries describe engine behaviour only.

## Reads

- [ ] Brain and clips adapter reads time out together every few minutes (25 s
      timeout; ticker shows "went down: Read timed out" then "recovered"), and
      the Clips screen can stay on "loading". Measured on 2026-10-04 with host
      load 37-50: `clips status --json` 0.5-5.9 s,
      `brain graph --json --no-html` 1.1-2.1 s, `brain graph --related` 0.8 s,
      so a single command does not explain 25 s. Next: log per-read duration and
      the phase that stalls (spawn, stdout drain, parse) for both adapters, and
      check whether the Clips detail route's 10 s budget covers `clips status`
      plus `clips doctor` run back to back.

## Memory (sub-project 1)

- [!] Lighthouse CI is out of `apps/web` (see `apps/web/README.md`). Blocked on
  upstream patches for the five `@lhci/cli` advisories; re-add it, or waive them
  explicitly, when they clear. Re-checked 2026-10-04: `@lhci/cli` 0.15.1 now
  resolves to 14 advisories (11 high), the same five among them.

## Reliability plan (2026-10-04, in this order)

- [~] 1. Engine read timeouts: time every engine command (total, outcome,
  concurrent runs) without content, find the stalled phase, then fix it.
- [ ] 4. Detail pool: bound queue wait and queued requests so non-settling work
      cannot hold both slots forever; Pending fans out up to 50 sources into it.
- [ ] 2. Poller health: per adapter last attempt, last success, duration,
      consecutive failures and next attempt as metadata, plus an external check
      that orbit's own LaunchAgent is alive.
- [ ] 3. Tailnet identity: `orbit doctor` claims an empty `allowedLogins`
      refuses every tailnet request; the guard only refuses a present, unlisted
      login (spec 6.5). Make the message say exactly that.
- [ ] 7. Tests under load: find what the 5 s vitest timeouts wait on and fix the
      cause (fake clocks or targeted limits).
- [ ] 5. Per-item clips waiting in Pending, with a content-safe item list from
      the clips engine.
- [ ] 8. Backlog warnings: oldest waiting clip and blocked TODO count thresholds
      from instance config.
- [ ] 6. Action outcomes survive a restart: persist content-free run metadata
      and mark interrupted runs at startup.
- [ ] Step-up: phone and remote sessions re-enter the admin token before launchd
      restart/run, worker cancel/retry/ack and brain index rebuild.
