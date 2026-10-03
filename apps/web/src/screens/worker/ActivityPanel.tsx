import { ACTIVITY_CHART_HEIGHT } from '../../charts/activityChartHeight'
import { ACTIVITY_FILLS } from '../../charts/activityFills'
import { ACTIVITY_KEYS } from '../../charts/activityKeys'
import { formatActivitySummary } from '../../formatters/formatActivitySummary'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { ActivityPanelProps } from '../../types/ActivityPanelProps'
import { ActivityTable } from './ActivityTable'
import { ActivityTooltip } from './ActivityTooltip'
import { ChartLegend } from './ChartLegend'
import { OpenrouterTile } from './OpenrouterTile'
import { StackedColumns } from './StackedColumns'

// A refetch for another range keeps this render, dimmed, until it lands.
export const ActivityPanel = ({ model, stale }: ActivityPanelProps) => (
  <div
    data-stale={stale}
    className="grid gap-3 transition-opacity data-[stale=true]:opacity-50 md:grid-cols-[minmax(0,1fr)_auto]"
  >
    <div className="border-line bg-panel min-w-0 space-y-3 rounded-xl border p-4">
      <div className="space-y-1">
        <p className="text-sm">{ACTIVITY_LABELS.chart}</p>
        <p className="text-muted text-xs">{ACTIVITY_LABELS.chartHint}</p>
      </div>
      {model.series.length > 0 && (
        <ChartLegend keys={model.series} swatches={ACTIVITY_KEYS} />
      )}
      <StackedColumns
        columns={model.columns}
        bucketMs={model.bucketMs}
        fills={ACTIVITY_FILLS}
        label={ACTIVITY_LABELS.chart}
        height={ACTIVITY_CHART_HEIGHT}
        describe={formatActivitySummary}
        renderTooltip={(column) => <ActivityTooltip column={column} />}
      />
      <ActivityTable columns={model.columns} />
    </div>
    <OpenrouterTile today={model.openrouter} bucketMs={model.bucketMs} />
  </div>
)
