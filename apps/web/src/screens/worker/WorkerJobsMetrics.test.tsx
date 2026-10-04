import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { mediaMatches } from '../../test/mediaMatches'
import { renderAt } from '../../test/renderAt'

const job = {
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'succeeded',
  privacy: 'internal',
  tier: 'basic',
  createdAt: 1_790_000_000_000,
  updatedAt: 1_790_000_100_000,
  attempts: 2,
  lastError: null,
  acked: null,
  retryOf: null,
  sampling: false,
  model: 'model-a',
  lastModel: 'vendor/model:free',
  tokensIn: 1200,
  tokensOut: 300,
  costUsd: 0,
  wallMs: 12_400,
  lastOutcome: 'succeeded',
}
const older = {
  ...job,
  id: 'job-0',
  state: 'failed',
  lastError: 'timeout',
  lastOutcome: 'failed',
}
// A row from an older server: no metrics at all.
const bare = { ...job, id: 'job-old' }
for (const key of [
  'model',
  'lastModel',
  'tokensIn',
  'tokensOut',
  'costUsd',
  'wallMs',
  'lastOutcome',
] as const)
  Reflect.deleteProperty(bare, key)

const serve = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Promise.resolve(Response.json({ jobs: [job, older, bare], next: null })),
    ),
  )
}

describe('job list metrics', () => {
  it('shows model, tokens, cost, duration and result columns', async () => {
    serve()
    await renderAt('/worker/jobs')
    const table = await screen.findByRole('table')
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((cell) => cell.textContent)
    expect(headers).toEqual([
      'Job',
      'Queue',
      'Producer',
      'State',
      'Privacy',
      'Model',
      'Tokens',
      'Cost',
      'Duration',
      'Result',
      'Created',
    ])
    const [first, second, third] = within(table).getAllByRole('row').slice(1)
    expect(first).toHaveTextContent('vendor/model:free')
    expect(first).toHaveTextContent('1200 in · 300 out')
    expect(first).toHaveTextContent('$0.00')
    expect(first).toHaveTextContent('12.4s')
    expect(first).toHaveTextContent('succeeded')
    expect(second).toHaveTextContent('timeout')
    expect(third).toHaveTextContent('— in · — out')
    // Model, cost, duration and result are all unknown.
    expect(within(third as HTMLElement).getAllByText('—')).toHaveLength(4)
  })
  it('adds a metrics line to each job on a phone', async () => {
    mediaMatches.add('(max-width: 767px)')
    serve()
    await renderAt('/worker/jobs')
    const list = await screen.findByRole('region', { name: 'Job list' })
    const items = await within(list).findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('vendor/model:free')
    expect(items[0]).toHaveTextContent('$0.00')
    expect(items[0]).toHaveTextContent('12.4s')
    expect(items[1]).toHaveTextContent('timeout')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
