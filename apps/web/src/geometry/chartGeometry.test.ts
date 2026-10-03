import { describe, expect, it } from 'vitest'

import { barWidth } from './barWidth'
import { layoutChart } from './layoutChart'
import { layoutStack } from './layoutStack'
import { sparkPoints } from './sparkPoints'
import { xAxisTicks } from './xAxisTicks'

const HOUR = 3_600_000

describe('layoutStack', () => {
  it('leaves a 2 px gap between segments and rounds only the top', () => {
    const rects = layoutStack(
      [
        { key: 'a', count: 10 },
        { key: 'b', count: 5 },
      ],
      (v) => 100 - v * 2,
    )
    expect(rects).toEqual([
      { key: 'a', y: 80, height: 20, rounded: false },
      { key: 'b', y: 70, height: 8, rounded: true },
    ])
  })
  it('keeps a tiny segment visible', () => {
    const [, tiny] = layoutStack(
      [
        { key: 'a', count: 100 },
        { key: 'b', count: 1 },
      ],
      (v) => 100 - v * 0.5,
    )
    expect(tiny?.height).toBe(1)
  })
})

describe('barWidth', () => {
  it('caps at 24 px and keeps a 2 px gap', () => {
    expect(barWidth(100)).toBe(24)
    expect(barWidth(10)).toBeCloseTo(7.2)
    expect(barWidth(4)).toBe(2)
    expect(barWidth(1)).toBe(1)
  })
})

describe('layoutChart', () => {
  it('centres columns in equal bands with whole-count ticks', () => {
    const columns = [0, 1, 2, 3].map((i) => ({
      start: i * HOUR,
      end: (i + 1) * HOUR,
      segments: [{ key: 'a', count: i }],
      total: i,
    }))
    const layout = layoutChart(columns, 430, 160, HOUR)
    expect(layout.columns.map((c) => c.bandWidth)).toEqual([100, 100, 100, 100])
    expect(layout.columns[0]?.center).toBe(78)
    expect(layout.yTicks.every((t) => /^\d+$/.test(t.label))).toBe(true)
    expect(layout.yTicks[0]?.at).toBe(160 - 18)
  })
})

describe('xAxisTicks', () => {
  it('labels where a local period begins, never the first bucket', () => {
    const starts = Array.from({ length: 25 }, (_, i) => i * HOUR)
    const ticks = xAxisTicks(
      starts,
      starts.map((_, i) => i * 10),
      HOUR,
    )
    expect(ticks.length).toBeGreaterThanOrEqual(3)
    expect(ticks.length).toBeLessThanOrEqual(5)
    expect(ticks.every((t) => t.at > 0)).toBe(true)
  })
  it('names weekdays on coarse buckets', () => {
    const starts = Array.from({ length: 28 }, (_, i) => i * 6 * HOUR)
    const ticks = xAxisTicks(
      starts,
      starts.map((_, i) => i),
      6 * HOUR,
    )
    expect(ticks.length).toBeGreaterThanOrEqual(6)
    expect(ticks[0]?.label).toMatch(/^[A-Z][a-z]{2}$/)
  })
})

describe('sparkPoints', () => {
  it('spreads points over band centres within the stroke margin', () => {
    expect(sparkPoints([0, 2], 100, 28)).toEqual([
      { x: 25, y: 24 },
      { x: 75, y: 4 },
    ])
  })
})
