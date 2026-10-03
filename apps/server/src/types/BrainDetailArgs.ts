import type { BrainDetailView } from './BrainDetailView'
import type { DetailPool } from './DetailPool'

export type BrainDetailArgs<T> = readonly [
  read: ((signal: AbortSignal) => Promise<T>) | null,
  toView: (doc: T, now: number) => BrainDetailView,
  pool: DetailPool,
  now: () => number,
  timeoutMs: number,
]
