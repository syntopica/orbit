import { formatCount } from '../../formatters/formatCount'
import { formatTrendChange } from '../../formatters/formatTrendChange'
import { summarizeTrendLine } from '../../selectors/summarizeTrendLine'
import type { TrendModel } from '../../types/TrendModel'

// Each line's current value and its change, so the chart below explains a
// movement instead of only drawing it.
export const TrendSummary = ({ model }: { model: TrendModel }) => (
  <dl className="flex flex-wrap gap-x-8 gap-y-2">
    {model.lines.map((line) => {
      const summary = summarizeTrendLine(line.values)
      return (
        <div key={line.label} className="space-y-0.5">
          <dt className="text-muted font-mono text-xs">{line.label}</dt>
          <dd className="text-xl font-semibold tabular-nums">
            {summary === null ? '—' : formatCount(summary.latest)}
          </dd>
          {summary === null ? null : (
            <dd className="text-muted text-xs">
              {formatTrendChange(summary.change)}
            </dd>
          )}
        </div>
      )
    })}
  </dl>
)
