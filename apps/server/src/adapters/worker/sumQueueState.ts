import type { WorkerStatus } from '../../types/WorkerStatus'
import { productionCount } from './productionCount'

export const sumQueueState = (status: WorkerStatus, name: string): number =>
  Object.values(status.queues).reduce(
    (total, queue) => total + productionCount(queue, name),
    0,
  )
