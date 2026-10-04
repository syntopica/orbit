import type { WorkerJobClient } from '../types/WorkerJobClient'
import { readWorkerPending } from './readWorkerPending'

const row = (id: string, acked: number | null = null, state = 'failed') => ({
  id,
  queue: 'demo',
  producer: 'demo',
  state,
  privacy: 'internal',
  tier: 'fast',
  created: 100,
  updated: 101,
  attempts: 1,
  last_error: 'timeout',
  acked,
  retry_of: null,
  sampling: false,
})

describe('readWorkerPending', () => {
  it('pages failed jobs and drops acknowledged, duplicate and invalid rows', async () => {
    const paths: string[] = []
    const read: WorkerJobClient = async (path) => {
      paths.push(path)
      return Promise.resolve({
        status: 200,
        body: JSON.stringify(
          paths.length === 1
            ? {
                jobs: [
                  row('one'),
                  row('acked', 103),
                  { ...row('sampling'), sampling: true },
                  row('bad id'),
                  row('queued', null, 'queued'),
                ],
                next: 'cursor',
              }
            : { jobs: [row('one'), row('two')], next: null },
        ),
      })
    }
    const result = await readWorkerPending(
      read,
      new AbortController().signal,
      200_000,
    )
    expect(paths[0]).toContain('state=failed')
    expect(paths[1]).toContain('before=cursor')
    expect(result.items.map((item) => item.id)).toEqual([
      'worker:one',
      'worker:two',
    ])
    expect(result.items[0]?.ageMs).toBe(100_000)
  })
  it('fails closed on an unsuccessful response', async () => {
    const read: WorkerJobClient = async () =>
      Promise.resolve({ status: 503, body: '' })
    await expect(
      readWorkerPending(read, new AbortController().signal, 1),
    ).rejects.toThrow()
  })
  it('rejects repeated cursors instead of looping indefinitely', async () => {
    const read: WorkerJobClient = async () =>
      Promise.resolve({
        status: 200,
        body: JSON.stringify({ jobs: [], next: 'same' }),
      })
    await expect(
      readWorkerPending(read, new AbortController().signal, 1),
    ).rejects.toThrow('worker cursor invalid')
  })
})
