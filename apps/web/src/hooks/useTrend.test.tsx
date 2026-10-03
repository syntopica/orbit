import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { HistoryRange } from '../types/HistoryRange'
import type { TrendSpec } from '../types/TrendSpec'
import { useTrend } from './useTrend'

const NOW = 1_790_000_000_000
const DAY = 86_400_000
const SPECS: readonly TrendSpec[] = [{ key: 'clips.pending', label: 'pending' }]
const history = (span: number, value: number) => ({
  now: NOW,
  from: NOW - span,
  runs: [{ started: NOW - span, stopped: NOW }],
  series: [{ key: 'clips.pending', points: [{ at: NOW - span, value }] }],
})

describe('useTrend', () => {
  it('retains the previous buckets while another range is loading', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    let finish: (response: Response) => void = () => undefined
    const pending = new Promise<Response>((resolve) => {
      finish = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) =>
        input.includes('range=7d') ? pending : Response.json(history(DAY, 4)),
      ),
    )
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result, rerender, unmount } = renderHook(
      ({ range }: { range: HistoryRange }) => useTrend('clips', range, SPECS),
      { wrapper, initialProps: { range: '24h' as HistoryRange } },
    )
    await waitFor(() => {
      expect(result.current.model?.starts).toHaveLength(48)
    })
    const previous = result.current.model
    rerender({ range: '7d' })
    await waitFor(() => {
      expect(result.current.stale).toBe(true)
    })
    expect(result.current.model).toEqual(previous)
    expect(
      result.current.model?.lines[0]?.values.every((value) => value === 4),
    ).toBe(true)
    await act(async () => {
      finish(Response.json(history(7 * DAY, 9)))
      await pending
    })
    await waitFor(() => {
      expect(result.current.stale).toBe(false)
    })
    expect(result.current.model?.starts).toHaveLength(84)
    expect(
      result.current.model?.lines[0]?.values.every((value) => value === 9),
    ).toBe(true)
    unmount()
    client.clear()
  })
  it.each([undefined, true, false])(
    'uses the polling policy %s',
    async (poll) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
      vi.useFakeTimers()
      const request = vi.fn(
        async () => await Promise.resolve(Response.json(history(DAY, 4))),
      )
      vi.stubGlobal('fetch', request)
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      )
      const component = poll === false ? 'brain' : 'clips'
      const { result, unmount } = renderHook(
        () =>
          useTrend(
            component,
            '24h',
            SPECS,
            poll === undefined
              ? undefined
              : { poll, gcTime: poll ? undefined : 0 },
          ),
        { wrapper },
      )
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1)
      })
      expect(result.current.model).not.toBeNull()
      try {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(120_000)
        })
        expect(request).toHaveBeenCalledTimes(poll === false ? 1 : 3)
        unmount()
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1)
        })
        expect(
          client.getQueryData(['metric-history', component, '24h']) ===
            undefined,
        ).toBe(poll === false)
      } finally {
        unmount()
        client.clear()
        vi.useRealTimers()
      }
    },
  )
})
