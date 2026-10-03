import { insertSample } from '../test/insertSample'
import { openHistoryDb } from '../test/openHistoryDb'
import { readMetricHistory } from './readMetricHistory'

const INSERT_ROLLUP =
  'INSERT INTO metric_rollups (component, key, hour, min, max, sum, count) VALUES (?, ?, ?, ?, ?, ?, ?)'
const HOUR = 3_600_000
const RECORDS = 'atrium.records'
const NOW = 1_790_000_000_000

describe('readMetricHistory', () => {
  it('returns the value in force at the start and every sample after it', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', RECORDS, 10, NOW - 30 * HOUR)
    insertSample(db, 'atrium', RECORDS, 11, NOW - 29 * HOUR)
    insertSample(db, 'atrium', RECORDS, 12, NOW - 2 * HOUR)
    insertSample(db, 'brain', 'brain.pages', 5, NOW - HOUR)
    insertSample(db, 'atrium', 'retired.key', 1, NOW - HOUR)
    db.prepare('INSERT INTO runs (started, stopped) VALUES (?, ?)').run(
      NOW - 48 * HOUR,
      NOW,
    )
    const history = readMetricHistory(db, 'atrium', NOW - 24 * HOUR, NOW)
    expect(history.series).toEqual([
      {
        key: RECORDS,
        points: [
          { at: NOW - 29 * HOUR, value: 11 },
          { at: NOW - 2 * HOUR, value: 12 },
        ],
      },
    ])
    expect(history.runs).toEqual([{ started: NOW - 48 * HOUR, stopped: NOW }])
  })
  it('reads hourly rollup maxima where raw samples are past retention', () => {
    const db = openHistoryDb()
    const hour = Math.floor((NOW - 10 * 24 * HOUR) / HOUR)
    db.prepare(INSERT_ROLLUP).run(
      'atrium',
      'atrium.not_indexed',
      hour,
      1,
      4,
      5,
      2,
    )
    insertSample(db, 'atrium', 'atrium.not_indexed', 2, NOW - HOUR)
    const history = readMetricHistory(db, 'atrium', NOW - 30 * 24 * HOUR, NOW)
    expect(history.series[0]?.points).toEqual([
      { at: hour * HOUR, value: 4 },
      { at: NOW - HOUR, value: 2 },
    ])
  })
  it('keeps each key latest rollup before the range when raw data is pruned', () => {
    const db = openHistoryDb()
    const from = NOW - 30 * 24 * HOUR
    const hour = Math.floor(from / HOUR)
    db.prepare(INSERT_ROLLUP).run('atrium', RECORDS, hour - 2, 1, 4, 5, 2)
    db.prepare(INSERT_ROLLUP).run('atrium', RECORDS, hour - 1, 2, 6, 8, 2)
    const history = readMetricHistory(db, 'atrium', from, NOW)
    expect(history.series[0]?.points).toEqual([
      { at: (hour - 1) * HOUR, value: 6 },
    ])
  })
  it('includes the partial retention hour before raw samples resume', () => {
    const db = openHistoryDb()
    const cutoff = NOW - 7 * 24 * HOUR
    const hour = Math.floor(cutoff / HOUR)
    db.prepare(INSERT_ROLLUP).run('atrium', RECORDS, hour, 1, 4, 5, 2)
    insertSample(db, 'atrium', RECORDS, 2, cutoff)
    const history = readMetricHistory(db, 'atrium', NOW - 30 * 24 * HOUR, NOW)
    expect(history.series[0]?.points).toEqual([
      { at: hour * HOUR, value: 4 },
      { at: cutoff, value: 2 },
    ])
  })
  it('keeps the partial cutoff hour for the seven-day range', () => {
    const db = openHistoryDb()
    const cutoff = NOW - 7 * 24 * HOUR
    const hour = Math.floor(cutoff / HOUR)
    db.prepare(INSERT_ROLLUP).run('atrium', RECORDS, hour, 1, 4, 5, 2)
    insertSample(db, 'atrium', RECORDS, 2, cutoff)
    expect(
      readMetricHistory(db, 'atrium', cutoff, NOW).series[0]?.points,
    ).toEqual([
      { at: hour * HOUR, value: 4 },
      { at: cutoff, value: 2 },
    ])
  })
  it('uses a pruned rollup baseline in a short window with no older raw sample', () => {
    const db = openHistoryDb()
    const hour = Math.floor((NOW - 8 * 24 * HOUR) / HOUR)
    db.prepare(INSERT_ROLLUP).run('atrium', RECORDS, hour, 1, 4, 5, 2)
    insertSample(db, 'atrium', RECORDS, 2, NOW - HOUR)
    expect(
      readMetricHistory(db, 'atrium', NOW - 24 * HOUR, NOW).series[0]?.points,
    ).toEqual([
      { at: hour * HOUR, value: 4 },
      { at: NOW - HOUR, value: 2 },
    ])
  })
  it('returns only the newest baseline when both raw and rollup values precede a short window', () => {
    const db = openHistoryDb()
    const hour = Math.floor((NOW - 8 * 24 * HOUR) / HOUR)
    db.prepare(INSERT_ROLLUP).run('atrium', RECORDS, hour, 1, 4, 5, 2)
    insertSample(db, 'atrium', RECORDS, 6, NOW - 25 * HOUR)
    insertSample(db, 'atrium', RECORDS, 2, NOW - HOUR)
    expect(
      readMetricHistory(db, 'atrium', NOW - 24 * HOUR, NOW).series[0]?.points,
    ).toEqual([
      { at: NOW - 25 * HOUR, value: 6 },
      { at: NOW - HOUR, value: 2 },
    ])
  })
})
