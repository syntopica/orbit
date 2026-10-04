import { ACTIVITY_FILLS } from '../../charts/activityFills'
import { ACTIVITY_KEYS } from '../../charts/activityKeys'
import { formatCostSummary } from '../../formatters/formatCostSummary'
import { isCostEmpty } from '../../selectors/isCostEmpty'
import { selectCostColumns } from '../../selectors/selectCostColumns'
import { selectCostTableRows } from '../../selectors/selectCostTableRows'
import { selectCostTotals } from '../../selectors/selectCostTotals'
import { selectDailyCostRows } from '../../selectors/selectDailyCostRows'
import type { CostsPanelProps } from '../../types/CostsPanelProps'
import { ChartLegend } from './ChartLegend'
import { CostsTable } from './CostsTable'
import { CostStats } from './CostStats'
import { CostTooltip } from './CostTooltip'
import { StackedColumns } from './StackedColumns'

export const CostsPanel = ({ view, range, stale }: CostsPanelProps) => {
  const columns = selectCostColumns(view, range)
  const keys = [
    ...new Set(
      columns.flatMap((column) => column.segments.map((entry) => entry.key)),
    ),
  ]
  return (
    <div
      data-stale={stale}
      className="space-y-3 transition-opacity data-[stale=true]:opacity-50"
    >
      <CostStats totals={selectCostTotals(view.rows)} />
      <div className="border-line bg-panel space-y-3 rounded-xl border p-4">
        <p className="text-sm">Cost per day by provider</p>
        {isCostEmpty(columns) ? (
          <p className="text-muted text-sm">No spend in this range.</p>
        ) : (
          <>
            <ChartLegend keys={keys} swatches={ACTIVITY_KEYS} />
            <StackedColumns
              columns={columns}
              bucketMs={86_400_000}
              fills={ACTIVITY_FILLS}
              label="Cost per day by provider"
              height={180}
              describe={formatCostSummary}
              renderTooltip={(column) => <CostTooltip column={column} />}
            />
          </>
        )}
        <CostsTable
          rows={selectCostTableRows(view.rows)}
          dailyRows={selectDailyCostRows(view.rows)}
        />
      </div>
    </div>
  )
}
