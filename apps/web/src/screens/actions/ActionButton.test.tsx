import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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
})
