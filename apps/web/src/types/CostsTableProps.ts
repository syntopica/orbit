import type { CostTableRow } from './CostTableRow'
import type { DailyCostRow } from './DailyCostRow'

export type CostsTableProps = {
  readonly rows: readonly CostTableRow[]
  readonly dailyRows: readonly DailyCostRow[]
}
