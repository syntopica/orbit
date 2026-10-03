import type { RangeOption } from './RangeOption'

export type RangePickerProps<T extends string> = {
  readonly options: readonly RangeOption<T>[]
  readonly range: T
  readonly onChange: (range: T) => void
}
