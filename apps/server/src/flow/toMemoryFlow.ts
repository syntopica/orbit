import type { MemoryFlow } from '@orbit/contract'

import type { FlowInputs } from '../types/FlowInputs'
import { FLOW_STAGES } from './flowStages'
import { toFlowEdges } from './toFlowEdges'
import { toFlowStage } from './toFlowStage'

export const toMemoryFlow = (inputs: FlowInputs): MemoryFlow => {
  const stages = FLOW_STAGES.map((spec) => toFlowStage(spec, inputs))
  return { now: inputs.now, stages, edges: toFlowEdges(stages, inputs.totals) }
}
