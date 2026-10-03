import type { WorkerBlocker } from './WorkerBlocker'

export type WorkerDiagnosis = {
  readonly state: 'idle' | 'working' | 'blocked'
  readonly queued: number
  readonly live: number
  readonly done1h: number
  readonly blockers: readonly WorkerBlocker[]
}
