# TODO

Active engine backlog. States: `[ ]` pending, `[~]` partial, `[!]` blocked,
`[x]` verified complete, `[-]` obsolete. Closed items move to `TODO_LOG.md`.
This repository is public: entries describe engine behaviour only.

## Memory (sub-project 1)

- [!] Lighthouse CI is out of `apps/web` (see `apps/web/README.md`). Blocked on
  upstream patches for the five `@lhci/cli` advisories; re-add it, or waive them
  explicitly, when they clear. Re-checked 2026-10-04: `@lhci/cli` 0.15.1 now
  resolves to 14 advisories (11 high), the same five among them.

## Reliability plan (2026-10-04, in this order)

- [~] 1. Engine read timeouts (brain and clips reads time out together every few
  minutes; the Clips screen can stay on loading): every engine command now logs
  `engine-run <engine> <subcommand> <ms> <outcome> concurrent=<n> load=<1-min>`.
  First sample: `clips status` and `brain lint` reach 8-10 s and time out at the
  runner's 10 s default with `concurrent=1`, so the command itself is slow, not
  orbit's queue; by hand `clips status` takes 0.6 s at load 15-23. Load alone
  does not explain it: at load 102.8 the same commands took 0.5-1.1 s, while
  every 8-10 s run so far fell inside a local gate run (build and git I/O on the
  same disk). Next: a few days of lines, then either a lighter status read in
  the engine or a measured per-engine budget.
- [ ] 5. Per-item clips waiting in Pending, with a content-safe item list from
      the clips engine.
- [ ] Exempt the machine itself from the action step-up only with a signal a
      client cannot forge: point Tailscale Serve at a second loopback port and
      treat requests on it as remote (the `Host` header cannot be trusted for
      this).
