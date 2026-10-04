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

- [~] Separate service availability from backlog state on the home screen and
  the orbit: the ok state now reads "Up" (it is adapter health, spec 5.1); a
  backlog severity still needs thresholds the spec does not define.
- [~] Worker: queues and failures now follow the diagnosis; secondary analysis
  is not collapsed yet.
- [ ] Brain on phone: show labels on selection and the selected page right under
      the graph.
- [ ] Charts: current value and change over the range next to each chart;
      shorter charts for flat series; legible time labels everywhere.
- [~] Pending: two-line titles on phone and search first with the source chips
  folded are done; blocked-first group order is not.
- [ ] System: a legend and start/end times on the history strips; group
      services; actions visually below status.
- [ ] Clips: funnel bars read as conversion; label them as counts or drop the
      funnel shape; flag the oldest waiting age against a threshold.
- [~] Job detail: the reveal reads "Reveal content"; attempts as a labelled
  timeline and one primary recovery action are not done.
- [ ] Empty and success states: add scope or a timestamp ("All checks pass" as
      of when).
