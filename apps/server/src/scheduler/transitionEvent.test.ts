import type { SnapshotCore } from '@orbit/contract'

import { transitionEvent } from './transitionEvent'

const core = (
  state: 'ok' | 'down',
  reason: 'timeout' | null,
): SnapshotCore => ({
  component: 'synthetic',
  health: { state, reason },
  metrics: [],
  pending: [],
  events: [],
  observedAt: '2026-01-01T00:00:00.000Z',
})

describe('transitionEvent', () => {
  it('reports going down with the reason, recovery, and nothing otherwise', () => {
    const ok = core('ok', null)
    const down = core('down', 'timeout')
    expect(transitionEvent(ok.health, down)).toMatchObject({
      kind: 'component.down',
      severity: 'error',
      refs: { reason: 'timeout' },
    })
    expect(transitionEvent(down.health, ok)).toMatchObject({
      kind: 'component.recovered',
      severity: 'info',
      refs: {},
    })
    expect(transitionEvent(ok.health, ok)).toBeNull()
    expect(transitionEvent(null, core('down', null))?.refs).toEqual({})
  })
})
