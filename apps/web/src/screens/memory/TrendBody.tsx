import { TREND_LABELS } from '../../labels/trendLabels'
import type { TrendBodyProps } from '../../types/TrendBodyProps'
import { ChartLegend } from '../worker/ChartLegend'
import { TrendChart } from './TrendChart'
import { TrendSummary } from './TrendSummary'
import { TrendTable } from './TrendTable'

// A range change keeps the previous render at half opacity (spec 7.3).
export const TrendBody = ({ chartLabel, trend }: TrendBodyProps) => {
  if (trend.failed) return <p role="alert">{TREND_LABELS.unavailable}</p>
  if (trend.model === null)
    return <p className="text-muted">{TREND_LABELS.loading}</p>
  const { lines } = trend.model
  return (
    <div className={`space-y-2 ${trend.stale ? 'opacity-50' : ''}`}>
      <TrendSummary model={trend.model} />
      <ChartLegend
        keys={lines.map((line) => line.label)}
        swatches={Object.fromEntries(lines.map((l) => [l.label, l.swatch]))}
      />
      <TrendChart label={chartLabel} model={trend.model} />
      <TrendTable model={trend.model} />
    </div>
  )
}
