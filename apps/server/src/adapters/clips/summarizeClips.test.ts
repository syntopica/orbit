import { summarizeClips } from './summarizeClips'

const at = new Date('2026-10-03T10:00:00.000Z')
const status = (over: Partial<Record<string, number>> = {}) => ({
  schemaVersion: 1 as const,
  total: 30,
  states: {
    pending: 5,
    'needs-claude': 2,
    inconsistent: 0,
    unreadable: 0,
    reconciled: 23,
    ...over,
  },
  oldestAt: {
    pending: '2026-10-01T00:00:00.000Z',
    'needs-claude': '2026-09-30T00:00:00.000Z',
  },
  intake: {
    days: [
      { day: '2026-10-02', count: 4 },
      { day: '2026-10-03', count: 1 },
    ],
    undated: 0,
  },
})
const doctor = (ok: boolean) => ({ schemaVersion: 1 as const, ok, checks: [] })

describe('summarizeClips', () => {
  it('reports counts, today intake and pending with their oldest times', () => {
    const s = summarizeClips(status(), doctor(true), at)
    expect(s.health).toEqual({ state: 'ok', reason: null })
    expect(s.metrics.map((m) => [m.key, m.value])).toEqual([
      ['clips.total', 30],
      ['clips.pending', 5],
      ['clips.needs_claude', 2],
      ['clips.intake_today', 1],
    ])
    expect(s.pending).toEqual([
      { key: 'clips.pending', count: 5, oldestAt: '2026-10-01T00:00:00.000Z' },
      {
        key: 'clips.needs_claude',
        count: 2,
        oldestAt: '2026-09-30T00:00:00.000Z',
      },
    ])
  })
  it('warns on a failing check or an inconsistent clip', () => {
    const warn = { state: 'warn', reason: 'check_failed' }
    expect(summarizeClips(status(), doctor(false), at).health).toEqual(warn)
    expect(
      summarizeClips(status({ inconsistent: 1 }), doctor(true), at).health,
    ).toEqual(warn)
  })
})
