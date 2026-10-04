import type { PendingView, Snapshot } from '@orbit/contract'

// One row per waiting state from the snapshot counts, for an engine that does
// not list items (`status --json` without `--items`).
export const clipsAggregateItems = (
  snapshot: Snapshot,
  now: number,
): PendingView['items'] => {
  const keys = ['clips.pending', 'clips.needs_claude'] as const
  return keys.flatMap((key) => {
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
}
