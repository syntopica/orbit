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
vi.mock('./GraphScene3d', () => ({
  default: () => <p>3D scene stand-in</p>,
}))

type LoadedGraph = {
  hasNode: (id: string) => boolean
  nodes: () => string[]
}
const lastGraph = () => fakeReactSigma.loaded.at(-1) as LoadedGraph

beforeEach(() => {
  fakeReactSigma.loaded.length = 0
  localStorage.clear()
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
      expect(lastGraph().hasNode('notes/a')).toBe(false)
    })
    expect(lastGraph().hasNode('notes/b')).toBe(true)
  })
  it('opens one step around the most linked page and names the view', async () => {
    await renderAt('/brain')
    expect(
      await screen.findByText('1 step around notes/b: 3 pages'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 step' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
  it('limits a local view to the steps around the found page', async () => {
    const { router } = await renderAt('/brain')
    fireEvent.change(await screen.findByLabelText('Find a page'), {
      target: { value: 'notes/a' },
    })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 'notes/a' })
    })
    await waitFor(() => {
      expect(lastGraph().hasNode('notes/c')).toBe(false)
    })
    fireEvent.click(screen.getByRole('button', { name: '2 steps' }))
    await waitFor(() => {
      expect(lastGraph().hasNode('notes/c')).toBe(true)
    })
  })
  it('leaves out orphans and hubs', async () => {
    const { router } = await renderAt('/brain')
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Orphans' }))
    await waitFor(() => {
      expect(lastGraph().hasNode('notes/c')).toBe(false)
    })
    fireEvent.change(screen.getByLabelText('Pages with more links than'), {
      target: { value: '1' },
    })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ maxLinks: 1 })
    })
    fireEvent.change(screen.getByLabelText('Pages with more links than'), {
      target: { value: '' },
    })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ maxLinks: null })
    })
  })
})

describe('views and keys', () => {
  it('steps through the overview, a group and back with keys', async () => {
    const { router } = await renderAt('/brain')
    await screen.findByText(/around notes\/b/)
    fireEvent.keyDown(document, { key: '0' })
    expect(await screen.findByText(/^Overview: 1 group/)).toBeInTheDocument()
    const [cluster] = lastGraph().nodes()
    expect(cluster).toMatch(/^cluster:/)
    fakeReactSigma.handlers['clickNode']?.({ node: cluster ?? '' })
    await waitFor(() => {
      expect(lastGraph().hasNode('notes/a')).toBe(true)
    })
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ cluster: null })
    })
    fireEvent.keyDown(document, { key: '+' })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ depth: 1 })
    })
    fireEvent.keyDown(screen.getByLabelText('Find a page'), { key: '3' })
    fireEvent.keyDown(document, { key: '2', ctrlKey: true })
    expect(router.state.location.search).toMatchObject({ depth: 1 })
  })
  it('opens a page picked in the overview in its local view', async () => {
    const { router } = await renderAt('/brain?depth=0')
    await screen.findByText(/^Overview: /)
    fakeReactSigma.handlers['clickNode']?.({ node: 'notes/a' })
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        page: 'notes/a',
        depth: 1,
      })
    })
  })
  it('draws the same scene in 3D when asked', async () => {
    const { router } = await renderAt('/brain')
    fireEvent.click(await screen.findByRole('button', { name: '3D' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ scene: '3d' })
    })
    expect(await screen.findByText('3D scene stand-in')).toBeInTheDocument()
  })
})
