import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatCount } from '../../formatters/formatCount'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { QueueSparkTableProps } from '../../types/QueueSparkTableProps'

// The sparkline's numbers without hovering: buckets with successes only.
export const QueueSparkTable = ({ model, values }: QueueSparkTableProps) => (
  <details>
    <summary className="text-muted cursor-pointer">
      {ACTIVITY_LABELS.showTable}
    </summary>
    <ul className="mt-1 space-y-0.5">
      {model.starts
        .map((start, i) => ({ start, value: values[i] ?? 0 }))
        .filter((b) => b.value > 0)
        .toReversed()
        .map((b) => (
          <li key={b.start} className="flex gap-3">
            <span className="text-muted">
              {formatBucketRange(b.start, b.start + model.bucketMs)}
            </span>
            <span className="tabular-nums">
              {formatCount(b.value)} {ACTIVITY_LABELS.succeeded}
            </span>
          </li>
        ))}
    </ul>
  </details>
)
