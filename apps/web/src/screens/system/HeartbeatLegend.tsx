import { formatDuration } from '../../formatters/formatDuration'
import { RANGE_SPECS } from '../../heartbeat/rangeSpecs'
import { BUCKET_LABELS } from '../../labels/bucketLabels'
import { BUCKET_LEGEND_ORDER } from '../../labels/bucketLegendOrder'
import type { HistoryRange } from '../../types/HistoryRange'

// One key for every strip: the colours, what one bar covers, and which end is
// now, so a strip reads without hovering.
export const HeartbeatLegend = ({ range }: { range: HistoryRange }) => {
  const spec = RANGE_SPECS[range]
  return (
    <div className="text-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {BUCKET_LEGEND_ORDER.map((state) => (
          <li key={state} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              data-state={state}
              className="bg-unknown/40 data-[state=failed]:bg-down data-[state=idle]:bg-line data-[state=missed]:bg-warn data-[state=ok]:bg-ok h-3 w-1 rounded-sm"
            />
            {BUCKET_LABELS[state]}
          </li>
        ))}
      </ul>
      <p>
        {`One bar per ${formatDuration(spec.spanMs / spec.buckets)}; oldest on the left, now on the right.`}
      </p>
    </div>
  )
}
