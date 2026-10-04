import type { ClipsItem } from '@orbit/contract'

import type { ClipsDocuments } from '../types/ClipsDocuments'
import { toClipsItem } from './toClipsItem'

// The engine's item list in its own order (waiting first), capped at the
// contract's 2000; null when the engine was not asked for one.
export const toClipsItems = (
  status: ClipsDocuments['status'],
): ClipsItem[] | null => {
  if (status.items === undefined) return null
  return status.items
    .flatMap((raw) => {
      const item = toClipsItem(raw)
      return item === null ? [] : [item]
    })
    .slice(0, 2000)
}
