import { metricHistorySchema } from './metricHistorySchema'

const history = {
  now: 1_790_000_000_000,
  from: 1_789_913_600_000,
  runs: [{ started: 1_789_900_000_000, stopped: 1_790_000_000_000 }],
  series: [
    { key: 'clips.pending', points: [{ at: 1_789_990_000_000, value: 3 }] },
  ],
}

describe('metricHistorySchema', () => {
  it('accepts a history', () => {
    expect(metricHistorySchema.parse(history)).toEqual(history)
  })
  it('rejects a key outside the metric enum', () => {
    const series = [{ key: 'clips.titles', points: [] }]
    expect(() => metricHistorySchema.parse({ ...history, series })).toThrow()
  })
})
