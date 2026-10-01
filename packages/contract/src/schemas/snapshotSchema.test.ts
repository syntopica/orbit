import { snapshotSchema } from './snapshotSchema'

const core = {
  component: 'worker',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'worker.queued', value: 2, at: '2026-10-02T10:00:00.000Z' }],
  pending: [{ key: 'worker.failed_jobs', count: 1, oldestAt: null }],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
}

describe('snapshotSchema', () => {
  it('accepts a snapshot without lastGood', () => {
    expect(snapshotSchema.parse({ ...core, lastGood: null }).component).toBe(
      'worker',
    )
  })
  it('accepts a down snapshot carrying the last good one', () => {
    const down = {
      ...core,
      health: { state: 'down', reason: 'timeout' },
      lastGood: core,
    }
    expect(snapshotSchema.parse(down).lastGood?.health.state).toBe('ok')
  })
  it('rejects a nested lastGood inside lastGood', () => {
    expect(() =>
      snapshotSchema.parse({ ...core, lastGood: { ...core, lastGood: null } }),
    ).toThrow()
  })
})
