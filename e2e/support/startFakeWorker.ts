import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'

import { fakeActivity } from './fakeActivity'
import { fakeCosts } from './fakeCosts'
import { fakeQuality } from './fakeQuality'
import { fakeJob } from './fakeJob'
import { E2E } from './paths'

// A stand-in coordinator: admin aggregate reads with the right
// bearer token only.
export const startFakeWorker = async (
  token: string,
): Promise<{ url: string; stop: () => Promise<void> }> => {
  const body = await readFile(join(E2E.fixtures, 'worker-status.json'))
  let cancelled = false
  const server = createServer((request, response) => {
    const allowed = request.headers.authorization === `Bearer ${token}`
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    const known =
      ['/v1/status', '/v1/activity', '/v1/costs', '/v1/quality'].includes(
        url.pathname,
      ) || url.pathname.startsWith('/v1/admin/jobs')
    if (!known || !allowed) {
      response.writeHead(allowed ? 404 : 401).end()
      return
    }
    if (url.pathname.startsWith('/v1/admin/jobs')) {
      const parts = url.pathname.split('/')
      const id = parts[4]
      const action = parts[5]
      const ids = ['job-internal', 'job-secret', 'job-cancel', 'job-running']
      const stateOf = (item: string) =>
        item === 'job-running'
          ? 'running'
          : item === 'job-cancel'
            ? cancelled
              ? 'cancelled'
              : 'queued'
            : 'failed'
      if (id && !ids.includes(id)) {
        response
          .writeHead(404, { 'Content-Type': 'application/json' })
          .end('{"error":"not_found"}')
        return
      }
      if (
        id === 'job-cancel' &&
        action === 'cancel' &&
        request.method === 'POST'
      )
        cancelled = true
      const row = fakeJob(id ?? 'job-internal', stateOf(id ?? 'job-internal'))
      const states = url.searchParams.get('state')?.split(',')
      const jobs = ids
        .map((item) => fakeJob(item, stateOf(item)))
        .filter(
          (item) =>
            (!url.searchParams.has('queue') ||
              item.queue === url.searchParams.get('queue')) &&
            (states === undefined || states.includes(item.state)) &&
            (!url.searchParams.has('producer') ||
              item.producer === url.searchParams.get('producer')),
        )
      const result = !id
        ? { jobs, next: null }
        : action === 'content'
          ? {
              input: { prompt: 'Example input' },
              output: { answer: 'Example output' },
            }
          : action === 'retry'
            ? { id: 'job-retry', state: 'queued', retry_of: id }
            : action
              ? { id, state: row.state }
              : {
                  ...row,
                  attempt_details: [
                    {
                      node: 'node-demo',
                      provider: 'agy',
                      model: 'model-demo',
                      outcome: 'failed',
                      error: 'timeout',
                      started: 1_790_000_001,
                      ended: 1_790_000_002,
                      tokens_in: 2,
                      tokens_out: 3,
                      wall_s: 1.5,
                      cost_usd: 0,
                    },
                  ],
                  results: [
                    {
                      result_id: 'result-demo',
                      control: 'failed',
                      detail: { error: 'timeout' },
                      executor: null,
                      usage: null,
                      rating: null,
                      created: 1_790_000_002,
                      acked: null,
                    },
                  ],
                  has_input: true,
                  has_output: true,
                }
      if (
        action === 'content' &&
        id === 'job-secret' &&
        request.headers['x-worker-reveal'] !== 'secret'
      ) {
        response
          .writeHead(403, { 'Content-Type': 'application/json' })
          .end('{"error":"reveal_required"}')
        return
      }
      response
        .writeHead(200, { 'Content-Type': 'application/json' })
        .end(JSON.stringify(result))
      return
    }
    response
      .writeHead(200, { 'Content-Type': 'application/json' })
      .end(
        url.pathname === '/v1/status'
          ? body
          : url.pathname === '/v1/activity'
            ? fakeActivity(Number(url.searchParams.get('hours')))
            : url.pathname === '/v1/costs'
              ? fakeCosts()
              : fakeQuality(),
      )
  })
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })
  const { port } = server.address() as AddressInfo
  return {
    url: `http://127.0.0.1:${String(port)}`,
    stop: async () =>
      new Promise((resolve) => {
        server.close(() => {
          resolve()
        })
      }),
  }
}
