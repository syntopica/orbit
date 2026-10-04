import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { requestUrl } from '../../test/requestUrl'
import { ActionButton } from './ActionButton'

describe('ActionButton', () => {
  it('waits for confirmation before posting a configured action', async () => {
    const request = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        await Promise.resolve()
        return new Response(
          init?.method === 'POST'
            ? JSON.stringify({ id: 'run-1', state: 'started' })
            : JSON.stringify({
                runs: [
                  {
                    id: 'run-1',
                    kind: 'run',
                    target: 'com.example.job',
                    state: 'started',
                    startedAt: 1,
                    exitCode: -1,
                    durationMs: 0,
                  },
                ],
              }),
          { status: init?.method === 'POST' ? 202 : 200 },
        )
      },
    )
    vi.stubGlobal('fetch', request)
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <ActionButton
          target="com.example.job"
          action="run"
          label="Run now"
          path="/api/launchd/com.example.job/run"
        />
      </QueryClientProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Run now' }))
    expect(
      screen.getByRole('dialog', { name: 'Confirm run' }),
    ).toHaveTextContent('com.example.job')
    expect(request.mock.calls.every((call) => call[1]?.method !== 'POST')).toBe(
      true,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm run' }))
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'View run' })).toBeVisible(),
    )
    expect(request.mock.calls.some((call) => call[1]?.method === 'POST')).toBe(
      true,
    )
    client.clear()
    vi.unstubAllGlobals()
  })
  it('shows a fixed failure message and lets the operator cancel the dialog', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        await Promise.resolve()
        return new Response(
          init?.method === 'POST'
            ? '{"error":"already_running"}'
            : '{"runs":[]}',
          { status: init?.method === 'POST' ? 409 : 200 },
        )
      }),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <ActionButton
          target="com.example.job"
          action="restart"
          label="Restart"
          path="/api/launchd/com.example.job/restart"
        />
      </QueryClientProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm restart' }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Action failed'),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    client.clear()
    vi.unstubAllGlobals()
  })
  it('asks for the admin token on step_up_required and retries the action', async () => {
    let steppedUp = false
    const request = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        await Promise.resolve()
        const url = requestUrl(input)
        if (url.endsWith('/session/step-up')) {
          steppedUp = true
          return new Response(null, { status: 204 })
        }
        if (init?.method === 'POST')
          return steppedUp
            ? Response.json({ id: 'run-2', state: 'started' }, { status: 202 })
            : Response.json({ error: 'step_up_required' }, { status: 403 })
        return Response.json({ runs: [] })
      },
    )
    vi.stubGlobal('fetch', request)
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <ActionButton
          target="com.example.service"
          action="restart"
          label="Restart"
          path="/api/launchd/com.example.service/restart"
        />
      </QueryClientProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm restart' }))
    const input = await screen.findByLabelText('Admin token for this action')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'token-value' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm restart' }))
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'View run' })).toBeVisible(),
    )
    client.clear()
  })
})
