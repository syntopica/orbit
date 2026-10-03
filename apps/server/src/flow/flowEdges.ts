import type { FlowEdgeSpec } from '../types/FlowEdgeSpec'

// Only an edge with a counter can carry particles (D6).
export const FLOW_EDGES: readonly FlowEdgeSpec[] = [
  { from: 'archive', to: 'episodes', counter: null },
  {
    from: 'archive',
    to: 'synthesis',
    counter: { key: 'atrium.records', mode: 'delta' },
  },
  {
    from: 'synthesis',
    to: 'index',
    counter: { key: 'atrium.synth_synthesized', mode: 'sum' },
  },
  { from: 'episodes', to: 'index', counter: null },
  { from: 'episodes', to: 'curation', counter: null },
  { from: 'curation', to: 'brain', counter: null },
  { from: 'clips', to: 'brain', counter: null },
  { from: 'brain', to: 'index', counter: null },
  { from: 'index', to: 'retrieval', counter: null },
]
