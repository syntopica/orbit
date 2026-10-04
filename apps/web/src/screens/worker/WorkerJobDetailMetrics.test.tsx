import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { renderAt } from '../../test/renderAt'
import { requestUrl } from '../../test/requestUrl'

const job = {
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'succeeded',
  privacy: 'internal',
  tier: 'basic',
  createdAt: 1000,
  updatedAt: 9000,
  attempts: 1,
  lastError: null,
  acked: null,
  retryOf: null,
  sampling: false,
  kind: 'inference',
  model: 'model-a',
  priority: 50,
  preemptions: 1,
  tokensIn: 7,
  tokensOut: 2,
  costUsd: 0,
  wallMs: 2500,
  lastModel: 'model-b',
  lastOutcome: 'succeeded',
  attemptDetails: [
    {
      node: 'node-a',
      provider: 'openrouter',
      model: 'model-b',
      outcome: 'succeeded',
      error: null,
      startedAt: 3000,
      endedAt: 5500,
      tokensIn: 7,
      tokensOut: 2,
      wallMs: 2500,
      costUsd: 0,
    },
  ],
  results: [
    {
      resultId: 'result-1',
      control: null,
      error: null,
      schemaPath: null,
      node: 'node-a',
      provider: 'openrouter',
      model: 'model-b',
      tokensIn: 7,
      tokensOut: 2,
      costUsd: 0,
      rating: 'good',
      createdAt: 5500,
      ackedAt: null,
    },
  ],
  hasInput: true,
  hasOutput: false,
}

const serve = (detail: unknown) => {
  const writeText = vi.fn(async () => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) =>
      Promise.resolve(
        Response.json(
          requestUrl(input).endsWith('/content')
            ? { input: { prompt: 'Example input' }, output: null }
            : detail,
        ),
      ),
    ),
  )
  return writeText
}

describe('job detail metrics', () => {
  it('shows totals, per-attempt run time and cost, and result metadata', async () => {
    serve(job)
    const { container } = await renderAt('/worker/jobs/job-1')
    const result = await screen.findByRole('region', { name: 'Result' })
    expect(result).toHaveTextContent('Latest attempt succeeded')
    expect(result).toHaveTextContent('Executornode-a · openrouter · model-b')
    expect(result).toHaveTextContent('Tokens7 in · 2 out')
    expect(result).toHaveTextContent('Cost$0.00')
    expect(result).toHaveTextContent('Ratinggood')
    expect(screen.getByRole('region', { name: 'Attempts' })).toHaveTextContent(
      '7 in · 2 out · 2.5s run · $0.00',
    )
    const header = screen.getByRole('main')
    expect(header).toHaveTextContent('Kindinference')
    expect(header).toHaveTextContent('Requested modelmodel-a')
    expect(header).toHaveTextContent('Run time2.5s')
    expect(header).toHaveTextContent('Preemptions1')
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0)
  })
  it('splits revealed content into input and output panes', async () => {
    const writeText = serve(job)
    await renderAt('/worker/jobs/job-1')
    const panel = await screen.findByRole('region', { name: 'Content' })
    expect(
      within(panel).queryByRole('region', { name: 'Input' }),
    ).not.toBeInTheDocument()
    fireEvent.click(within(panel).getByRole('button', { name: 'Open content' }))
    const input = await within(panel).findByRole('region', { name: 'Input' })
    expect(input).toHaveTextContent('Example input')
    expect(
      within(panel).getByRole('region', { name: 'Output' }),
    ).toHaveTextContent('Not stored.')
    fireEvent.click(within(input).getByRole('button', { name: 'Copy input' }))
    expect(writeText).toHaveBeenCalledWith(
      JSON.stringify({ prompt: 'Example input' }, null, 2),
    )
  })
  it('reads an older server detail with no metrics or results', async () => {
    const older = {
      ...job,
      kind: undefined,
      attemptDetails: [{ ...job.attemptDetails[0], wallMs: undefined }],
    }
    Reflect.deleteProperty(older, 'results')
    serve(older)
    await renderAt('/worker/jobs/job-1')
    const result = await screen.findByRole('region', { name: 'Result' })
    expect(result).toHaveTextContent('No result stored yet.')
    expect(screen.getByRole('region', { name: 'Attempts' })).toHaveTextContent(
      '7 in · 2 out · — run · $0.00',
    )
  })
})
