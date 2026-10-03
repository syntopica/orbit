import { readCounterTotal } from '../history/readCounterTotal'
import { readLastRuns } from '../history/readLastRuns'
import type { AtriumDocuments } from '../types/AtriumDocuments'
import type { FlowInputs } from '../types/FlowInputs'
import type { FlowRouteDeps } from '../types/FlowRouteDeps'
import { componentOf } from './componentOf'
import { edgeKey } from './edgeKey'
import { FLOW_EDGES } from './flowEdges'

export const collectFlowInputs = (
  deps: FlowRouteDeps,
  atrium: AtriumDocuments | null,
): FlowInputs => {
  const now = deps.now()
  const totals = new Map<string, number | null>()
  for (const edge of FLOW_EDGES) {
    if (edge.counter === null) continue
    const { key, mode } = edge.counter
    const from = now - 86_400_000
    totals.set(
      edgeKey(edge),
      readCounterTotal(deps.historyDb, componentOf(key), key, from, mode),
    )
  }
  return {
    now,
    snapshots: new Map(deps.hub.snapshots().map((s) => [s.component, s])),
    atrium,
    refreshIntervalMs: deps.atrium?.refreshIntervalMs ?? null,
    labels: deps.stageLabels,
    lastRuns: readLastRuns(deps.historyDb, [...deps.stageLabels.values()]),
    totals,
  }
}
