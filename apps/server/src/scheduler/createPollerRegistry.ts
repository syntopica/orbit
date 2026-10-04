import type { ComponentId, PollerRow } from '@orbit/contract'

import type { PollerRegistry } from '../types/PollerRegistry'

// One row per adapter loop, updated in place by its tracker and copied out on
// read, so a reader never sees a row change under it.
export const createPollerRegistry = (
  now: () => number = Date.now,
): PollerRegistry => {
  const rows = new Map<ComponentId, PollerRow>()
  const row = (component: ComponentId): PollerRow => {
    const found = rows.get(component)
    if (found !== undefined) return found
    const fresh: PollerRow = {
      component,
      running: false,
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastDurationMs: null,
      failures: 0,
      nextAt: null,
    }
    rows.set(component, fresh)
    return fresh
  }
  return {
    tracker: (component) => {
      const own = row(component)
      return {
        attempt: () => {
          own.running = true
          own.lastAttemptAt = now()
          own.nextAt = null
        },
        settle: (ok) => {
          const at = now()
          own.running = false
          own.lastDurationMs = at - (own.lastAttemptAt ?? at)
          own.failures = ok ? 0 : own.failures + 1
          if (ok) own.lastSuccessAt = at
        },
        scheduled: (delayMs) => {
          own.nextAt = now() + delayMs
        },
      }
    },
    rows: () => [...rows.values()].map((item) => ({ ...item })),
  }
}
