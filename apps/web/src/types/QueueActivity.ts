import type { CountEntry } from './CountEntry'

// One queue's production attempts over the selected range.
export type QueueActivity = {
  readonly succeeded: readonly number[]
  readonly outcomes: readonly CountEntry[]
  readonly providers: readonly CountEntry[]
  readonly errors: readonly CountEntry[]
  readonly meanWallMs: number | null
  readonly tokensIn: number
  readonly tokensOut: number
}
