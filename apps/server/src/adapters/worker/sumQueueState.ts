import type { WorkerStatus } from '../../types/WorkerStatus'

export const sumQueueState = (status: WorkerStatus, name: string): number =>
  Object.values(status.queues).reduce(
    (total, queue) => total + (queue.states[name] ?? 0),
    0,
  )
