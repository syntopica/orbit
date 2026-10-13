import type { WorkerCosts, WorkerQuality } from '@orbit/contract'

import type { DetailPool } from './DetailPool'

export type WorkerAggregateOptions<Report> = {
  readonly read: ((days: number, signal: AbortSignal) => Promise<Report>) | null
  readonly pool: DetailPool
  readonly now: () => number
  readonly ranges: ReadonlyMap<string, number>
  readonly convert: (report: Report, at: number) => WorkerCosts | WorkerQuality
}
