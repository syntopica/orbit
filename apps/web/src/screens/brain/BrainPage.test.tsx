import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { BRAIN_GRAPH } from '../../test/brainGraphFixture'
import { renderAt } from '../../test/renderAt'
import { stubBrainFetch } from '../../test/stubBrainFetch'

vi.mock(
  '@react-sigma/core',
  async () => (await import('../../test/fakeReactSigma')).fakeReactSigma,
)
vi.mock(
  '../../layout/createLayoutWorker',
  async () =>
    (await import('../../test/fakeLayoutWorkerModule')).fakeLayoutWorkerModule,
)
vi.mock('../../graph/hasWebGl', () => ({ hasWebGl: () => true }))

const SELECTED_ROUTE = '/brain?page=notes%2Fa'
const PAGE = {
  id: 'notes/a',
  title: 'A page',
  type: 'topic',
  updated: '2026-10-01',
  summary: 'What A is about.',
  sources: ['https://example.com/source'],
  body: '# Heading\n\nSee [[notes/b]], [[bad id|plain]] and [site](https://example.com).\n\n![a diagram](https://example.com/a.png)\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert%281%29)',
  truncated: true,
  outbound: [
    { target: 'notes/b', exists: true },
    { target: 'notes/gone', exists: false },
  ],
  inbound: ['notes/c'],
}
const RELATED = {
  now: 0,
  total: 2,
  pairs: [
    { left: 'notes/b', right: 'notes/c', score: 3 },
    { left: 'notes/c', right: 'notes/a', score: 2 },
  ],
}

beforeEach(() => {
  stubBrainFetch({
    '/api/brain/graph': BRAIN_GRAPH,
    '/api/brain/page?id=notes%2Fa': PAGE,
    '/api/brain/page?id=notes%2Fz': 404,
    '/api/brain/related': RELATED,
  })
})

describe('page view', () => {
  it('renders the page without raw HTML or remote images', async () => {
    const { container, router } = await renderAt(SELECTED_ROUTE)
    const panel = await screen.findByRole('region', { name: 'Page' })
    expect(
      await within(panel).findByRole('heading', { name: 'A page' }),
    ).toBeInTheDocument()
    expect(within(panel).getByText('What A is about.')).toBeInTheDocument()
    expect(within(panel).getByText(/longer than 1 MiB/)).toBeInTheDocument()
    const body = within(panel).getByRole('article')
    expect(
      within(body).getByRole('heading', { level: 3, name: 'Heading' }),
    ).toBeInTheDocument()
    expect(within(body).getByText(/plain/)).toBeInTheDocument()
    expect(within(body).getByRole('link', { name: 'site' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
    expect(within(body).getByText('a diagram')).toBeInTheDocument()
    expect(within(body).queryByRole('img')).toBeNull()
    expect(
      within(body).getByText('<script>alert(1)</script>'),
    ).toBeInTheDocument()
    expect(within(body).getByText('unsafe')).toHaveAttribute('href', '')
    expect(within(panel).getByText('(missing)')).toBeInTheDocument()
    fireEvent.click(within(body).getByRole('link', { name: 'notes/b' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/b' })
    })
    expect(await axe(container)).toEqual(
      expect.objectContaining({ violations: [] }),
    )
  })
  it('loads a selected page even when the graph fails', async () => {
    stubBrainFetch({ '/api/brain/graph': 503, '/api/brain/page': PAGE })
    await renderAt(SELECTED_ROUTE)
    expect(
      await screen.findByRole('heading', { name: 'A page' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/The brain graph is unavailable/),
    ).toBeInTheDocument()
  })
  it('preserves wiki syntax in literal code and existing links', async () => {
    stubBrainFetch({
      '/api/brain/graph': BRAIN_GRAPH,
      '/api/brain/page': {
        ...PAGE,
        body: '`[[notes/b]]`\n\n```md\n[[notes/c]]\n```\n\n[existing [[notes/b]]](https://example.com)\n\n[[notes/b|select B]]',
      },
    })
    await renderAt(SELECTED_ROUTE)
    const panel = await screen.findByRole('region', { name: 'Page' })
    const body = await within(panel).findByRole('article')
    expect(within(body).getByText('[[notes/b]]')).toHaveProperty(
      'tagName',
      'CODE',
    )
    expect(within(body).getByText('[[notes/c]]')).toHaveProperty(
      'tagName',
      'CODE',
    )
    expect(
      within(body).getByRole('link', { name: 'existing [[notes/b]]' }),
    ).toHaveAttribute('href', 'https://example.com')
    expect(
      within(body).getByRole('link', { name: 'select B' }),
    ).toHaveAttribute('href', expect.stringContaining('page=notes%2Fb'))
  })
  it('says when the page no longer exists', async () => {
    await renderAt('/brain?page=notes%2Fz')
    expect(
      await screen.findByText('This page no longer exists.'),
    ).toBeInTheDocument()
  })
  it('loads related pages only when asked, the selected page first', async () => {
    await renderAt(SELECTED_ROUTE)
    await screen.findByRole('region', { name: 'Page' })
    const asked = () =>
      vi
        .mocked(fetch)
        .mock.calls.filter(([input]) =>
          (typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url
          ).startsWith('/api/brain/related'),
        )
    expect(asked()).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Show related pages' }))
    const panel = screen.getByRole('region', { name: 'Related, not linked' })
    const items = await within(panel).findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('notes/c')
    expect(items[0]).toHaveTextContent('notes/a')
    expect(asked()).toHaveLength(1)
  })
})
