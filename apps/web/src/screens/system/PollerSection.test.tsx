import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderAt } from '../../test/renderAt'

describe('PollerSection', () => {
  it('lists each loop with its state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: string) =>
        input === '/api/launchd'
          ? Response.json({ rows: [] })
          : Response.json({
              now: 100_000,
              rows: [
                {
                  component: 'clips',
                  running: false,
                  lastAttemptAt: 90_000,
                  lastSuccessAt: null,
                  lastDurationMs: 25_000,
                  failures: 2,
                  nextAt: 160_000,
                },
              ],
            }),
      ),
    )
    await renderAt('/system')
    const section = await screen.findByRole('region', { name: 'Orbit polling' })
    const row = await within(section).findByRole('listitem')
    expect(row).toHaveAttribute('data-state', 'failing')
    expect(row).toHaveTextContent('Clips')
    expect(within(section).getByText(/2 failed in a row/)).toBeInTheDocument()
  })
})
