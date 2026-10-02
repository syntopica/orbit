import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { FakeEventSource } from '../../test/FakeEventSource'
import { renderShell } from '../../test/renderShell'
import { snapshotOf } from '../../test/snapshotOf'

const source = () => FakeEventSource.instances.at(-1) as FakeEventSource
const palette = () => screen.queryByRole('dialog', { name: 'Command palette' })

describe('Shell', () => {
  it('shows the connection state and the page', async () => {
    const { container } = await renderShell()
    expect(
      screen.getByRole('heading', { name: 'home page' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: 'Connection' }),
    ).toHaveTextContent('Connecting')
    act(() => source().onopen?.())
    expect(
      screen.getByRole('status', { name: 'Connection' }),
    ).toHaveTextContent('Live')
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toHaveLength(0)
  })
  it('toasts a component that goes down after sync, not one already down', async () => {
    await renderShell()
    act(() => {
      source().emit({
        type: 'snapshot',
        id: 1,
        snapshot: snapshotOf('launchd', 'down'),
      })
      source().emit({
        type: 'snapshot',
        id: 1,
        snapshot: snapshotOf('worker', 'ok'),
      })
      source().emit({ type: 'sync', id: 1 })
    })
    act(() => {
      source().emit({
        type: 'snapshot',
        id: 2,
        snapshot: snapshotOf('worker', 'down'),
      })
    })
    const toasts = await screen.findAllByRole('alert')
    expect(toasts.map((t) => t.textContent)).toEqual([
      expect.stringContaining('Worker is down'),
    ])
  })
  it('opens the command palette with Cmd-K and navigates', async () => {
    const { router } = await renderShell()
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.click(await screen.findByRole('option', { name: 'System' }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/system')
    })
  })
  it('toggles the palette with Ctrl-K and ignores a bare K', async () => {
    await renderShell()
    expect(fireEvent.keyDown(document, { key: 'k' })).toBe(true)
    expect(palette()).toBeNull()
    expect(fireEvent.keyDown(document, { key: 'K', ctrlKey: true })).toBe(false)
    expect(
      await screen.findByRole('dialog', { name: 'Command palette' }),
    ).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    await waitFor(() => {
      expect(palette()).toBeNull()
    })
  })
  it('signs out from the palette', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { router } = await renderShell()
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.click(await screen.findByRole('option', { name: 'Sign out' }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/logout',
      expect.objectContaining({ method: 'POST' }),
    )
  })
  it('still leaves for login when the sign-out request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockRejectedValue(new Error('offline')),
    )
    const { router } = await renderShell()
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.click(await screen.findByRole('option', { name: 'Sign out' }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
  })
  it('closes the palette on Escape or a backdrop click, with no style injection', async () => {
    await renderShell()
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    const input = await screen.findByPlaceholderText('Go to…')
    expect(input).toHaveFocus()
    expect(document.styleSheets).toHaveLength(0)
    fireEvent.keyDown(input, { key: 'a' })
    expect(palette()).not.toBeNull()
    fireEvent.keyDown(input, { key: 'Escape' })
    await waitFor(() => {
      expect(palette()).toBeNull()
    })
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.click(
      await screen.findByRole('button', { name: 'Close command palette' }),
    )
    await waitFor(() => {
      expect(palette()).toBeNull()
    })
  })
  it('keeps Tab inside the palette and restores focus on close', async () => {
    await renderShell()
    const link = screen.getAllByRole('link', {
      name: 'System',
    })[0] as HTMLElement
    link.focus()
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    const input = await screen.findByPlaceholderText('Go to…')
    expect(fireEvent.keyDown(input, { key: 'Tab' })).toBe(false)
    expect(fireEvent.keyDown(input, { key: 'Tab', shiftKey: true })).toBe(false)
    expect(input).toHaveFocus()
    fireEvent.keyDown(input, { key: 'Escape' })
    await waitFor(() => {
      expect(link).toHaveFocus()
    })
  })
  it('routes to login when the session is gone', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 401 })),
    )
    const { router } = await renderShell()
    act(() => {
      source().close()
      source().onerror?.()
    })
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
  })
})
