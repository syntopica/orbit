import { createAdminToken } from '../../auth/createAdminToken'
import { hasRecentStepUp } from '../../auth/hasRecentStepUp'
import { migrateAuthStepUp } from '../../state/migrateAuthStepUp'
import { buildTestApp } from '../../test/buildTestApp'
import type { WorkerJobClient } from '../../types/WorkerJobClient'

const job = {
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'failed',
  privacy: 'secret',
  tier: 'fast',
  created: 1.25,
  updated: 2.5,
  attempts: 1,
  last_error: 'timeout',
  acked: null,
  retry_of: null,
  sampling: false,
}
const detail = {
  ...job,
  attempt_details: [
    {
      node: 'node-a',
      provider: 'agy',
      model: 'model-a',
      outcome: 'failed',
      error: 'timeout',
      started: 1.5,
      ended: 2.25,
      tokens_in: 3,
      tokens_out: 4,
    },
  ],
  has_input: true,
  has_output: true,
}
const content = { input: { prompt: 'PRIVATE' }, output: { answer: 'PRIVATE' } }

describe('worker jobs routes', () => {
  it('migrates older auth stores idempotently and keeps step-up on the session row', () => {
    const { authDb, cookie } = buildTestApp()
    migrateAuthStepUp(authDb)
    const columns = authDb.prepare('PRAGMA table_info(sessions)').all() as {
      name: string
    }[]
    expect(
      columns.filter((column) => column.name === 'step_up_at'),
    ).toHaveLength(1)
    expect(
      hasRecentStepUp(authDb, cookie.split('=')[1] ?? '', 1_790_000_000_000),
    ).toBe(false)
  })
  it('filters invalid identifiers and converts timestamps and attempts', async () => {
    const read = vi.fn<WorkerJobClient>(
      async (path) =>
        await Promise.resolve({
          status: 200,
          body: JSON.stringify(
            path.includes('job-1')
              ? detail
              : {
                  jobs: [job, { ...job, id: 'bad id' }],
                  next: 'cursor',
                },
          ),
        }),
    )
    const { get } = buildTestApp({ workerJobs: read })
    const list = await get('/api/worker/jobs?queue=queue.a&limit=20')
    expect(await list.json()).toMatchObject({
      jobs: [
        {
          id: 'job-1',
          queue: 'queue.a',
          producer: 'app',
          state: 'failed',
          privacy: 'secret',
          tier: 'fast',
          createdAt: 1250,
          updatedAt: 2500,
          attempts: 1,
          lastError: 'timeout',
          acked: null,
          retryOf: null,
          sampling: false,
        },
      ],
      next: 'cursor',
    })
    expect(read.mock.calls[0]?.[0]).toContain('queue=queue.a&limit=20')
    expect((await get('/api/worker/jobs?queue=bad%20name')).status).toBe(400)
    const one = await get('/api/worker/jobs/job-1')
    expect(
      ((await one.json()) as { attemptDetails: unknown }).attemptDetails,
    ).toEqual([
      {
        node: 'node-a',
        provider: 'agy',
        model: 'model-a',
        outcome: 'failed',
        error: 'timeout',
        startedAt: 1500,
        endedAt: 2250,
        tokensIn: 3,
        tokensOut: 4,
        wallMs: null,
        costUsd: null,
      },
    ])
  })
  it('requires a fresh token step-up for secret content and emits metadata only', async () => {
    const read = vi.fn<WorkerJobClient>(
      async (path) =>
        await Promise.resolve({
          status: 200,
          body: JSON.stringify(path.endsWith('/content') ? content : detail),
        }),
    )
    let now = 1_790_000_000_000
    const app = buildTestApp({ workerJobs: read, now: () => now })
    const token = createAdminToken(app.authDb, now)
    const url = '/api/worker/jobs/job-1/content'
    expect((await app.get(url)).status).toBe(403)
    expect((await app.get(url, { 'X-Orbit-Reveal': 'secret' })).status).toBe(
      403,
    )
    expect(
      (
        await app.post(
          '/api/session/step-up',
          JSON.stringify({ token: 'wrong' }),
          { Cookie: app.cookie },
        )
      ).status,
    ).toBe(401)
    expect(
      (
        await app.post('/api/session/step-up', JSON.stringify({ token }), {
          Cookie: app.cookie,
        })
      ).status,
    ).toBe(204)
    const revealed = await app.get(url, { 'X-Orbit-Reveal': 'secret' })
    expect(await revealed.json()).toEqual(content)
    expect(read.mock.calls.at(-1)?.[2]).toBe('secret')
    const events = app.deps.hub.recentEvents()
    expect(events.at(-1)?.event).toMatchObject({
      kind: 'worker.revealed',
      refs: { id: 'job-1', class: 'secret' },
    })
    expect(JSON.stringify(events)).not.toContain('PRIVATE')
    now += 300_000
    expect((await app.get(url, { 'X-Orbit-Reveal': 'secret' })).status).toBe(
      403,
    )
  })
  it('maps only fixed worker errors, and actions require CSRF', async () => {
    const read = vi.fn<WorkerJobClient>(async (path, method) => {
      if (method === 'POST')
        return await Promise.resolve({
          status: 409,
          body: JSON.stringify({ error: 'not_retryable', private: 'PRIVATE' }),
        })
      return await Promise.resolve({
        status: 404,
        body: JSON.stringify({ error: 'not_found', private: 'PRIVATE' }),
      })
    })
    const { get, post, deps, app, cookie } = buildTestApp(
      { workerJobs: read },
      { stepUp: true },
    )
    const missing = await get('/api/worker/jobs/job-1')
    expect(await missing.text()).toBe('{"error":"not_found"}')
    const refused = await post('/api/worker/jobs/job-1/retry', '', {
      Cookie: cookie,
    })
    expect(await refused.text()).toBe('{"error":"not_retryable"}')
    const csrf = await app.request(
      'http://127.0.0.1:8790/api/worker/jobs/job-1/ack',
      {
        method: 'POST',
        headers: {
          Host: '127.0.0.1:8790',
          Origin: 'http://127.0.0.1:8790',
          Cookie: cookie,
        },
      },
    )
    expect(csrf.status).toBe(403)
    expect(deps.hub.recentEvents()).toHaveLength(0)
  })
})
