import type { WorkerCostRow } from '@orbit/contract'

import type { CostTotals } from '../types/CostTotals'

export const selectCostTotals = (rows: readonly WorkerCostRow[]): CostTotals =>
  rows.reduce(
    (totals, row) => ({
      attempts: totals.attempts + row.attempts,
      tokensIn: totals.tokensIn + row.tokensIn,
      tokensOut: totals.tokensOut + row.tokensOut,
      costUsd: totals.costUsd + row.costUsd,
    }),
    { attempts: 0, tokensIn: 0, tokensOut: 0, costUsd: 0 },
  )
