import type { CountEntry } from './CountEntry'

export type TooltipRowsProps = {
  readonly entries: readonly CountEntry[]
  readonly keys: Readonly<Record<string, string>>
}
