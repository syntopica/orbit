import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderAt } from '../../test/renderAt'
import { requestUrl } from '../../test/requestUrl'

const JOB_ID = 'job-remote'

const job = {
  id: JOB_ID,
  queue: 'queue.a',
  producer: 'app',
  state: 'queued',
  privacy: 'internal',
  tier: 'fast',
  createdAt: 1000,
  updatedAt: 2000,
  attempts: 0,
  lastError: null,
  acked: null,
  retryOf: null,
  sampling: false,
  attemptDetails: [],
  hasInput: false,
  hasOutput: false,
}

describe('job actions on a remote session', () => {
  it('asks for the admin token when the server wants a step-up, then retries', async () => {
    let state = 'queued'
    let steppedUp = false
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = requestUrl(input)
        if (url.endsWith('/session/step-up')) {
          steppedUp = true
          return Promise.resolve(new Response(null, { status: 204 }))
        }
        if (url.endsWith('/cancel') && init?.method === 'POST') {
          if (!steppedUp)
            return Promise.resolve(
              Response.json({ error: 'step_up_required' }, { status: 403 }),
            )
          state = 'cancelled'
          return Promise.resolve(Response.json({ id: JOB_ID, state }))
        }
        return Promise.resolve(Response.json({ ...job, state }))
      },
    )
    vi.stubGlobal('fetch', fetchMock)
    await renderAt(`/worker/jobs/${JOB_ID}`)
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel job' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancel' }))
    const input = await screen.findByLabelText('Admin token for this action')
    expect(state).toBe('queued')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'token-value' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancel' }))
    await waitFor(() => {
      expect(state).toBe('cancelled')
    })
  })
})
