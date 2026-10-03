import type { ClipsView, Snapshot } from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'

// The one lane with a count surface: capture's undrained items (D7).
export const toCaptureLane = (
  snapshot: Snapshot | undefined,
): ClipsView['capture'] => {
  if (snapshot === undefined || snapshot.health.state === 'down') return null
  const metric = snapshot.metrics.find((m) => m.key === 'capture.undrained')
  if (metric === undefined) return null
  const pending = snapshot.pending.find((p) => p.key === 'capture.undrained')
  return { count: metric.value, oldestAt: epochOrNull(pending?.oldestAt) }
}
