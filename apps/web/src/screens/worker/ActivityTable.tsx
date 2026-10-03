import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatCount } from '../../formatters/formatCount'
import { formatCounts } from '../../formatters/formatCounts'
import { formatDuration } from '../../formatters/formatDuration'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { ActivityTableProps } from '../../types/ActivityTableProps'
import { ActivityTableHead } from './ActivityTableHead'

// The chart's numbers without hovering: every bucket, newest first.
export const ActivityTable = ({ columns }: ActivityTableProps) => (
  <details className="text-sm">
    <summary className="text-muted cursor-pointer">
      {ACTIVITY_LABELS.showTable}
    </summary>
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-xs">
        <ActivityTableHead />
        <tbody className="divide-line divide-y tabular-nums">
          {columns.toReversed().map((c) => (
            <tr key={c.start}>
              <th scope="row" className="py-1 pr-3 text-left font-normal">
                {formatBucketRange(c.start, c.end)}
              </th>
              <td className="py-1 pr-3">
                {formatCount(c.total)}{' '}
                <span className="text-muted font-mono">
                  {c.total === 0 ? '' : formatCounts(c.segments)}
                </span>
              </td>
              <td className="py-1 pr-3 text-right">{formatCount(c.failed)}</td>
              <td className="py-1 pr-3 text-right">
                {formatCount(c.sampling)}
              </td>
              <td className="py-1 text-right">
                {c.meanWallMs === null ? '—' : formatDuration(c.meanWallMs)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
)
