import type { AtriumView, MetricHistory } from '@orbit/contract'
import { focusManager } from '@tanstack/react-query'
import { act, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'

const NOW = 1_790_000_000_000
const view: AtriumView = {
  now: NOW,
  writtenAt: NOW - 60_000,
  refreshIntervalMs: 3_600_000,
  records: {
    total: 40,
    bySource: [
      { source: 'source-a', count: 30 },
      { source: 'source-b', count: 10 },
    ],
  },
  archiveAt: NOW - 600_000,
  refreshAt: NOW - 3 * 3_600_000,
  contentAt: null,
  populations: [
    { model: 'model-a', intended: 5, indexed: 3 },
    { model: 'model-b', intended: 2, indexed: 2 },
  ],
  synthesis: {
    finishedAt: NOW - 900_000,
    durationMs: 300_000,
    producer: 'task',
    conversations: 4,
    synthesized: 3,
    skipped: 0,
    failed: 0,
    deferred: 1,
  },
}
const history: MetricHistory = {
  now: NOW,
  from: NOW - 86_400_000,
  runs: [],
  series: [],
}
const serve = (atrium: unknown, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string) =>
      Promise.resolve(
        path.startsWith('/api/atrium')
          ? Response.json(atrium, { status })
          : Response.json(history),
      ),
    ),
  )
}

describe('AtriumScreen', () => {
  it('shows sources, freshness, the last pass and unindexed populations', async () => {
    serve(view)
    const { container } = await renderAt('/atrium')
    const sources = await screen.findByRole('region', {
      name: 'Records per source',
    })
    expect(sources).toHaveTextContent('source-a')
    expect(sources).toHaveTextContent('30')
    const freshness = screen.getByRole('region', { name: 'Freshness' })
    expect(within(freshness).getAllByText('Fresh')).toHaveLength(1)
    expect(within(freshness).getByText('Behind')).toBeInTheDocument()
    expect(within(freshness).getByText('Not measured')).toBeInTheDocument()
    const missing = screen.getByRole('region', { name: 'Not in the index' })
    expect(missing).toHaveTextContent('model-a')
    expect(missing).not.toHaveTextContent('model-b')
    expect(screen.getByRole('region', { name: 'Synthesis' })).toHaveTextContent(
      '3 synthesized',
    )
    expect(
      await screen.findByRole('slider', {
        name: 'Synthesized and deferred per bucket',
      }),
    ).toBeInTheDocument()
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
  it('reports an absent pass and fully indexed populations', async () => {
    serve({ ...view, synthesis: null, populations: [] })
    await renderAt('/atrium?range=7d')
    expect(
      await screen.findByText('No synthesis pass has been published yet.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Every population is fully indexed.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '7 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
  it('keeps the last good view greyed with its age after a failed refetch', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(NOW)
    serve(view)
    await renderAt('/atrium')
    await screen.findByRole('region', { name: 'Records per source' })
    clock.mockReturnValue(NOW + 120_000)
    serve({ error: 'unavailable' }, 503)
    act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Last good data is 2m old.',
    )
    const sources = screen.getByRole('region', { name: 'Records per source' })
    expect(sources).toHaveTextContent('source-a')
    expect(screen.getByRole('region', { name: 'Atrium data' })).toHaveClass(
      'grayscale',
    )
    focusManager.setFocused(undefined)
  })
  it('says so when atrium cannot be read', async () => {
    serve({ error: 'unavailable' }, 503)
    await renderAt('/atrium')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not read atrium.',
    )
  })
})
