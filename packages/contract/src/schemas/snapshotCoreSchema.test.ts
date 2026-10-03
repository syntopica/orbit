import { snapshotCoreSchema } from './snapshotCoreSchema'

const at = '2026-10-02T10:00:00.000Z'
const metric = { key: 'worker.queued', value: 1, at }
const pending = { key: 'worker.failed_jobs', count: 1, oldestAt: null }
const event = {
  at,
  component: 'worker',
  kind: 'worker.job_failed',
  severity: 'warn',
  refs: {},
}
const core = {
  component: 'worker',
  health: { state: 'ok', reason: null },
  metrics: [],
  pending: [],
  events: [],
  observedAt: at,
}
const many = <T>(item: T, n: number): T[] =>
  Array.from({ length: n }, () => item)

describe('snapshotCoreSchema caps', () => {
  it.each([
    ['metrics', metric, 64],
    ['pending', pending, 32],
    ['events', event, 100],
  ] as const)(
    'accepts %s up to %i and rejects one more',
    (field, item, cap) => {
      expect(() =>
        snapshotCoreSchema.parse({ ...core, [field]: many(item, cap) }),
      ).not.toThrow()
      expect(() =>
        snapshotCoreSchema.parse({ ...core, [field]: many(item, cap + 1) }),
      ).toThrow()
    },
  )
  it('rejects unknown fields', () => {
    expect(() => snapshotCoreSchema.parse({ ...core, note: 'x' })).toThrow()
  })
})
