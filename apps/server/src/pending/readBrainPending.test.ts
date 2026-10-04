import type { BrainReaders } from '../types/BrainReaders'
import { readBrainPending } from './readBrainPending'

describe('readBrainPending', () => {
  it('uses the existing checks reader and drops invalid issue identifiers', async () => {
    const checkDocument = {
      lint: {
        schemaVersion: 1 as const,
        pageCount: 1,
        indexStale: false,
        issues: [
          { page: 'notes/a', code: 'broken_link' },
          { page: 'notes/a', code: 'broken_link' },
          { page: '../escape', code: 'broken_link' },
        ],
      },
      doctor: { schemaVersion: 1 as const, ok: true, checks: [] },
    }
    const brain: BrainReaders = {
      graph: async () => Promise.reject(new Error('unused')),
      related: async () => Promise.reject(new Error('unused')),
      page: async () => Promise.reject(new Error('unused')),
      checks: async () => Promise.resolve(checkDocument),
    }
    const result = await readBrainPending(brain, new AbortController().signal)
    expect(result.source).toMatchObject({ count: 2, status: 'ok' })
    expect(result.items).toMatchObject([
      { id: 'brain:notes/a:broken_link:0', ref: 'notes/a', state: 'issue' },
      { id: 'brain:notes/a:broken_link:1', ref: 'notes/a', state: 'issue' },
    ])
  })
})
