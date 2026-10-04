import type { WorkerCosts } from '@orbit/contract'

import type { WorkerCostsRange } from './WorkerCostsRange'

export type CostsPanelProps = {
  readonly view: WorkerCosts
  readonly range: WorkerCostsRange
  readonly stale: boolean
}
