import type { Snapshot } from '@orbit/contract'

import { stageState } from './stageState'

const NOW = 1_790_000_000_000
const snapshot = (state: 'ok' | 'warn' | 'down'): Snapshot => ({
  component: 'atrium',
  health: { state, reason: state === 'ok' ? null : 'stale' },
  metrics: [],
  pending: [],
  events: [],
  observedAt: '2026-10-03T10:00:00.000Z',
  lastGood: null,
})

describe('stageState', () => {
  it.each([
    [undefined, NOW, 1000, 'unknown'],
    [snapshot('down'), NOW, 1000, 'down'],
    [snapshot('ok'), null, 1000, 'unknown'],
    [snapshot('ok'), NOW, null, 'unknown'],
    [snapshot('warn'), NOW - 1000, 1000, 'ok'],
    [snapshot('ok'), NOW - 1001, 1000, 'warn'],
    [snapshot('ok'), NOW - 2000, 1000, 'warn'],
    [snapshot('ok'), NOW - 2001, 1000, 'down'],
  ] as const)('reads %#', (snap, freshAt, policyMs, expected) => {
    expect(stageState(snap, freshAt, policyMs, NOW)).toBe(expected)
  })
})
