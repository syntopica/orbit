import type { OrbitEvent } from '@orbit/contract'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { eventMessages } from '../../test/eventMessages'
import { EventTicker } from './EventTicker'

const JOB = 'com.example.job'
const START = '2026-10-02T10:00:00.000Z'

const launchd = (
  kind: OrbitEvent['kind'],
  at: string,
  refs: OrbitEvent['refs'] = { label: JOB },
): OrbitEvent => ({ at, component: 'launchd', kind, severity: 'info', refs })

describe('EventTicker', () => {
  it('names what each event happened to', () => {
    render(
      <EventTicker
        events={eventMessages([
          launchd('launchd.started', START),
          launchd('launchd.exit_changed', '2026-10-02T09:00:00.000Z', {
            label: 'com.example.other',
            exit: 78,
          }),
        ])}
      />,
    )
    const rows = screen.getAllByRole('listitem')
    expect(rows[0]).toHaveTextContent('job started')
    expect(rows[0]).toHaveTextContent(JOB)
    expect(rows[1]).toHaveTextContent('com.example.other · exit 78')
  })
  it('collapses a start and stop of one label into a ran row', () => {
    render(
      <EventTicker
        events={eventMessages([
          launchd('launchd.stopped', '2026-10-02T10:01:00.000Z'),
          launchd('launchd.started', START),
          launchd('component.recovered', '2026-10-02T09:00:00.000Z', {}),
        ])}
      />,
    )
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('ran 1m')
    expect(rows[0]).toHaveTextContent(JOB)
    expect(rows[0]).not.toHaveTextContent('job started')
    expect(rows[1]).toHaveTextContent('recovered')
  })
  it('renders identical events as separate rows', () => {
    const same = launchd('launchd.started', START)
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(<EventTicker events={eventMessages([same, same])} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })
  it('renders action lifecycle without leaking output', () => {
    render(
      <EventTicker
        events={eventMessages([
          launchd('action.succeeded', '2026-10-02T10:00:12.000Z', {
            id: 'run-1',
            kind: 'run',
            target: JOB,
            exitCode: 0,
            durationMs: 12000,
          }),
          launchd('action.started', START, {
            id: 'run-1',
            kind: 'run',
            target: JOB,
            exitCode: -1,
            durationMs: 0,
          }),
        ])}
      />,
    )
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
      'com.example.job run succeeded in 12s',
    )
    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent(
      'com.example.job run started',
    )
  })
})
