import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { EngineActions } from './EngineActions'

describe('EngineActions', () => {
  it('lists configured actions as buttons', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        await Promise.resolve()
        return new Response(
          JSON.stringify({
            actions: {
              refresh: {
                args: ['refresh'],
                label: 'Refresh graph',
                timeoutS: 600,
              },
            },
          }),
        )
      }),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <EngineActions engine="brain" />
      </QueryClientProvider>,
    )
    const group = await screen.findByRole('group', { name: 'Actions' })
    expect(group).toContainElement(
      screen.getByRole('button', { name: 'Refresh graph' }),
    )
    client.clear()
    vi.unstubAllGlobals()
  })
})
