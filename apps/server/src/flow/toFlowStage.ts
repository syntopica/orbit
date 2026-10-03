import type { MemoryFlow } from '@orbit/contract'

import type { FlowInputs } from '../types/FlowInputs'
import type { FlowStageSpec } from '../types/FlowStageSpec'
import { FRESH_READERS } from './freshReaders'
import { resolvePolicyMs } from './resolvePolicyMs'
import { stageMetrics } from './stageMetrics'
import { stagePending } from './stagePending'
import { stageState } from './stageState'

export const toFlowStage = (
  spec: FlowStageSpec,
  inputs: FlowInputs,
): MemoryFlow['stages'][number] => {
  const freshAt = FRESH_READERS[spec.fresh](spec, inputs)
  const policyMs = resolvePolicyMs(spec, inputs.refreshIntervalMs)
  const label = inputs.labels.get(spec.id) ?? null
  const metrics = stageMetrics(spec.metrics, inputs.snapshots)
  return {
    id: spec.id,
    component: spec.component,
    state: stageState(
      inputs.snapshots.get(spec.component),
      freshAt,
      policyMs,
      inputs.now,
    ),
    freshAt,
    policyMs,
    label,
    lastRunAt: label === null ? null : (inputs.lastRuns.get(label) ?? null),
    backlog: metrics.find((m) => m.key === spec.backlog) ?? null,
    metrics,
    pending: stagePending(spec.pending, inputs.snapshots),
  }
}
