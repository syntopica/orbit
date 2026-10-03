import { describe, expect, it } from 'vitest'

import { bucketSeries } from './bucketSeries'
import { rangeStarts } from './rangeStarts'
import { selectTrend } from './selectTrend'

const NOW = 1_790_000_000_000
const HALF = 1_800_000

describe('rangeStarts', () => {
  it('ends the newest bucket at now', () => {
    const { starts, bucketMs } = rangeStarts(NOW, '24h')
    expect(bucketMs).toBe(HALF)
    expect(starts).toHaveLength(48)
    expect((starts.at(-1) ?? 0) + bucketMs).toBe(NOW)
  })
})

describe('range specifications', () => {
  it.each([
    ['7d', 84, 7_200_000],
    ['30d', 90, 28_800_000],
  ] as const)('%s uses the System bucket width', (range, count, width) => {
    const { starts, bucketMs } = rangeStarts(NOW, range)
    expect(starts).toHaveLength(count)
    expect(bucketMs).toBe(width)
    expect((starts.at(-1) ?? 0) + bucketMs).toBe(NOW)
  })
})

describe('bucketSeries', () => {
  const starts = [NOW - 3 * HALF, NOW - 2 * HALF, NOW - HALF]
  it('carries the value in force at each bucket end and gaps unwatched buckets', () => {
    const points = [
      { at: NOW - 4 * HALF, value: 5 },
      { at: NOW - HALF - 1, value: 7 },
    ]
    const runs = [{ started: NOW - 2 * HALF, stopped: NOW }]
    expect(bucketSeries(points, runs, starts, HALF)).toEqual([null, 7, 7])
  })
  it('leaves an internal uncovered run as a gap and retains an observed zero', () => {
    const runs = [
      { started: NOW - 3 * HALF, stopped: NOW - 2 * HALF },
      { started: NOW - HALF, stopped: NOW },
    ]
    expect(
      bucketSeries([{ at: NOW - 4 * HALF, value: 0 }], runs, starts, HALF),
    ).toEqual([0, null, 0])
  })
  it('is null before the first sample', () => {
    const runs = [{ started: NOW - 10 * HALF, stopped: NOW }]
    const points = [{ at: NOW - HALF, value: 2 }]
    expect(bucketSeries(points, runs, starts, HALF)).toEqual([null, null, 2])
  })
})

describe('selectTrend', () => {
  it('builds one line per spec in fixed slots, empty series as gaps', () => {
    const model = selectTrend(
      {
        now: NOW,
        from: NOW - 86_400_000,
        runs: [{ started: NOW - 86_400_000, stopped: NOW }],
        series: [
          {
            key: 'clips.pending',
            points: [{ at: NOW - 86_400_000, value: 3 }],
          },
        ],
      },
      '24h',
      [
        { key: 'clips.pending', label: 'pending' },
        { key: 'clips.needs_claude', label: 'need review' },
      ],
    )
    expect(model.lines.map((l) => [l.label, l.stroke])).toEqual([
      ['pending', 'stroke-series-1'],
      ['need review', 'stroke-series-2'],
    ])
    expect(model.lines[0]?.values.at(-1)).toBe(3)
    expect(model.lines[1]?.values.every((v) => v === null)).toBe(true)
  })
})
