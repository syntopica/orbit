import type { WorkerView } from '@orbit/contract'

import type { WorkerBodyModel } from '../types/WorkerBodyModel'
import { diagnoseWorker } from './diagnoseWorker'
import { groupFailures } from './groupFailures'
import { splitQueues } from './splitQueues'

export const selectWorkerBody = (view: WorkerView): WorkerBodyModel => {
  const queues = splitQueues(view.queues)
  return {
    view,
    diagnosis: diagnoseWorker(view),
    activeQueues: queues.active,
    idleQueues: queues.idle,
    failures: groupFailures(view.failures),
  }
}
