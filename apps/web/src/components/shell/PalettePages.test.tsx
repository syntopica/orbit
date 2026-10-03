import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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

const graphCalls = () =>
  vi.mocked(fetch).mock.calls.filter(([input]) => input === '/api/brain/graph')

describe('palette pages', () => {
  it('lists brain pages only while open and opens the chosen one', async () => {
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    const { router } = await renderAt('/system')
    expect(graphCalls()).toHaveLength(0)
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(await screen.findByRole('listbox')).toHaveClass(
      'max-h-[calc(100dvh-11rem)]',
      'overflow-y-auto',
    )
    fireEvent.click(await screen.findByRole('option', { name: 'notes/c' }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/brain')
    })
    expect(router.state.location.search).toMatchObject({ page: 'notes/c' })
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).toBeNull()
  })
  it('releases the graph when the palette closes', async () => {
    stubBrainFetch({ '/api/brain/graph': BRAIN_GRAPH })
    await renderAt('/system')
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    await screen.findByRole('option', { name: 'notes/c' })
    expect(graphCalls()).toHaveLength(1)
    fireEvent.click(
      screen.getByRole('button', { name: 'Close command palette' }),
    )
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Command palette' }),
      ).toBeNull()
    })
    // Let the zero-duration garbage-collection timer remove the inactive query.
    await new Promise((resolve) => setTimeout(resolve, 10))
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    await screen.findByRole('option', { name: 'notes/c' })
    expect(graphCalls()).toHaveLength(2)
  })
  it('keeps navigation working when the graph is unavailable', async () => {
    stubBrainFetch({ '/api/brain/graph': 503 })
    const { router } = await renderAt('/system')
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.click(await screen.findByRole('option', { name: 'Worker' }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/worker')
    })
  })
})
