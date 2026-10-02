import type { OrbitEvent } from '@orbit/contract'

import type { LabelReading } from '../../types/LabelReading'
import { eventsForLabel } from './eventsForLabel'

export const diffLaunchd = (
  previous: ReadonlyMap<string, LabelReading>,
  readings: readonly LabelReading[],
  now: Date,
): OrbitEvent[] => {
  const at = now.toISOString()
  return readings.flatMap((reading): OrbitEvent[] => {
    const before = previous.get(reading.entry.label)
    if (before === undefined || reading.error !== null) return []
    return eventsForLabel(reading.entry.label, before.state, reading.state, at)
  })
}
