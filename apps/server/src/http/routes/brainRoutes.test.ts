import {
  brainChecksSchema,
  brainGraphSchema,
  brainRelatedSchema,
} from '@orbit/contract'

import { ProcessError } from '../../process/ProcessError'
import { buildTestApp } from '../../test/buildTestApp'
import type { BrainReaders } from '../../types/BrainReaders'

const graphDoc = {
  schemaVersion: 1 as const,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1 },
    { id: 'notes/b', type: 'bad type', degree: 2 },
    { id: '../escape', type: 'topic', degree: 1 },
  ],
  edges: [
    { source: 'notes/b', target: 'notes/a' },
    { source: 'notes/b', target: '../escape' },
  ],
  orphans: ['notes/b'],
  dangling: [{ page: 'notes/a', target: 'notes/gone' }],
}
const readers = (
  over: Partial<BrainReaders> = {},
): { brain: BrainReaders } => ({
  brain: {
    graph: async () => Promise.resolve(graphDoc),
    related: async () =>
      Promise.resolve({
        schemaVersion: 1 as const,
        total: 2,
        pairs: [
          { left: 'notes/a', right: 'notes/b', score: 2.5 },
          { left: 'notes/a', right: 'bad id', score: 1 },
        ],
      }),
    page: async () => Promise.reject(new Error('unused')),
    checks: async () =>
      Promise.resolve({
        lint: {
          schemaVersion: 1 as const,
          pageCount: 2,
          indexStale: true,
          issues: [
            { page: 'notes/a', code: 'dangling_link' },
            { page: 'notes/a', code: 'free text' },
          ],
        },
        doctor: {
          schemaVersion: 1 as const,
          ok: false,
          checks: [
            { name: 'paths', ok: false, code: 'paths_missing' },
            { name: 'paths', ok: false, code: 'free text' },
            { name: 'free text', ok: false, code: 'paths_missing' },
          ],
        },
      }),
    ...over,
  },
})

describe('brain detail routes', () => {
  it('answers the graph with index edges, orphan flags and skipped ids', async () => {
    const res = await buildTestApp(readers()).get('/api/brain/graph')
    expect(res.status).toBe(200)
    const graph = brainGraphSchema.parse(await res.json())
    expect(graph.nodes).toEqual([
      { id: 'notes/a', type: 'topic', degree: 1, orphan: false },
      { id: 'notes/b', type: null, degree: 2, orphan: true },
    ])
    expect(graph.edges).toEqual([[1, 0]])
    expect([graph.dangling, graph.skipped, graph.now]).toEqual([
      1, 1, 1_790_000_000_000,
    ])
  })
  it('answers related pairs of valid ids only', async () => {
    const res = await buildTestApp(readers()).get('/api/brain/related')
    const related = brainRelatedSchema.parse(await res.json())
    expect(related.pairs).toEqual([
      { left: 'notes/a', right: 'notes/b', score: 2.5 },
    ])
    expect(related.total).toBe(2)
  })
  it('answers checks with identifier codes only', async () => {
    const res = await buildTestApp(readers()).get('/api/brain/checks')
    const checks = brainChecksSchema.parse(await res.json())
    expect(checks.issues).toEqual([{ page: 'notes/a', code: 'dangling_link' }])
    expect(checks.indexStale).toBe(true)
    expect(checks.doctor.checks).toEqual([
      { name: 'paths', ok: false, code: 'paths_missing' },
    ])
  })
  it('answers a fixed 503 when brain is absent or failing', async () => {
    const off = await buildTestApp().get('/api/brain/graph')
    expect(off.status).toBe(503)
    const failing = await buildTestApp(
      readers({
        graph: async () => Promise.reject(new ProcessError('exit_nonzero')),
      }),
    ).get('/api/brain/graph')
    expect(failing.status).toBe(503)
    expect(await failing.json()).toEqual({ error: 'unavailable' })
  })
})
