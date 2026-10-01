import type {
  ComponentId,
  ReasonCode,
  Snapshot,
  SnapshotCore,
} from '@orbit/contract'

export const downSnapshot = (
  component: ComponentId,
  reason: ReasonCode,
  lastGood: SnapshotCore | null,
): Snapshot => ({
  component,
  health: { state: 'down', reason },
  metrics: [],
  pending: [],
  events: [],
  observedAt: new Date().toISOString(),
  lastGood,
})
