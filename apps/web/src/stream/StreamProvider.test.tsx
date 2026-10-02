import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStream } from '../hooks/useStream'
import { FakeEventSource } from '../test/FakeEventSource'
import { StreamProvider } from './StreamProvider'

const navigate = vi.hoisted(() => vi.fn())
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }))

const wrapper = ({ children }: { children: ReactNode }) => (
  <StreamProvider>{children}</StreamProvider>
)
const source = () => FakeEventSource.instances[0] as FakeEventSource

describe('StreamProvider', () => {
  beforeEach(() => {
    navigate.mockClear()
  })
  it('serves the folded stream state and the live status', () => {
    const { result } = renderHook(() => useStream(), { wrapper })
    expect(result.current).toMatchObject({
      status: 'connecting',
      lastId: null,
    })
    act(() => {
      source().onopen?.()
      source().emit({ type: 'sync', id: 7 })
    })
    expect(result.current).toMatchObject({
      status: 'live',
      lastId: 7,
      synced: true,
    })
  })
  it('routes to the login screen when the session is gone', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 401 })),
    )
    const { result } = renderHook(() => useStream(), { wrapper })
    act(() => {
      source().close()
      source().onerror?.()
    })
    await waitFor(() => {
      expect(result.current.status).toBe('unauthorized')
    })
    expect(navigate).toHaveBeenCalledWith({ to: '/login' })
  })
  it('stays put while merely offline', () => {
    const { result } = renderHook(() => useStream(), { wrapper })
    act(() => {
      source().onerror?.()
    })
    expect(result.current.status).toBe('offline')
    expect(navigate).not.toHaveBeenCalled()
  })
})
