import type { SnapshotCore } from '@orbit/contract'

export const brainHealth = (
  ok: boolean,
  indexStale: boolean,
): SnapshotCore['health'] => {
  if (!ok) return { state: 'warn', reason: 'check_failed' }
  if (indexStale) return { state: 'warn', reason: 'stale' }
  return { state: 'ok', reason: null }
}
