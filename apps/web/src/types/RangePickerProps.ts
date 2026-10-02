import type { HistoryRange } from './HistoryRange'

export type RangePickerProps = {
  readonly range: HistoryRange
  readonly onChange: (range: HistoryRange) => void
}
