# orbit sub-project 2 (Worker) - design

Status: draft, revision 1. Scope: sub-project 2 of
`2026-10-01-orbit-design.md` section 2: costs, executors, a job browser,
results with a content view and `secret` reveal, and worker actions. Every
rule of the base spec holds unless this one says otherwise; section numbers
written as "base 6.6" point there. The worker's own contract is
`syntopica/worker` `docs/superpowers/specs/2026-09-29-worker-design.md`.

## 1. Delivery

| Part | Content | Worker change |
| --- | --- | --- |
| 2a | Costs and Executors panels | none: `GET /v1/costs`, `GET /v1/quality` and cooldowns in `GET /v1/status` exist |
| 2b | Job browser, job detail, content view, reveal | admin job list, job detail and content routes |
| 2c | Worker actions | admin cancel, retry and acknowledge routes |

Each part ships on its own and is admitted when its worker routes have landed
and the full gate is green. 2a is read-only. 2b reads content. 2c is the first
place orbit writes to another component; base section 1 ("read-only") is
amended for the worker only.

## 2. Costs and Executors (2a)

**Routes.** `GET /api/worker/costs?range=24h|7d|30d` over `GET /v1/costs`
with `days=1|7|30`, and `GET /api/worker/quality?range=7d|30d` over
`GET /v1/quality` with `days=7|30`. Both are session-guarded detail routes
under the worker detail pool, 4 s abort, 1 MiB cap and fixed 503 of base 7.3;
any other range is a 400. Identifiers follow the base 7.3 rule (a row whose
queue, provider or model fails is dropped; a failed secondary code is blanked
to `null`). Numbers pass through as numbers; cost is the worker's `cost_usd`, in US
dollars.

- Costs answer `{ now, rows }`, each row
  `{ day, provider, queue, attempts, succeeded, wallMs, tokensIn, tokensOut,
  costUsd }`, `day` as the UTC day start in epoch ms (the worker sends
  `YYYY-MM-DD`).
- Quality answers `{ now, attempts, ratings, judged }` with the worker's three
  aggregate lists renamed to camelCase: per queue, tier, provider and model
  the attempt outcomes and mean wall time; per queue, tier, provider and
  model the owner ratings; per queue, provider and model the judged count,
  mean score and times judged best.

**Screen.** Two sections below the existing Worker panels, inside the lazy
Worker route.

1. **Costs.** A range control of its own (24 hours | 7 days | 30 days, in the
   URL as `?costs=`). Stat tiles: attempts, tokens in, tokens out and cost for
   the range. A stacked column chart per day by provider, and a table by
   provider and queue with the same numbers. A cost of zero is shown as `0`,
   never hidden: free providers are the point of the ladder.
2. **Executors.** One row per executor (provider plus model, or runner
   profile) with: the queues it served, attempts, success rate, mean judged
   score and judged count, and a cooldown badge with time left when the
   status reports one. An executor with fewer than 20 judged answers on a
   queue shows its score dimmed with "n < 20": the worker's rule for when a
   score may reorder the ladder.

Both follow base 7.1 and 7.3: progressive detail, a "Show table" disclosure,
one tab stop per chart.

## 3. Job browser and content (2b)

### 3.1 Worker routes (admin)

- `GET /v1/admin/jobs?queue=&state=&producer=&before=<cursor>&limit=` lists
  jobs newest first, at most 100 per page, as `{ jobs, next }`: `id, queue, producer, state,
  privacy, tier, created, updated, attempts, last_error, acked, retry_of` and a
  `sampling` flag. No payload, no result.
- `GET /v1/admin/jobs/{id}` returns the same fields plus `attempt_details`
  (`node, provider, model, outcome, error, started, ended, tokens_in,
  tokens_out`) and whether an input and an output payload are still stored.
- `GET /v1/admin/jobs/{id}/content` returns `{ input, output }` for a job of
  class `public` or `internal`. For `personal`, `mail` and `secret` it
  requires the request header `X-Worker-Reveal: <class>` naming the job's
  class, else 403 `reveal_required`. A payload already deleted is `null`, and
  a job whose payloads are both gone answers 410 `content_gone`.
- Every content read of a sensitive class appends an audit row (job id,
  class, time, principal) without content; `GET /v1/admin/audit?days=N`
  and `worker audit --days N` list them, with the admin actions of 4.1.

### 3.2 orbit routes

- `GET /api/worker/jobs` and `GET /api/worker/jobs/:id` pass the list and
  detail through with base 7.3 identifier rules. They are not content
  (base 6.6): no payload.
- `GET /api/worker/jobs/:id/content` is content: never cached, never logged,
  never in an event. For a sensitive class orbit forwards
  `X-Worker-Reveal` only when the request carries `X-Orbit-Reveal: <class>`.
- **Step-up for `secret`.** A `secret` reveal also requires that the session
  re-entered the admin token within the last 5 minutes:
  `POST /api/session/step-up` with `{ token }` marks the session, with the
  same rate limits as `POST /api/session` (base 6.4). A paired-device
  session can step up the same way. Without it the route answers 403
  `step_up_required`.
- orbit records a `worker.revealed` event with the job id and class only.

### 3.3 Screen

`/worker/jobs` lists jobs with filters for queue, state and producer in the
URL, and pages with "Older". A row opens `/worker/jobs/:id`: metadata, the
attempts as a waterfall (one bar per attempt from start to end, coloured by
outcome, with node, provider, model and error), and a Content panel.

- `public` and `internal` content loads when the panel is opened.
- `personal` and `mail` show a "Reveal" button; `secret` shows "Reveal" behind
  a token prompt (step-up). Revealed content is hidden again after 60 s, on
  navigation, and when the tab is hidden, and its query entry is removed, not
  only garbage-collected.
- Content is shown as plain text in a monospace block (JSON pretty-printed),
  never rendered as Markdown or HTML, with a copy button.

## 4. Worker actions (2c)

### 4.1 Worker routes (admin)

- `POST /v1/admin/jobs/{id}/cancel` cancels any non-terminal job of any
  producer (the producer route stays producer-scoped).
- `POST /v1/admin/jobs/{id}/retry` creates a new job from a `failed`,
  `expired` or `cancelled` job whose input payload is still stored: same
  queue, producer, privacy, tier and input, a fresh id, `retry_of` set to
  the original. The original is acknowledged.
- `POST /v1/admin/jobs/{id}/ack` acknowledges a failed or control result so it
  leaves the producer's outstanding count and recent failures; a job with an
  unacknowledged output answers 409 `not_ackable`, since that output is the
  producer's to collect.
- Each answers `{ id, state }` (retry adds `retry_of`, 201 when it created
  the job, 200 when the same retry was already made: the new job's
  idempotency key is `retry:<original id>`) and records an audit row (action, job id,
  principal, time).

### 4.2 orbit

`POST /api/worker/jobs/:id/cancel|retry|ack` with base 6.5 CSRF rules. The
job detail shows the actions that apply to its state; each asks for
confirmation in a dialog naming the job and the action, and the result
refreshes the job. orbit records `worker.action` events (action, job id).
Bulk actions are out of scope.

## 5. Testing

Unit tests for every schema, mapping and identifier rule; route tests for
range validation, 503, step-up and the reveal header; Playwright for the
Costs and Executors panels, the job list and detail, a reveal with step-up
and its auto-hide, and an action with its confirmation. The fake worker in
e2e serves fixed placeholder jobs, never instance data.
