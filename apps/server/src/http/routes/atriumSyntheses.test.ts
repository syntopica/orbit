import {
  atriumPassesSchema,
  atriumSynthesesSchema,
  atriumSynthesisContentSchema,
} from '@orbit/contract'

import { buildAtriumSynthesisReaders } from '../../cli/buildAtriumSynthesisReaders'
import { createEngineRunner } from '../../engines/createEngineRunner'
import { buildTestApp } from '../../test/buildTestApp'
import type { RunRequest } from '../../types/RunRequest'

const KEY = 'a'.repeat(32)
const SECRET_TITLE = 'a synthesized title'
const pass = {
  lane: 'local',
  producer: 'local',
  model: 'model-a:7b',
  startedAt: '2026-10-03T10:00:00Z',
  finishedAt: '2026-10-03T10:55:00Z',
  durationS: 3300,
  exitCode: 124,
  state: 'timeout',
  synthesized: null,
  skipped: null,
  failed: null,
  deferred: null,
}
const record = {
  jobKey: KEY,
  kind: 'session',
  source: 'source-a',
  conversationId: 'conv-1',
  episodeId: 'ep-1',
  eventCount: 0,
  session: { since: '2026-10-03T09:00:00Z', until: '2026-10-03T10:00:00Z' },
  authoredAt: '2026-10-03T10:00:00Z',
  writtenAt: '2026-10-03T11:00:00Z',
  modelRequested: 'model a',
  modelResolved: 'model-a:7b',
  inputTokens: 1200,
  outputTokens: 300,
  durationMs: 4200,
  mapChunks: 0,
  workerResults: 0,
  facts: 2,
  openEnds: 1,
}
const documents: Record<string, unknown> = {
  passes: {
    schemaVersion: 1,
    writtenAt: '2026-10-03T12:00:00Z',
    lastPass: { ...pass, state: 'running', exitCode: null, finishedAt: null },
    unsuccessfulStreak: 2,
    progress: {
      conversations: 40,
      finished: 3,
      failed: 1,
      synthesized: 2,
      walled: false,
      updatedAt: '2026-10-03T11:59:00Z',
    },
    passes: [pass],
  },
  recent: {
    schemaVersion: 1,
    writtenAt: '2026-10-03T12:00:00Z',
    records: 2,
    recent: [record, { ...record, jobKey: '../escape' }],
    daily: [
      { day: '2026-10-03', records: 1, inputTokens: 1200, outputTokens: 300 },
    ],
    lastPass: null,
  },
  show: {
    schemaVersion: 1,
    record,
    content: {
      title: SECRET_TITLE,
      summary: 's',
      facts: ['f1', 'f2'],
      openEnds: ['o1'],
    },
  },
}
const subcommands = [
  ['synthesis', 'passes', '--json', '--limit', '20'],
  ['synthesis', 'recent', '--json', '--limit', '50', '--days', '14'],
  ['synthesis', 'show', '--json', '--job-key', '{jobKey}'],
]
const appWith = () => {
  const seen: RunRequest[] = []
  const run = createEngineRunner(
    { file: '/opt/atrium/bin/atrium', subcommands, env: {} },
    async (request) => {
      seen.push(request)
      const view = request.args[1] ?? ''
      return await Promise.resolve({
        code: 0,
        stdout: JSON.stringify(documents[view]),
      })
    },
  )
  const app = buildTestApp({
    atriumSyntheses: buildAtriumSynthesisReaders(run, true, 60_000),
  })
  return { ...app, seen }
}

describe('atrium synthesis routes', () => {
  it('answers passes with exit states, the streak and progress counts', async () => {
    const { get, seen } = appWith()
    const res = await get('/api/atrium/passes')
    expect(res.status).toBe(200)
    const view = atriumPassesSchema.parse(await res.json())
    expect(view.lastPass?.state).toBe('running')
    expect(view.passes[0]).toMatchObject({
      exitCode: 124,
      state: 'timeout',
      durationMs: 3_300_000,
      model: 'model-a:7b',
    })
    expect(view.unsuccessfulStreak).toBe(2)
    expect(view.progress?.finished).toBe(3)
    expect(seen[0]?.args).toEqual(subcommands[0])
  })
  it('answers rows without content and drops a row whose key is no key', async () => {
    const { get, seen } = appWith()
    const res = await get('/api/atrium/syntheses')
    const text = await res.text()
    expect(text).not.toContain(SECRET_TITLE)
    const view = atriumSynthesesSchema.parse(JSON.parse(text))
    expect(view.rows).toHaveLength(1)
    expect(view.rows[0]).toMatchObject({
      jobKey: KEY,
      kind: 'session',
      modelRequested: null,
      sessionSince: Date.parse('2026-10-03T09:00:00Z'),
      durationMs: 4200,
    })
    expect(view.daily).toEqual([
      {
        day: Date.parse('2026-10-03T00:00:00Z'),
        records: 1,
        inputTokens: 1200,
        outputTokens: 300,
      },
    ])
    expect(seen[0]?.args).toEqual(subcommands[1])
  })
  it('reveals content only with the reveal header, and audits it', async () => {
    const { get, deps, seen } = appWith()
    const path = `/api/atrium/syntheses/${KEY}/content`
    const refused = await get(path)
    expect(refused.status).toBe(403)
    expect(await refused.json()).toEqual({ error: 'reveal_required' })
    expect(seen).toHaveLength(0)
    const res = await get(path, { 'X-Orbit-Reveal': 'personal' })
    expect(res.status).toBe(200)
    const content = atriumSynthesisContentSchema.parse(await res.json())
    expect(content.title).toBe(SECRET_TITLE)
    expect(seen[0]?.args).toEqual([
      'synthesis',
      'show',
      '--json',
      '--job-key',
      KEY,
    ])
    const events = deps.hub.recentEvents()
    expect(events.at(-1)?.event).toMatchObject({
      kind: 'atrium.revealed',
      refs: { id: KEY, class: 'personal' },
    })
    expect(JSON.stringify(events)).not.toContain(SECRET_TITLE)
  })
  it('refuses a key that is not a registry key before running anything', async () => {
    const { get, seen } = appWith()
    const res = await get('/api/atrium/syntheses/ABC/content', {
      'X-Orbit-Reveal': 'personal',
    })
    expect(res.status).toBe(400)
    expect(seen).toHaveLength(0)
  })
  it('answers a fixed 503 when atrium has no engine entry', async () => {
    const { get } = buildTestApp()
    for (const path of [
      '/api/atrium/passes',
      '/api/atrium/syntheses',
      `/api/atrium/syntheses/${KEY}/content`,
    ]) {
      const res = await get(path, { 'X-Orbit-Reveal': 'personal' })
      expect(res.status).toBe(503)
      expect(await res.json()).toEqual({ error: 'unavailable' })
    }
  })
})
