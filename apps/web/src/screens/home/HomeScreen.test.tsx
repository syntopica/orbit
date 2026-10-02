import { act, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { FakeEventSource } from '../../test/FakeEventSource'
import { mediaMatches } from '../../test/mediaMatches'
import { renderAt } from '../../test/renderAt'
import { snapshotOf } from '../../test/snapshotOf'

const feed = () => {
  const source = FakeEventSource.instances.at(-1) as FakeEventSource
  act(() => {
    source.onopen?.()
    source.emit({
      type: 'snapshot',
      id: 1,
      snapshot: snapshotOf('worker', 'warn', {
        metrics: [
          { key: 'worker.live', value: 2, at: '2026-10-02T10:00:00.000Z' },
        ],
        pending: [
          {
            key: 'worker.failed_jobs',
            count: 64,
            oldestAt: '2026-10-02T09:00:00.000Z',
          },
        ],
      }),
    })
    source.emit({
      type: 'event',
      id: 1,
      event: {
        at: '2026-10-02T10:00:00.000Z',
        component: 'worker',
        kind: 'worker.job_failed',
        severity: 'error',
        refs: { job: 'j1' },
      },
    })
    source.emit({ type: 'sync', id: 1 })
  })
}

describe('HomeScreen', () => {
  it('draws the orbit map with health, pending and events', async () => {
    const { container } = await renderAt('/')
    feed()
    expect(
      screen.getByRole('img', { name: 'Worker: Degraded, 2 running' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('listitem', { name: /Worker failed jobs/ }),
    ).toHaveTextContent('64')
    expect(screen.getByText('job failed')).toBeInTheDocument()
    expect(screen.getAllByTestId('pulse').length).toBeGreaterThan(0)
    expect(
      within(screen.getByRole('main')).queryByRole('status', {
        name: 'Connection',
      }),
    ).toBeNull()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toHaveLength(0)
  })
  it('shows nothing before the opening set ends', async () => {
    await renderAt('/')
    expect(
      screen.getByText(/Waiting for the first readings/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Worker/ })).toBeNull()
  })
  it('lists components on a phone', async () => {
    mediaMatches.add('(max-width: 767px)')
    await renderAt('/')
    feed()
    expect(screen.queryByRole('img', { name: /Worker/ })).toBeNull()
    expect(
      screen.getByRole('listitem', { name: /^Worker: Degraded/ }),
    ).toHaveTextContent('2 running')
    expect(
      within(screen.getByRole('main')).getByRole('status', {
        name: 'Connection',
      }),
    ).toBeInTheDocument()
  })
  it('does not pulse when the user asks for reduced motion', async () => {
    mediaMatches.add('(prefers-reduced-motion: reduce)')
    await renderAt('/')
    feed()
    expect(screen.queryByTestId('pulse')).toBeNull()
  })
})
