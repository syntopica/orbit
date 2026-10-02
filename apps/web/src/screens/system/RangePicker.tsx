import { HISTORY_RANGES } from '../../heartbeat/historyRanges'
import { RANGE_SPECS } from '../../heartbeat/rangeSpecs'
import { SYSTEM_LABELS } from '../../labels/systemLabels'
import type { RangePickerProps } from '../../types/RangePickerProps'

export const RangePicker = ({ range, onChange }: RangePickerProps) => (
  <div
    role="group"
    aria-label={SYSTEM_LABELS.range}
    className="border-line flex gap-1 rounded-lg border p-1"
  >
    {HISTORY_RANGES.map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={option === range}
        onClick={() => {
          onChange(option)
        }}
        className="text-muted aria-pressed:bg-panel aria-pressed:text-ink rounded-md px-3 py-1 text-sm"
      >
        {RANGE_SPECS[option].label}
      </button>
    ))}
  </div>
)
