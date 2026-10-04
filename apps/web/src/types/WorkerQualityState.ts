import type { WorkerQuality } from '@orbit/contract'

export type WorkerQualityState = {
  readonly view: WorkerQuality | null
  readonly failed: boolean
}
