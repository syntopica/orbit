# TODO

Active engine backlog. States: `[ ]` pending, `[~]` partial, `[!]` blocked,
`[x]` verified complete, `[-]` obsolete. Closed items move to `TODO_LOG.md`.
This repository is public: entries describe engine behaviour only.

## Memory (sub-project 1)

- [ ] Atrium doctor panel (spec 7.4): needs atrium to publish its doctor result
      to a status file at the end of work it already does;
      `atrium doctor --json` measured 114-188 s and 620-690 MB, over the spec 4
      budget.
- [ ] Atrium context inspector (spec 7 item 4, 7.4): needs `schemaVersion` on
      `atrium context --json`, a benchmark against the budget, and an engine
      table form for one bounded free argument (spec 5.3, 500 characters).
- [ ] size-limit measures only `index-*.js`, not the chunks the entry imports
      statically: on 2026-10-04 the entry was 103.6 KB brotli while the initial
      download (entry plus two shared chunks) was about the same 137 KB that a
      later build put in the entry alone. Next: measure the entry with its
      static-import closure so the 150 KB budget covers what loads.
- [ ] Phone navigation holds eight screens since Pending joined; at 375 px the
      bar truncates labels ("Mem…", "Pendi…"). Sub-project 4: group screens or
      switch the phone bar to icons with labels on focus.
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
