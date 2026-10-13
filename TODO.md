# TODO

Active engine backlog. States: `[ ]` pending, `[~]` partial, `[!]` blocked,
`[x]` verified complete, `[-]` obsolete. Closed items move to `TODO_LOG.md`.
This repository is public: entries describe engine behaviour only.

## Reliability plan (2026-10-04, in this order)

- [~] 1. Engine read timeouts (brain and clips reads time out together every few
  minutes; the Clips screen can stay on loading): every engine command logs
  `engine-run <engine> <subcommand> <ms> <outcome> concurrent=<n> load=<1-min> at=<ISO end time>`;
  `aborted` now marks a run its caller abandoned (adapter or pool budget), so
  `timeout` means the command used up its own `timeoutMs`. Recheck 2026-10-11
  over the 31k lines since 2026-10-06: 736 timeouts (atrium synthesis 431, clips
  status 189, brain lint 87, brain doctor 20, clips doctor 9). Median load 186
  at a timeout against 9.9 for the rest, 12 of 736 below load 20; most ran alone
  (525 of 736) and never more than 3 engine runs overlapped, though overlap is
  over-represented (24% of timeouts, 4% of runs). They come in bursts: 380 of
  them in one tenth of the log. A timer firing far past its budget (synthesis
  "timeouts" at 5-25 s on a 3 s budget, brain lint at 45 s on 20 s) shows
  orbit's own event loop starved by the host, so these are host starvation, not
  slow engines. Done 2026-10-11: `/api/clips` falls back to the adapter's last
  good read, marked `lastGoodAt`, and the screen greys it with its age instead
  of spinning; its budget is 45 s like the adapter's (it was 10 s, under one 20
  s engine run). Atrium synthesis's 3 s budget is intended: `synthesis passes`
  is a log tail (p50 0.2 s) whose failure only drops the pass warning inside the
  adapter's 5 s budget. Remaining: once orbit restarts on this build, use the
  `at=` stamps to match the bursts against what else ran (a 2026-10-11 snapshot
  at load 23-57 showed dozens of `node` processes at 65-80% CPU plus OrbStack,
  i.e. other sessions' work, not orbit); only the host's scheduling can fix
  that, not an orbit budget. Decided 2026-10-11 (owner via Codex adjudication):
  restart orbit on this build after checking no action is in flight. Done
  2026-10-11 20:04Z: no action run was in flight; after the restart
  `orbit doctor` is all `ok` bar the expected `port 8790 in use`, `/api/clips`
  answered 200 with fresh data (no `lastGoodAt`, since no read timed out), and
  new `engine-run` lines carry `at=`. Remaining: the live fallback is seen only
  when a clips read next times out, and the burst match against `at=` needs a
  few days of lines. Decided 2026-10-11 (owner via Codex adjudication): cap
  concurrent resource-heavy session work on the host and stop unused container
  workloads while diagnosing; reassess orbit only once host load falls. Needs
  owner: which other sessions and container workloads may pause, then compare
  timeout counts before and after. Decided 2026-10-11 (owner via Codex
  adjudication): a host admission gate for heavy test commands, one suite per
  host with two test workers each. Done 2026-10-11: the root `gate` and `e2e`
  scripts run through a `heavy-suite` admission wrapper when the host provides
  one (the original commands are `gate:run` and `e2e:run`; CI and hosts without
  the wrapper run them directly). Remaining: compare the `timeout` rate before
  and after over a few days of `at=` stamps.

## Daily round

Filed by `~/p/bin/daily`; one bullet per finding, updated in place while it
repeats.

## Dependencies

- [ ] `@react-sigma/core` 5.0.6 declares `sigma` `^3.0.2` as a peer, but the app
      runs on sigma 4. `SigmaContainer` hands its `settings` prop to the Sigma
      constructor as the options object, so the app passes Sigma 4 options
      (`settings` and `styles`) through that prop (`src/graph/sigmaOptions.ts`),
      and the library's own typings still describe Sigma 3 settings. Smallest
      next step: replace `SigmaContainer` and the four hooks the app uses
      (`useSigma`, `useLoadGraph`, `useRegisterEvents`, `useCamera`) with a
      small local binding, or move to a `@react-sigma/core` release that
      supports sigma 4, then drop the prop workaround.
