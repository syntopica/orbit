import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatTrendValue } from '../../formatters/formatTrendValue'
import { TREND_LABELS } from '../../labels/trendLabels'
import type { TrendTableProps } from '../../types/TrendTableProps'

// The chart's numbers without hovering: every bucket, newest first.
export const TrendTable = ({ model }: TrendTableProps) => (
  <details className="text-sm">
    <summary className="text-muted cursor-pointer">
      {TREND_LABELS.showTable}
    </summary>
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted">
            <th scope="col" className="py-1 pr-3 text-left font-normal">
              {TREND_LABELS.bucket}
            </th>
            {model.lines.map((line) => (
              <th
                key={line.key}
                scope="col"
                className="py-1 pr-3 text-right font-normal"
              >
                {line.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-line divide-y tabular-nums">
          {model.starts.toReversed().map((start, r) => {
            const i = model.starts.length - 1 - r
            return (
              <tr key={start}>
                <th scope="row" className="py-1 pr-3 text-left font-normal">
                  {formatBucketRange(start, start + model.bucketMs)}
                </th>
                {model.lines.map((line) => (
                  <td key={line.key} className="py-1 pr-3 text-right">
                    {formatTrendValue(line.values[i])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </details>
)
