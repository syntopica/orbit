import type { WorkerBodyModel } from './WorkerBodyModel'

export type WorkerModel = {
  readonly body: WorkerBodyModel | null
  readonly failed: boolean
  readonly isPhone: boolean
}
