import type { OrbitEvent } from '@orbit/contract'

import { formatDuration } from './formatDuration'

export const formatActionEvent = (event: OrbitEvent): string | null => {
  if (!event.kind.startsWith('action.')) return null
  const target = event.refs['target']
  const action = event.refs['kind']
  if (typeof target !== 'string' || typeof action !== 'string') return null
  if (event.kind === 'action.started') return `${target} ${action} started`
  if (event.kind === 'action.succeeded')
    return `${target} ${action} succeeded in ${formatDuration(Number(event.refs['durationMs'] ?? 0))}`
  return `${target} ${action} failed (exit ${String(event.refs['exitCode'] ?? -1)})`
}
