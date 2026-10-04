import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { mediaMatches } from '../../test/mediaMatches'
import { renderAt } from '../../test/renderAt'
import {
  activityRow,
  HOUR,
  LAST_BUCKET,
  workerActivity,
} from '../../test/workerActivity'
import { workerQueue, workerView } from '../../test/workerView'

const WORKER = '/worker'
const VALUE_NOW = 'aria-valuenow'
const view = workerView({ queues: [workerQueue({ queued: 1 })] })
const activity = workerActivity([
  activityRow({ attempts: 5, wallMs: 50_000 }),
  activityRow({ provider: 'openrouter', attempts: 2 }),
  activityRow({ outcome: 'failed', error: 'timeout', attempts: 3 }),
  activityRow({ sampling: true, attempts: 4 }),
  activityRow({ bucket: LAST_BUCKET - HOUR, attempts: 1 }),
])
const serve = (activityBody: unknown = activity, status = 200) => {
  const fetcher = vi.fn(async (input: RequestInfo | URL) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url
    return Promise.resolve(
      url.startsWith('/api/worker/activity')
        ? Response.json(activityBody, { status })
        : Response.json(view),
    )
  })
  vi.stubGlobal('fetch', fetcher)
  return fetcher
}
const chart = async () =>
  screen.findByRole('slider', {
    name: 'Production attempts per bucket by provider',
  })

describe('worker activity', () => {
  it('shows the stacked chart with a legend and a hover tooltip', async () => {
    serve()
    const { container } = await renderAt(WORKER)
    const slider = await chart()
    const section = screen.getByRole('region', { name: 'Activity' })
    expect(
      within(section)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['agy', 'openrouter', 'failed'])
    const bands = within(slider).getAllByTestId('hit-band')
    expect(bands).toHaveLength(25)
    fireEvent.pointerEnter(bands[24] as Element)
    const tip = await screen.findByRole('tooltip')
    expect(tip).toHaveTextContent('5agy')
    expect(tip).toHaveTextContent('3failed')
    expect(tip).toHaveTextContent('timeout 3')
    expect(tip).toHaveTextContent('4 sampling')
    expect(tip).toHaveTextContent('mean 5s')
    fireEvent.pointerLeave(slider)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toHaveLength(0)
  })
  it('walks the buckets with the keyboard and says each one', async () => {
    serve()
    await renderAt(WORKER)
    const slider = await chart()
    fireEvent.focus(slider)
    expect(slider).toHaveAttribute(VALUE_NOW, '24')
    expect(slider.getAttribute('aria-valuetext')).toMatch(
      /10 attempts, 3 failed, 4 sampling$/,
    )
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(slider).toHaveAttribute(VALUE_NOW, '23')
    expect(await screen.findByRole('tooltip')).toHaveTextContent('1agy')
    fireEvent.keyDown(slider, { key: 'Home' })
    expect(slider).toHaveAttribute(VALUE_NOW, '0')
    fireEvent.keyDown(slider, { key: 'End' })
    expect(slider).toHaveAttribute(VALUE_NOW, '24')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider).toHaveAttribute(VALUE_NOW, '24')
    fireEvent.keyDown(slider, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    fireEvent.keyDown(slider, { key: 'a' })
    fireEvent.blur(slider)
  })
  it('expands a queue row into its activity detail', async () => {
    serve()
    await renderAt(WORKER)
    await chart()
    const toggle = screen.getByRole('button', { name: /queue\.a/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const detail = screen.getByRole('group', { name: 'queue.a details' })
    expect(detail).toHaveTextContent('succeeded 8 · failed 3')
    expect(detail).toHaveTextContent('agy 9 · openrouter 2')
    expect(detail).toHaveTextContent('40 in · 20 out')
    expect(detail).toHaveTextContent('timeout 3')
    const spark = screen.getByRole('slider', {
      name: 'queue.a: succeeded attempts per bucket',
    })
    fireEvent.pointerDown(
      within(spark).getAllByTestId('hit-band')[23] as Element,
    )
    expect(await screen.findByRole('tooltip')).toHaveTextContent('1 succeeded')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
  it('shows OpenRouter attempts today and the failure chart', async () => {
    serve()
    await renderAt(WORKER)
    await chart()
    expect(
      screen.getByRole('group', { name: 'OpenRouter attempts today (UTC)' })
        .textContent,
    ).toBe('OpenRouter attempts today (UTC)2')
    const failures = screen.getByRole('region', { name: 'Recent failures' })
    expect(
      within(failures)
        .getByRole('slider', {
          name: 'Production failures per bucket by error code',
        })
        .getAttribute('aria-valuetext'),
    ).toMatch(/3 failures, timeout 3$/)
  })
  it('switches the range in the URL and refetches', async () => {
    const fetcher = serve()
    const { router } = await renderAt(WORKER)
    await chart()
    fireEvent.click(
      within(screen.getByRole('region', { name: 'Activity' })).getByRole(
        'button',
        { name: '7 days' },
      ),
    )
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ range: '7d' })
    })
    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(
        '/api/worker/activity?range=7d',
        expect.anything(),
      )
    })
  })
  it('says when the activity cannot be read, and works on a phone', async () => {
    mediaMatches.add('(max-width: 767px)')
    serve({ error: 'unavailable' }, 503)
    await renderAt(WORKER)
    expect(
      await screen.findByText('Could not read the worker activity.'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /queue\.a/ }))
    expect(
      screen.getByText('No production attempts in this range.'),
    ).toBeInTheDocument()
  })
})
