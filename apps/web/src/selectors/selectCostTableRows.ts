import type { WorkerCostRow } from '@orbit/contract'

import type { CostTableRow } from '../types/CostTableRow'
import { mergeCostTableRow } from './mergeCostTableRow'

export const selectCostTableRows = (
  rows: readonly WorkerCostRow[],
): CostTableRow[] => {
  const grouped = new Map<string, CostTableRow>()
  for (const row of rows) {
    const key = `${row.provider}\u0000${row.queue}`
    grouped.set(key, mergeCostTableRow(row, grouped.get(key)))
  }
  return [...grouped.values()].sort(
    (a, b) =>
      a.provider.localeCompare(b.provider) || a.queue.localeCompare(b.queue),
  )
}
