import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderAt } from '../../test/renderAt'
import { requestOf } from '../../test/requestOf'

const signIn = (value: string) => {
  fireEvent.change(screen.getByLabelText('Admin token'), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('LoginScreen', () => {
  it('opens a session with a marked POST and leaves the login page', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { router } = await renderAt('/login')
    signIn('secret-token')
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })
    const { path, init } = requestOf(fetchMock, 0)
    expect(path).toBe('/api/session')
    expect(init.body).toBe('{"token":"secret-token"}')
    expect(new Headers(init.headers).get('X-Orbit')).toBe('1')
  })
  it('says the token was rejected and clears the field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    )
    await renderAt('/login')
    signIn('nope')
    expect(await screen.findByRole('alert')).toHaveTextContent('Token rejected')
    expect(screen.getByLabelText('Admin token')).toHaveValue('')
  })
  it('shows a fixed message when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('leaky detail')))
    await renderAt('/login')
    signIn('nope')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Server unreachable')
    expect(alert).not.toHaveTextContent('leaky')
    expect(screen.getByLabelText('Admin token')).toHaveValue('')
  })
})
