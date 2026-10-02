import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderAt } from '../../test/renderAt'
import { requestOf } from '../../test/requestOf'

const link = '/pair#abcdefghijk.aaaaaaaaaaaaaaaaaaaaaa'

describe('PairScreen', () => {
  it('strips the fragment from the URL and redeems the invitation', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { router } = await renderAt(link)
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const { path, init } = requestOf(fetchMock, 0)
    expect(path).toBe('/api/pair')
    expect(init.body).toBe(
      '{"id":"abcdefghijk","secret":"aaaaaaaaaaaaaaaaaaaaaa"}',
    )
    expect(new Headers(init.headers).get('X-Orbit')).toBe('1')
    expect(router.history.location.href).not.toContain('abcdefghijk')
    expect(router.history.location.href).not.toContain('placeholder_secret')
  })
  it('removes the secret from history even when the server rejects it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    )
    const { router } = await renderAt(link)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'expired or already used',
    )
    expect(router.history.location.href).toBe('/pair')
    expect(JSON.stringify(router.history.location.state)).not.toContain(
      'placeholder_secret',
    )
  })
  it('reports a malformed link without calling the server', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
    const { router } = await renderAt('/pair#nope')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This pairing link is not valid',
    )
    expect(fetchMock).not.toHaveBeenCalled()
    expect(router.history.location.href).toBe('/pair')
  })
  it('shows a fixed message when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('leaky detail')))
    await renderAt(link)
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Server unreachable')
    expect(alert).not.toHaveTextContent('leaky')
  })
})
