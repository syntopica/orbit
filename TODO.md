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

## Design review (external critique, 2026-10-04)

- [!] Backlog severity on the home cards and a warning for the oldest waiting
  clip need thresholds the spec does not define. Blocked on the owner naming
  them (count or age per component); the ok state already reads "Up".
