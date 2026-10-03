import type { FlowStageId } from '@orbit/contract'

import type { LabelEntry } from '../types/LabelEntry'

export const buildStageLabels = (
  labels: readonly LabelEntry[],
): ReadonlyMap<FlowStageId, string> => {
  const map = new Map<FlowStageId, string>()
  for (const entry of labels)
    if (entry.stage !== undefined && !map.has(entry.stage))
      map.set(entry.stage, entry.label)
  return map
}
