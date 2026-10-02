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

Remote access goes through Tailscale Serve only; orbit itself never leaves
loopback:

```bash
tailscale serve --bg --https=443 http://127.0.0.1:8790
```

Add the machine's tailnet name to `allowedHosts` and your tailnet login to
`allowedLogins` in `$SYNTOPICA_DATA/orbit/orbit.json`, then pair a phone with
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
  "launchd": {
    "labels": [
      {
        "component": "worker",
        "label": "com.example.worker.serve",
        "role": "keepalive",
        "plist": "/Users/you/Library/LaunchAgents/com.example.worker.serve.plist"
      }
    ]
  }
}
```

## Develop

```bash
pnpm install
pnpm --filter @orbit/server build && SYNTOPICA_DATA=/path/to/instance node apps/server/dist/orbit.mjs serve
pnpm --filter @orbit/web dev      # http://localhost:5173, /api proxied to 127.0.0.1:8790
pnpm gate                         # everything CI runs, including the Playwright suite
```

The dev server rewrites `Origin` to the server's own origin, because the server
accepts only its own origins.

orbit is an engine: this repository holds no instance data. Everything it shows
is discovered at runtime from the instance under `SYNTOPICA_DATA`.

License: MIT.
