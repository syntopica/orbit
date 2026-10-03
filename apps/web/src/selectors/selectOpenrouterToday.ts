import type { WorkerActivity } from '@orbit/contract'

import type { OpenrouterToday } from '../types/OpenrouterToday'
import { bucketIndex } from './bucketIndex'

// Every OpenRouter attempt (production and sampling) since 00:00 UTC on the
// server's clock. Attempts, not provider requests: the quota is not known here.
export const selectOpenrouterToday = (
  view: WorkerActivity,
  starts: readonly number[],
): OpenrouterToday => {
  const dayStart = Math.floor(view.now / 86_400_000) * 86_400_000
  const today = starts.filter((start) => start >= dayStart)
  const values = today.map(() => 0)
  for (const row of view.rows) {
    if (row.provider !== 'openrouter' || row.bucket < dayStart) continue
    const index = bucketIndex(today, view.bucketMs, row.bucket)
    if (index >= 0) values[index] = (values[index] ?? 0) + row.attempts
  }
  const count = values.reduce((sum, value) => sum + value, 0)
  return { count, starts: today, values }
}
