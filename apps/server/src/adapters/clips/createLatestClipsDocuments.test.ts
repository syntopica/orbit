import type { ClipsDocuments } from '../../types/ClipsDocuments'
import { createLatestClipsDocuments } from './createLatestClipsDocuments'

const documents: ClipsDocuments = {
  status: {
    schemaVersion: 1,
    total: 0,
    states: {},
    oldestAt: {},
    intake: { days: [], undated: 0 },
  },
  doctor: { schemaVersion: 1, ok: true, checks: [] },
}

describe('createLatestClipsDocuments', () => {
  it('serves the last read while it is young enough', () => {
    let now = 1_000
    const latest = createLatestClipsDocuments(() => now)
    expect(latest.get(60_000)).toBeNull()
    latest.put(documents)
    now += 60_000
    expect(latest.get(60_000)).toBe(documents)
    now += 1
    expect(latest.get(60_000)).toBeNull()
  })
})
