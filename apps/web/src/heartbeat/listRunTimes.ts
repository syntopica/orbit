import type { LaunchdObservation } from '../types/LaunchdObservation'

// A counter that drops (the job was reloaded) is not a run.
export const listRunTimes = (
  observations: readonly LaunchdObservation[],
): number[] =>
  observations.flatMap((observation, index) => {
    const before = observations[index - 1]?.runs ?? null
    return before !== null &&
      observation.runs !== null &&
      observation.runs > before
      ? [observation.at]
      : []
  })
