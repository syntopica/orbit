import { buildTestApp } from '../../test/buildTestApp'
import type { WorkerJobClient } from '../../types/WorkerJobClient'

const running = {
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'running',
  privacy: 'mail',
  tier: 'basic',
  created: 1,
  updated: 2,
  attempts: 1,
  last_error: null,
  acked: null,
  retry_of: null,
  sampling: false,
  kind: 'inference',
  model: 'model-a',
  priority: 50,
  finished: null,
  deadline: null,
  lease_node: 'node-a',
  lease_expires: 90,
  parent_id: null,
  preemptions: 0,
  tokens_in: null,
  tokens_out: null,
  cost_usd: null,
  wall_s: null,
  last_model: null,
  last_provider: null,
  last_started: 3,
  last_outcome: null,
}
const detail = {
  ...running,
  attempt_details: [
    {
      node: 'node-a',
      provider: 'openrouter',
      model: 'vendor/model:free',
      outcome: 'succeeded',
      error: null,
      started: 3,
      ended: 5.5,
      tokens_in: 7,
      tokens_out: 2,
      wall_s: 2.5,
      cost_usd: 0,
    },
  ],
  results: [
    {
      result_id: 'result-1',
      control: null,
      detail: null,
      executor: { node: 'node-a', provider: 'openrouter', model: 'm-1' },
      usage: { tokens_in: 7, tokens_out: 2, cost_usd: 0 },
      rating: null,
      created: 5.5,
      acked: null,
      output: { text: 'PRIVATE' },
    },
  ],
  has_input: true,
  has_output: true,
}

describe('worker job metrics routes', () => {
  it('asks the worker for what runs now and maps live metrics', async () => {
    const read = vi.fn<WorkerJobClient>(
      async () =>
        await Promise.resolve({
          status: 200,
          body: JSON.stringify({ jobs: [running], next: null }),
        }),
    )
    const { get } = buildTestApp({ workerJobs: read })
    const list = await get(
      '/api/worker/jobs?state=leased%2Crunning%2Cdraining&limit=100',
    )
    expect(read.mock.calls[0]?.[0]).toBe(
      '/v1/admin/jobs?state=leased%2Crunning%2Cdraining&limit=100',
    )
    expect(await list.json()).toMatchObject({
      jobs: [
        {
          kind: 'inference',
          model: 'model-a',
          leaseNode: 'node-a',
          leaseExpiresAt: 90_000,
          lastStartedAt: 3000,
          tokensIn: null,
        },
      ],
    })
    expect((await get('/api/worker/jobs?state=running,bad%20one')).status).toBe(
      400,
    )
  })
  it('passes result metadata and attempt cost through, never the output', async () => {
    const read = vi.fn<WorkerJobClient>(
      async () =>
        await Promise.resolve({ status: 200, body: JSON.stringify(detail) }),
    )
    const { get } = buildTestApp({ workerJobs: read })
    const body = await (await get('/api/worker/jobs/job-1')).text()
    expect(body).not.toContain('PRIVATE')
    expect(JSON.parse(body)).toMatchObject({
      attemptDetails: [{ wallMs: 2500, costUsd: 0 }],
      results: [
        {
          resultId: 'result-1',
          provider: 'openrouter',
          tokensIn: 7,
          tokensOut: 2,
          costUsd: 0,
          createdAt: 5500,
        },
      ],
    })
  })
})
