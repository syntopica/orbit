import type { WorkerActivityState } from './WorkerActivityState'
import type { WorkerBodyModel } from './WorkerBodyModel'

export type WorkerBodyProps = {
  readonly body: WorkerBodyModel
  readonly isPhone: boolean
  readonly activity: WorkerActivityState
}
