import { describe, expect, it } from 'vitest'

import { FLOW_LAYOUT } from './flowLayout'
import { segmentsIntersect } from './segmentsIntersect'

const edges = [
  ['archive', 'episodes'],
  ['archive', 'synthesis'],
  ['synthesis', 'index'],
  ['episodes', 'index'],
  ['episodes', 'curation'],
  ['curation', 'brain'],
  ['clips', 'brain'],
  ['brain', 'index'],
  ['index', 'retrieval'],
] as const

describe('segmentsIntersect', () => {
  it('detects a crossing but allows separated and joined segments', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 10, y: 10 }
    expect(segmentsIntersect(a, b, { x: 0, y: 10 }, { x: 10, y: 0 })).toBe(true)
    expect(segmentsIntersect(a, b, b, { x: 20, y: 0 })).toBe(false)
    expect(segmentsIntersect(a, b, { x: 0, y: 20 }, { x: 10, y: 20 })).toBe(
      false,
    )
  })

  it('keeps every unrelated flow edge from crossing', () => {
    const segments = edges.map(([from, to]) => ({
      from,
      to,
      start: { x: FLOW_LAYOUT[from].x + 208, y: FLOW_LAYOUT[from].y + 40 },
      end: { x: FLOW_LAYOUT[to].x, y: FLOW_LAYOUT[to].y + 40 },
    }))
    segments.forEach(({ start, end }) => {
      expect(start.x).toBeLessThan(end.x)
    })
    for (const [index, first] of segments.entries()) {
      for (const second of segments.slice(index + 1)) {
        if (
          first.from === second.from ||
          first.from === second.to ||
          first.to === second.from ||
          first.to === second.to
        )
          continue
        expect(
          segmentsIntersect(first.start, first.end, second.start, second.end),
          `${first.from}>${first.to} crosses ${second.from}>${second.to}`,
        ).toBe(false)
      }
    }
  })
})
