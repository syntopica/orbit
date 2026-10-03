import { atriumViewSchema } from './atriumViewSchema'

const view = {
  now: 1_790_000_000_000,
  writtenAt: 1_789_999_000_000,
  refreshIntervalMs: 3_600_000,
  records: { total: 3, bySource: [{ source: 'source-a', count: 3 }] },
  archiveAt: 1_789_998_000_000,
  refreshAt: null,
  contentAt: 1_789_990_000_000,
  populations: [{ model: 'model-a', intended: 4, indexed: 1 }],
  synthesis: {
    finishedAt: 1_789_999_000_000,
    durationMs: 60_000,
    producer: null,
    conversations: 2,
    synthesized: 1,
    skipped: 0,
    failed: 0,
    deferred: 1,
  },
}

describe('atriumViewSchema', () => {
  it('accepts a view', () => {
    expect(atriumViewSchema.parse(view)).toEqual(view)
  })
  it('rejects a source that is not an identifier', () => {
    const records = { total: 1, bySource: [{ source: 'a b', count: 1 }] }
    expect(() => atriumViewSchema.parse({ ...view, records })).toThrow()
  })
})
