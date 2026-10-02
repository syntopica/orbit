import { access } from 'node:fs/promises'

import { ProcessError } from '../../process/ProcessError'
import type { Adapter } from '../../types/Adapter'

export const createSyntheticAdapter = (failFlagPath: string): Adapter => {
  let tick = 0
  return {
    id: 'synthetic',
    cadenceMs: 1000,
    timeoutMs: 2000,
    freshnessMs: 5000,
    read: async () => {
      const failing = await access(failFlagPath).then(
        () => true,
        () => false,
      )
      if (failing) throw new ProcessError('unreachable')
      tick += 1
      const at = new Date().toISOString()
      return {
        component: 'synthetic',
        health: { state: 'ok', reason: null },
        metrics: [{ key: 'synthetic.value', value: tick % 100, at }],
        pending: [{ key: 'synthetic.items', count: tick % 5, oldestAt: null }],
        events: [
          {
            at,
            component: 'synthetic',
            kind: 'synthetic.tick',
            severity: 'info',
            refs: { n: tick },
          },
        ],
        observedAt: at,
      }
    },
  }
}
