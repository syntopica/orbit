import type { BrainGraph } from '@orbit/contract'

// notes/b links to notes/a; notes/c links to notes/b and nothing links to it.
export const BRAIN_GRAPH: BrainGraph = {
  now: 1_790_000_000_000,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1, orphan: false },
    { id: 'notes/b', type: 'topic', degree: 2, orphan: false },
    { id: 'notes/c', type: 'project', degree: 1, orphan: true },
  ],
  edges: [
    [1, 0],
    [2, 1],
  ],
  dangling: 0,
  skipped: 0,
}
