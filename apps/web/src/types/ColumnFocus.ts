import type { FocusEvent, KeyboardEvent } from 'react'

// Which bucket a chart is showing: pointer, tap and arrow keys share it.
export type ColumnFocus = {
  readonly active: number | null
  readonly show: (index: number) => void
  readonly clear: () => void
  readonly onKeyDown: (event: KeyboardEvent) => void
  readonly onFocus: (event: FocusEvent) => void
}
