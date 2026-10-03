import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { mediaMatches } from '../../test/mediaMatches'
import { renderAt } from '../../test/renderAt'
import { workerNode } from '../../test/workerNode'
import { workerQueue, workerView } from '../../test/workerView'

const NOW = 1_790_000_000_000
const failure = (id: string, error: string | null) => ({
  id,
  queue: 'queue.a',
  error,
  finishedAt: NOW - 60_000,
})
const view = workerView({
  queues: [
    workerQueue({ queued: 3, failed: 2, oldestQueuedMs: 7_200_000 }),
    workerQueue({ name: 'queue.b', succeeded: 9 }),
  ],
  nodes: [
    workerNode({
      idleMs: 2000,
      lastRelease: { code: 'user_active', ageMs: 60_000 },
      resident: ['model-a:7b'],
    }),
    workerNode({ name: 'node-b', reportAgeMs: 36_000_000 }),
  ],
  cooldowns: [
    { runner: 'runner-a', availableAt: NOW + 4 * 86_400_000 + 36_000_000 },
  ],
  failures: [
    failure('aaaaaaaa1111', 'runner_failed'),
    failure('bbbbbbbb2222', 'runner_failed'),
    failure('cccccccc3333', null),
  ],
})
const serve = (body: unknown, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Promise.resolve(Response.json(body, { status }))),
  )
}

describe('WorkerScreen', () => {
  it('explains why queued work waits and lists every section', async () => {
    serve(view)
    const { container } = await renderAt('/worker')
    const diagnosis = await screen.findByRole('region', { name: 'Diagnosis' })
    expect(diagnosis).toHaveTextContent(
      '3 waiting and nothing running right now. Why:',
    )
    expect(diagnosis).toHaveTextContent('0 done in the last hour.')
    expect(diagnosis).toHaveTextContent('runner-a available in 4d 10h')
    expect(diagnosis).toHaveTextContent('node-a is in use, works when idle')
    expect(diagnosis).toHaveTextContent('node-b last reported 10h ago')
    const queues = screen.getByRole('region', { name: 'Queues' })
    expect(
      within(queues).getByRole('rowheader', { name: 'queue.a' }),
    ).toBeInTheDocument()
    expect(within(queues).getByText('2h')).toBeInTheDocument()
    expect(within(queues).getByText('1 idle queues')).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Runners cooling down' }),
    ).toHaveTextContent('available in 4d 10h')
    const nodes = screen.getByRole('region', { name: 'Nodes' })
    expect(within(nodes).getByText('blocked')).toBeInTheDocument()
    expect(within(nodes).getByText('offline')).toBeInTheDocument()
    expect(within(nodes).getByText('model-a:7b')).toBeInTheDocument()
    const failures = within(
      screen.getByRole('region', { name: 'Recent failures' }),
    ).getAllByRole('listitem')
    expect(failures).toHaveLength(2)
    expect(failures[0]).toHaveTextContent('runner_failed')
    expect(failures[0]).toHaveTextContent('job aaaaaaaa')
    expect(failures[0]).toHaveTextContent('×2')
    expect(failures[1]).toHaveTextContent('no code')
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toHaveLength(0)
  })
  it('says nothing is waiting and shows empty sections', async () => {
    serve(workerView())
    await renderAt('/worker')
    expect(await screen.findByText('Nothing waiting.')).toBeInTheDocument()
    expect(screen.getByText('No runner is cooling down.')).toBeInTheDocument()
    expect(screen.getByText('No node has reported.')).toBeInTheDocument()
    expect(screen.getByText('No recent failures.')).toBeInTheDocument()
  })
  it('says what runs while work waits, and when no cause is found', async () => {
    serve(workerView({ queues: [workerQueue({ queued: 2, live: 1 })] }))
    await renderAt('/worker')
    expect(await screen.findByText('1 running, 2 waiting.')).toBeInTheDocument()
    serve(
      workerView({
        queues: [workerQueue({ queued: 2 })],
        nodes: [
          workerNode({
            onAc: null,
            pressure: null,
            idleMs: null,
            lastRelease: { code: null, ageMs: 1 },
          }),
        ],
      }),
    )
    await renderAt('/worker')
    expect(
      await screen.findByText('No blocking cause found in the worker status.'),
    ).toBeInTheDocument()
  })
  it('lists queues on a phone and words an unknown code', async () => {
    mediaMatches.add('(max-width: 767px)')
    serve(
      workerView({
        queues: [workerQueue({ queued: 1 })],
        nodes: [workerNode({ reason: 'drain_failed' })],
      }),
    )
    await renderAt('/worker')
    expect(await screen.findByText('drain_failed')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText(/Queued 1 · Oldest —/)).toBeInTheDocument()
  })
  it('alerts when the worker cannot be read', async () => {
    serve({ error: 'unavailable' }, 503)
    await renderAt('/worker')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not read the worker.',
    )
  })
})
