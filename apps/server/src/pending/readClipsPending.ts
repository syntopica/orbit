import type { PendingView, Snapshot } from '@orbit/contract'

import type { PendingSourceResult } from '../types/PendingSourceResult'

export const readClipsPending = (
  snapshot: Snapshot | undefined,
  now: number,
): PendingSourceResult => {
  if (snapshot === undefined || snapshot.health.state === 'down')
    throw new Error('clips unavailable')
  const keys = ['clips.pending', 'clips.needs_claude'] as const
  const items: PendingView['items'] = keys.flatMap((key) => {
    const pending = snapshot.pending.find((row) => row.key === key)
    if (pending === undefined || pending.count === 0) return []
    return [
      {
        id: `clips:${key}`,
        source: 'clips',
        kind: 'clips' as const,
        state: 'waiting' as const,
        title:
          key === 'clips.pending'
            ? `Pending clips (${String(pending.count)})`
            : `Clips needing review (${String(pending.count)})`,
        detail: '',
        section: null,
        ref: '/clips',
        ageMs:
          pending.oldestAt === null
            ? null
            : Math.max(0, now - Date.parse(pending.oldestAt)),
      },
    ]
  })
  const count = keys.reduce(
    (sum, key) =>
      sum + (snapshot.pending.find((row) => row.key === key)?.count ?? 0),
    0,
  )
  return {
    source: {
      id: 'clips',
      kind: 'clips',
      name: 'Clips waiting',
      status: 'ok',
      count,
    },
    items,
  }
}
