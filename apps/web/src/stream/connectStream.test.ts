import { describe, expect, it, vi } from 'vitest'

import { FakeEventSource } from '../test/FakeEventSource'
import type { StreamHandlers } from '../types/StreamHandlers'
import { connectStream } from './connectStream'

const setup = (probeStatus = 200) => {
  FakeEventSource.instances = []
  vi.stubGlobal('EventSource', FakeEventSource)
  vi.stubGlobal(
    'fetch',
    vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: probeStatus })),
  )
  const onMessage = vi.fn<StreamHandlers['onMessage']>()
  const onStatus = vi.fn()
  const stop = connectStream({ onMessage, onStatus }, 10)
  const source = FakeEventSource.instances[0] as FakeEventSource
  return { onMessage, onStatus, stop, source }
}

describe('connectStream', () => {
  it('goes live and forwards valid messages only', () => {
    const { onMessage, onStatus, source, stop } = setup()
    source.onopen?.()
    source.emit({ type: 'sync', id: 1 })
    source.emit({ type: 'bogus' })
    expect(onStatus).toHaveBeenLastCalledWith('live')
    expect(onMessage).toHaveBeenCalledTimes(1)
    stop()
    expect(source.readyState).toBe(FakeEventSource.CLOSED)
  })
  it('reports offline while the browser retries', () => {
    const { onStatus, source, stop } = setup()
    source.onerror?.()
    expect(onStatus).toHaveBeenLastCalledWith('offline')
    stop()
  })
  it('leaves reconnection to the browser while the stream is not closed', async () => {
    const { source, stop } = setup()
    source.onerror?.()
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(fetch).not.toHaveBeenCalled()
    expect(FakeEventSource.instances).toHaveLength(1)
    stop()
  })
  it('does nothing after stop even if the probe answers late', async () => {
    const { onStatus, source, stop } = setup(401)
    source.close()
    source.onerror?.()
    stop()
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(onStatus).not.toHaveBeenCalledWith('unauthorized')
    expect(FakeEventSource.instances).toHaveLength(1)
  })
  it('reports unauthorized when the closed stream is a 401', async () => {
    const { onStatus, source, stop } = setup(401)
    source.close()
    source.onerror?.()
    await vi.waitFor(() => {
      expect(onStatus).toHaveBeenLastCalledWith('unauthorized')
    })
    expect(FakeEventSource.instances).toHaveLength(1)
    stop()
  })
  it('reopens after a closed stream when the session is fine', async () => {
    const { source, stop } = setup(200)
    source.close()
    source.onerror?.()
    await vi.waitFor(() => {
      expect(FakeEventSource.instances).toHaveLength(2)
    })
    stop()
  })
  it('turns stale after 45 s of silence', () => {
    vi.useFakeTimers()
    const { onStatus, source, stop } = setup()
    source.onopen?.()
    vi.advanceTimersByTime(30_000)
    source.listeners.get('ping')?.()
    vi.advanceTimersByTime(44_000)
    expect(onStatus).toHaveBeenLastCalledWith('live')
    vi.advanceTimersByTime(2_000)
    expect(onStatus).toHaveBeenLastCalledWith('stale')
    stop()
    vi.useRealTimers()
  })
  it('empties state when a replacement stream opens, before its messages', async () => {
    const { onMessage, source, stop } = setup(200)
    source.emit({ type: 'sync', id: 1 })
    source.close()
    source.onerror?.()
    await vi.waitFor(() => {
      expect(FakeEventSource.instances).toHaveLength(2)
    })
    const next = FakeEventSource.instances[1] as FakeEventSource
    expect(onMessage).toHaveBeenCalledTimes(1)
    next.onopen?.()
    next.emit({ type: 'sync', id: 2 })
    expect(onMessage.mock.calls.map(([message]) => message.type)).toEqual([
      'sync',
      'resync',
      'sync',
    ])
    stop()
  })
  it('resyncs only on the first open of a replacement stream', async () => {
    const { onMessage, source, stop } = setup(200)
    source.close()
    source.onerror?.()
    await vi.waitFor(() => {
      expect(FakeEventSource.instances).toHaveLength(2)
    })
    const next = FakeEventSource.instances[1] as FakeEventSource
    next.onopen?.()
    next.onerror?.()
    next.onopen?.()
    expect(onMessage).toHaveBeenCalledTimes(1)
    stop()
  })
  it('keeps the data when a replacement stream fails before opening', async () => {
    const { onMessage, source, stop } = setup(200)
    source.close()
    source.onerror?.()
    await vi.waitFor(() => {
      expect(FakeEventSource.instances).toHaveLength(2)
    })
    ;(FakeEventSource.instances[1] as FakeEventSource).onerror?.()
    expect(onMessage).not.toHaveBeenCalled()
    stop()
  })
  it('stays offline instead of decaying to stale after an error', () => {
    vi.useFakeTimers()
    const { onStatus, source, stop } = setup()
    source.onopen?.()
    source.onerror?.()
    vi.advanceTimersByTime(46_000)
    expect(onStatus).toHaveBeenLastCalledWith('offline')
    stop()
    vi.useRealTimers()
  })
  it('stays unauthorized instead of decaying to stale', async () => {
    vi.useFakeTimers()
    const { onStatus, source, stop } = setup(401)
    source.onopen?.()
    source.close()
    source.onerror?.()
    await vi.advanceTimersByTimeAsync(0)
    expect(onStatus).toHaveBeenLastCalledWith('unauthorized')
    vi.advanceTimersByTime(46_000)
    expect(onStatus).toHaveBeenLastCalledWith('unauthorized')
    stop()
    vi.useRealTimers()
  })
  it('cancels a pending reconnect on stop', async () => {
    const { source, stop } = setup(200)
    source.close()
    source.onerror?.()
    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    stop()
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(FakeEventSource.instances).toHaveLength(1)
  })
  it('stops the silence watchdog on stop', () => {
    vi.useFakeTimers()
    const { onStatus, source, stop } = setup()
    source.onopen?.()
    stop()
    vi.advanceTimersByTime(46_000)
    expect(onStatus).not.toHaveBeenCalledWith('stale')
    vi.useRealTimers()
  })
})
