import type { WorkerView } from '@orbit/contract'

import type { WorkerStatus } from '../types/WorkerStatus'
import { toCooldownRows } from './toCooldownRows'
import { toFailureRows } from './toFailureRows'
import { toNodeRows } from './toNodeRows'
import { toQueueRows } from './toQueueRows'

// Only allowlisted fields leave: names, counts, codes and times (spec 6.6).
export const toWorkerView = (
  status: WorkerStatus,
  now: number,
): WorkerView => ({
  now,
  queues: toQueueRows(status.queues),
  nodes: toNodeRows(status.nodes),
  cooldowns: toCooldownRows(status.cooldowns, now),
  failures: toFailureRows(status.recent_failures),
})
