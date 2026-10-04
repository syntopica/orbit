import type { PendingView } from '@orbit/contract'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderAt } from '../../test/renderAt'

const item = (line: number, title: string): PendingView['items'][number] => ({
  id: `todo:big:${String(line)}`,
  source: 'todo:big',
  kind: 'todo',
  state: line === 1 ? 'blocked' : 'open',
  title,
  detail: '',
  section: 'Queue',
  ref: { file: '/example/TODO.md', line },
  ageMs: null,
})

const view: PendingView = {
  now: 1,
  sources: [
    { id: 'todo:big', kind: 'todo', name: 'Big', status: 'ok', count: 12 },
    { id: 'todo:small', kind: 'todo', name: 'Small', status: 'ok', count: 1 },
  ],
  items: [
    item(1, 'Run `tool --flag` on the **example** backlog'),
    ...Array.from({ length: 11 }, (_, i) => item(i + 2, `Item ${String(i)}`)),
    {
      ...item(99, 'Small needle item'),
      id: 'todo:small:1',
      source: 'todo:small',
    },
  ],
}

const group = (name: string) =>
  within(screen.getByRole('region', { name })).getAllByRole('group')[0]

describe('Pending groups', () => {
  it('collapses large groups, expands all, and opens groups a search matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve(Response.json(view))),
    )
    await renderAt('/pending')
    expect(await screen.findByText('Small needle item')).toBeInTheDocument()
    expect(group('Big')).not.toHaveAttribute('open')
    expect(group('Small')).toHaveAttribute('open')
    expect(
      within(screen.getByRole('region', { name: 'Big' })).getByText(
        '12 · 1 blocked · 11 open',
      ),
    ).toBeInTheDocument()
    const code = screen.getByText('tool --flag')
    expect(code.tagName).toBe('CODE')
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }))
    expect(group('Big')).toHaveAttribute('open')
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }))
    expect(group('Small')).not.toHaveAttribute('open')
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search title and detail' }),
      { target: { value: 'item' } },
    )
    await waitFor(() => {
      expect(group('Big')).toHaveAttribute('open')
    })
    expect(group('Small')).toHaveAttribute('open')
  })
})
