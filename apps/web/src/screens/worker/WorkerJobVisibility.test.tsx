import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderAt } from '../../test/renderAt'
import { requestUrl } from '../../test/requestUrl'

const job = {
  id: 'job-mail',
  queue: 'queue.a',
  producer: 'app',
  state: 'failed',
  privacy: 'mail',
  tier: 'fast',
  createdAt: 1000,
  updatedAt: 2000,
  attempts: 0,
  lastError: null,
  acked: null,
  retryOf: null,
  sampling: false,
  attemptDetails: [],
  hasInput: true,
  hasOutput: false,
}

describe('job content visibility', () => {
  it('reveals mail only on request and removes cached content when the tab hides', async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, _init?: RequestInit) =>
        await Promise.resolve(
          Response.json(
            requestUrl(input).endsWith('/content')
              ? { input: 'Example message', output: null }
              : job,
          ),
        ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const { client } = await renderAt('/worker/jobs/job-mail')
    const panel = await screen.findByRole('region', { name: 'Content' })
    expect(within(panel).queryByText(/Example message/)).not.toBeInTheDocument()
    fireEvent.click(
      within(panel).getByRole('button', { name: 'Reveal content' }),
    )
    expect(
      await within(panel).findByText(/Example message/),
    ).toBeInTheDocument()
    const contentCall = fetchMock.mock.calls.find(([path]) =>
      requestUrl(path).endsWith('/content'),
    )
    expect(new Headers(contentCall?.[1]?.headers).get('X-Orbit-Reveal')).toBe(
      'mail',
    )
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    fireEvent(document, new Event('visibilitychange'))
    expect(within(panel).queryByText(/Example message/)).not.toBeInTheDocument()
    expect(
      client.getQueryData(['worker-job-content', 'job-mail']),
    ).toBeUndefined()
    hidden.mockRestore()
  })
})
