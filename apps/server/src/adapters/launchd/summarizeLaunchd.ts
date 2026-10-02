import type { SnapshotCore } from '@orbit/contract'

import type { LabelReading } from '../../types/LabelReading'

export const summarizeLaunchd = (
  readings: readonly LabelReading[],
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const at = now.toISOString()
  const failing = readings.filter(
    (r) =>
      !r.loaded ||
      (r.state?.pid === null &&
        r.state.lastExit !== null &&
        r.state.lastExit !== 0),
  ).length
  const running = readings.filter(
    (r) => r.state !== null && r.state.pid !== null,
  ).length
  return {
    health:
      failing === 0
        ? { state: 'ok', reason: null }
        : { state: 'warn', reason: 'check_failed' },
    metrics: [
      { key: 'launchd.jobs', value: readings.length, at },
      { key: 'launchd.running', value: running, at },
      { key: 'launchd.failing', value: failing, at },
    ],
    pending:
      failing === 0
        ? []
        : [{ key: 'launchd.failing_jobs', count: failing, oldestAt: null }],
  }
}
