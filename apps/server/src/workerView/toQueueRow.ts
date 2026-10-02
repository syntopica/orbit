import type { WorkerQueue } from '@orbit/contract'

import type { WorkerStatus } from '../types/WorkerStatus'
import { secondsToMs } from './secondsToMs'

export const toQueueRow = (
  name: string,
  queue: WorkerStatus['queues'][string],
): WorkerQueue => {
  const count = (state: string): number => queue.states[state] ?? 0
  return {
    name,
    queued: count('queued'),
    live: count('leased') + count('running') + count('draining'),
    failed: count('failed'),
    succeeded: count('succeeded'),
    oldestQueuedMs:
      queue.oldest_queued_s === null
        ? null
        : secondsToMs(queue.oldest_queued_s),
    done1h: queue.done_1h,
  }
}
