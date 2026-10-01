import type { Snapshot, SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import { createAdapterLoop } from './createAdapterLoop'
import { syntheticAdapter } from './syntheticAdapter'
import { syntheticCore } from './syntheticCore'

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

  it('does not carry the stop abort into the backoff count', async () => {
    let calls = 0
    const starts: number[] = []
    const failing = syntheticAdapter(async () => {
      calls += 1
      starts.push(Date.now())
      await Promise.resolve()
      throw new Error('down')
    })
    const hung = syntheticAdapter(
      async () => new Promise<SnapshotCore>(() => undefined),
    )
    const loop = createAdapterLoop(hung, { publish: () => undefined })
    loop.start()
    await vi.advanceTimersByTimeAsync(10)
    loop.stop()
    await vi.advanceTimersByTimeAsync(10)
    const again = createAdapterLoop(failing, { publish: () => undefined })
    again.start()
    await vi.advanceTimersByTimeAsync(2100)
    again.stop()
    expect(calls).toBe(2)
    expect((starts[1] ?? 0) - (starts[0] ?? 0)).toBe(2000)
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
