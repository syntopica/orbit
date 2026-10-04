import { syntheticAdapter } from '../test/syntheticAdapter'
import { syntheticCore } from '../test/syntheticCore'
import { createAdapterLoop } from './createAdapterLoop'
import { createPollerRegistry } from './createPollerRegistry'

describe('createAdapterLoop poll tracking', () => {
  beforeEach(() => vi.useFakeTimers({ now: 10_000 }))
  afterEach(() => vi.useRealTimers())

  it('records attempt, success, duration and the next tick', async () => {
    const poller = createPollerRegistry()
    const loop = createAdapterLoop(
      syntheticAdapter(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return syntheticCore(1)
      }),
      { publish: () => undefined },
      poller.tracker('brain'),
    )
    loop.start()
    await vi.advanceTimersByTimeAsync(100)
    expect(poller.rows()[0]).toMatchObject({
      running: true,
      lastAttemptAt: 10_000,
    })
    await vi.advanceTimersByTimeAsync(150)
    loop.stop()
    expect(poller.rows()[0]).toMatchObject({
      running: false,
      lastSuccessAt: 10_200,
      lastDurationMs: 200,
      failures: 0,
      nextAt: 11_200,
    })
  })

  it('counts consecutive failures', async () => {
    const poller = createPollerRegistry()
    const loop = createAdapterLoop(
      syntheticAdapter(async () => Promise.reject(new Error('down'))),
      { publish: () => undefined },
      poller.tracker('clips'),
    )
    loop.start()
    await vi.advanceTimersByTimeAsync(3500)
    loop.stop()
    const [row] = poller.rows()
    expect(row?.failures).toBeGreaterThanOrEqual(2)
    expect(row?.lastSuccessAt).toBeNull()
  })
})
