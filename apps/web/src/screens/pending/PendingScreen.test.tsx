import type { PendingView } from '@orbit/contract'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'

const TODO_SOURCE = 'todo:tasks'
const BLOCKED_TITLE = 'Blocked placeholder'

const view: PendingView = {
  now: 100,
  sources: [
    { id: TODO_SOURCE, kind: 'todo', name: 'Tasks', status: 'ok', count: 2 },
    { id: 'brain', kind: 'brain', name: 'Brain lint', status: 'ok', count: 1 },
    {
      id: 'worker',
      kind: 'worker',
      name: 'Worker failures',
      status: 'unavailable',
      count: 0,
    },
    {
      id: 'clips',
      kind: 'clips',
      name: 'Clips waiting',
      status: 'ok',
      count: 1,
    },
  ],
  items: [
    {
      id: 'todo:tasks:2',
      source: TODO_SOURCE,
      kind: 'todo',
      state: 'blocked',
      title: BLOCKED_TITLE,
      detail: 'Private placeholder detail',
      section: 'Queue',
      ref: { file: '/example/TODO.md', line: 2 },
      ageMs: null,
    },
    {
      id: 'todo:tasks:3',
      source: TODO_SOURCE,
      kind: 'todo',
      state: 'partial',
      title: 'Partial placeholder',
      detail: '',
      section: 'Queue',
      ref: { file: '/example/TODO.md', line: 3 },
      ageMs: null,
    },
    {
      id: 'brain:notes/a:broken',
      source: 'brain',
      kind: 'brain',
      state: 'issue',
      title: 'broken',
      detail: '',
      section: null,
      ref: 'notes/a',
      ageMs: null,
    },
    {
      id: 'clips:pending',
      source: 'clips',
      kind: 'clips',
      state: 'waiting',
      title: 'Pending clips (2)',
      detail: '',
      section: null,
      ref: '/clips',
      ageMs: null,
    },
  ],
}

describe('PendingScreen', () => {
  it('shows source issues, filters in the URL and expands plain text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve(Response.json(view))),
    )
    const { container, router, client, unmount } = await renderAt('/pending')
    expect(await screen.findByText(BLOCKED_TITLE)).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Source issues' }),
    ).toHaveTextContent('Worker failures: unavailable')
    fireEvent.click(screen.getByText(BLOCKED_TITLE))
    expect(screen.getByText('Private placeholder detail').tagName).toBe('PRE')
    expect(
      within(screen.getByRole('region', { name: 'Tasks' })).getByText('Queue'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'blocked 1' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ state: 'blocked' })
    })
    expect(screen.queryByText('Partial placeholder')).not.toBeInTheDocument()
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search title and detail' }),
      { target: { value: 'private' } },
    )
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: 'private' })
    })
    expect(screen.getByText(BLOCKED_TITLE)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tasks 2' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        source: TODO_SOURCE,
      })
    })
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toEqual([])
    unmount()
    expect(client.getQueryData(['pending-board'])).toBeUndefined()
  })

  it('shows a fixed read error and refresh control', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve(
          Response.json({ error: 'unavailable' }, { status: 503 }),
        ),
      ),
    )
    await renderAt('/pending')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not read pending items.',
    )
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
  })

  it('shows an empty board', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve(Response.json({ now: 1, sources: [], items: [] })),
      ),
    )
    await renderAt('/pending')
    expect(await screen.findByText('No matching items.')).toBeInTheDocument()
  })
})
