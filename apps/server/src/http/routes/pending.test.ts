import { pendingViewSchema } from '@orbit/contract'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { buildTestApp } from '../../test/buildTestApp'

describe('GET /api/pending', () => {
  it('merges Brain issues, Worker failures and Clips counts from existing readers', async () => {
    const app = buildTestApp({
      brain: {
        graph: async () => Promise.reject(new Error('unused')),
        related: async () => Promise.reject(new Error('unused')),
        page: async () => Promise.reject(new Error('unused')),
        checks: async () =>
          Promise.resolve({
            lint: {
              schemaVersion: 1,
              pageCount: 1,
              indexStale: false,
              issues: [{ page: 'notes/a', code: 'broken_link' }],
            },
            doctor: { schemaVersion: 1, ok: true, checks: [] },
          }),
      },
      workerJobs: async () =>
        Promise.resolve({
          status: 200,
          body: JSON.stringify({
            jobs: [
              {
                id: 'job-one',
                queue: 'demo',
                producer: 'demo',
                state: 'failed',
                privacy: 'internal',
                tier: 'fast',
                created: 100,
                updated: 101,
                attempts: 1,
                last_error: 'timeout',
                acked: null,
                retry_of: null,
                sampling: false,
              },
            ],
            next: null,
          }),
        }),
      clips: async () => Promise.reject(new Error('unused')),
    })
    app.deps.hub.publish({
      component: 'clips',
      health: { state: 'ok', reason: null },
      metrics: [],
      events: [],
      observedAt: '2026-10-04T00:00:00.000Z',
      lastGood: null,
      pending: [{ key: 'clips.pending', count: 2, oldestAt: null }],
    })
    const response = await app.get('/api/pending')
    const board = pendingViewSchema.parse(await response.json())
    expect(board.sources.map((source) => source.count)).toEqual([1, 1, 2])
    expect(board.items.map((item) => item.kind)).toEqual([
      'brain',
      'worker',
      'clips',
    ])
  })
  it('keeps a failed source visible while returning TODO items', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-board-'))
    const path = join(dir, 'TODO.md')
    await writeFile(
      path,
      '## Queue\n- [!] Fix placeholder\n  More placeholder detail\n',
    )
    const app = buildTestApp({
      todoFiles: [{ name: 'tasks', path }],
      workerJobs: async () => Promise.reject(new Error('unavailable')),
    })
    const response = await app.get('/api/pending')
    expect(response.status).toBe(200)
    const board = pendingViewSchema.parse(await response.json())
    expect(board.sources.map((source) => source.status)).toEqual([
      'ok',
      'unavailable',
    ])
    expect(board.items[0]).toMatchObject({
      state: 'blocked',
      title: 'Fix placeholder',
      detail: '  More placeholder detail',
      ref: { file: path, line: 2 },
    })
  })

  it('caps the merged board at 2000 items', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-board-'))
    const path = join(dir, 'TODO.md')
    await writeFile(
      path,
      Array.from(
        { length: 2001 },
        (_, i) => `- [ ] Placeholder ${String(i)}`,
      ).join('\n'),
    )
    const response = await buildTestApp({
      todoFiles: [{ name: 'tasks', path }],
    }).get('/api/pending')
    const board = pendingViewSchema.parse(await response.json())
    expect(board.sources[0]?.count).toBe(2001)
    expect(board.items).toHaveLength(2000)
  })
})
