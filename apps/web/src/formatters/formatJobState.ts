import type { LaunchdObservation } from '../types/LaunchdObservation'

export const formatJobState = (
  observation: LaunchdObservation | null,
): string => {
  if (observation === null) return 'no reading yet'
  if (observation.pid !== null) return `running, pid ${String(observation.pid)}`
  return observation.lastExit === null
    ? 'never exited'
    : `last exit ${String(observation.lastExit)}`
}
