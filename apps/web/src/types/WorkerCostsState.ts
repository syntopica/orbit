import type { WorkerCosts } from '@orbit/contract'

import type { WorkerCostsRange } from './WorkerCostsRange'

export type WorkerCostsState = {
  readonly view: WorkerCosts | null
  readonly stale: boolean
  readonly failed: boolean
  readonly range: WorkerCostsRange
  readonly setRange: (range: WorkerCostsRange) => void
}
