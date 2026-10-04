import type { ClipsView, MetricHistory } from '@orbit/contract'
import { focusManager } from '@tanstack/react-query'
import { act, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'

const NOW = 1_790_000_000_000
const view: ClipsView = {
  now: NOW,
  total: 9,
  states: [
    { state: 'pending', count: 3, oldestAt: NOW - 2 * 86_400_000 },
    { state: 'needs-claude', count: 1, oldestAt: null },
    { state: 'reconciled', count: 5, oldestAt: null },
  ],
  intake: {
    days: [
      { day: '2026-09-20', count: 1 },
      { day: '2026-09-21', count: 3 },
    ],
    undated: 1,
  },
  doctor: {
    ok: false,
    checks: [{ name: 'archive', ok: false, code: 'archive_public_remote' }],
  },
  capture: { count: 2, oldestAt: NOW - 3_600_000 },
  items: null,
}
const history: MetricHistory = {
  now: NOW,
  from: NOW - 86_400_000,
  runs: [],
  series: [],
}
const serve = (clips: unknown = view, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string) =>
      Promise.resolve(
        path.startsWith('/api/clips')
          ? Response.json(clips, { status })
          : Response.json(history),
      ),
    ),
  )
}

describe('ClipsScreen', () => {
  it('draws the funnel, intake, oldest waiting and failing checks', async () => {
    serve()
    const { container } = await renderAt('/clips')
    const funnel = await screen.findByRole('region', { name: 'Funnel' })
    const stages = within(funnel).getAllByRole('listitem')
    expect(stages[0]).toHaveTextContent('capture API')
    expect(stages[0]).toHaveTextContent('2 waiting')
    expect(stages[1]).toHaveTextContent('pending3')
    expect(funnel).toHaveTextContent('no count surface')
    expect(
      screen.getByRole('slider', { name: 'Clips captured per day' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 without a capture date')).toBeInTheDocument()
    const oldest = screen.getByRole('region', { name: 'Oldest waiting' })
    expect(oldest).toHaveTextContent('pending')
    expect(oldest).toHaveTextContent('2d')
    expect(screen.getByRole('region', { name: 'Doctor' })).toHaveTextContent(
      'archive_public_remote',
    )
    expect(
      await screen.findByRole('slider', {
        name: 'Pending and needing review per bucket',
      }),
    ).toBeInTheDocument()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
  it('preserves failing check names without a code and empty optional lanes', async () => {
    serve({
      ...view,
      capture: null,
      states: [],
      doctor: {
        ok: false,
        checks: [{ name: 'archive', ok: false, code: null }],
      },
    })
    await renderAt('/clips?range=7d')
    const doctor = await screen.findByRole('region', { name: 'Doctor' })
    expect(doctor).toHaveTextContent('archive')
    expect(screen.getByText('Nothing is waiting.')).toBeInTheDocument()
    expect(screen.queryByText('capture API')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '7 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
  it('reports an initial read failure', async () => {
    serve({ error: 'unavailable' }, 503)
    await renderAt('/clips')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not read clips.',
    )
  })
  it('greys cached data with its age after a failed refetch', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(NOW)
    serve()
    await renderAt('/clips')
    await screen.findByRole('region', { name: 'Funnel' })
    clock.mockReturnValue(NOW + 120_000)
    serve({ error: 'unavailable' }, 503)
    act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Last good data is 2m old.',
    )
    expect(screen.getByRole('region', { name: 'Clips data' })).toHaveClass(
      'grayscale',
    )
    expect(screen.getByRole('region', { name: 'Funnel' })).toHaveTextContent(
      'capture API',
    )
    focusManager.setFocused(undefined)
  })
  it('shows unknown waiting ages and excludes terminal states', async () => {
    serve({
      ...view,
      states: [
        { state: 'pending', count: 2, oldestAt: null },
        { state: 'archived', count: 3, oldestAt: NOW - 1000 },
        { state: 'reconciled', count: 4, oldestAt: NOW - 1000 },
      ],
    })
    await renderAt('/clips')
    const oldest = await screen.findByRole('region', { name: 'Oldest waiting' })
    expect(oldest).toHaveTextContent('pending')
    expect(oldest).toHaveTextContent('Age unknown')
    expect(oldest).not.toHaveTextContent('Nothing is waiting.')
    expect(oldest).not.toHaveTextContent('archived')
    expect(oldest).not.toHaveTextContent('reconciled')
  })
  it('reports a failed doctor summary without failing check details', async () => {
    serve({ ...view, doctor: { ok: false, checks: [] } })
    await renderAt('/clips')
    const doctor = await screen.findByRole('region', { name: 'Doctor' })
    expect(doctor).toHaveTextContent(
      'Doctor reports a failure; check details are unavailable.',
    )
    expect(doctor).not.toHaveTextContent('All checks pass.')
  })
})
