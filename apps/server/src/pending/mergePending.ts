import type { PendingView } from '@orbit/contract'

import type { PendingSourceResult } from '../types/PendingSourceResult'

export const mergePending = (
  results: readonly PendingSourceResult[],
  now: number,
): PendingView => {
  const rank: Record<PendingView['items'][number]['state'], number> = {
    blocked: 0,
    partial: 1,
    open: 2,
    issue: 2,
    failed: 2,
    waiting: 2,
  }
  const items = results.flatMap((result) => result.items)
  items.sort((left, right) => rank[left.state] - rank[right.state])
  return {
    now,
    sources: results.map((result) => result.source),
    items: items.slice(0, 2000),
  }
}
