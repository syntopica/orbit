import { access } from 'node:fs/promises'

import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkLaunchdLabels: DoctorCheck = async (state) => {
  const labels = state.config.launchd?.labels ?? []
  const missing: string[] = []
  for (const entry of labels) {
    await access(entry.plist).catch(() => missing.push(entry.label))
  }
  if (missing.length > 0) {
    return {
      name: 'launchd',
      level: 'fail',
      detail: `plist missing for ${missing.join(', ')}`,
    }
  }
  return {
    name: 'launchd',
    level: 'ok',
    detail: `${String(labels.length)} label(s) registered`,
  }
}
