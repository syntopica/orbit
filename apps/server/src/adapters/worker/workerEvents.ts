import type { OrbitEvent } from '@orbit/contract'

import { toSafeRef } from '../../refs/toSafeRef'
import type { WorkerStatus } from '../../types/WorkerStatus'

// The worker's free-text `error` is never copied: only closed values and
// filtered ids enter the stream (spec 6.6).
export const workerEvents = (
  seen: {
    readonly failures: ReadonlySet<string>
    readonly cooldowns: ReadonlySet<string>
  } | null,
  status: WorkerStatus,
  now: Date,
): OrbitEvent[] => {
  if (seen === null) return []
  const at = now.toISOString()
  const failures = status.recent_failures
    .filter((f) => !seen.failures.has(f.id))
    .map((f): OrbitEvent => ({
      at,
      component: 'worker',
      kind: 'worker.job_failed',
      severity: 'warn',
      refs: Object.fromEntries(
        Object.entries({
          job: toSafeRef(f.id),
          queue: toSafeRef(f.queue),
        }).filter((entry): entry is [string, string] => entry[1] !== undefined),
      ),
    }))
  const cooldowns = Object.keys(status.cooldowns)
    .filter((runner) => !seen.cooldowns.has(runner))
    .flatMap((runner): OrbitEvent[] => {
      const ref = toSafeRef(runner)
      return ref === undefined
        ? []
        : [
            {
              at,
              component: 'worker',
              kind: 'worker.cooldown_started',
              severity: 'info',
              refs: { runner: ref },
            },
          ]
    })
  return [...failures, ...cooldowns]
}
