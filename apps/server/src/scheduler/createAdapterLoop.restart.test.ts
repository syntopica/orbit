import type { Snapshot } from '@orbit/contract'

import { syntheticAdapter } from '../test/syntheticAdapter'
import { syntheticCore } from '../test/syntheticCore'
import type { Adapter } from '../types/Adapter'
import { createAdapterLoop } from './createAdapterLoop'

describe('createAdapterLoop restart', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('ignores a second start() while running', async () => {
    let calls = 0
    const loop = createAdapterLoop(
      syntheticAdapter(async () => {
        calls += 1
        await Promise.resolve()
        return syntheticCore(calls)
      }),
      { publish: () => undefined },
    )
    loop.start()
    loop.start()
    await vi.advanceTimersByTimeAsync(3500)
    loop.stop()
    expect(calls).toBe(4)
  })

  it('never overlaps reads across stop and start and drops the old read', async () => {
    let active = 0
    let maxActive = 0
    let calls = 0
    const published: Snapshot[] = []
    const stubborn = syntheticAdapter(async () => {
      calls += 1
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) =>
        setTimeout(resolve, calls === 1 ? 2000 : 10),
      )
      active -= 1
      return syntheticCore(calls)
    })
    const loop = createAdapterLoop(stubborn, {
      publish: (s) => published.push(s),
    })
    loop.start()
    await vi.advanceTimersByTimeAsync(100)
    loop.stop()
    loop.start()
    await vi.advanceTimersByTimeAsync(1800)
    expect(calls).toBe(1)
    expect(published).toEqual([])
    await vi.advanceTimersByTimeAsync(1200)
    loop.stop()
    expect(maxActive).toBe(1)
    expect(calls).toBeGreaterThan(1)
    expect(published.every((s) => s.health.state === 'ok')).toBe(true)
  })

  it('resets the backoff count when restarted', async () => {
    const starts: number[] = []
    const failing = syntheticAdapter(async () => {
      starts.push(Date.now())
      await Promise.resolve()
      throw new Error('down')
    })
    const loop = createAdapterLoop(failing, { publish: () => undefined })
    const t0 = Date.now()
    loop.start()
    await vi.advanceTimersByTimeAsync(2100)
    loop.stop()
    loop.start()
    await vi.advanceTimersByTimeAsync(2100)
    loop.stop()
    expect(starts.map((t) => t - t0)).toEqual([0, 2000, 2100, 4100])
  })

  it('keeps the running read when start() is called again', async () => {
    let calls = 0
    const published: Snapshot[] = []
    const slow = syntheticAdapter(async () => {
      calls += 1
      await new Promise((resolve) => setTimeout(resolve, 500))
      return syntheticCore(calls)
    })
    const loop = createAdapterLoop(slow, { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(100)
    loop.start()
    await vi.advanceTimersByTimeAsync(450)
    loop.stop()
    expect(calls).toBe(1)
    expect(published).toHaveLength(1)
  })

  it('survives a sink that throws and still reads after a restart', async () => {
    let calls = 0
    let publishes = 0
    const reading = syntheticAdapter(async () => {
      calls += 1
      await Promise.resolve()
      return syntheticCore(calls)
    })
    const loop = createAdapterLoop(reading, {
      publish: () => {
        publishes += 1
        if (publishes <= 2) throw new Error('sink')
      },
    })
    loop.start()
    await vi.advanceTimersByTimeAsync(10)
    loop.stop()
    loop.start()
    await vi.advanceTimersByTimeAsync(10)
    loop.stop()
    expect(calls).toBe(2)
  })
})

describe('createAdapterLoop degrade rules', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('keeps the reason of a down snapshot instead of degrading it', async () => {
    const published: Snapshot[] = []
    const failing = syntheticAdapter(async () => {
      await Promise.resolve()
      throw new Error('down')
    })
    const loop = createAdapterLoop(failing, {
      publish: (s) => published.push(s),
    })
    loop.start()
    await vi.advanceTimersByTimeAsync(12_000)
    loop.stop()
    expect(published.length).toBeGreaterThan(0)
    expect(published.every((s) => s.health.reason === 'unreachable')).toBe(true)
  })

  it('does not let lagging replace stale', async () => {
    let calls = 0
    const published: Snapshot[] = []
    const lateAdapter: Adapter = {
      ...syntheticAdapter(async () => {
        calls += 1
        if (calls === 1) return syntheticCore(1)
        await new Promise((resolve) => setTimeout(resolve, 5000))
        return syntheticCore(2)
      }),
      cadenceMs: 1000,
      freshnessMs: 1500,
      timeoutMs: 60_000,
    }
    const loop = createAdapterLoop(lateAdapter, {
      publish: (s) => published.push(s),
    })
    loop.start()
    await vi.advanceTimersByTimeAsync(4000)
    loop.stop()
    const reasons = published.map((s) => s.health.reason)
    expect(reasons).toContain('stale')
    expect(reasons.lastIndexOf('lagging')).toBeLessThan(
      reasons.indexOf('stale'),
    )
  })
})
