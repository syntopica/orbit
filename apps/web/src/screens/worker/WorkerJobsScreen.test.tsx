import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'
import { requestUrl } from '../../test/requestUrl'

const job = {
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'failed',
  privacy: 'internal',
  tier: 'fast',
  createdAt: 1_790_000_000_000,
  updatedAt: 1_790_000_100_000,
  attempts: 1,
  lastError: null,
  acked: null,
  retryOf: null,
  sampling: false,
}

describe('WorkerJobsScreen', () => {
  it('lists jobs, applies URL filters, and pages with Older', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestUrl(input)
      return await Promise.resolve(
        Response.json({
          jobs: [job],
          next: url.includes('before=cursor') ? null : 'cursor',
        }),
      )
    })
    vi.stubGlobal('fetch', fetchMock)
    const { router } = await renderAt('/worker/jobs')
    expect(
      await screen.findByRole('link', { name: 'job-1' }),
    ).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Queue' }), {
      target: { value: 'queue.a' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'State' }), {
      target: { value: 'failed' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Producer' }), {
      target: { value: 'app' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        queue: 'queue.a',
        state: 'failed',
        producer: 'app',
      })
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Older' }))
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ before: 'cursor' })
    })
    expect(
      fetchMock.mock.calls.some(([path]) =>
        requestUrl(path).includes('before=cursor'),
      ),
    ).toBe(true)
  })
  it('shows an empty result and an accessible layout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          await Promise.resolve(Response.json({ jobs: [], next: null })),
      ),
    )
    const { container } = await renderAt('/worker/jobs')
    expect(await screen.findByText('No jobs found.')).toBeInTheDocument()
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0)
  })
  it('shows a fixed read error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          await Promise.resolve(
            Response.json({ error: 'unavailable' }, { status: 503 }),
          ),
      ),
    )
    await renderAt('/worker/jobs')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not read jobs.',
    )
  })
})
