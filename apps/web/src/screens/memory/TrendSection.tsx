import { HISTORY_RANGE_OPTIONS } from '../../heartbeat/historyRangeOptions'
import type { TrendSectionProps } from '../../types/TrendSectionProps'
import { RangePicker } from '../system/RangePicker'
import { TrendBody } from './TrendBody'

export const TrendSection = ({
  title,
  chartLabel,
  trend,
  range,
  setRange,
}: TrendSectionProps) => (
  <section
    aria-label={title}
    className="border-line bg-panel space-y-3 rounded-xl border p-4"
  >
    <header className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <RangePicker
        options={HISTORY_RANGE_OPTIONS}
        range={range}
        onChange={setRange}
      />
    </header>
    <TrendBody chartLabel={chartLabel} trend={trend} />
  </section>
)
