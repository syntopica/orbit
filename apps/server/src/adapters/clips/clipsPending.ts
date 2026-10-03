import type { SnapshotCore } from '@orbit/contract'
import type { z } from 'zod'

import type { clipsStatusSchema } from './clipsStatusSchema'

export const clipsPending = (
  status: z.infer<typeof clipsStatusSchema>,
): SnapshotCore['pending'] => {
  const pairs = [
    ['clips.pending', 'pending'],
    ['clips.needs_claude', 'needs-claude'],
  ] as const
  return pairs.flatMap(([key, state]) => {
    const count = status.states[state] ?? 0
    return count > 0
      ? [{ key, count, oldestAt: status.oldestAt[state] ?? null }]
      : []
  })
}
