import type { WorkerNode } from '@orbit/contract'

import { WORKER_THRESHOLDS } from './workerThresholds'

// Its last release was the person coming back, and they are still there.
export const isNodeInUse = (node: WorkerNode): boolean =>
  node.lastRelease?.code === 'user_active' &&
  node.idleMs !== null &&
  node.idleMs < WORKER_THRESHOLDS.inUseIdleMs
