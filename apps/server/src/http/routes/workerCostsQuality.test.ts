import { buildTestApp } from '../../test/buildTestApp'
import type { WorkerCostsReader } from '../../types/WorkerCostsReader'
import type { WorkerQualityReader } from '../../types/WorkerQualityReader'

const costs = vi.fn<WorkerCostsReader>().mockResolvedValue({
  rows: [
    {
      day: '2026-10-01',
      provider: 'agy',
      queue: 'q',
      attempts: 2,
      succeeded: 1,
      tokens_in: 3,
      tokens_out: 4,
      cost_usd: 0,
      wall_s: 1.5,
    },
    {
      day: '2026-10-01',
      provider: 'bad name',
      queue: 'q',
      attempts: 1,
      succeeded: 1,
      tokens_in: 0,
      tokens_out: 0,
      cost_usd: 1,
      wall_s: 1,
    },
  ],
})
const quality = vi.fn<WorkerQualityReader>().mockResolvedValue({
  attempts: [
    {
      queue: 'q',
      tier: 'fast',
      provider: 'agy',
      model: 'm',
      attempts: 2,
      succeeded: 1,
      schema_violations: 0,
      failed: 1,
      preempted: 0,
      mean_wall_s: null,
    },
  ],
  ratings: [],
  judged: [
    {
      queue: 'q',
      provider: 'agy',
      model: 'm',
      judged: 10,
      mean_score: null,
      best: 2,
    },
  ],
})

describe('worker costs and quality routes', () => {
  it('maps costs and drops invalid identifiers', async () => {
    const res = await buildTestApp({ workerCosts: costs }).get(
      '/api/worker/costs?range=24h',
    )
    expect(res.status).toBe(200)
    expect(costs.mock.calls.at(-1)?.[0]).toBe(1)
    expect(await res.json()).toEqual({
      now: 1_790_000_000_000,
      rows: [
        {
          day: Date.parse('2026-10-01T00:00:00.000Z'),
          provider: 'agy',
          queue: 'q',
          attempts: 2,
          succeeded: 1,
          tokensIn: 3,
          tokensOut: 4,
          costUsd: 0,
          wallMs: 1500,
        },
      ],
    })
  })
  it('maps quality and keeps nullable means', async () => {
    const res = await buildTestApp({ workerQuality: quality }).get(
      '/api/worker/quality?range=7d',
    )
    expect(res.status).toBe(200)
    expect(quality.mock.calls.at(-1)?.[0]).toBe(7)
    expect(await res.json()).toMatchObject({
      attempts: [{ meanWallMs: null, schemaViolations: 0 }],
      judged: [{ meanScore: null, best: 2 }],
    })
  })
  it('maps both 30-day ranges to 30 days upstream', async () => {
    const { get } = buildTestApp({ workerCosts: costs, workerQuality: quality })
    expect((await get('/api/worker/costs?range=30d')).status).toBe(200)
    expect((await get('/api/worker/quality?range=30d')).status).toBe(200)
    expect(costs.mock.calls.at(-1)?.[0]).toBe(30)
    expect(quality.mock.calls.at(-1)?.[0]).toBe(30)
  })
  it('rejects ranges, guards sessions, and fixes upstream failure responses', async () => {
    const { get } = buildTestApp({ workerCosts: costs, workerQuality: quality })
    expect((await get('/api/worker/costs?range=bad')).status).toBe(400)
    expect((await get('/api/worker/quality?range=24h')).status).toBe(400)
    expect(
      (await get('/api/worker/costs?range=7d', { Cookie: '' })).status,
    ).toBe(401)
    const res = await buildTestApp().get('/api/worker/quality?range=30d')
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'unavailable' })
    const failing = vi
      .fn<WorkerCostsReader>()
      .mockRejectedValue(new Error('private upstream body'))
    const failed = await buildTestApp({ workerCosts: failing }).get(
      '/api/worker/costs?range=7d',
    )
    expect(failed.status).toBe(503)
    expect(await failed.text()).toBe('{"error":"unavailable"}')
  })
  it('aborts a stalled quality read after four seconds', async () => {
    vi.useFakeTimers()
    try {
      let signal: AbortSignal | undefined
      const stuck: WorkerQualityReader = async (_days, next) => {
        signal = next
        return new Promise(() => undefined)
      }
      const pending = buildTestApp({ workerQuality: stuck }).get(
        '/api/worker/quality?range=7d',
      )
      await vi.advanceTimersByTimeAsync(4000)
      expect(signal?.aborted).toBe(true)
      expect((await pending).status).toBe(503)
    } finally {
      vi.useRealTimers()
    }
  })
})
