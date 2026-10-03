import { focusManager } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetBrainGraphMocks } from '../../test/resetBrainGraphMocks'

import { BRAIN_GRAPH } from '../../test/brainGraphFixture'
import { fakeLayoutWorkerModule } from '../../test/fakeLayoutWorkerModule'
import { fakeReactSigma } from '../../test/fakeReactSigma'
import { mediaMatches } from '../../test/mediaMatches'
import { renderAt } from '../../test/renderAt'
import { stubBrainFetch } from '../../test/stubBrainFetch'

beforeEach(resetBrainGraphMocks)

describe('Brain view fallbacks and interaction', () => {
  it('opens a local view from the URL, respects reduced motion and clears on the stage', async () => {
    mediaMatches.add('(prefers-reduced-motion: reduce)')
    mediaMatches.add('(max-width: 767px)')
    mediaMatches.add('(prefers-color-scheme: light)')
    stubBrainFetch({ '/api/brain/graph': { ...BRAIN_GRAPH, skipped: 2 } })
    const { router } = await renderAt(
      '/brain?page=notes%2Fa&depth=1&color=community&orphans=false',
    )
    await screen.findByRole('img', { name: /^Brain graph/ })
    await waitFor(() => {
      expect(fakeReactSigma.goto).toHaveBeenCalledWith(expect.any(Object), {
        duration: 0,
      })
    })
    expect(screen.getByText(/2 pages not shown/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Legend' })).toHaveTextContent(
      'communities',
    )
    expect(
      screen.queryByText('Orphan (no inbound links)'),
    ).not.toBeInTheDocument()
    act(() => {
      fakeReactSigma.handlers['enterNode']?.({ node: 'notes/a' })
    })
    expect(fakeReactSigma.container).toHaveClass('cursor-pointer')
    act(() => {
      fakeReactSigma.handlers['leaveNode']?.({ node: 'notes/a' })
    })
    expect(fakeReactSigma.container).not.toHaveClass('cursor-pointer')
    act(() => {
      fakeReactSigma.handlers['clickStage']?.({ node: '' })
    })
    await waitFor(() => {
      expect(router.state.location.search).not.toHaveProperty('page')
    })
  })
  it('keeps pages reachable after layout failure', async () => {
    vi.spyOn(
      fakeLayoutWorkerModule,
      'createLayoutWorker',
    ).mockImplementationOnce(() => {
      throw new Error('worker unavailable')
    })
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    const { router } = await renderAt('/brain')
    expect(await screen.findByText(/The graph layout failed/)).toHaveAttribute(
      'role',
      'alert',
    )
    fireEvent.click(screen.getByText('Show pages'))
    fireEvent.click(screen.getByRole('button', { name: 'notes/a' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/a' })
    })
  })
  it('does not refetch the graph on selection or window focus', async () => {
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    await renderAt('/brain')
    await screen.findByRole('img', { name: /^Brain graph/ })
    fireEvent.click(screen.getByText('Show pages'))
    fireEvent.click(screen.getByRole('button', { name: 'notes/b' }))
    await waitFor(() => {
      expect(fakeReactSigma.gotoNode).toHaveBeenCalledWith('notes/b', {
        duration: 300,
      })
    })
    await act(async () => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
      await Promise.resolve()
    })
    expect(
      vi
        .mocked(fetch)
        .mock.calls.filter(([path]) => path === '/api/brain/graph'),
    ).toHaveLength(1)
    focusManager.setFocused(undefined)
  })
  it('renders an empty graph and ignores an unknown selected page', async () => {
    stubBrainFetch({
      '/api/brain/graph': { ...BRAIN_GRAPH, nodes: [], edges: [] },
    })
    await renderAt('/brain?page=notes%2Fmissing')
    expect(
      await screen.findByRole('img', {
        name: 'Brain graph: 0 pages, 0 links, 0 orphans',
      }),
    ).toBeInTheDocument()
    expect(fakeReactSigma.gotoNode).not.toHaveBeenCalled()
  })
})
