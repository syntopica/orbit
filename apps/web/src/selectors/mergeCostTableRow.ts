import type { WorkerCostRow } from '@orbit/contract'

import type { CostTableRow } from '../types/CostTableRow'

export const mergeCostTableRow = (
  row: WorkerCostRow,
  previous: CostTableRow | undefined,
): CostTableRow => {
  const base = previous ?? {
    provider: row.provider,
    queue: row.queue,
    attempts: 0,
    succeeded: 0,
    tokensIn: 0,
    tokensOut: 0,
    costUsd: 0,
    wallMs: 0,
  }
  return {
    provider: row.provider,
    queue: row.queue,
    attempts: base.attempts + row.attempts,
    succeeded: base.succeeded + row.succeeded,
    tokensIn: base.tokensIn + row.tokensIn,
    tokensOut: base.tokensOut + row.tokensOut,
    costUsd: base.costUsd + row.costUsd,
    wallMs: base.wallMs + row.wallMs,
  }
}
