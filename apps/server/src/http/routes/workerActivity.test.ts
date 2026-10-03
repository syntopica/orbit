import { buildTestApp } from '../../test/buildTestApp'
import type { WorkerActivityReader } from '../../types/WorkerActivityReader'

const NOW = 1_790_000_000_000
const ACTIVITY = '/api/worker/activity'
const row = {
  bucket: 1_789_996_400,
  queue: 'queue.a',
  provider: 'provider-a',
  sampling: false,
  outcome: 'failed',
  error: 'timeout',
  attempts: 3,
  wall_s: 1.5,
  tokens_in: 10,
  tokens_out: 4,
}
const report = {
  since: 1_789_913_600,
  bucket_s: 3600,
  rows: [
    row,
    { ...row, error: 'free text here' },
    { ...row, queue: 'bad queue' },
    { ...row, provider: 'p\n' },
    { ...row, outcome: '' },
  ],
}
const reader = () => vi.fn<WorkerActivityReader>().mockResolvedValue(report)

describe('GET /api/worker/activity', () => {
  it('converts to ms, drops bad names and blanks bad codes', async () => {
    const read = reader()
    const res = await buildTestApp({ workerActivity: read }).get(
      `${ACTIVITY}?range=24h`,
    )
    expect(res.status).toBe(200)
    const converted = {
      bucket: 1_789_996_400_000,
      queue: 'queue.a',
      provider: 'provider-a',
      sampling: false,
      outcome: 'failed',
      error: 'timeout',
      attempts: 3,
      wallMs: 1500,
      tokensIn: 10,
      tokensOut: 4,
    }
    expect(await res.json()).toEqual({
      now: NOW,
      since: 1_789_913_600_000,
      bucketMs: 3_600_000,
      rows: [converted, { ...converted, error: null }],
    })
    expect(read.mock.calls[0]?.[0]).toBe(24)
  })
  it('asks the coordinator for 168 hours on 7d', async () => {
    const read = reader()
    await buildTestApp({ workerActivity: read }).get(`${ACTIVITY}?range=7d`)
    expect(read.mock.calls[0]?.[0]).toBe(168)
  })
  it('refuses any other range with a 400', async () => {
    const read = reader()
    const { get } = buildTestApp({ workerActivity: read })
    for (const path of [
      ACTIVITY,
      `${ACTIVITY}?range=30d`,
      `${ACTIVITY}?range=1`,
    ]) {
      const res = await get(path)
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'bad_request' })
    }
    expect(read).not.toHaveBeenCalled()
  })
  it('is guarded by the session', async () => {
    const res = await buildTestApp({ workerActivity: reader() }).get(
      `${ACTIVITY}?range=24h`,
      { Cookie: '' },
    )
    expect(res.status).toBe(401)
  })
  it('answers a fixed 503 when unconfigured or failing', async () => {
    const unconfigured = await buildTestApp().get(`${ACTIVITY}?range=24h`)
    expect(unconfigured.status).toBe(503)
    const failing = vi
      .fn<WorkerActivityReader>()
      .mockRejectedValue(new Error('SECRET upstream'))
    const res = await buildTestApp({ workerActivity: failing }).get(
      `${ACTIVITY}?range=7d`,
    )
    expect(res.status).toBe(503)
    expect(await res.text()).toBe('{"error":"unavailable"}')
  })
  it('aborts the read after 4 seconds', async () => {
    vi.useFakeTimers()
    try {
      let signal: AbortSignal | undefined
      const stuck: WorkerActivityReader = async (_hours, s) => {
        signal = s
        return new Promise(() => undefined)
      }
      const pending = buildTestApp({ workerActivity: stuck }).get(
        `${ACTIVITY}?range=24h`,
      )
      await vi.advanceTimersByTimeAsync(4000)
      expect(signal?.aborted).toBe(true)
      expect((await pending).status).toBe(503)
    } finally {
      vi.useRealTimers()
    }
  })
})
