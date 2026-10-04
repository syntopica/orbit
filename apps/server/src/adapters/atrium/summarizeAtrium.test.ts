import { atriumRefreshDocument } from '../../test/atriumRefreshDocument'
import { atriumSynthesisDocument } from '../../test/atriumSynthesisDocument'
import { summarizeAtrium } from './summarizeAtrium'

const now = new Date('2026-10-03T12:00:00.000Z')
const hour = 3_600_000
const doctorWith = (severity: 'ok' | 'warn' | 'broken') => ({
  schemaVersion: 1 as const,
  ok: severity !== 'broken',
  writtenAt: '2026-10-03T11:30:00.000Z',
  checks: [{ name: 'archive', ok: severity === 'ok', severity, code: 'x' }],
})
describe('summarizeAtrium', () => {
  it('counts records, unindexed records and the last synthesis pass', () => {
    const s = summarizeAtrium(
      {
        refresh: atriumRefreshDocument({
          writtenAt: '2026-10-03T11:30:00.000Z',
        }),
        synthesis: atriumSynthesisDocument(),
        doctor: null,
      },
      hour,
      now,
    )
    expect(s.health).toEqual({ state: 'ok', reason: null })
    expect(s.metrics.map((m) => [m.key, m.value])).toEqual([
      ['atrium.records', 50],
      ['atrium.not_indexed', 3],
      ['atrium.synth_synthesized', 6],
      ['atrium.synth_deferred', 4],
      ['atrium.synth_failed', 1],
    ])
    expect(s.pending).toEqual([
      { key: 'atrium.not_indexed', count: 3, oldestAt: null },
    ])
  })
  it('turns stale past twice the refresh interval and omits absent synthesis', () => {
    const s = summarizeAtrium(
      {
        refresh: atriumRefreshDocument({
          writtenAt: '2026-10-03T09:59:59.000Z',
        }),
        synthesis: null,
        doctor: doctorWith('broken'),
      },
      hour,
      now,
    )
    expect(s.health).toEqual({ state: 'warn', reason: 'stale' })
    expect(s.metrics.map((m) => m.key)).toEqual([
      'atrium.records',
      'atrium.not_indexed',
    ])
  })
  it('warns on a broken doctor check but not on a warn finding', () => {
    const health = (severity: 'ok' | 'warn' | 'broken') =>
      summarizeAtrium(
        {
          refresh: atriumRefreshDocument(),
          synthesis: null,
          doctor: doctorWith(severity),
        },
        hour,
        now,
      ).health
    expect(health('broken')).toEqual({ state: 'warn', reason: 'check_failed' })
    expect(health('warn')).toEqual({ state: 'ok', reason: null })
  })
})
