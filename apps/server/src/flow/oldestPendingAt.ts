import { epochOrNull } from '../time/epochOrNull'
import type { FlowInputs } from '../types/FlowInputs'
import type { FlowStageSpec } from '../types/FlowStageSpec'

// No waiting item means no measured freshness instant (spec 7.4).
export const oldestPendingAt = (
  spec: FlowStageSpec,
  inputs: FlowInputs,
): number | null => {
  const snapshot = inputs.snapshots.get(spec.component)
  if (snapshot === undefined || spec.backlog === null) return null
  const item = snapshot.pending.find((p) => p.key === spec.backlog)
  return item === undefined ? null : epochOrNull(item.oldestAt)
}
