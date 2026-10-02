import type { Snapshot } from '@orbit/contract'

import { buildTestApp } from '../../test/buildTestApp'
import { createCountingHub } from '../../test/createCountingHub'
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
    const { hub, active } = createCountingHub()
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
  it('sends a named ping event every 15 s on the injected clock', async () => {
    vi.useFakeTimers()
    try {
      let clock = 4_000_000_000_000
      const { get } = buildTestApp({ now: () => clock })
      const res = await get(STREAM)
      const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
        res.body?.getReader()
      await reader?.read()
      // Only the injected clock moves 15 s; the timers move one pump tick.
      clock += 15_000
      await vi.advanceTimersByTimeAsync(300)
      const chunk = await reader?.read()
      expect(new TextDecoder().decode(chunk?.value)).toBe(
        'event: ping\ndata: 1\n\n',
      )
      await reader?.cancel()
    } finally {
      vi.useRealTimers()
    }
  })
  it('closes quietly and unsubscribes when the hub throws', async () => {
    const { hub, active } = createCountingHub()
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
