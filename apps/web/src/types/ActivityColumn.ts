import type { CountEntry } from './CountEntry'
import type { StackColumn } from './StackColumn'

export type ActivityColumn = StackColumn & {
  readonly failed: number
  readonly sampling: number
  readonly meanWallMs: number | null
  readonly errors: readonly CountEntry[]
}
