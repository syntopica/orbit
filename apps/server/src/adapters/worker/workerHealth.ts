import type { SnapshotCore } from '@orbit/contract'

import { WORKER_LAG_LIMIT_S } from './workerLagLimit'

export const workerHealth = (oldestQueuedS: number): SnapshotCore['health'] =>
  oldestQueuedS > WORKER_LAG_LIMIT_S
    ? { state: 'warn', reason: 'lagging' }
    : { state: 'ok', reason: null }
