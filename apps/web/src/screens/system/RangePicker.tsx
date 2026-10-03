import { SYSTEM_LABELS } from '../../labels/systemLabels'
import type { RangePickerProps } from '../../types/RangePickerProps'

export const RangePicker = <T extends string>({
  options,
  range,
  onChange,
}: RangePickerProps<T>) => (
  <div
    role="group"
    aria-label={SYSTEM_LABELS.range}
    className="border-line flex gap-1 rounded-lg border p-1"
  >
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={option.value === range}
        onClick={() => {
          onChange(option.value)
        }}
        className="text-muted aria-pressed:bg-panel aria-pressed:text-ink rounded-md px-3 py-1 text-sm"
      >
        {option.label}
      </button>
    ))}
  </div>
)
