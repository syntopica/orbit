import type { MemoryFlow } from '@orbit/contract'

import { edgeKey } from './edgeKey'
import { FLOW_EDGES } from './flowEdges'

// A rate over the last 24 h; particles stop behind a stale upstream (D6).
export const toFlowEdges = (
  stages: MemoryFlow['stages'],
  totals: ReadonlyMap<string, number | null>,
): MemoryFlow['edges'] => {
  const stateOf = new Map(stages.map((stage) => [stage.id, stage.state]))
  return FLOW_EDGES.map((edge) => {
    const total = totals.get(edgeKey(edge)) ?? null
    const perHour = total === null ? null : total / 24
    const upstream = stateOf.get(edge.from)
    const stale = upstream === 'warn' || upstream === 'down'
    return {
      from: edge.from,
      to: edge.to,
      perHour,
      flowing: perHour !== null && perHour > 0 && !stale,
    }
  })
}
