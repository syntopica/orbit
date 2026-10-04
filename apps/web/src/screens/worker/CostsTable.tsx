import type { CostsTableProps } from '../../types/CostsTableProps'
import { CostTotalsTable } from './CostTotalsTable'
import { DailyCostsTable } from './DailyCostsTable'

export const CostsTable = ({ rows, dailyRows }: CostsTableProps) => (
  <details className="text-sm">
    <summary className="text-muted cursor-pointer">Show table</summary>
    {/* Six numeric columns overflow a phone: the scroller takes keyboard focus. */}
    <div
      role="region"
      aria-label="Cost tables"
      tabIndex={0}
      className="mt-2 overflow-x-auto"
    >
      <DailyCostsTable rows={dailyRows} />
      <CostTotalsTable rows={rows} />
    </div>
  </details>
)
