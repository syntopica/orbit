import type { SnapshotCore } from '@orbit/contract'

import type { AtriumDocuments } from '../../types/AtriumDocuments'
import { atriumHealth } from './atriumHealth'

export const summarizeAtrium = (
  { refresh, synthesis, doctor }: AtriumDocuments,
  refreshIntervalMs: number,
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const at = now.toISOString()
  const notIndexed = refresh.populations.reduce(
    (sum, p) => sum + Math.max(0, p.intended - p.indexed),
    0,
  )
  const metrics: SnapshotCore['metrics'] = [
    { key: 'atrium.records', value: refresh.records.total, at },
    { key: 'atrium.not_indexed', value: notIndexed, at },
  ]
  if (synthesis !== null)
    metrics.push(
      {
        key: 'atrium.synth_synthesized',
        value: synthesis.lastPass.synthesized,
        at,
      },
      { key: 'atrium.synth_deferred', value: synthesis.lastPass.deferred, at },
      { key: 'atrium.synth_failed', value: synthesis.lastPass.failed, at },
    )
  return {
    health: atriumHealth(refresh.writtenAt, refreshIntervalMs, now, doctor),
    metrics,
    pending:
      notIndexed > 0
        ? [{ key: 'atrium.not_indexed', count: notIndexed, oldestAt: null }]
        : [],
  }
}
