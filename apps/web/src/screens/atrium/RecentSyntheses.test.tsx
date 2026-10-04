import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { ATRIUM_SYNTHESIS_FIXTURE } from '../../test/atriumSynthesisFixture'
import { renderAt } from '../../test/renderAt'
import { serveAtriumSyntheses as serve } from '../../test/serveAtriumSyntheses'

const { KEY, TITLE } = ATRIUM_SYNTHESIS_FIXTURE

describe('Atrium synthesis activity', () => {
  it('surfaces a timed-out last pass, the streak and the running pass', async () => {
    serve()
    await renderAt('/atrium')
    const section = await screen.findByRole('region', { name: 'Synthesis' })
    expect(
      await within(section).findByText(/exit 124 \(time box\)/),
    ).toHaveTextContent('Last pass: local · model-a:7b · exit 124 (time box)')
    expect(section).toHaveTextContent('15 in a row ended without succeeding')
    expect(section).toHaveTextContent(
      'running 10m · 1 of 52,427 conversations · 0 synthesized · 4 failed',
    )
  })
  it('lists recent syntheses and tokens per day without their text', async () => {
    serve()
    const { container } = await renderAt('/atrium')
    const recent = await screen.findByRole('region', {
      name: 'Recent syntheses',
    })
    const table = await within(recent).findByRole('region', {
      name: 'Recent syntheses table',
    })
    expect(table).toHaveTextContent('model-a:7b')
    expect(table).toHaveTextContent('1449 in · 369 out')
    expect(table).toHaveTextContent('not recorded')
    expect(table).toHaveTextContent('4 facts · 1 open end')
    expect(recent).toHaveTextContent('76,095 records in the registry')
    expect(recent).toHaveTextContent('6,697,381 in · 2,702,577 out, 2026-09-21')
    expect(container).not.toHaveTextContent(TITLE)
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
  it('reveals one record with the reveal header, and hides it again', async () => {
    const fetch = serve()
    await renderAt('/atrium')
    const table = await screen.findByRole('region', {
      name: 'Recent syntheses table',
    })
    fireEvent.click(within(table).getByRole('button', { name: 'Details' }))
    expect(table).toHaveTextContent('conversation cccccccc…')
    expect(table).toHaveTextContent('6 events in 1 chunks')
    expect(table).not.toHaveTextContent(TITLE)
    fireEvent.click(
      within(table).getByRole('button', { name: 'Reveal title and summary' }),
    )
    expect(await within(table).findByText(TITLE)).toBeInTheDocument()
    const call = fetch.mock.calls.find(
      ([path]) => path === `/api/atrium/syntheses/${KEY}/content`,
    ) as unknown as [string, RequestInit] | undefined
    expect(new Headers(call?.[1].headers).get('X-Orbit-Reveal')).toBe(
      'personal',
    )
    fireEvent.click(within(table).getByRole('button', { name: 'Hide content' }))
    await waitFor(() => {
      expect(table).not.toHaveTextContent(TITLE)
    })
  })
})
