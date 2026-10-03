import type { SnapshotCore } from '@orbit/contract'

// A snapshot core with the fields that change on every read blanked out.
export const stableSnapshotCore = (core: SnapshotCore) => ({
  ...core,
  observedAt: '',
  events: [],
  metrics: core.metrics.map((metric) => ({ ...metric, at: '' })),
  pending: core.pending.map((item) => ({ ...item, oldestAt: '' })),
})
