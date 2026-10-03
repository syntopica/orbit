# Brain detail commands against the spec 4 budget

Date: 2026-10-03. Ten runs each on the full instance with the environment
allowlist (`PATH`, `HOME`, `SYNTOPICA_DATA`). The sandbox denied the sysctl call
made by `/usr/bin/time -l`, so elapsed time was measured with Python's
`perf_counter` and peak resident memory with `wait4`'s `ru_maxrss`. Budget: p95
2 s and under 300 MiB RSS. The maximum of ten runs is reported as a conservative
p95 estimate.

| Command                                   | Median  | Max (p95 of 10) | Max RSS  | Load average (1/5/15 min) | Verdict |
| ----------------------------------------- | ------- | --------------- | -------- | ------------------------- | ------- |
| `brain graph --json --no-html`            | 0.511 s | 0.633 s         | 27.2 MiB | 6.62 / 9.18 / 11.38       | pass    |
| `brain graph --json --related --limit 50` | 0.558 s | 0.633 s         | 28.3 MiB | 6.62 / 9.18 / 11.38       | pass    |
| `brain page --json --id <id>`             | 0.269 s | 0.283 s         | 26.6 MiB | 6.62 / 9.18 / 11.38       | pass    |

The graph is fetched when the Brain screen opens and cached 60 s on the server;
it is never polled. `--related` and `page` are on-demand detail calls.
