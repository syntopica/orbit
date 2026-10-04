import type { WorkerCostRow } from '@orbit/contract'

import type { DailyCostRow } from '../types/DailyCostRow'

export const selectDailyCostRows = (
  rows: readonly WorkerCostRow[],
): DailyCostRow[] => {
  const grouped = new Map<string, DailyCostRow>()
  for (const row of rows) {
    const key = `${String(row.day)}:${row.provider}`
    grouped.set(key, {
      day: row.day,
      provider: row.provider,
      costUsd: (grouped.get(key)?.costUsd ?? 0) + row.costUsd,
    })
  }
  return [...grouped.values()].sort(
    (a, b) => a.day - b.day || a.provider.localeCompare(b.provider),
  )
}
