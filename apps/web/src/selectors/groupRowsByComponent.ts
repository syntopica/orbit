import type { LaunchdRow } from '../types/LaunchdRow'
import type { LaunchdRowGroup } from '../types/LaunchdRowGroup'

// One group per component, in the order the catalog first names each.
export const groupRowsByComponent = (
  rows: readonly LaunchdRow[],
): LaunchdRowGroup[] => {
  const groups: LaunchdRowGroup[] = []
  for (const row of rows) {
    const group = groups.find((item) => item.component === row.component)
    if (group) group.rows.push(row)
    else groups.push({ component: row.component, rows: [row] })
  }
  return groups
}
