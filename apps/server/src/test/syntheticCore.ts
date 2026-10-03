import type { SnapshotCore } from '@orbit/contract'

export const syntheticCore = (value: number): SnapshotCore => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: new Date().toISOString() }],
  pending: [],
  events: [],
  observedAt: new Date().toISOString(),
})
