import type { WorkerCostsRange } from './WorkerCostsRange'
import type { WorkerRange } from './WorkerRange'

export type WorkerSearch = {
  readonly range: WorkerRange
  readonly costs?: WorkerCostsRange
}
