import { ProcessError } from '../../process/ProcessError'
import type { LaunchdAdapterDeps } from '../../types/LaunchdAdapterDeps'
import type { LaunchdCatalog } from '../../types/LaunchdCatalog'
import type { LaunchdSchedule } from '../../types/LaunchdSchedule'
import { readSchedule } from './readSchedule'

export const createLaunchdCatalog = (
  deps: LaunchdAdapterDeps,
): LaunchdCatalog => {
  const cache = new Map<string, { schedule: LaunchdSchedule; at: number }>()
  const scheduleOf = async (
    plist: string,
    signal: AbortSignal,
  ): Promise<LaunchdSchedule | null> => {
    const hit = cache.get(plist)
    if (hit !== undefined && Date.now() - hit.at < 600_000) return hit.schedule
    const schedule = await readSchedule(deps, plist, signal).catch(() => null)
    if (signal.aborted) throw new ProcessError('timeout')
    if (schedule !== null) cache.set(plist, { schedule, at: Date.now() })
    return schedule
  }
  return {
    rows: async (signal) => {
      const rows = []
      for (const entry of deps.labels) {
        if (signal.aborted) throw new ProcessError('timeout')
        rows.push({
          component: entry.component,
          label: entry.label,
          role: entry.role,
          actions: entry.actions ?? [],
          schedule: await scheduleOf(entry.plist, signal),
        })
      }
      return rows
    },
  }
}
