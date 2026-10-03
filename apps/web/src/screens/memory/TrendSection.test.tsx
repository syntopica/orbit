import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import type { TrendModel } from '../../types/TrendModel'
import { TrendSection } from './TrendSection'

const model: TrendModel = {
  starts: [1_790_000_000_000, 1_790_001_800_000],
  bucketMs: 1_800_000,
  lines: [
    {
      key: 'clips.pending',
      label: 'pending',
      values: [4, null],
      stroke: 'stroke-series-1',
      dot: 'fill-series-1',
      swatch: 'bg-series-1',
    },
  ],
}
const renderSection = (
  overrides: Partial<{
    failed: boolean
    stale: boolean
    loading: boolean
  }> = {},
) => {
  const setRange = vi.fn()
  const view = render(
    <TrendSection
      title="Backlog"
      chartLabel="Pending per bucket"
      trend={{
        model: overrides.loading ? null : model,
        stale: overrides.stale ?? false,
        failed: overrides.failed ?? false,
      }}
      range="24h"
      setRange={setRange}
    />,
  )
  return { ...view, setRange }
}

describe('TrendSection', () => {
  it('reads each bucket by keyboard, gaps included, and lists them in a table', async () => {
    const { container, setRange } = renderSection()
    const region = screen.getByRole('region', { name: 'Backlog' })
    const chart = within(region).getByRole('slider', {
      name: 'Pending per bucket',
    })
    expect(chart).toHaveAttribute(
      'aria-valuetext',
      expect.stringContaining('no data pending'),
    )
    fireEvent.focus(chart)
    fireEvent.keyDown(chart, { key: 'Home' })
    expect(chart).toHaveAttribute(
      'aria-valuetext',
      expect.stringContaining('4 pending'),
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent('4 pending')
    fireEvent.keyDown(chart, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(within(region).getAllByRole('row')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: '7 days' }))
    expect(setRange).toHaveBeenCalledWith('7d')
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
  it('offers one tab stop and reads gaps on pointer and keyboard input', () => {
    renderSection({ stale: true })
    const chart = screen.getByRole('slider', { name: 'Pending per bucket' })
    expect(screen.getAllByRole('slider')).toHaveLength(1)
    expect(chart).toHaveAttribute('width', '100%')
    fireEvent.pointerDown(
      within(chart).getAllByTestId('hit-band')[0] as Element,
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent('4 pending')
    fireEvent.keyDown(chart, { key: 'End' })
    expect(screen.getByRole('tooltip')).toHaveTextContent('no data pending')
    fireEvent.keyDown(chart, { key: 'ArrowLeft' })
    expect(chart).toHaveAttribute('aria-valuenow', '0')
    fireEvent.blur(chart)
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(screen.getByText('Show table')).toBeInTheDocument()
  })
  it('shows a loading placeholder before the first read', () => {
    renderSection({ loading: true })
    expect(screen.getByText('loading')).toBeInTheDocument()
    expect(screen.queryByRole('slider')).toBeNull()
  })
  it('says the history is unavailable when the first read fails', () => {
    renderSection({ failed: true })
    expect(screen.getByRole('alert')).toHaveTextContent('History unavailable.')
  })
})
