import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { EngineActions } from './EngineActions'

describe('EngineActions', () => {
  it('lists configured actions in a menu', async () => {
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
    const summary = await screen.findByText('Actions')
    const menu = screen.getByRole('group')
    expect(menu).not.toHaveAttribute('open')
    fireEvent.click(summary)
    expect(menu).toHaveAttribute('open')
    expect(screen.getByRole('button', { name: 'Refresh graph' })).toBeVisible()
    client.clear()
    vi.unstubAllGlobals()
  })
})
