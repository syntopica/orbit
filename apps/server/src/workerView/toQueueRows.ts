import type { WorkerQueue } from '@orbit/contract'

import type { WorkerStatus } from '../types/WorkerStatus'
import { compareQueues } from './compareQueues'
import { isIdentifier } from './isIdentifier'
import { toQueueRow } from './toQueueRow'

// Most queued first, then most failed: the rows that need a look lead.
export const toQueueRows = (queues: WorkerStatus['queues']): WorkerQueue[] =>
  Object.entries(queues)
    .filter(([name]) => isIdentifier(name))
    .map(([name, queue]) => toQueueRow(name, queue))
    .toSorted(compareQueues)
