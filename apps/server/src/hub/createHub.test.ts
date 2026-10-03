import type { Snapshot, StreamMessage } from '@orbit/contract'

import { createHub } from './createHub'

const snap = (value: number, events: Snapshot['events'] = []): Snapshot => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: '2026-10-02T10:00:00.000Z' }],
  pending: [],
  events,
  observedAt: new Date().toISOString(),
  lastGood: null,
})

const tick = {
  at: '2026-10-02T10:00:00.000Z',
  component: 'synthetic',
  kind: 'synthetic.tick',
  severity: 'info',
  refs: { n: 1 },
} as const

const newHub = (recentEvents = 5) =>
  createHub({ ringSize: 10, recentEvents, firstId: 100 })

describe('createHub', () => {
  afterEach(() => {
    vi.useRealTimers()
  })
  it('sends a snapshot only when it changes, and events separately', () => {
    const hub = createHub({ ringSize: 10, recentEvents: 5, firstId: 100 })
    const seen: StreamMessage[] = []
    hub.subscribe((m) => {
      seen.push(m)
    })
    hub.publish(snap(1))
    hub.publish(snap(1))
    hub.publish(snap(2, [tick]))
    expect(seen.map((m) => [m.type, m.id])).toEqual([
      ['snapshot', 100],
      ['snapshot', 101],
      ['event', 102],
    ])
    expect(hub.snapshots()[0]?.events).toEqual([])
    expect(hub.recentEvents()).toHaveLength(1)
    expect(hub.lastId()).toBe(102)
    expect(hub.replayAfter(100)?.map((m) => m.id)).toEqual([101, 102])
  })
  it('stops delivering after unsubscribe and caps recent events', () => {
    const hub = createHub({ ringSize: 10, recentEvents: 2, firstId: 0 })
    const seen: StreamMessage[] = []
    const off = hub.subscribe((m) => {
      seen.push(m)
    })
    off()
    hub.publish(snap(1, [tick, tick, tick]))
    expect(seen).toEqual([])
    expect(hub.recentEvents()).toHaveLength(2)
  })
  it('keeps the latest snapshot even when it is not sent', () => {
    const hub = newHub()
    hub.publish({ ...snap(1), observedAt: 'a' })
    hub.publish({ ...snap(1), observedAt: 'b' })
    expect(hub.snapshots()[0]?.observedAt).toBe('b')
    expect(hub.lastId()).toBe(100)
  })
  it('ignores read timestamps when deciding a snapshot changed', () => {
    const hub = newHub()
    const seen: StreamMessage[] = []
    hub.subscribe((m) => {
      seen.push(m)
    })
    const at = (stamp: string): Snapshot => {
      const { lastGood: _, ...core } = snap(1)
      return {
        ...core,
        metrics: [{ key: 'synthetic.value', value: 1, at: stamp }],
        pending: [{ key: 'synthetic.items', count: 2, oldestAt: stamp }],
        observedAt: stamp,
        lastGood: { ...core, observedAt: stamp },
      }
    }
    hub.publish(at('2026-10-02T10:00:00.000Z'))
    hub.publish(at('2026-10-02T10:00:05.000Z'))
    expect(seen).toHaveLength(1)
    hub.publish({ ...at('2026-10-02T10:00:10.000Z'), metrics: [] })
    expect(seen).toHaveLength(2)
  })
  it('stores lastGood without its events', () => {
    const hub = newHub()
    const { lastGood: _, ...core } = snap(1, [tick])
    hub.publish({ ...snap(1), lastGood: core })
    expect(hub.snapshots()[0]?.lastGood?.events).toEqual([])
  })
  it('resends an unchanged snapshot only after 30 seconds', () => {
    vi.useFakeTimers()
    const hub = newHub()
    const seen: StreamMessage[] = []
    hub.subscribe((m) => {
      seen.push(m)
    })
    hub.publish(snap(1))
    vi.advanceTimersByTime(29_999)
    hub.publish(snap(1))
    expect(seen).toHaveLength(1)
    vi.advanceTimersByTime(1)
    hub.publish(snap(1))
    expect(seen).toHaveLength(2)
  })
  it('tracks each component separately', () => {
    const hub = newHub()
    const seen: StreamMessage[] = []
    hub.subscribe((m) => {
      seen.push(m)
    })
    hub.publish(snap(1))
    hub.publish({ ...snap(1), component: 'worker' })
    expect(seen).toHaveLength(2)
    expect(hub.snapshots()).toHaveLength(2)
  })
  it('survives a throwing listener without skipping others or corrupting state', () => {
    const hub = newHub()
    const seen: StreamMessage[] = []
    hub.subscribe(() => {
      throw new Error('boom')
    })
    hub.subscribe((m) => {
      seen.push(m)
    })
    expect(() => {
      hub.publish(snap(1, [tick]))
    }).not.toThrow()
    expect(seen.map((m) => m.id)).toEqual([100, 101])
    expect(hub.lastId()).toBe(101)
    expect(hub.replayAfter(99)).toHaveLength(2)
    expect(hub.recentEvents()).toHaveLength(1)
  })
  it('unsubscribe is idempotent and does not remove other listeners', () => {
    const hub = newHub()
    const a: StreamMessage[] = []
    const b: StreamMessage[] = []
    const offA = hub.subscribe((m) => {
      a.push(m)
    })
    hub.subscribe((m) => {
      b.push(m)
    })
    offA()
    offA()
    hub.publish(snap(1))
    expect(a).toEqual([])
    expect(b).toHaveLength(1)
  })
  it('lets a listener unsubscribe itself during delivery', () => {
    const hub = newHub()
    const seen: StreamMessage[] = []
    const off = hub.subscribe(() => {
      off()
    })
    hub.subscribe((m) => {
      seen.push(m)
    })
    hub.publish(snap(1, [tick]))
    expect(seen).toHaveLength(2)
  })
  it('starts a listener added during delivery with the next message', () => {
    const hub = newHub()
    const late: StreamMessage[] = []
    const off = hub.subscribe(() => {
      off()
      hub.subscribe((m) => {
        late.push(m)
      })
    })
    hub.publish(snap(1))
    expect(late).toEqual([])
    hub.publish(snap(2))
    expect(late).toHaveLength(1)
  })
})

describe('createHub ring size', () => {
  it('rejects a ring smaller than one message', () => {
    for (const ringSize of [0, -1, 1.5, Number.NaN]) {
      expect(() =>
        createHub({ ringSize, recentEvents: 5, firstId: 1 }),
      ).toThrow('ringSize')
    }
  })
})
