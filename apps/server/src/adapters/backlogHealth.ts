import type { SnapshotCore } from '@orbit/contract'

// A backlog past its limit only downgrades a healthy reading: a failed check
// keeps its own reason.
export const backlogHealth = (
  health: SnapshotCore['health'],
  over: boolean,
): SnapshotCore['health'] =>
  over && health.state === 'ok' ? { state: 'warn', reason: 'backlog' } : health
