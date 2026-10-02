import type { Snapshot } from '@orbit/contract'

import { createHub } from '../../hub/createHub'
import { buildTestApp } from '../../test/buildTestApp'
import { readSseBlocks } from '../../test/readSseBlocks'
import type { Hub } from '../../types/Hub'

const STREAM = '/api/stream'

const snap = (value: number): Snapshot => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: '2026-10-02T10:00:00.000Z' }],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
})

const countingHub = () => {
  const hub = createHub({ ringSize: 10, recentEvents: 5, firstId: 1 })
  const active = new Set<object>()
  const counted: Hub = {
    ...hub,
    subscribe: (listener) => {
      const token = {}
      active.add(token)
      const unsubscribe = hub.subscribe(listener)
      return () => {
        active.delete(token)
        unsubscribe()
      }
    },
  }
  return { hub: counted, active }
}

const hasSync = (blocks: string[]) =>
  blocks.some((b) => b.includes('"type":"sync"'))

describe('GET /api/stream lifecycle', () => {
  it('treats a Last-Event-ID that is not a non-negative integer as absent', async () => {
    for (const id of ['abc', '-1', '1.5', '1e3', '0x1', '9'.repeat(16)]) {
      const { get, deps } = buildTestApp()
      deps.hub.publish(snap(1))
      const blocks = await readSseBlocks(
        await get(STREAM, { 'Last-Event-ID': id }),
        hasSync,
      )
      expect(blocks.map((b) => /"type":"(\w+)"/.exec(b)?.[1])).toEqual([
        'snapshot',
        'sync',
      ])
    }
  })
  it('resyncs for an id the ring never held', async () => {
    const { get, deps } = buildTestApp()
    deps.hub.publish(snap(1))
    const blocks = await readSseBlocks(
      await get(STREAM, { 'Last-Event-ID': '99' }),
      hasSync,
    )
    expect(blocks.map((b) => /"type":"(\w+)"/.exec(b)?.[1])).toEqual([
      'resync',
      'snapshot',
      'sync',
    ])
  })
  it('forwards live messages with their id and unsubscribes on disconnect', async () => {
    const { hub, active } = countingHub()
    const { get } = buildTestApp({ hub })
    const res = await get(STREAM)
    const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
      res.body?.getReader()
    await reader?.read()
    expect(active.size).toBe(1)
    hub.publish(snap(7))
    let text = ''
    while (reader !== undefined && !text.includes('"value":7')) {
      text += new TextDecoder().decode((await reader.read()).value)
    }
    expect(text).toContain('\nid: 1\n')
    await reader?.cancel()
    await vi.waitFor(() => {
      expect(active.size).toBe(0)
    })
  })
  it('pings every 15 s', async () => {
    vi.useFakeTimers()
    try {
      const { get } = buildTestApp()
      const res = await get(STREAM)
      const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
        res.body?.getReader()
      await reader?.read()
      await vi.advanceTimersByTimeAsync(15_500)
      const chunk = await reader?.read()
      expect(new TextDecoder().decode(chunk?.value)).toBe(
        'event: ping\ndata: \n\n',
      )
      await reader?.cancel()
    } finally {
      vi.useRealTimers()
    }
  })
  it('closes quietly and unsubscribes when the hub throws', async () => {
    const { hub, active } = countingHub()
    const failing: Hub = {
      ...hub,
      snapshots: () => {
        throw new Error('hub content')
      },
    }
    const errors = vi.spyOn(console, 'error')
    const res = await buildTestApp({ hub: failing }).get(STREAM)
    expect(await res.text()).toBe('')
    expect(active.size).toBe(0)
    expect(errors).not.toHaveBeenCalled()
  })
})
