import type { OrbitEvent } from '@orbit/contract'
import { act, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { mediaMatches } from '../../test/mediaMatches'
import { openStream } from '../../test/openStream'
import { renderAt } from '../../test/renderAt'
import { snapshotOf } from '../../test/snapshotOf'

const AT = '2026-10-02T10:00:00.000Z'
const eventAt = (second: number): OrbitEvent => ({
  at: `2026-10-02T10:00:${String(second).padStart(2, '0')}.000Z`,
  component: 'worker',
  kind: 'worker.job_failed',
  severity: 'error',
  refs: {},
})

describe('HomeScreen states', () => {
  it('shows nothing until the opening set ends with sync', async () => {
    await renderAt('/')
    const source = openStream()
    act(() => {
      source.emit({
        type: 'snapshot',
        id: 1,
        snapshot: snapshotOf('worker', 'ok', {
          pending: [{ key: 'worker.failed_jobs', count: 3, oldestAt: AT }],
        }),
      })
      source.emit({ type: 'event', id: 2, event: eventAt(1) })
    })
    expect(
      screen.getByText(/Waiting for the first readings/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Worker/ })).toBeNull()
    expect(screen.getByText('Nothing pending.')).toBeInTheDocument()
    expect(screen.getByText('No events yet.')).toBeInTheDocument()
  })
  it('stops waiting at sync even with no components', async () => {
    await renderAt('/')
    const source = openStream()
    act(() => {
      source.emit({ type: 'sync', id: 1 })
    })
    expect(screen.queryByText(/Waiting for the first readings/)).toBeNull()
  })
  it('caps the ticker at twenty events', async () => {
    await renderAt('/')
    const source = openStream()
    act(() => {
      for (let i = 0; i < 25; i += 1)
        source.emit({ type: 'event', id: i + 1, event: eventAt(i) })
      source.emit({ type: 'sync', id: 26 })
    })
    expect(screen.getAllByText('job failed')).toHaveLength(20)
  })
  it('pulses again on a fresh reading', async () => {
    await renderAt('/')
    const source = openStream()
    const reading = (id: number, observedAt: string) => {
      act(() => {
        source.emit({
          type: 'snapshot',
          id,
          snapshot: snapshotOf('worker', 'ok', { observedAt }),
        })
        source.emit({ type: 'sync', id: id + 1 })
      })
    }
    reading(1, AT)
    const first = screen.getByTestId('pulse')
    reading(3, '2026-10-02T10:00:30.000Z')
    expect(screen.getByTestId('pulse')).not.toBe(first)
  })
  it('dims a down satellite on the map and shows the reading age', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-02T10:05:00.000Z'))
    await renderAt('/')
    const source = openStream()
    const { lastGood: _ignored, ...core } = snapshotOf('worker', 'ok', {
      metrics: [{ key: 'worker.live', value: 2, at: AT }],
    })
    act(() => {
      source.emit({
        type: 'snapshot',
        id: 1,
        snapshot: snapshotOf('worker', 'down', { lastGood: core }),
      })
      source.emit({
        type: 'snapshot',
        id: 2,
        snapshot: snapshotOf('launchd', 'ok'),
      })
      source.emit({ type: 'sync', id: 3 })
    })
    const down = screen.getByRole('img', { name: /^Worker: Down, 2 running/ })
    expect(down).toHaveAttribute('opacity', '0.5')
    expect(down).toHaveTextContent('last reading 5m')
    expect(within(down).queryByTestId('pulse')).toBeNull()
    const fresh = screen.getByRole('img', { name: /^Scheduled jobs: Healthy/ })
    expect(fresh).toHaveAttribute('opacity', '1')
    expect(fresh).not.toHaveTextContent('last reading')
    vi.useRealTimers()
  })
  it('keeps the last known figures of a down component, greyed', async () => {
    mediaMatches.add('(max-width: 767px)')
    await renderAt('/')
    const source = openStream()
    const { lastGood: _ignored, ...core } = snapshotOf('worker', 'ok', {
      metrics: [{ key: 'worker.live', value: 2, at: AT }],
      pending: [{ key: 'worker.failed_jobs', count: 7, oldestAt: AT }],
    })
    act(() => {
      source.emit({
        type: 'snapshot',
        id: 1,
        snapshot: snapshotOf('worker', 'down', { lastGood: core }),
      })
      source.emit({
        type: 'snapshot',
        id: 2,
        snapshot: snapshotOf('launchd', 'ok', {
          metrics: [{ key: 'launchd.failing', value: 1, at: AT }],
        }),
      })
      source.emit({ type: 'sync', id: 3 })
    })
    const row = screen.getByRole('listitem', { name: /^Worker: Down/ })
    expect(row).toHaveAttribute('data-greyed', 'true')
    expect(row).toHaveTextContent('2 running')
    expect(
      screen.getByRole('listitem', { name: /Scheduled jobs: Healthy/ }),
    ).toHaveTextContent('1 failing')
    expect(screen.getByText('last known')).toBeInTheDocument()
  })
})
