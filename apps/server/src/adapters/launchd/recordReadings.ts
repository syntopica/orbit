import type { LabelReading } from '../../types/LabelReading'
import type { LaunchdObservation } from '../../types/LaunchdObservation'

export const recordReadings = (
  readings: readonly LabelReading[],
  at: number,
  record: (observation: LaunchdObservation) => void,
): void => {
  for (const r of readings) {
    if (r.error !== null) continue
    record({
      label: r.entry.label,
      pid: r.state?.pid ?? null,
      runs: r.state?.runs ?? null,
      lastExit: r.state?.lastExit ?? null,
      at,
    })
  }
}
