import type { RangeOption } from '../types/RangeOption'
import type { WorkerCostsRange } from '../types/WorkerCostsRange'

export const WORKER_COSTS_RANGE_OPTIONS: readonly RangeOption<WorkerCostsRange>[] =
  [
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
  ]
