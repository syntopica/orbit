import { summarizeAtrium } from './summarizeAtrium'

const now = new Date('2026-10-03T12:00:00.000Z')
const hour = 3_600_000
const refresh = (writtenAt: string) => ({
  schemaVersion: 1 as const,
  writtenAt,
  records: { total: 50 },
  populations: [
    { intended: 10, indexed: 7 },
    { intended: 3, indexed: 5 },
  ],
})
const synthesis = {
  schemaVersion: 1 as const,
  writtenAt: '2026-10-03T11:00:00.000Z',
  lastPass: { deferred: 4, failed: 1 },
}

describe('summarizeAtrium', () => {
  it('counts records, unindexed records and the last synthesis pass', () => {
    const s = summarizeAtrium(
      refresh('2026-10-03T11:30:00.000Z'),
      synthesis,
      hour,
      now,
    )
    expect(s.health).toEqual({ state: 'ok', reason: null })
    expect(s.metrics.map((m) => [m.key, m.value])).toEqual([
      ['atrium.records', 50],
      ['atrium.not_indexed', 3],
      ['atrium.synth_deferred', 4],
      ['atrium.synth_failed', 1],
    ])
    expect(s.pending).toEqual([
      { key: 'atrium.not_indexed', count: 3, oldestAt: null },
    ])
  })
  it('turns stale past twice the refresh interval and omits absent synthesis', () => {
    const s = summarizeAtrium(
      refresh('2026-10-03T09:59:59.000Z'),
      null,
      hour,
      now,
    )
    expect(s.health).toEqual({ state: 'warn', reason: 'stale' })
    expect(s.metrics.map((m) => m.key)).toEqual([
      'atrium.records',
      'atrium.not_indexed',
    ])
  })
})
