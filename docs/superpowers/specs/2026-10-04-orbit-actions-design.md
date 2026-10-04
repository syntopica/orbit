# orbit sub-project 5 (Actions) - design

Status: draft, revision 1. Scope: sub-project 5 of
`2026-10-01-orbit-design.md` section 2, writes through engine interfaces.
Every rule of the base spec holds; "base 5.3" points there. Worker actions
shipped with sub-project 2 (`2026-10-04-orbit-worker-design.md` section 4)
and are not repeated here.

## 1. What orbit may do

| Action | Mechanism | Where it is offered |
| --- | --- | --- |
| Run a scheduled job now | `launchctl kickstart gui/<uid>/<label>` | System screen, a label with role `scheduled` |
| Restart a resident service | `launchctl kickstart -k gui/<uid>/<label>` | System screen, a label with role `keepalive` |
| Run an engine action | an entry of `engines.<name>.actions` | the engine's screen |

Not offered: clips ingest (it needs the owner to read and approve a diff,
which orbit does not show), curation proposal review (waits for an Atrium
review API), anything not listed in `orbit.json`.

## 2. Configuration

- `launchd.labels[]` gains an optional `actions` list, each `run` or
  `restart`; a label without it offers nothing. `run` is valid only for role
  `scheduled`, `restart` only for `keepalive`; anything else is a
  configuration error found at start and by `orbit doctor`.
- `engines.<name>.actions` is a map from an action id (identifier, base 7.3)
  to `{ "args": [...], "label": "...", "timeoutS": n }`: a fixed argument
  list with no placeholders, a short human label, and a timeout of at most
  1800 s (default 600). The runner rules of base 5.3 apply (absolute command,
  `shell: false`, own process group, killed as a group on timeout).

## 3. Routes

- `POST /api/launchd/:label/run` and `POST /api/launchd/:label/restart`.
- `POST /api/engines/:engine/actions/:action`.
- All require a session and the CSRF header (base 6.5). An unknown label,
  engine or action, or an action the label does not list, is 404 with a fixed
  body.
- **Remote step-up.** A request whose `Host` is a published (tailnet) host
  also needs the admin token re-entered on that session within the last five
  minutes (`POST /api/session/step-up`, the same window as secret reveal);
  otherwise 403 `step_up_required`, and the confirmation dialog asks for the
  token and retries. Loopback requests, from the machine itself, skip it. The
  worker job actions (`cancel`, `retry`, `ack`) follow the same rule.
- **Single flight.** One run per action (or label) at a time; a second
  request while one runs answers 409 `already_running` with the start time.
- **Rate limit.** 10 action requests per minute per session, counted like the
  auth limits (base 6.4).
- The answer is `{ id, state: "started" }` at once; the outcome arrives as
  events `action.started`, `action.succeeded` or `action.failed` with
  `{ id, kind, target, exitCode, durationMs }` and nothing else: no stdout,
  no stderr (they may hold content; base 6.6). `GET /api/actions` lists the
  last 50 runs with the same fields.
- Restarting orbit's own LaunchAgent is refused (400 `self`): the request
  would kill the process answering it.

## 4. Screens

- **System:** each label row shows the actions it allows as buttons. Each opens
  a confirmation dialog naming the label and what will happen ("Run now" /
  "Restart, interrupting any work it holds"). While running, the button shows
  a spinner and the row links to the run in the ticker.
- **Engine screens:** an "Actions" menu lists the engine's actions by label,
  with the same dialog and state.
- **Home ticker:** action events render as "<target> run started / succeeded
  in 12 s / failed (exit 1)".

## 5. Testing

Unit tests for configuration validation (role/action pairing, timeout cap,
placeholder refusal), the single-flight and rate-limit stores, and event
shapes; route tests for 404, 409, 429, the self-restart refusal, timeout
killing the process group, and that no stdout or stderr reaches an event or a
response; Playwright for a run with its confirmation and resulting ticker
event against fake launchctl and fake engine commands.
