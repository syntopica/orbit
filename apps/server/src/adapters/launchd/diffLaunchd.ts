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
    const label = reading.entry.label
    const before = previous.get(label)?.state ?? null
    const after = reading.state
    return before === null || after === null
      ? []
      : eventsForLabel(label, before, after, at)
  })
}
