import type { WorkerCosts } from '@orbit/contract'

import { UTC_DAY_MS } from '../charts/utcDayMs'
import type { CostColumn } from '../types/CostColumn'
import type { WorkerCostsRange } from '../types/WorkerCostsRange'

export const selectCostColumns = (
  view: WorkerCosts,
  range: WorkerCostsRange,
): CostColumn[] => {
  const count = range === '30d' ? 30 : range === '7d' ? 7 : 2
  const latest = Math.floor(view.now / UTC_DAY_MS) * UTC_DAY_MS
  return Array.from({ length: count }, (_, i) => {
    const start = latest - (count - i - 1) * UTC_DAY_MS
    const rows = view.rows.filter((row) => row.day === start)
    const byProvider = new Map<string, number>()
    for (const row of rows)
      byProvider.set(
        row.provider,
        (byProvider.get(row.provider) ?? 0) + row.costUsd,
      )
    const segments = [...byProvider]
      .filter(([, cost]) => cost > 0)
      .map(([key, cost]) => ({ key, count: cost }))
    return {
      start,
      end: start + UTC_DAY_MS,
      segments,
      total: rows.reduce((sum, row) => sum + row.costUsd, 0),
      attempts: rows.reduce((sum, row) => sum + row.attempts, 0),
    }
  })
}
