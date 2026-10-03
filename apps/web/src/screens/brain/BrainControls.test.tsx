import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BRAIN_GRAPH } from '../../test/brainGraphFixture'
import { fakeReactSigma } from '../../test/fakeReactSigma'
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

type LoadedGraph = { getNodeAttribute: (id: string, name: string) => unknown }
const lastGraph = () => fakeReactSigma.loaded.at(-1) as LoadedGraph

beforeEach(() => {
  fakeReactSigma.loaded.length = 0
  stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
})

describe('graph controls', () => {
  it('switches the colour mode and the orphan highlight', async () => {
    const { router } = await renderAt('/brain')
    fireEvent.click(await screen.findByRole('radio', { name: 'Community' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ color: 'community' })
    })
    expect(
      await screen.findByText(/communities; the five largest/),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Highlight orphans' }))
    await waitFor(() => {
      expect(screen.queryByText('Orphan (no inbound links)')).toBeNull()
    })
  })
  it('hides a type but keeps the selected page', async () => {
    await renderAt('/brain?page=notes%2Fb')
    fireEvent.click(await screen.findByRole('checkbox', { name: 'topic' }))
    await waitFor(() => {
      expect(lastGraph().getNodeAttribute('notes/a', 'hidden')).toBe(true)
    })
    expect(lastGraph().getNodeAttribute('notes/b', 'hidden')).toBe(false)
  })
  it('offers local steps only with a selection, then limits the view', async () => {
    const { router } = await renderAt('/brain')
    expect(await screen.findByRole('button', { name: '1 step' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Find a page'), {
      target: { value: 'notes/a' },
    })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/a' })
    })
    fireEvent.click(screen.getByRole('button', { name: '1 step' }))
    await waitFor(() => {
      expect(lastGraph().getNodeAttribute('notes/c', 'hidden')).toBe(true)
    })
    expect(lastGraph().getNodeAttribute('notes/b', 'hidden')).toBe(false)
    expect(screen.getByRole('button', { name: '1 step' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
