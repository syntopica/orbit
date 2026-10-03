import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useBrainChecks } from './useBrainChecks'

describe('useBrainChecks', () => {
  it('loads once per screen opening, never polls and removes cached checks on close', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const request = vi.fn(
      async () =>
        await Promise.resolve(
          Response.json({
            now: 0,
            pageCount: 0,
            indexStale: false,
            issues: [],
            doctor: { ok: true, checks: [] },
          }),
        ),
    )
    vi.stubGlobal('fetch', request)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    vi.useFakeTimers()
    const { result, unmount } = renderHook(useBrainChecks, { wrapper })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(result.current.checks).not.toBeNull()
    try {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(120_000)
      })
      expect(request).toHaveBeenCalledTimes(1)
      unmount()
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1)
      })
      expect(client.getQueryData(['brain', 'checks'])).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
    const reopened = renderHook(useBrainChecks, { wrapper })
    await waitFor(() => {
      expect(reopened.result.current.checks).not.toBeNull()
    })
    expect(request).toHaveBeenCalledTimes(2)
    reopened.unmount()
    client.clear()
  })
})
