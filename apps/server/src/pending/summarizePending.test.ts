import type { TodoSourceResult } from '../types/TodoSourceResult'
import { summarizePending } from './summarizePending'

describe('summarizePending', () => {
  it('reports a healthy empty board without pending rows', () => {
    const summary = summarizePending([], '2026-10-04T00:00:00.000Z')
    expect(summary.health).toEqual({ state: 'ok', reason: null })
    expect(summary.pending).toEqual([])
    expect(summary.metrics.map((metric) => metric.value)).toEqual([0, 0, 0])
  })
  it('keeps only counts in metrics and pending, warning on an unreadable file', () => {
    const sources: TodoSourceResult[] = [
      {
        source: {
          id: 'todo:a',
          kind: 'todo',
          name: 'a',
          status: 'ok',
          count: 2,
        },
        items: [
          {
            id: '1',
            source: 'todo:a',
            kind: 'todo',
            state: 'open',
            title: 'private text',
            detail: '',
            section: null,
            ref: { file: '/private', line: 1 },
            ageMs: null,
          },
          {
            id: '2',
            source: 'todo:a',
            kind: 'todo',
            state: 'blocked',
            title: 'more private text',
            detail: '',
            section: null,
            ref: { file: '/private', line: 2 },
            ageMs: null,
          },
        ],
      },
      {
        source: {
          id: 'todo:b',
          kind: 'todo',
          name: 'b',
          status: 'unreadable',
          count: 0,
        },
        items: [],
      },
    ]
    const summary = summarizePending(sources, '2026-10-04T00:00:00.000Z')
    expect(summary.health).toEqual({ state: 'warn', reason: 'check_failed' })
    expect(summary.metrics.map((metric) => metric.value)).toEqual([1, 0, 1])
    expect(JSON.stringify(summary)).not.toContain('private')
  })
})
