import { clipsItemSchema, type ClipsItem } from '@orbit/contract'

import { clipsStatusItemSchema } from '../adapters/clips/clipsStatusItemSchema'
import { epochOrNull } from '../time/epochOrNull'
import { pageIdOfPath } from './pageIdOfPath'

// One engine item for the view: times as epoch ms, page paths as page ids,
// and the contract applied, so a code that is not an identifier or an id that
// is not a digest drops the item rather than reaching the client.
export const toClipsItem = (raw: unknown): ClipsItem | null => {
  const item = clipsStatusItemSchema.safeParse(raw)
  if (!item.success) return null
  const { lastRun } = item.data
  const view = clipsItemSchema.safeParse({
    ...item.data,
    capturedAt: epochOrNull(item.data.capturedAt),
    lastTransitionAt: epochOrNull(item.data.lastTransitionAt),
    lastRun:
      lastRun === null
        ? null
        : { ...lastRun, startedAt: epochOrNull(lastRun.startedAt) },
    pages: item.data.pages.flatMap((path) => {
      const id = pageIdOfPath(path)
      return id === null ? [] : [id]
    }),
  })
  return view.success ? view.data : null
}
