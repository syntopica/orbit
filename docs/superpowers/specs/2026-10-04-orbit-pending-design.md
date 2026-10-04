# orbit sub-project 3 (Pending) - design

Status: draft, revision 1. Scope: sub-project 3 of
`2026-10-01-orbit-design.md` section 2, "one triage board over TODOs,
inboxes, curation proposals, lint". Every rule of the base spec holds; "base
6.6" points there. Read-only: acting on an item is sub-project 5.

## 1. Sources (first release)

| Source | Items | Where from |
| --- | --- | --- |
| TODO files | every open, partial or blocked item | files listed in `orbit.json` |
| Brain lint | every lint issue | the brain checks already read by the Brain screen (base 7.5) |
| Worker | production jobs `failed` and not acknowledged | `GET /v1/admin/jobs?state=failed` |
| Clips | one aggregate row per waiting state, with count and oldest age | the clips snapshot (counts only) |

Curation proposals join when Atrium specifies a review API (base 2,
sub-project 5). Clips joins item by item when `clips status --json` lists
items; until then it is one row per state linking to `/clips`.

## 2. TODO files

`orbit.json` gains `pending.todoFiles`: a list of `{ "name", "path" }`, at most
50, `name` an identifier (base 7.3), `path` absolute. orbit reads each file at
request time (1 MiB cap per file, files over it are reported as `too_large`
and skipped) and parses it:

- An item is a top-level list line `- [ ]`, `- [~]` or `- [!]` (states
  `open`, `partial`, `blocked`), plus its indented continuation lines, up to
  the next list line, heading or blank line. `[x]` and `[-]` are closed and
  skipped. Nested list lines belong to their parent item.
- Its section is the nearest preceding `##` heading text, or `null`.
- Its `line` is the 1-based line of the list marker.
- A file that cannot be read is reported as `unreadable`; one with no items
  as an empty source. Neither fails the board.

Item text and section titles are content (base 6.6): they appear only in the
detail route below, never in snapshots, events or logs.

## 3. Route

`GET /api/pending` (session-guarded detail route, content) answers
`{ now, sources, items }`:

- `sources`: `{ id, kind, name, status, count }`, `kind` in
  `todo | brain | worker | clips`, `status` in
  `ok | unreadable | too_large | unavailable`.
- `items`: `{ id, source, kind, state, title, detail, section, ref, ageMs }`.
  `id` is stable across reads (source id plus line for TODO items, the issue
  or job id otherwise). `state` is `open | partial | blocked` for TODO items,
  `issue` for lint, `failed` for jobs, `waiting` for clips aggregates. `title`
  is the item's first line (at most 300 characters) and `detail` the rest
  (at most 4000). `ref` is where it lives: `{ file, line }` for TODO items, a
  page id, a job id, or a route. `ageMs` is known for jobs and clips, `null`
  otherwise.

Each source is read with its own 4 s abort; one slow or failing source answers
`unavailable` without failing the others. Only sources that run an engine
command or call the worker (brain lint, worker failures) take a detail-pool
slot; TODO files are local reads and the clips aggregate comes from the
in-memory snapshot, so they never queue behind them. (Queuing every source
behind two slots made the last ones time out from their enqueue deadline.) At most 2000
items, blocked first, then partial, then by source.

The snapshot of a new `pending` component carries counts only
(`open, partial, blocked` across TODO files) so the home Pending row shows
them.

**Backlog warnings.** `orbit.json` `warnings` sets two optional limits:
`pendingBlocked` (the pending card turns `warn`, reason `backlog`, when blocked
items exceed it) and `clipsOldestDays` (the clips card does the same when the
oldest waiting clip in any group is older). Without them counts are shown and
never warned on. A backlog only downgrades a healthy reading; a failed check
keeps `check_failed`.

## 4. Screen

`/pending` (lazy route, in the shell navigation after Worker):

- A header with the counts per state and per source, each a filter toggle
  kept in the URL (`?state=`, `?source=`), and a text filter applied on the
  client to title and detail (`?q=`, not sent to the server).
- Items grouped by source, then by section, blocked first. Each row shows the
  state badge, the title, and on expand the detail as plain text (no
  Markdown rendering of TODO text) plus its ref: `file:line` for TODO items
  (copy button), a link to `/brain?page=` for lint, to `/worker/jobs/:id`
  for jobs, to `/clips` for clips rows.
- Sources reported `unreadable`, `too_large` or `unavailable` are listed at the
  top with their status, never hidden.
- Refetch on window focus and on demand; no polling. The query entry is
  removed when the screen unmounts (base 6.6).

## 5. Testing

Unit tests for the TODO parser (states, continuation, nesting, headings,
closed items, blank-line ends, CRLF, the size cap), the source merge and
ordering, and identifier rules; route tests for partial failure and caps;
Playwright for the board at 1280 and 375 px in dark and light with axe,
filters in the URL and an expanded item. Fixture TODO files use placeholder
text only.
