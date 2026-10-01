import type { Snapshot } from '@orbit/contract'

export const degradeSnapshot = (
  last: Snapshot,
  reason: 'lagging' | 'stale',
): Snapshot => ({
  ...last,
  events: [],
  health: { state: last.health.state === 'down' ? 'down' : 'warn', reason },
})
