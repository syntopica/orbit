import type { Snapshot, SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import { createAdapterLoop } from './createAdapterLoop'

const core = (value: number): SnapshotCore => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: new Date().toISOString() }],
  pending: [],
  events: [],
  observedAt: new Date().toISOString(),
})

const adapter = (read: Adapter['read']): Adapter => ({
  id: 'synthetic',
  cadenceMs: 1000,
  timeoutMs: 3000,
  freshnessMs: 5000,
  read,
})

describe('createAdapterLoop', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('publishes each successful read', async () => {
    const published: Snapshot[] = []
    const loop = createAdapterLoop(
      adapter(async () => {
        await Promise.resolve()
        return core(1)
      }),
      { publish: (s) => published.push(s) },
    )
    loop.start()
    await vi.advanceTimersByTimeAsync(2500)
    loop.stop()
    expect(published.filter((s) => s.health.state === 'ok').length).toBe(3)
  })

  it('never overlaps reads and marks a slow read lagging', async () => {
    let active = 0
    let maxActive = 0
    const published: Snapshot[] = []
    const slow = adapter(async () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 2500))
      active -= 1
      return core(1)
    })
    const loop = createAdapterLoop(slow, { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(8000)
    loop.stop()
    expect(maxActive).toBe(1)
    expect(published.some((s) => s.health.reason === 'lagging')).toBe(true)
  })

  it('times out a read that ignores its signal and keeps the last good snapshot', async () => {
    let calls = 0
    const published: Snapshot[] = []
    const flaky = adapter(async () => {
      calls += 1
      if (calls === 1) return core(7)
      return new Promise<SnapshotCore>(() => undefined)
    })
    const loop = createAdapterLoop(flaky, { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(4500)
    loop.stop()
    const down = published.find((s) => s.health.state === 'down')
    expect(down?.health.reason).toBe('timeout')
    expect(down?.lastGood?.metrics[0]?.value).toBe(7)
    expect(down?.events.map((e) => e.kind)).toContain('component.down')
  })

  it('does not start a new read until a timed-out one settles', async () => {
    let active = 0
    let maxActive = 0
    let calls = 0
    const published: Snapshot[] = []
    const late = adapter(async () => {
      calls += 1
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) =>
        setTimeout(resolve, calls === 1 ? 6000 : 10),
      )
      active -= 1
      return core(calls)
    })
    const loop = createAdapterLoop(late, { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(9000)
    loop.stop()
    expect(published.some((s) => s.health.reason === 'timeout')).toBe(true)
    expect(maxActive).toBe(1)
    expect(calls).toBeGreaterThan(1)
  })

  it('marks data stale when nothing new arrives within freshnessMs', async () => {
    let calls = 0
    const published: Snapshot[] = []
    const once = adapter(async () => {
      calls += 1
      if (calls === 1) return core(1)
      return new Promise<SnapshotCore>(() => undefined)
    })
    const loop = createAdapterLoop(
      { ...once, timeoutMs: 60_000 },
      { publish: (s) => published.push(s) },
    )
    loop.start()
    await vi.advanceTimersByTimeAsync(5500)
    loop.stop()
    expect(published.some((s) => s.health.reason === 'stale')).toBe(true)
  })

  it('backs off after failures', async () => {
    let calls = 0
    const failing = adapter(async () => {
      calls += 1
      await Promise.resolve()
      throw new Error('down')
    })
    const loop = createAdapterLoop(failing, { publish: () => undefined })
    loop.start()
    await vi.advanceTimersByTimeAsync(7100)
    loop.stop()
    // reads at 0, 2000 (2^1), 6000 (+4000): three calls in 7.1 s
    expect(calls).toBe(3)
  })
})

describe('createAdapterLoop lifecycle', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('leaves no timers behind and aborts the pending read on stop', async () => {
    let seen: AbortSignal | undefined
    const published: Snapshot[] = []
    const hung = adapter(async (signal) => {
      seen = signal
      return new Promise<SnapshotCore>(() => undefined)
    })
    const loop = createAdapterLoop(hung, { publish: (s) => published.push(s) })
    loop.start()
    await vi.advanceTimersByTimeAsync(10)
    loop.stop()
    await vi.advanceTimersByTimeAsync(0)
    expect(seen?.aborted).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
    expect(published).toEqual([])
  })

  it('clears the pending next-read timer on stop', async () => {
    let calls = 0
    const loop = createAdapterLoop(
      adapter(async () => {
        calls += 1
        await Promise.resolve()
        return core(calls)
      }),
      { publish: () => undefined },
    )
    loop.start()
    await vi.advanceTimersByTimeAsync(10)
    loop.stop()
    await vi.advanceTimersByTimeAsync(5000)
    expect(calls).toBe(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('adds a recovered event when a failing adapter heals', async () => {
    let calls = 0
    const published: Snapshot[] = []
    const healing = adapter(async () => {
      calls += 1
      await Promise.resolve()
      if (calls === 1) throw new Error('down')
      return core(calls)
    })
    const loop = createAdapterLoop(healing, {
      publish: (s) => published.push(s),
    })
    loop.start()
    await vi.advanceTimersByTimeAsync(2500)
    loop.stop()
    expect(published.flatMap((s) => s.events.map((e) => e.kind))).toEqual([
      'component.down',
      'component.recovered',
    ])
  })
})
