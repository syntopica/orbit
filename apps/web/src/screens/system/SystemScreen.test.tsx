import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'

const JOB = 'com.example.job'
const rows = [
  {
    component: 'worker',
    label: JOB,
    role: 'scheduled',
    schedule: { intervalS: 3_600, calendar: false, keepAlive: false },
  },
]
const history = {
  now: Date.now(),
  observations: [
    {
      label: JOB,
      at: Date.now() - 60_000,
      runs: 4,
      lastExit: 78,
      pid: null,
    },
  ],
  runs: [{ started: Date.now() - 2 * 3_600_000, stopped: Date.now() }],
}

describe('SystemScreen', () => {
  it('shows each label with schedule, state and heartbeat', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) =>
        Promise.resolve(
          input === '/api/launchd'
            ? Response.json({ rows })
            : input.startsWith(
                  '/api/launchd/history?label=com.example.job&range=',
                )
              ? Response.json(history)
              : new Response(null, { status: 200 }),
        ),
      ),
    )
    const { container } = await renderAt('/system')
    expect(
      await screen.findByRole('heading', { name: 'com.example.job' }),
    ).toBeInTheDocument()
    expect(screen.getByText('every 1h')).toBeInTheDocument()
    expect(await screen.findByText('last exit 78')).toBeInTheDocument()
    expect(
      await screen.findByRole('img', {
        name: /com\.example\.job, last 24 hours: .*failed/,
      }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '7 days' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '7 days' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toHaveLength(0)
  })
  it('says when no labels are registered', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve(Response.json({ rows: [] }))),
    )
    await renderAt('/system')
    expect(
      await screen.findByText(/No launchd labels are registered/),
    ).toBeInTheDocument()
  })
  it('says when the catalog cannot be read and when history fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve(new Response(null, { status: 503 }))),
    )
    await renderAt('/system')
    expect(
      await screen.findByText('Could not read the launchd catalog.'),
    ).toHaveAttribute('role', 'alert')
    expect(
      await screen.findByText('Could not read the poll loops.'),
    ).toHaveAttribute('role', 'alert')
  })
  it('shows history unavailable for one row when its history fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) =>
        Promise.resolve(
          input === '/api/launchd'
            ? Response.json({ rows })
            : new Response(null, { status: 503 }),
        ),
      ),
    )
    await renderAt('/system?range=30d')
    expect(await screen.findByText('history unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '30 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
  it('draws the newest bucket against the server clock, not the browser clock', async () => {
    const serverNow = Date.now() - 100_000
    const lagging = {
      now: serverNow,
      observations: [
        {
          label: JOB,
          at: serverNow - 3_600_000,
          runs: 1,
          lastExit: 0,
          pid: null,
        },
      ],
      runs: [{ started: serverNow - 90_000_000, stopped: serverNow - 60_000 }],
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) =>
        Promise.resolve(
          input === '/api/launchd'
            ? Response.json({ rows: [{ ...rows[0], schedule: null }] })
            : Response.json(lagging),
        ),
      ),
    )
    await renderAt('/system')
    expect(
      await screen.findByRole('img', { name: /last 24 hours: all up/ }),
    ).toBeInTheDocument()
  })
})
