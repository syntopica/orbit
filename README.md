# orbit

A control panel for a Syntopica instance: what every component is doing, what
failed, what is waiting for a human, and how the memory stack moves information
from agent sessions back into agent sessions.

## Run it

```bash
pnpm install && pnpm build
export SYNTOPICA_DATA=/path/to/instance
node apps/server/dist/orbit.mjs token create      # prints the admin token once
node apps/server/dist/orbit.mjs doctor
plist=$(mktemp) && node apps/server/dist/orbit.mjs serve --print-plist > "$plist" \
  && mv "$plist" ~/Library/LaunchAgents/com.syntopica.orbit.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.syntopica.orbit.plist
```

The plist sets `Umask` 63 (octal 077): launchd opens `orbit.log` before orbit
runs, so the plist, not orbit's own `umask`, is what makes the log `0600`.

The plist also carries a `PATH`: the directory of the node that printed it, then
the installing shell's `PATH` entries. launchd's default `PATH` finds neither
`node` nor the brain toolchain, so without it `brain` and `clips` read `down`.
Print the plist from a shell where those tools resolve, and re-print it after
upgrading node. `orbit doctor` fails when the installed plist has no `PATH`.

Remote access goes through Tailscale Serve only; orbit itself never leaves
loopback:

```bash
tailscale serve --bg --https=443 http://127.0.0.1:8790
```

Serve forwards the client's `Host` header unchanged (measured in
`docs/measurements/2026-10-03-tailscale-serve.md`), so add the machine's tailnet
name to `allowedHosts` and your tailnet login to `allowedLogins` in
`$SYNTOPICA_DATA/orbit/orbit.json`, then pair a phone with
`node apps/server/dist/orbit.mjs pair` and scan the QR code.

`orbit.json` example (placeholders):

```json
{
  "port": 8790,
  "allowedHosts": ["machine.example.ts.net"],
  "allowedLogins": ["you@example.com"],
  "worker": {
    "url": "http://127.0.0.1:8765",
    "tokenFile": "/path/to/instance/worker/state/tokens/admin.token"
  },
  "atrium": { "statusDir": "/path/to/instance/atrium/status" },
  "capture": {
    "url": "https://capture.example",
    "tokenFile": "/path/to/instance/capture.token"
  },
  "pending": {
    "todoFiles": [{ "name": "project", "path": "/path/to/project/TODO.md" }]
  },
  "engines": {
    "brain": {
      "command": "bin/brain",
      "actions": {
        "example": {
          "args": ["example-action"],
          "label": "Example action",
          "timeoutS": 600
        }
      },
      "subcommands": [
        ["lint", "--json"],
        ["doctor", "--json"]
      ]
    },
    "clips": {
      "command": "bin/clips",
      "subcommands": [
        ["status", "--json"],
        ["doctor", "--json"]
      ]
    }
  },
  "launchd": {
    "labels": [
      {
        "component": "worker",
        "label": "com.example.worker.serve",
        "role": "keepalive",
        "actions": ["restart"],
        "plist": "/Users/you/Library/LaunchAgents/com.example.worker.serve.plist"
      }
    ]
  }
}
```

`worker.url` and `capture.url` are origins: a path prefix is ignored, because
requests are built as `/api/...` against the origin. `pending.todoFiles` is
optional. Each entry has an identifier name and an absolute path; when absent,
the Pending board has no TODO sources.

`launchd.labels[].actions` allows `run` for scheduled jobs and `restart` for
keepalive services. Omit it to offer no action. `engines.<name>.actions` maps a
fixed action identifier to its argument list, button label and optional
`timeoutS` (default 600, maximum 1800). Actions need confirmation in orbit.

## Update

```bash
git pull && pnpm install && pnpm build
launchctl kickstart -k gui/$(id -u)/com.syntopica.orbit
```

Re-run `serve --print-plist` and replace the installed plist only when the
template under `launchd/` changed; then `launchctl bootout` and `bootstrap` it
again as below.

## Uninstall

```bash
launchctl bootout gui/$(id -u)/com.syntopica.orbit
rm ~/Library/LaunchAgents/com.syntopica.orbit.plist
tailscale serve --https=443 off   # only if this route serves nothing else
```

orbit's own state (sessions, history, log) lives in `$SYNTOPICA_DATA/orbit/`;
remove it only when the instance no longer needs it.

## Develop

```bash
pnpm install
pnpm build && SYNTOPICA_DATA=/path/to/instance node apps/server/dist/orbit.mjs serve
pnpm --filter @orbit/web dev      # http://localhost:5173, /api proxied to 127.0.0.1:8790
pnpm gate                         # everything CI runs, including the Playwright suite
```

The dev server rewrites `Origin` to the server's own origin, because the server
accepts only its own origins.

orbit is an engine: this repository holds no instance data. Everything it shows
is discovered at runtime from the instance under `SYNTOPICA_DATA`.

License: MIT.
