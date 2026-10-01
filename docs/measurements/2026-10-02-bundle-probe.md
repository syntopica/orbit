# Bundle probe against the spec budget

Date: 2026-10-02. Throwaway Vite build of three entries (shell, graph, flow),
each rendering its features so tree shaking keeps them. Sizes are brotli bytes
per emitted chunk, measured with the `brotli` CLI (`brotli -c <file> | wc -c`).

## Library versions (probe lockfile)

react 19.3.0, react-dom 19.3.0, sigma 3.0.3, graphology 0.26.0,
graphology-layout-forceatlas2 0.10.1, graphology-communities-louvain 2.0.2,
@react-sigma/core 5.0.6, @xyflow/react 12.12.0, recharts 3.10.1, cmdk 1.1.1,
@tanstack/react-router 1.170.41, @tanstack/react-query 5.104.0, motion 13.4.6,
vite 8.3.1, @vitejs/plugin-react 6.1.1.

## Chunks (brotli)

| Chunk                  | Contents                                             | Bytes   |
| ---------------------- | ---------------------------------------------------- | ------- |
| shell                  | router, query, cmdk, motion                          | 77,307  |
| graph                  | sigma, graphology, forceatlas2, louvain, react-sigma | 39,428  |
| flow                   | xyflow, recharts                                     | 126,575 |
| jsx-runtime (shared)   | react, react-dom                                     | 58,275  |
| with-selector (shared) | use-sync-external-store shim                         | 658     |

Each entry also loads the shared chunks, so the effective cost is entry plus
shared (about 58.9 KB): shell 136.2 KB, graph 98.4 KB, flow 185.5 KB.

## Verdict against spec 11

- Initial route (150 KB): shell with shared chunks is 136.2 KB. Pass.
- Graph chunk (250 KB): 39.4 KB alone, 98.4 KB with shared. Pass.
- Flow chunk (250 KB): 126.6 KB alone, 185.5 KB with shared. Pass. Dominated by
  recharts and xyflow.

The probe measures library cost only. The scaffolded template app's initial
route is 62.6 KB brotli, and `apps/web/.size-limit.json` now enforces 150 KB on
`dist/assets/index-*.js`.
