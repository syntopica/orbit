import type { PendingView, Snapshot } from '@orbit/contract'

import { toClipsItems } from '../clipsView/toClipsItems'
import type { ClipsDocuments } from '../types/ClipsDocuments'
import type { PendingSourceResult } from '../types/PendingSourceResult'
import { clipsAggregateItems } from './clipsAggregateItems'
import { toClipsPendingItem } from './toClipsPendingItem'

// One row per waiting clip when the adapter's last read lists items, else one
// row per waiting state from the snapshot counts. Both are in memory: this
// source never runs the engine.
export const readClipsPending = (
  snapshot: Snapshot | undefined,
  latest: ClipsDocuments | null,
  now: number,
): PendingSourceResult => {
  if (snapshot === undefined || snapshot.health.state === 'down')
    throw new Error('clips unavailable')
  const listed = latest === null ? null : toClipsItems(latest.status)
  const items: PendingView['items'] =
    listed === null
      ? clipsAggregateItems(snapshot, now)
      : listed.flatMap((item) => {
          const row = toClipsPendingItem(item, now)
          return row === null ? [] : [row]
        })
  const count =
    listed === null
      ? (['clips.pending', 'clips.needs_claude'] as const).reduce(
          (sum, key) =>
            sum + (snapshot.pending.find((row) => row.key === key)?.count ?? 0),
          0,
        )
      : items.length
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
