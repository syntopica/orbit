import type { FlowStageId, MemoryFlow } from '@orbit/contract'

import { FLOW_LAYOUT } from '../charts/flowLayout'
import { particleDurationS } from '../charts/particleDurationS'
import type { FlowGraph } from '../types/FlowGraph'

export const selectFlowGraph = (
  flow: MemoryFlow,
  selectedId: FlowStageId | null,
  onSelect: (id: FlowStageId | null) => void,
  animate: boolean,
): FlowGraph => ({
  nodes: flow.stages.map((stage) => ({
    id: stage.id,
    type: 'stage',
    position: FLOW_LAYOUT[stage.id],
    data: { stage, selected: stage.id === selectedId, onSelect },
    draggable: false,
    selectable: false,
  })),
  edges: flow.edges.map((edge) => ({
    id: `${edge.from}>${edge.to}`,
    source: edge.from,
    target: edge.to,
    type: 'flow',
    data: {
      perHour: edge.perHour,
      durationS:
        animate && edge.flowing ? particleDurationS(edge.perHour) : null,
    },
  })),
})
