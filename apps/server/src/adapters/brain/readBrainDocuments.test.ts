import type { EngineRunner } from '../../types/EngineRunner'
import { readBrainChecks } from './readBrainChecks'
import { readBrainGraph } from './readBrainGraph'
import { readBrainPage } from './readBrainPage'
import { readBrainRelated } from './readBrainRelated'

const docs: Record<string, { code: number; doc: unknown }> = {
  'lint --json': {
    code: 0,
    doc: { schemaVersion: 1, pageCount: 2, indexStale: false, issues: [] },
  },
  'doctor --json': { code: 0, doc: { schemaVersion: 1, ok: true, checks: [] } },
  'graph --json --no-html': {
    code: 0,
    doc: {
      schemaVersion: 1,
      nodes: [{ id: 'notes/a', type: 'topic', degree: 0 }],
      edges: [],
      orphans: ['notes/a'],
      dangling: [],
    },
  },
  'graph --json --related': {
    code: 0,
    doc: { schemaVersion: 1, total: 0, pairs: [] },
  },
  'page --json --id notes/a': {
    code: 0,
    doc: {
      schemaVersion: 1,
      id: 'notes/a',
      frontmatter: { title: 'A' },
      body: 'Body',
      truncated: false,
      links: { outbound: [], inbound: [] },
    },
  },
  'page --json --id notes/none': {
    code: 1,
    doc: { schemaVersion: 1, error: 'page_not_found' },
  },
}
const seen: string[] = []
const run: EngineRunner = async (args) => {
  const key = args.join(' ')
  seen.push(key)
  const entry = docs[key]
  return await Promise.resolve(
    entry === undefined
      ? { code: 64, stdout: '' }
      : { code: entry.code, stdout: JSON.stringify(entry.doc) },
  )
}
const signal = new AbortController().signal

describe('brain readers', () => {
  it('reads lint then doctor', async () => {
    const checks = await readBrainChecks(run, signal)
    expect(checks.lint.pageCount).toBe(2)
    expect(checks.doctor.ok).toBe(true)
    expect(seen.slice(-2)).toEqual(['lint --json', 'doctor --json'])
  })
  it('reads the graph and related documents', async () => {
    expect((await readBrainGraph(run, signal)).orphans).toEqual(['notes/a'])
    expect((await readBrainRelated(run, signal)).total).toBe(0)
  })
  it('reads a page, and an error document whatever the exit code', async () => {
    const page = await readBrainPage(run, 'notes/a', signal)
    expect('body' in page && page.body).toBe('Body')
    expect(await readBrainPage(run, 'notes/none', signal)).toEqual({
      schemaVersion: 1,
      error: 'page_not_found',
    })
  })
})
