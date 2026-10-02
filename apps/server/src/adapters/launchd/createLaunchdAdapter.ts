import type { Adapter } from '../../types/Adapter'
import type { LabelReading } from '../../types/LabelReading'
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import { diffLaunchd } from './diffLaunchd'
import { readLabel } from './readLabel'
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
        readings.push(await readLabel(deps, entry, signal))
      const now = new Date()
      for (const r of readings) {
        deps.record({
          label: r.entry.label,
          pid: r.state?.pid ?? null,
          runs: r.state?.runs ?? null,
          lastExit: r.state?.lastExit ?? null,
          at: now.getTime(),
        })
      }
      const events = diffLaunchd(previous, readings, now)
      previous = new Map(readings.map((r) => [r.entry.label, r]))
      return {
        component: 'launchd',
        ...summarizeLaunchd(readings, now),
        events,
        observedAt: now.toISOString(),
      }
    },
  }
}
