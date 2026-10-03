import type { ComponentId, MemoryFlow, Metric, Snapshot } from '@orbit/contract'

import { componentOf } from './componentOf'

export const stageMetrics = (
  keys: readonly Metric['key'][],
  snapshots: ReadonlyMap<ComponentId, Snapshot>,
): MemoryFlow['stages'][number]['metrics'] =>
  keys.flatMap((key) => {
    const metric = snapshots
      .get(componentOf(key))
      ?.metrics.find((m) => m.key === key)
    return metric === undefined ? [] : [{ key, value: metric.value }]
  })
