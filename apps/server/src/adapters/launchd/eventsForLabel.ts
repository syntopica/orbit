import type { OrbitEvent } from '@orbit/contract'

import type { LaunchctlState } from '../../types/LaunchctlState'

export const eventsForLabel = (
  label: string,
  before: LaunchctlState,
  after: LaunchctlState,
  at: string,
): OrbitEvent[] => {
  const events: OrbitEvent[] = []
  if (before.pid === null && after.pid !== null) {
    events.push({
      at,
      component: 'launchd',
      kind: 'launchd.started',
      severity: 'info',
      refs: { label },
    })
  }
  if (before.pid !== null && after.pid === null) {
    events.push({
      at,
      component: 'launchd',
      kind: 'launchd.stopped',
      severity: 'info',
      refs: { label },
    })
  }
  if (after.lastExit !== null && after.lastExit !== before.lastExit) {
    const severity = after.lastExit === 0 ? 'info' : 'warn'
    events.push({
      at,
      component: 'launchd',
      kind: 'launchd.exit_changed',
      severity,
      refs: { label, exit: after.lastExit },
    })
  }
  return events
}
