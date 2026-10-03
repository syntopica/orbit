import type { SnapshotCore } from '@orbit/contract'

export const atriumHealth = (
  writtenAt: string,
  refreshIntervalMs: number,
  now: Date,
): SnapshotCore['health'] =>
  now.getTime() - Date.parse(writtenAt) > 2 * refreshIntervalMs
    ? { state: 'warn', reason: 'stale' }
    : { state: 'ok', reason: null }
