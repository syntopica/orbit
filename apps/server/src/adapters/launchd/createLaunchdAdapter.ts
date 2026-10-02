import type { Adapter } from '../../types/Adapter'
import type { LabelReading } from '../../types/LabelReading'
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import { assertSomeReadable } from './assertSomeReadable'
import { diffLaunchd } from './diffLaunchd'
import { nextBaseline } from './nextBaseline'
import { readLabelIsolated } from './readLabelIsolated'
import { recordReadings } from './recordReadings'
import { summarizeLaunchd } from './summarizeLaunchd'

export const createLaunchdAdapter = (deps: LaunchdAdapterDeps): Adapter => {
  let previous = new Map<string, LabelReading>()
  return {
    id: 'launchd',
    cadenceMs: deps.cadenceMs,
    timeoutMs: 15_000,
    freshnessMs: deps.cadenceMs * 2,
    read: async (signal) => {
      const readings: LabelReading[] = []
      for (const entry of deps.labels)
        readings.push(await readLabelIsolated(deps, entry, signal))
      assertSomeReadable(readings)
      const now = new Date()
      recordReadings(readings, now.getTime(), deps.record)
      const events = diffLaunchd(previous, readings, now)
      previous = nextBaseline(previous, readings)
      return {
        component: 'launchd',
        ...summarizeLaunchd(readings, now),
        events,
        observedAt: now.toISOString(),
      }
    },
  }
}
