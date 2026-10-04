# TODO

Active engine backlog. States: `[ ]` pending, `[~]` partial, `[!]` blocked,
`[x]` verified complete, `[-]` obsolete. Closed items move to `TODO_LOG.md`.
This repository is public: entries describe engine behaviour only.

## Reliability plan (2026-10-04, in this order)

- [~] 1. Engine read timeouts (brain and clips reads time out together every few
  minutes; the Clips screen can stay on loading): every engine command now logs
  `engine-run <engine> <subcommand> <ms> <outcome> concurrent=<n> load=<1-min>`.
  First sample: `clips status` and `brain lint` reach 8-10 s and time out at the
  runner's 10 s default with `concurrent=1`, so the command itself is slow, not
  orbit's queue; by hand `clips status` takes 0.6 s at load 15-23. Load alone
  does not explain it: at load 102.8 the same commands took 0.5-1.1 s, while
  every 8-10 s run so far fell inside a local gate run (build and git I/O on the
  same disk). 668 lines by 2026-10-04 18:56: all 25 timeouts fell at load 20-125
  (median load of successful runs 12); `clips status` p50 1.1 s, p90 8.7 s;
  `brain lint` p90 3.1 s, p99 10 s. Per-engine `timeoutMs` added (clips and
  brain set to 20 s in the instance), adapter budget 45 s for two reads. Next:
  confirm the timeouts stop in the next day of lines.

## Test reliability

- [ ] `worker-costs.spec.ts` light 1280px failed once in the full gate
      (2026-10-04, host load ~50) on axe `color-contrast` for `text-muted` stat
      labels (#828997 on #fcfcfe, 3.43); it passed 12 of 12 alone. Likely axe
      sampling mid theme transition. Next: wait for the computed colour to
      settle (or disable transitions) before axe in that spec.
