import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatCount } from '../../formatters/formatCount'
import { formatCounts } from '../../formatters/formatCounts'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { FailureTableProps } from '../../types/FailureTableProps'

// Buckets with failures only, newest first.
export const FailureTable = ({ columns }: FailureTableProps) => (
  <details className="text-sm">
    <summary className="text-muted cursor-pointer">
      {ACTIVITY_LABELS.showTable}
    </summary>
    <ul className="divide-line mt-2 divide-y text-xs">
      {columns
        .filter((c) => c.total > 0)
        .toReversed()
        .map((c) => (
          <li key={c.start} className="flex flex-wrap gap-x-3 py-1">
            <span className="text-muted">
              {formatBucketRange(c.start, c.end)}
            </span>
            <strong className="font-semibold tabular-nums">
              {formatCount(c.total)}
            </strong>
            <span className="font-mono break-all">
              {formatCounts(c.segments)}
            </span>
          </li>
        ))}
    </ul>
  </details>
)
