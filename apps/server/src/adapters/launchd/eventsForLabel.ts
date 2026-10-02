import type { OrbitEvent } from '@orbit/contract'

import type { LaunchctlState } from '../../types/LaunchctlState'
import { exitEvent } from './exitEvent'

export const eventsForLabel = (
  label: string,
  before: LaunchctlState | null,
  after: LaunchctlState | null,
  at: string,
): OrbitEvent[] => {
  const wasRunning = before?.pid != null
  const isRunning = after?.pid != null
  const events: OrbitEvent[] = []
  if (!wasRunning && isRunning) {
    events.push({
      at,
      component: 'launchd',
      kind: 'launchd.started',
      severity: 'info',
      refs: { label },
    })
  }
  if (wasRunning && !isRunning) {
    events.push({
      at,
      component: 'launchd',
      kind: 'launchd.stopped',
      severity: 'info',
      refs: { label },
    })
  }
  return [...events, ...exitEvent(label, before, after, at)]
}
