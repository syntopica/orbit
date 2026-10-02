import { buildChildEnv } from '../../process/buildChildEnv'
import { runProcess } from '../../process/runProcess'
import type { DoctorCheck } from '../../types/DoctorCheck'

// Every registered label exists in launchd (spec 10).
export const checkLaunchdLoaded: DoctorCheck = async (state) => {
  const launchd = state.config.launchd
  if (launchd === undefined) {
    return { name: 'launchd labels', level: 'ok', detail: 'none registered' }
  }
  const uid = process.getuid?.() ?? 0
  const missing: string[] = []
  for (const entry of launchd.labels) {
    const result = await runProcess({
      file: launchd.launchctl,
      args: ['print', `gui/${String(uid)}/${entry.label}`],
      env: buildChildEnv(state.env, {}),
      timeoutMs: 5000,
      maxBytes: 1_048_576,
    }).catch(() => null)
    if (result === null || result.code !== 0) missing.push(entry.label)
  }
  return missing.length === 0
    ? {
        name: 'launchd labels',
        level: 'ok',
        detail: `${String(launchd.labels.length)} loaded`,
      }
    : {
        name: 'launchd labels',
        level: 'fail',
        detail: `not loaded: ${missing.join(', ')}`,
      }
}
