import type { CountEntry } from './CountEntry'

// One bucket of a stacked column chart; segments bottom to top.
export type StackColumn = {
  readonly start: number
  readonly end: number
  readonly segments: readonly CountEntry[]
  readonly total: number
}
