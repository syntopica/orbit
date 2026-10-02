import type { WorkerNode } from '@orbit/contract'

import type { WorkerBlocker } from '../types/WorkerBlocker'
import { isNodeInUse } from './isNodeInUse'
import { isNodeOnBattery } from './isNodeOnBattery'
import { isNodeStale } from './isNodeStale'
import { isNodeUnderPressure } from './isNodeUnderPressure'
import { otherNodeReason } from './otherNodeReason'

// A stale report says nothing current, so silence is its only cause.
export const nodeBlockers = (node: WorkerNode): WorkerBlocker[] => {
  const cause = (
    kind: WorkerBlocker['kind'],
    ms: number | null = null,
    code: string | null = null,
  ): WorkerBlocker => ({ kind, subject: node.name, ms, code })
  if (isNodeStale(node)) return [cause('stale', node.reportAgeMs)]
  const other = otherNodeReason(node)
  return [
    ...(isNodeInUse(node) ? [cause('in_use')] : []),
    ...(isNodeOnBattery(node) ? [cause('battery')] : []),
    ...(isNodeUnderPressure(node) ? [cause('pressure')] : []),
    ...(other === null ? [] : [cause('blocked', null, other)]),
  ]
}
