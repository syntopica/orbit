import type { FlowEdgeSpec } from '../types/FlowEdgeSpec'

export const edgeKey = (edge: Pick<FlowEdgeSpec, 'from' | 'to'>): string =>
  `${edge.from}>${edge.to}`
