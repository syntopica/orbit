import type { ComponentId, Snapshot } from '@orbit/contract'

export const snapshotOf = (
  component: ComponentId,
  state: 'ok' | 'warn' | 'down',
  overrides: Partial<Snapshot> = {},
): Snapshot => ({
  component,
  health: { state, reason: state === 'down' ? 'unreachable' : null },
  metrics: [],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
  ...overrides,
})
