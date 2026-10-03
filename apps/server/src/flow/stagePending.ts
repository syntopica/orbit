import type {
  ComponentId,
  MemoryFlow,
  Pending,
  Snapshot,
} from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'
import { componentOf } from './componentOf'

export const stagePending = (
  keys: readonly Pending['key'][],
  snapshots: ReadonlyMap<ComponentId, Snapshot>,
): MemoryFlow['stages'][number]['pending'] =>
  keys.flatMap((key) => {
    const item = snapshots
      .get(componentOf(key))
      ?.pending.find((p) => p.key === key)
    return item === undefined
      ? []
      : [{ key, count: item.count, oldestAt: epochOrNull(item.oldestAt) }]
  })
