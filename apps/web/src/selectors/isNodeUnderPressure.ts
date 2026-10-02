import type { WorkerNode } from '@orbit/contract'

import { PRESSURE_REASONS } from './pressureReasons'

export const isNodeUnderPressure = (node: WorkerNode): boolean =>
  (node.pressure !== null && node.pressure !== 'normal') ||
  (node.reason !== null && PRESSURE_REASONS.has(node.reason))
