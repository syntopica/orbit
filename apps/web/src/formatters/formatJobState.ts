import { SYSTEM_LABELS } from '../labels/systemLabels'
import type { LaunchdObservation } from '../types/LaunchdObservation'

export const formatJobState = (
  observation: LaunchdObservation | null,
): string => {
  if (observation === null) return SYSTEM_LABELS.noReading
  if (observation.pid !== null)
    return `${SYSTEM_LABELS.runningPid} ${String(observation.pid)}`
  return observation.lastExit === null
    ? SYSTEM_LABELS.neverExited
    : `${SYSTEM_LABELS.lastExit} ${String(observation.lastExit)}`
}
