import { summarizeBrain } from './summarizeBrain'

const at = new Date('2026-10-03T10:00:00.000Z')
const lint = (issues: number, indexStale = false) => ({
  schemaVersion: 1 as const,
  pageCount: 10,
  indexStale,
  issues: Array.from({ length: issues }, () => ({ page: 'p', code: 'c' })),
})
const doctor = (ok: boolean) => ({
  schemaVersion: 1 as const,
  ok,
  checks: [{ name: 'paths', ok, code: ok ? 'ok' : 'paths_missing' }],
})

describe('summarizeBrain', () => {
  it('reports pages, issues and failing checks without page ids', () => {
    const s = summarizeBrain(lint(2), doctor(true), at)
    expect(s.health).toEqual({ state: 'ok', reason: null })
    expect(s.metrics.map((m) => [m.key, m.value])).toEqual([
      ['brain.pages', 10],
      ['brain.lint_issues', 2],
      ['brain.doctor_failing', 0],
    ])
    expect(s.pending).toEqual([
      { key: 'brain.lint_issues', count: 2, oldestAt: null },
    ])
    expect(JSON.stringify(s)).not.toContain('"p"')
  })
  it('warns on a failing check before a stale index', () => {
    expect(summarizeBrain(lint(0, true), doctor(false), at).health).toEqual({
      state: 'warn',
      reason: 'check_failed',
    })
    expect(summarizeBrain(lint(0, true), doctor(true), at).health).toEqual({
      state: 'warn',
      reason: 'stale',
    })
    expect(summarizeBrain(lint(0), doctor(true), at).pending).toEqual([])
  })
})
