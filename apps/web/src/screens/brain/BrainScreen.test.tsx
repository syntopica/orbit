import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { resetBrainGraphMocks } from '../../test/resetBrainGraphMocks'

import { hasWebGl } from '../../graph/hasWebGl'
import { BRAIN_GRAPH } from '../../test/brainGraphFixture'
import { fakeReactSigma } from '../../test/fakeReactSigma'
import { renderAt } from '../../test/renderAt'
import { stubBrainFetch } from '../../test/stubBrainFetch'

beforeEach(resetBrainGraphMocks)

describe('BrainScreen', () => {
  it('draws the laid-out graph and names it', async () => {
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    const { container } = await renderAt('/brain')
    expect(
      await screen.findByRole('img', {
        name: 'Brain graph: 3 pages, 2 links, 1 orphan',
      }),
    ).toBeInTheDocument()
    await waitFor(() => {
      const graph = fakeReactSigma.loaded.at(-1)
      expect([graph?.order, graph?.size]).toEqual([3, 2])
    })
    expect(screen.getByText('Orphan (no inbound links)')).toBeInTheDocument()
    const legend = screen.getByRole('region', { name: 'Legend' })
    expect(within(legend).getByText('topic')).toBeInTheDocument()
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0)
  })
  it('selects a page from the canvas and from the page list', async () => {
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    const { router } = await renderAt('/brain')
    await screen.findByRole('img', { name: /^Brain graph/ })
    await waitFor(() => {
      expect(fakeReactSigma.handlers['clickNode']).toBeTypeOf('function')
    })
    fakeReactSigma.handlers['clickNode']?.({ node: 'notes/b' })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/b' })
    })
    await waitFor(() => {
      expect(fakeReactSigma.goto).toHaveBeenCalledWith(expect.any(Object), {
        duration: 300,
      })
    })
    fireEvent.click(screen.getByText('Show pages'))
    fireEvent.click(screen.getByRole('button', { name: 'notes/c' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/c' })
    })
  })
  it('keeps the page list without WebGL and says why', async () => {
    vi.mocked(hasWebGl).mockReturnValue(false)
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    await renderAt('/brain')
    expect(await screen.findByText(/no WebGL/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'notes/a' })).toBeInTheDocument()
  })
  it('says when the graph is unavailable', async () => {
    stubBrainFetch({ '/api/brain/graph': 503 })
    await renderAt('/brain')
    expect(
      await screen.findByText(/The brain graph is unavailable/),
    ).toHaveAttribute('role', 'alert')
  })
})
