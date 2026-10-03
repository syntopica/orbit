import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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

const NOW = 1_790_000_000_000
const CHECKS = {
  now: NOW,
  pageCount: 3,
  indexStale: true,
  issues: [
    { page: 'notes/a', code: 'dangling_link' },
    { page: 'notes/b', code: 'dangling_link' },
  ],
  doctor: {
    ok: false,
    checks: [{ name: 'paths', ok: false, code: 'paths_missing' }],
  },
}

describe('brain side panels', () => {
  it.each([BRAIN_GRAPH, 503])(
    'shows independent checks with graph response %s',
    async (graph) => {
      stubBrainFetch({
        '/api/brain/graph': graph,
        '/api/brain/checks': CHECKS,
        '/api/history/metrics': {
          now: NOW,
          from: NOW - 86_400_000,
          runs: [],
          series: [],
        },
      })
      const { container, router } = await renderAt('/brain')
      const lint = await screen.findByRole('region', { name: 'Lint' })
      expect(await within(lint).findByText(/dangling_link/)).toHaveTextContent(
        '2',
      )
      expect(within(lint).getByText(/index is stale/)).toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Doctor' })).toHaveTextContent(
        'paths paths_missing',
      )
      expect(
        screen.getByRole('region', { name: 'Lint over time' }),
      ).toBeInTheDocument()
      fireEvent.click(within(lint).getByText(/dangling_link/))
      fireEvent.click(within(lint).getByRole('link', { name: 'notes/b' }))
      await waitFor(() => {
        expect(router.state.location.search).toMatchObject({ page: 'notes/b' })
      })
      expect(await axe(container)).toEqual(
        expect.objectContaining({ violations: [] }),
      )
    },
  )
  it('requests and displays checks while the graph is still loading', async () => {
    stubBrainFetch({ '/api/brain/checks': CHECKS })
    const request = fetch
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) =>
        input === '/api/brain/graph'
          ? new Promise<Response>(() => undefined)
          : request(input),
      ),
    )
    await renderAt('/brain')
    expect(
      await screen.findByRole('region', { name: 'Lint' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Loading the graph…')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/brain/checks', expect.any(Object))
  })
  it('says when the checks are unavailable', async () => {
    stubBrainFetch({
      '/api/brain/graph': BRAIN_GRAPH,
      '/api/brain/checks': 503,
    })
    await renderAt('/brain')
    expect(
      await screen.findByText('Lint and doctor results are unavailable.'),
    ).toBeInTheDocument()
  })
})
