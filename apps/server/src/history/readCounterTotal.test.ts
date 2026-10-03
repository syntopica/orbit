import { insertSample } from '../test/insertSample'
import { openHistoryDb } from '../test/openHistoryDb'
import { readCounterTotal } from './readCounterTotal'

const records = 'atrium.records'
const synthesized = 'atrium.synth_synthesized'

describe('readCounterTotal', () => {
  it('adds the rises of a counter from the value in force at the start', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', records, 100, 500)
    insertSample(db, 'atrium', records, 110, 1500)
    insertSample(db, 'atrium', records, 90, 2000)
    insertSample(db, 'atrium', records, 95, 2500)
    expect(readCounterTotal(db, 'atrium', records, 1000, 'delta')).toBe(15)
  })
  it('sums per-pass samples inside the window only', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', synthesized, 7, 500)
    insertSample(db, 'atrium', synthesized, 3, 1500)
    insertSample(db, 'atrium', synthesized, 4, 2500)
    expect(readCounterTotal(db, 'atrium', synthesized, 1000, 'sum')).toBe(7)
  })
  it('reads zero for a steady counter and null for one never sampled', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', records, 100, 500)
    expect(readCounterTotal(db, 'atrium', records, 1000, 'delta')).toBe(0)
    expect(
      readCounterTotal(db, 'clips', 'clips.total', 1000, 'delta'),
    ).toBeNull()
  })
  it('includes the boundary sample and ignores other keys and components', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', records, 10, 500)
    insertSample(db, 'atrium', records, 15, 1000)
    insertSample(db, 'atrium', records, 15, 2000)
    insertSample(db, 'clips', records, 500, 1500)
    insertSample(db, 'atrium', synthesized, 100, 1500)
    expect(readCounterTotal(db, 'atrium', records, 1000, 'delta')).toBe(5)
    expect(readCounterTotal(db, 'atrium', records, 1000, 'sum')).toBe(30)
  })
  it('sums zero for a baseline alone and null for an unobserved key', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', synthesized, 7, 500)
    expect(readCounterTotal(db, 'atrium', synthesized, 1000, 'sum')).toBe(0)
    expect(readCounterTotal(db, 'atrium', records, 1000, 'sum')).toBeNull()
  })
  it('requires an observed starting value for a delta but sums first-pass samples', () => {
    const db = openHistoryDb()
    insertSample(db, 'atrium', records, 10, 1500)
    insertSample(db, 'atrium', records, 15, 2000)
    expect(readCounterTotal(db, 'atrium', records, 1000, 'delta')).toBeNull()
    expect(readCounterTotal(db, 'atrium', records, 1000, 'sum')).toBe(25)
  })
})
