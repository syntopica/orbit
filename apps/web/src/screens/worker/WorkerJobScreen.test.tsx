import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'
import { requestUrl } from '../../test/requestUrl'

const JOB_ID = 'job-internal'
const CONTENT_KEY = 'worker-job-content'

const job = {
  id: JOB_ID,
  queue: 'queue.a',
  producer: 'app',
  state: 'failed',
  privacy: 'internal',
  tier: 'fast',
  createdAt: 1000,
  updatedAt: 2000,
  attempts: 1,
  lastError: 'timeout',
  acked: null,
  retryOf: null,
  sampling: false,
  attemptDetails: [
    {
      node: 'node-a',
      provider: 'agy',
      model: 'model-a',
      outcome: 'failed',
      error: 'timeout',
      startedAt: 1000,
      endedAt: 2000,
      tokensIn: 2,
      tokensOut: 3,
    },
  ],
  hasInput: true,
  hasOutput: true,
}
const content = {
  input: { prompt: 'Example input' },
  output: { answer: 'Example output' },
}

describe('WorkerJobScreen', () => {
  it('renders attempts and removes internal content when hidden or navigated away', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (input: RequestInfo | URL) =>
          await Promise.resolve(
            Response.json(
              requestUrl(input).endsWith('/content') ? content : job,
            ),
          ),
      ),
    )
    const { container, router, client } = await renderAt(
      `/worker/jobs/${JOB_ID}`,
    )
    expect(
      await screen.findByRole('region', { name: 'Attempts' }),
    ).toHaveTextContent('node-a')
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0)
    const panel = screen.getByRole('region', { name: 'Content' })
    fireEvent.click(within(panel).getByRole('button', { name: 'Open content' }))
    expect(await within(panel).findByText(/Example input/)).toBeInTheDocument()
    expect(client.getQueryData([CONTENT_KEY, JOB_ID])).toEqual(content)
    fireEvent.click(within(panel).getByRole('button', { name: 'Hide content' }))
    expect(within(panel).queryByText(/Example input/)).not.toBeInTheDocument()
    expect(client.getQueryData([CONTENT_KEY, JOB_ID])).toBeUndefined()
    fireEvent.click(within(panel).getByRole('button', { name: 'Open content' }))
    await within(panel).findByText(/Example input/)
    await router.navigate({ to: '/worker/jobs' })
    expect(client.getQueryData([CONTENT_KEY, JOB_ID])).toBeUndefined()
  })
  it('steps up before secret reveal and hides content after 60 seconds', async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = requestUrl(input)
        if (url.endsWith('/step-up'))
          return await Promise.resolve(
            new Response(null, {
              status: init?.body === '{"token":"valid"}' ? 204 : 401,
            }),
          )
        return await Promise.resolve(
          Response.json(
            url.endsWith('/content')
              ? content
              : { ...job, id: 'job-secret', privacy: 'secret' },
          ),
        )
      },
    )
    vi.stubGlobal('fetch', fetchMock)
    const { client } = await renderAt('/worker/jobs/job-secret')
    const panel = await screen.findByRole('region', { name: 'Content' })
    fireEvent.click(
      within(panel).getByRole('button', { name: 'Reveal content' }),
    )
    fireEvent.change(within(panel).getByLabelText('Admin token for reveal'), {
      target: { value: 'wrong' },
    })
    fireEvent.click(
      within(panel).getByRole('button', { name: 'Reveal content' }),
    )
    expect(await within(panel).findByRole('alert')).toHaveTextContent(
      'Token rejected',
    )
    fireEvent.change(within(panel).getByLabelText('Admin token for reveal'), {
      target: { value: 'valid' },
    })
    const timeout = vi.spyOn(window, 'setTimeout')
    fireEvent.click(
      within(panel).getByRole('button', { name: 'Reveal content' }),
    )
    expect(await within(panel).findByText(/Example output/)).toBeInTheDocument()
    const contentCall = fetchMock.mock.calls.find(([path]) =>
      requestUrl(path).endsWith('/content'),
    )
    expect(new Headers(contentCall?.[1]?.headers).get('X-Orbit-Reveal')).toBe(
      'secret',
    )
    const hide = timeout.mock.calls.find(
      ([, delay]) => delay === 60_000,
    )?.[0] as (() => void) | undefined
    expect(typeof hide).toBe('function')
    if (typeof hide === 'function')
      act(() => {
        hide()
      })
    expect(within(panel).queryByText(/Example output/)).not.toBeInTheDocument()
    expect(client.getQueryData([CONTENT_KEY, 'job-secret'])).toBeUndefined()
  })
  it('requires a confirmation before cancelling and refreshes the state', async () => {
    let state = 'queued'
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = requestUrl(input)
        if (url.endsWith('/cancel') && init?.method === 'POST') {
          state = 'cancelled'
          return await Promise.resolve(Response.json({ id: JOB_ID, state }))
        }
        return await Promise.resolve(Response.json({ ...job, state }))
      },
    )
    vi.stubGlobal('fetch', fetchMock)
    await renderAt(`/worker/jobs/${JOB_ID}`)
    const button = await screen.findByRole('button', { name: 'Cancel job' })
    fireEvent.click(button)
    expect(
      screen.getByRole('dialog', { name: 'Confirm cancel' }),
    ).toHaveTextContent(JOB_ID)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Keep job' }), {
      key: 'Escape',
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(state).toBe('queued')
    fireEvent.click(button)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancel' }))
    await waitFor(() => {
      expect(state).toBe('cancelled')
    })
    expect(
      fetchMock.mock.calls.some(
        ([path, init]) =>
          requestUrl(path).endsWith('/cancel') && init?.method === 'POST',
      ),
    ).toBe(true)
    expect(
      await screen.findByText('cancelled', { exact: true }),
    ).toBeInTheDocument()
  })
})
