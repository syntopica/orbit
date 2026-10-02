import { describe, expect, it, vi } from 'vitest'
import { requestOf } from '../test/requestOf'
import { apiFetch } from './apiFetch'

describe('apiFetch', () => {
  it('marks mutations with the CSRF header and leaves GETs plain', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    await apiFetch('/api/logout', { method: 'POST' })
    await apiFetch('/api/snapshots')
    const post = requestOf(fetchMock, 0).init
    const get = requestOf(fetchMock, 1).init
    expect(new Headers(post.headers).get('X-Orbit')).toBe('1')
    expect(new Headers(post.headers).get('Content-Type')).toBe(
      'application/json',
    )
    expect(new Headers(get.headers).get('X-Orbit')).toBeNull()
    expect(post.credentials).toBe('same-origin')
  })
})
