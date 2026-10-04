import type { SnapshotCore } from '@orbit/contract'

import type { TodoSourceResult } from '../types/TodoSourceResult'

export const summarizePending = (
  sources: readonly TodoSourceResult[],
  at: string,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const states = ['open', 'partial', 'blocked'] as const
  const counts = states.map((state) =>
    sources.reduce(
      (total, source) =>
        total + source.items.filter((item) => item.state === state).length,
      0,
    ),
  )
  return {
    health: sources.some(({ source }) => source.status !== 'ok')
      ? { state: 'warn', reason: 'check_failed' }
      : { state: 'ok', reason: null },
    metrics: states.map((state, index) => ({
      key: `pending.${state}`,
      value: counts[index] ?? 0,
      at,
    })),
    pending: states.flatMap((state, index) =>
      (counts[index] ?? 0) > 0
        ? [
            {
              key: `pending.${state}` as const,
              count: counts[index] ?? 0,
              oldestAt: null,
            },
          ]
        : [],
    ),
  }
}
