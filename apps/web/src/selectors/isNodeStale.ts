import type { WorkerNode } from '@orbit/contract'

import { WORKER_THRESHOLDS } from './workerThresholds'

export const isNodeStale = (node: WorkerNode): boolean =>
  node.reportAgeMs > WORKER_THRESHOLDS.staleReportMs
