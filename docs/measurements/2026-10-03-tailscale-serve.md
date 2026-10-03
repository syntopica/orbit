# Host header behind Tailscale Serve (2026-10-03)

Setup: orbit on `127.0.0.1:8790`,
`tailscale serve --bg --https=443 http://127.0.0.1:8790` (Tailscale 1.102.4,
macOS), `allowedHosts` holding the machine's tailnet name, `allowedLogins`
holding the tailnet login.

Requests to `https://<tailnet-name>/api/snapshots`, made through Serve from a
tailnet device:

| Request                                               | Response           | Meaning                                                                                              |
| ----------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `Host: <tailnet-name>`, `Sec-Fetch-Site: same-origin` | 401 `unauthorized` | Serve forwards the original Host; host allowlist and tailnet login pass; only the session is missing |
| Same, without `Sec-Fetch-Site`                        | 403 `forbidden`    | same-origin guard                                                                                    |
| `Host: evil.example` (SNI still the tailnet name)     | 421 `misdirected`  | Serve passes the Host through unchanged and orbit's allowlist rejects it                             |

So orbit sees the client's Host header, not `127.0.0.1:8790`: the tailnet name
must be in `allowedHosts`, and a request carrying any other Host is refused by
orbit itself.
