import type { LaunchdObservation } from './LaunchdObservation'
import type { LaunchdRow } from './LaunchdRow'

export type BucketInput = {
  readonly covered: boolean
  readonly role: LaunchdRow['role']
  readonly intervalMs: number | null
  readonly inBucket: readonly LaunchdObservation[]
  readonly atEnd: LaunchdObservation | null
  readonly runInBucket: boolean
  readonly missWindow: {
    readonly watched: boolean
    readonly ran: boolean
  } | null
}
