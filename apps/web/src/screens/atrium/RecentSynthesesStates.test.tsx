import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ATRIUM_SYNTHESIS_FIXTURE } from '../../test/atriumSynthesisFixture'
import { renderAt } from '../../test/renderAt'
import { serveAtriumSyntheses as serve } from '../../test/serveAtriumSyntheses'

const { NOW, KEY, passes, syntheses } = ATRIUM_SYNTHESIS_FIXTURE

describe('Atrium synthesis activity states', () => {
  it('says when there is no pass log, no record, or the registry is unreadable', async () => {
    serve({
      '/api/atrium/passes': {
        ...passes,
        lastPass: null,
        passes: [],
        progress: null,
        unsuccessfulStreak: 0,
      },
      '/api/atrium/syntheses': { ...syntheses, rows: [] },
    })
    await renderAt('/atrium')
    expect(
      await screen.findByText('No pass has been logged yet.'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('No synthesis records yet.'),
    ).toBeInTheDocument()
  })
  it('says so when the pass log and the registry cannot be read', async () => {
    serve({ '/api/atrium/passes': 503, '/api/atrium/syntheses': 503 })
    await renderAt('/atrium')
    expect(
      await screen.findByText('Could not read recent syntheses.'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Could not read the pass log.'),
    ).toBeInTheDocument()
  })
  it('shows a session record with its window and duration, and closes it', async () => {
    const [first] = syntheses.rows
    if (first === undefined) throw new Error('fixture')
    serve({
      '/api/atrium/syntheses': {
        ...syntheses,
        rows: [
          {
            ...first,
            kind: 'session',
            source: null,
            modelResolved: null,
            durationMs: 90_000,
            sessionSince: NOW - 3_600_000,
            sessionUntil: NOW,
          },
        ],
      },
      [`/api/atrium/syntheses/${KEY}/content`]: 503,
    })
    await renderAt('/atrium')
    const table = await screen.findByRole('region', {
      name: 'Recent syntheses table',
    })
    expect(table).toHaveTextContent('— · session')
    expect(table).toHaveTextContent('local-model-a')
    expect(table).toHaveTextContent('1m')
    fireEvent.click(within(table).getByRole('button', { name: 'Details' }))
    expect(table).toHaveTextContent('· session ')
    fireEvent.click(
      within(table).getByRole('button', { name: 'Reveal title and summary' }),
    )
    expect(await within(table).findByRole('alert')).toHaveTextContent(
      'Could not reveal content.',
    )
    fireEvent.click(within(table).getByRole('button', { name: 'Hide details' }))
    expect(
      within(table).queryByRole('button', { name: 'Hide content' }),
    ).not.toBeInTheDocument()
  })
})
