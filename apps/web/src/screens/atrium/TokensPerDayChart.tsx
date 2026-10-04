import { ACTIVITY_CHART_HEIGHT } from '../../charts/activityChartHeight'
import { TOKEN_FILLS } from '../../charts/tokenFills'
import { TOKEN_KEYS } from '../../charts/tokenKeys'
import { describeTokenColumn } from '../../formatters/describeTokenColumn'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import { TREND_LABELS } from '../../labels/trendLabels'
import { selectTokenColumns } from '../../selectors/selectTokenColumns'
import type { TokensPerDayChartProps } from '../../types/TokensPerDayChartProps'
import { ChartLegend } from '../worker/ChartLegend'
import { StackedColumns } from '../worker/StackedColumns'

// Tokens per UTC day by when the registry gained the record.
export const TokensPerDayChart = ({ daily }: TokensPerDayChartProps) => {
  const columns = selectTokenColumns(daily)
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{ATRIUM_LABELS.tokens}</h3>
      <ChartLegend keys={['input', 'output']} swatches={TOKEN_KEYS} />
      <StackedColumns
        columns={columns}
        bucketMs={86_400_000}
        fills={TOKEN_FILLS}
        label={ATRIUM_LABELS.tokensChart}
        height={ACTIVITY_CHART_HEIGHT}
        describe={describeTokenColumn}
        renderTooltip={(c) => (
          <span className="whitespace-nowrap">{describeTokenColumn(c)}</span>
        )}
      />
      <details className="text-sm">
        <summary className="text-muted cursor-pointer">
          {TREND_LABELS.showTable}
        </summary>
        <ul className="mt-2 text-xs tabular-nums">
          {columns.toReversed().map((c) => (
            <li key={c.start}>{describeTokenColumn(c)}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}
