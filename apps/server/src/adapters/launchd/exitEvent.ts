import type { OrbitEvent } from '@orbit/contract'

import type { LaunchctlState } from '../../types/LaunchctlState'

export const exitEvent = (
  label: string,
  before: LaunchctlState | null,
  after: LaunchctlState | null,
  at: string,
): OrbitEvent[] => {
  const exit = after?.lastExit ?? null
  if (before === null || exit === null || exit === before.lastExit) return []
  const severity = exit === 0 ? 'info' : 'warn'
  return [
    {
      at,
      component: 'launchd',
      kind: 'launchd.exit_changed',
      severity,
      refs: { label, exit },
    },
  ]
}
