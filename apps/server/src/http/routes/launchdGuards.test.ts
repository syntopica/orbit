import { recordLaunchdObservation } from '../../history/recordLaunchdObservation'
import { buildTestApp } from '../../test/buildTestApp'
import type { LaunchdCatalog } from '../../types/LaunchdCatalog'

const NOW = 1_790_000_000_000
const DAY = 86_400_000
const row = {
  component: 'worker',
  label: 'com.example.a',
  role: 'keepalive',
  schedule: null,
} as const
const catalog: LaunchdCatalog = {
  rows: vi.fn<LaunchdCatalog['rows']>().mockResolvedValue([row]),
}
const history = (query: string) => `/api/launchd/history?${query}`

describe('launchd history guards', () => {
  it('matches the label exactly: no prefix, suffix or case folding', async () => {
    const { get } = buildTestApp({ catalog })
    for (const label of [
      'com.example',
      'com.example.a.b',
      'COM.EXAMPLE.A',
      'com.example.a%20',
    ]) {
      expect((await get(history(`label=${label}&range=24h`))).status).toBe(404)
    }
    expect((await get(history('range=24h'))).status).toBe(404)
    expect((await get(history('label=com.example.a&range=7d'))).status).toBe(
      200,
    )
  })
  it('accepts only the three ranges', async () => {
    const { get } = buildTestApp({ catalog })
    for (const range of ['30d', '24h', '7d']) {
      expect(
        (await get(history(`label=com.example.a&range=${range}`))).status,
      ).toBe(200)
    }
    for (const query of [
      'label=com.example.a',
      'label=com.example.a&range=24H',
      'label=com.example.a&range=1d',
    ]) {
      const res = await get(history(query))
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'bad_request' })
    }
  })
  it('reads from now - range - 47 days', async () => {
    const { get, deps } = buildTestApp({ catalog })
    for (const at of [
      NOW - DAY - 46 * DAY,
      NOW - DAY - 40 * DAY,
      NOW - DAY - 48 * DAY,
      NOW - DAY - 50 * DAY,
    ]) {
      recordLaunchdObservation(deps.historyDb, {
        label: 'com.example.a',
        pid: 1,
        runs: at,
        lastExit: null,
        at,
      })
    }
    const res = await get(history('label=com.example.a&range=24h'))
    // The newest observation before the window start, then everything inside it.
    expect(await res.json()).toMatchObject({
      observations: [49, 47, 41].map((days) => ({ at: NOW - days * DAY })),
    })
  })
  it('answers 404 when there is no catalog or it fails', async () => {
    expect(
      (await buildTestApp().get(history('label=com.example.a&range=24h')))
        .status,
    ).toBe(404)
    const broken: LaunchdCatalog = {
      rows: vi
        .fn<LaunchdCatalog['rows']>()
        .mockRejectedValue(new Error('content')),
    }
    expect(
      (
        await buildTestApp({ catalog: broken }).get(
          history('label=com.example.a&range=24h'),
        )
      ).status,
    ).toBe(404)
  })
})

describe('launchd rows through the detail pool', () => {
  it('times a never-settling catalog out and keeps a third request waiting for a slot', async () => {
    vi.useFakeTimers()
    try {
      let calls = 0
      const stuck: LaunchdCatalog = {
        rows: async () => {
          calls += 1
          return new Promise(() => undefined)
        },
      }
      const { get } = buildTestApp({ catalog: stuck })
      const first = get('/api/launchd')
      const second = get('/api/launchd')
      await vi.advanceTimersByTimeAsync(1000)
      const third = get('/api/launchd')
      await vi.advanceTimersByTimeAsync(1000)
      expect(calls).toBe(2)
      await vi.advanceTimersByTimeAsync(13_500)
      expect((await first).status).toBe(503)
      expect(await (await second).json()).toEqual({ error: 'unavailable' })
      await vi.advanceTimersByTimeAsync(1000)
      expect((await third).status).toBe(503)
      expect(calls).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })
})
