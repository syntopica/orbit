import { failureFillsFor } from '../../charts/failureFillsFor'
import { failureKeysFor } from '../../charts/failureKeysFor'
import { formatFailureSummary } from '../../formatters/formatFailureSummary'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { FailureChartProps } from '../../types/FailureChartProps'
import { ChartLegend } from './ChartLegend'
import { FailureTable } from './FailureTable'
import { FailureTooltip } from './FailureTooltip'
import { StackedColumns } from './StackedColumns'

export const FailureChart = ({
  failures,
  bucketMs,
  stale,
}: FailureChartProps) => (
  <div
    data-stale={stale}
    className="border-line bg-panel space-y-3 rounded-xl border p-4 transition-opacity data-[stale=true]:opacity-50"
  >
    <p className="text-sm">{ACTIVITY_LABELS.failuresChart}</p>
    <ChartLegend
      keys={failures.keys}
      swatches={failureKeysFor(failures.keys)}
    />
    <StackedColumns
      columns={failures.columns}
      bucketMs={bucketMs}
      fills={failureFillsFor(failures.keys)}
      label={ACTIVITY_LABELS.failuresChart}
      height={96}
      describe={formatFailureSummary}
      renderTooltip={(column) => (
        <FailureTooltip column={column} keys={failureKeysFor(failures.keys)} />
      )}
    />
    <FailureTable columns={failures.columns} />
  </div>
)
