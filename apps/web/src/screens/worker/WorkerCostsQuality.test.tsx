import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'
import { workerView } from '../../test/workerView'

const day = Date.parse('2026-10-02T00:00:00Z')
const costs = {
  now: day + 1000,
  rows: [
    {
      day,
      provider: 'agy',
      queue: 'q',
      attempts: 2,
      succeeded: 2,
      wallMs: 100,
      tokensIn: 10,
      tokensOut: 5,
      costUsd: 0,
    },
    {
      day,
      provider: 'openrouter',
      queue: 'q',
      attempts: 1,
      succeeded: 1,
      wallMs: 100,
      tokensIn: 2,
      tokensOut: 1,
      costUsd: 0.25,
    },
  ],
}
const quality = {
  now: day + 1000,
  attempts: [
    {
      queue: 'q',
      tier: 'fast',
      provider: 'agy',
      model: 'm',
      attempts: 2,
      succeeded: 2,
      schemaViolations: 0,
      failed: 0,
      preempted: 0,
      meanWallMs: 50,
    },
  ],
  ratings: [],
  judged: [
    {
      queue: 'q',
      provider: 'agy',
      model: 'm',
      judged: 12,
      meanScore: 0.8,
      best: 3,
    },
  ],
}

describe('worker costs and executors', () => {
  it('shows totals, a keyboard chart, table, cooldown and low sample', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url
        return await Promise.resolve(
          Response.json(
            url.includes('/costs')
              ? costs
              : url.includes('/quality')
                ? quality
                : workerView({
                    now: day,
                    cooldowns: [{ runner: 'agy', availableAt: day + 60_000 }],
                  }),
          ),
        )
      }),
    )
    const { container, router } = await renderAt('/worker')
    const section = await screen.findByRole('region', { name: 'Costs' })
    expect(
      (await within(section).findAllByText('$0.25')).length,
    ).toBeGreaterThan(0)
    const chart = within(section).getByRole('slider', {
      name: 'Cost per day by provider',
    })
    fireEvent.focus(chart)
    expect(chart.getAttribute('aria-valuetext')).toContain('$0.25')
    fireEvent.keyDown(chart, { key: 'ArrowLeft' })
    fireEvent.click(within(section).getByText('Show table'))
    expect(
      within(section).getByRole('table', {
        name: 'Totals by provider and queue',
      }),
    ).toHaveTextContent('agy')
    expect(
      within(section).getByRole('table', { name: 'Daily cost by provider' }),
    ).toHaveTextContent('$0.25')
    fireEvent.click(within(section).getByRole('button', { name: '30 days' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ costs: '30d' })
    })
    const executors = await screen.findByRole('region', { name: 'Executors' })
    expect(executors).toHaveTextContent('n < 20')
    expect(executors).toHaveTextContent('available in 1m')
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0)
  })
})
