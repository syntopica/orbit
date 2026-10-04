import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'
import { requestUrl } from '../../test/requestUrl'
import { workerView } from '../../test/workerView'

const NOW = 1_790_000_000_000
const RUNNING = { name: 'Running now' }
const running = {
  id: 'job-live',
  queue: 'queue.a',
  producer: 'app',
  state: 'running',
  privacy: 'internal',
  tier: 'basic',
  createdAt: NOW - 600_000,
  updatedAt: NOW - 120_000,
  attempts: 2,
  lastError: null,
  acked: null,
  retryOf: null,
  sampling: false,
  kind: 'inference',
  model: 'model-a',
  leaseNode: 'node-a',
  tokensIn: 40,
  tokensOut: 8,
  lastModel: 'model-b',
  lastStartedAt: NOW - 65_000,
}

const serve = (jobs: unknown, status = 200) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = requestUrl(input)
    if (url.startsWith('/api/worker/jobs'))
      return await Promise.resolve(Response.json(jobs, { status }))
    return await Promise.resolve(Response.json(workerView()))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('Running now', () => {
  it('lists live jobs with kind, model, node, elapsed time and tokens', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW)
    const fetchMock = serve({ jobs: [running], next: null })
    const { container } = await renderAt('/worker')
    const section = await screen.findByRole('region', RUNNING)
    expect(
      await within(section).findByRole('link', { name: 'job-live' }),
    ).toBeInTheDocument()
    expect(section).toHaveTextContent('queue.a')
    expect(section).toHaveTextContent('Kindinference')
    expect(section).toHaveTextContent('Modelmodel-b')
    expect(section).toHaveTextContent('Nodenode-a')
    expect(section).toHaveTextContent('Elapsed 1m 05s')
    expect(section).toHaveTextContent('Tokens so far40 in · 8 out')
    expect(
      fetchMock.mock.calls.some(([path]) =>
        requestUrl(path).includes('state=leased%2Crunning%2Cdraining'),
      ),
    ).toBe(true)
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0)
  })
  it('falls back to the requested model and dashes an unknown node', async () => {
    serve({
      jobs: [{ ...running, lastModel: null, leaseNode: null }],
      next: null,
    })
    await renderAt('/worker')
    const section = await screen.findByRole('region', RUNNING)
    expect(await within(section).findByText('model-a')).toBeInTheDocument()
    expect(section).toHaveTextContent('Node—')
  })
  it('says nothing is running for an empty list', async () => {
    serve({ jobs: [], next: null })
    await renderAt('/worker')
    const section = await screen.findByRole('region', RUNNING)
    expect(
      await within(section).findByText('Nothing is running.'),
    ).toBeInTheDocument()
  })
  it('reports an unreadable list without hiding the rest of the screen', async () => {
    serve({ error: 'unavailable' }, 503)
    await renderAt('/worker')
    const section = await screen.findByRole('region', RUNNING)
    expect(
      await within(section).findByText('Could not read running jobs.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Worker' })).toBeInTheDocument()
  })
})
