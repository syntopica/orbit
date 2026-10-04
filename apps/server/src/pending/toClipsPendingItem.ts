import type { ClipsItem, PendingView } from '@orbit/contract'

import { describeClipsItem } from './describeClipsItem'

// A waiting clip as a board row, titled by its state and the code that holds
// it; reconciled clips are done and are not rows.
export const toClipsPendingItem = (
  item: ClipsItem,
  now: number,
): PendingView['items'][number] | null => {
  if (item.state === 'reconciled') return null
  return {
    id: `clips:${item.id}`,
    source: 'clips',
    kind: 'clips',
    state: 'waiting',
    title: `Clip ${item.state}: ${item.failure?.code ?? item.reason}`,
    detail: describeClipsItem(item),
    section: item.state,
    ref: '/clips',
    ageMs: item.capturedAt === null ? null : Math.max(0, now - item.capturedAt),
  }
}
