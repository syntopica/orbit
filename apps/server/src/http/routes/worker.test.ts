import { buildTestApp } from '../../test/buildTestApp'
import type { WorkerReader } from '../../types/WorkerReader'

const NOW = 1_790_000_000_000
const WORKER = '/api/worker'
const status = {
  queues: {
    'queue.a': {
      states: { queued: 2 },
      oldest_queued_s: 60,
      done_1h: 0,
      wasted_1h_s: 0,
    },
  },
  nodes: {},
  cooldowns: { 'runner-a': 10 },
  recent_failures: [
    { id: 'job-a', queue: 'queue.a', error: 'timeout', finished: 1 },
  ],
}
const reader = (): WorkerReader =>
  vi.fn<WorkerReader>().mockResolvedValue(status)

describe('GET /api/worker', () => {
  it('serves the converted view on the server clock', async () => {
    const res = await buildTestApp({ worker: reader() }).get(WORKER)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      now: NOW,
      queues: [
        {
          name: 'queue.a',
          queued: 2,
          live: 0,
          failed: 0,
          succeeded: 0,
          oldestQueuedMs: 60_000,
          done1h: 0,
        },
      ],
      nodes: [],
      cooldowns: [{ runner: 'runner-a', availableAt: NOW + 10_000 }],
      failures: [
        { id: 'job-a', queue: 'queue.a', error: 'timeout', finishedAt: 1000 },
      ],
    })
  })
  it('is guarded by the session like the launchd routes', async () => {
    const { get } = buildTestApp({ worker: reader() })
    for (const path of [WORKER, '/api/launchd']) {
      const res = await get(path, { Cookie: '' })
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'unauthorized' })
    }
    const crossSite = await get(WORKER, {
      'Sec-Fetch-Site': 'cross-site',
    })
    const launchd = await get('/api/launchd', {
      'Sec-Fetch-Site': 'cross-site',
    })
    expect(crossSite.status).toBe(launchd.status)
    expect(await crossSite.json()).toEqual(await launchd.json())
  })
  it('answers a fixed 503 when unconfigured or failing, never upstream text', async () => {
    const unconfigured = await buildTestApp().get(WORKER)
    expect(unconfigured.status).toBe(503)
    expect(await unconfigured.json()).toEqual({ error: 'unavailable' })
    const failing = vi
      .fn<WorkerReader>()
      .mockRejectedValue(new Error('SECRET upstream'))
    const res = await buildTestApp({ worker: failing }).get(WORKER)
    expect(res.status).toBe(503)
    expect(await res.text()).toBe('{"error":"unavailable"}')
  })
  it('aborts the read after 4 seconds', async () => {
    vi.useFakeTimers()
    try {
      let signal: AbortSignal | undefined
      const stuck: WorkerReader = async (s) => {
        signal = s
        return new Promise(() => undefined)
      }
      const pending = buildTestApp({ worker: stuck }).get(WORKER)
      await vi.advanceTimersByTimeAsync(3999)
      expect(signal?.aborted).toBe(false)
      await vi.advanceTimersByTimeAsync(1)
      expect(signal?.aborted).toBe(true)
      expect((await pending).status).toBe(503)
    } finally {
      vi.useRealTimers()
    }
  })
})
