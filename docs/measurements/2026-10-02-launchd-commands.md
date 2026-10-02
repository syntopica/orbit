# launchd command cost against the spec budget

Date: 2026-10-02. Each command was run 20 times with `/usr/bin/time -l` on the
development machine: `launchctl print gui/<uid>/<loaded-label>` against a loaded
label, and `plutil -convert json -o - <plist>` against a LaunchAgent plist.
Labels and paths are omitted on purpose.

| Command                | p95 wall time | Peak RSS |
| ---------------------- | ------------- | -------- |
| `launchctl print`      | under 0.01 s  | 2.0 MB   |
| `plutil -convert json` | 0.01 s        | 2.7 MB   |

Budget (spec 5.3): under 2 s at p95 and under 300 MB peak RSS. Both pass, so
both commands are polled.
