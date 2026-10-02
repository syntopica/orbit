import type { WorkerNode } from '@orbit/contract'

import { PRESSURE_REASONS } from './pressureReasons'

// A block reason the battery and pressure causes do not already explain.
export const otherNodeReason = (node: WorkerNode): string | null =>
  node.reason === null ||
  node.reason === 'on_battery' ||
  PRESSURE_REASONS.has(node.reason)
    ? null
    : node.reason
