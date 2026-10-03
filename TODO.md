# TODO

Active engine backlog. States: `[ ]` pending, `[~]` partial, `[!]` blocked,
`[x]` verified complete, `[-]` obsolete. Closed items move to `TODO_LOG.md`.
This repository is public: entries describe engine behaviour only.

## Config and adapters

- [!] Worker health stays `ok` unless the read itself fails
  (`summarizeWorker.ts`). Blocked on an owner decision: should stale or failing
  queues, all runners in cooldown, or zero nodes degrade it?

## Web

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
