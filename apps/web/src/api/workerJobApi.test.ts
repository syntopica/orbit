import { describe, expect, it, vi } from 'vitest'

import { fetchWorkerJobContent } from './fetchWorkerJobContent'
import { postWorkerJobAction } from './postWorkerJobAction'

describe('worker job API calls', () => {
  it('sends reveal class only for sensitive content and rejects failed reads', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(
        async () =>
          await Promise.resolve(Response.json({ input: null, output: 'text' })),
      )
    vi.stubGlobal('fetch', fetchMock)
    await fetchWorkerJobContent(
      'job-1',
      'internal',
      new AbortController().signal,
    )
    expect(
      new Headers(fetchMock.mock.calls[0]?.[1]?.headers).has('X-Orbit-Reveal'),
    ).toBe(false)
    await fetchWorkerJobContent('job-1', 'mail', new AbortController().signal)
    expect(
      new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('X-Orbit-Reveal'),
    ).toBe('mail')
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: 'reveal_required' }, { status: 403 }),
    )
    await expect(
      fetchWorkerJobContent('job-1', 'mail', new AbortController().signal),
    ).rejects.toThrow('403')
  })
  it('adds the mutation header and rejects a failed action', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ id: 'job-1', state: 'cancelled' }))
    vi.stubGlobal('fetch', fetchMock)
    await postWorkerJobAction('job-1', 'cancel')
    expect(
      new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('X-Orbit'),
    ).toBe('1')
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: 'not_retryable' }, { status: 409 }),
    )
    await expect(postWorkerJobAction('job-1', 'retry')).rejects.toThrow('409')
  })
})
