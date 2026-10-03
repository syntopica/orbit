import type { RangeOption } from '../types/RangeOption'
import type { WorkerRange } from '../types/WorkerRange'

export const WORKER_RANGE_OPTIONS: readonly RangeOption<WorkerRange>[] = [
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
]
