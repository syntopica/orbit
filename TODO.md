# TODO

Active engine backlog. States: `[ ]` pending, `[~]` partial, `[!]` blocked,
`[x]` verified complete, `[-]` obsolete. Closed items move to `TODO_LOG.md`.
This repository is public: entries describe engine behaviour only.

## Reliability plan (2026-10-04, in this order)

- [~] 1. Engine read timeouts (brain and clips reads time out together every few
  minutes; the Clips screen can stay on loading): every engine command logs
  `engine-run <engine> <subcommand> <ms> <outcome> concurrent=<n> load=<1-min>`.
  Recheck 2026-10-06 over ~16k lines (~52 h) after the per-engine `timeoutMs`
  deploy (8ff6d0d): timeouts did NOT stop, 203 in total (clips status 73, atrium
  synthesis 78, brain lint 27, brain doctor 10, brain graph 8, clips doctor 5,
  atrium context 2). Clips and brain now time out at the new 20 s ceiling;
  `clips status` p50 1.1 s, p90 4.7 s, p99 20 s. Atrium synthesis has its own ~3
  s budget the change never touched. Timeouts track host load: median load 62 at
  a timeout against 8.5 for successful runs, only 4 of 203 below load 20. Nearly
  gone for ~10k lines after the deploy, then rising again. A bigger budget does
  not fix it. Next: keep the screen's last good result when a read times out
  instead of spinning, decide whether atrium synthesis's 3 s budget is intended,
  and find what drives load 60-370 at those moments.
