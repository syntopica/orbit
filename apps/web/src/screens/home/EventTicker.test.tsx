import type { OrbitEvent } from '@orbit/contract'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { eventMessages } from '../../test/eventMessages'
import { EventTicker } from './EventTicker'

const launchd = (
  kind: OrbitEvent['kind'],
  at: string,
  refs: OrbitEvent['refs'] = { label: 'com.example.job' },
): OrbitEvent => ({ at, component: 'launchd', kind, severity: 'info', refs })

describe('EventTicker', () => {
  it('names what each event happened to', () => {
    render(
      <EventTicker
        events={eventMessages([
          launchd('launchd.started', '2026-10-02T10:00:00.000Z'),
          launchd('launchd.exit_changed', '2026-10-02T09:00:00.000Z', {
            label: 'com.example.other',
            exit: 78,
          }),
        ])}
      />,
    )
    const rows = screen.getAllByRole('listitem')
    expect(rows[0]).toHaveTextContent('job started')
    expect(rows[0]).toHaveTextContent('com.example.job')
    expect(rows[1]).toHaveTextContent('com.example.other · exit 78')
  })
  it('collapses a start and stop of one label into a ran row', () => {
    render(
      <EventTicker
        events={eventMessages([
          launchd('launchd.stopped', '2026-10-02T10:01:00.000Z'),
          launchd('launchd.started', '2026-10-02T10:00:00.000Z'),
          launchd('component.recovered', '2026-10-02T09:00:00.000Z', {}),
        ])}
      />,
    )
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('ran 1m')
    expect(rows[0]).toHaveTextContent('com.example.job')
    expect(rows[0]).not.toHaveTextContent('job started')
    expect(rows[1]).toHaveTextContent('recovered')
  })
  it('renders identical events as separate rows', () => {
    const same = launchd('launchd.started', '2026-10-02T10:00:00.000Z')
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(<EventTicker events={eventMessages([same, same])} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })
})
