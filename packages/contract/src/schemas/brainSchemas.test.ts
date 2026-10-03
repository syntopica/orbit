import { brainChecksSchema } from './brainChecksSchema'
import { brainGraphSchema } from './brainGraphSchema'
import { brainPageSchema } from './brainPageSchema'
import { brainRelatedSchema } from './brainRelatedSchema'
import { pageIdSchema } from './pageIdSchema'

const NOW = 1_790_000_000_000

describe('pageIdSchema', () => {
  it.each(['notes/a', 'notes/sub/b-2', 'notes/v1.2', 'a_b/c_d'])(
    'accepts %s',
    (id) => {
      expect(pageIdSchema.safeParse(id).success).toBe(true)
    },
  )
  it.each([
    'notes',
    '/notes/a',
    'notes/../a',
    'notes/.hidden',
    'notes/-rf',
    '-x/a',
    'notes/a b',
    'notes\\a',
    'notes/ñ',
    `notes/${'a'.repeat(260)}`,
  ])('refuses %s', (id) => {
    expect(pageIdSchema.safeParse(id).success).toBe(false)
  })
})

describe('brain view schemas', () => {
  it('accepts a graph with index edges and refuses a bad id or type', () => {
    const graph = {
      now: NOW,
      nodes: [
        { id: 'notes/a', type: 'topic', degree: 1, orphan: true },
        { id: 'notes/b', type: null, degree: 1, orphan: false },
      ],
      edges: [[1, 0]],
      dangling: 2,
      skipped: 0,
    }
    expect(brainGraphSchema.parse(graph)).toEqual(graph)
    const badId = { ...graph, nodes: [{ ...graph.nodes[0], id: 'x' }] }
    expect(brainGraphSchema.safeParse(badId).success).toBe(false)
    const badType = { ...graph, nodes: [{ ...graph.nodes[0], type: 'a b' }] }
    expect(brainGraphSchema.safeParse(badType).success).toBe(false)
  })
  it('accepts related pairs of page ids', () => {
    const related = {
      now: NOW,
      total: 3,
      pairs: [{ left: 'notes/a', right: 'notes/b', score: 1.5 }],
    }
    expect(brainRelatedSchema.parse(related)).toEqual(related)
  })
  it('accepts a page and refuses an outbound target outside the pattern', () => {
    const page = {
      id: 'notes/a',
      title: 'A',
      type: 'topic',
      updated: '2026-10-01',
      summary: null,
      sources: ['https://example.com/x'],
      body: '# A',
      truncated: false,
      outbound: [{ target: 'notes/b', exists: true }],
      inbound: ['notes/c'],
    }
    expect(brainPageSchema.parse(page)).toEqual(page)
    const bad = { ...page, outbound: [{ target: '../x', exists: false }] }
    expect(brainPageSchema.safeParse(bad).success).toBe(false)
  })
  it('accepts checks with identifier codes only', () => {
    const checks = {
      now: NOW,
      pageCount: 3,
      indexStale: false,
      issues: [{ page: 'notes/a', code: 'dangling_link' }],
      doctor: { ok: true, checks: [{ name: 'paths', ok: true, code: 'ok' }] },
    }
    expect(brainChecksSchema.parse(checks)).toEqual(checks)
    const bad = { ...checks, issues: [{ page: 'notes/a', code: 'see log' }] }
    expect(brainChecksSchema.safeParse(bad).success).toBe(false)
  })
})
