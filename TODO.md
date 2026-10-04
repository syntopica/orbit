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

- [!] Web type coverage is 99.89 % (7772/7780, strict, tests excluded); spec 11
  says 100 %. The floor cannot be raised here: `baseline-type-coverage` reads
  the shared `TYPE_COVERAGE_THRESHOLD` (99) from `@syntopica/quality-config` and
  refuses `--at-least` above it. Remaining gaps are library-typed:
  `TooltipWithBounds` from `@visx/tooltip` (`ChartTooltip.tsx`) and TanStack
  router generics in `src/test/renderShell.tsx`. Unblock: a per-repo floor above
  the shared one in quality-config, then type the two call sites.
- [!] Lighthouse CI is out of `apps/web` (see `apps/web/README.md`). Blocked on
  upstream patches for the five `@lhci/cli` advisories; re-add it, or waive them
  explicitly, when they clear.
