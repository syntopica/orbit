import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'

import { fakeActivity } from './fakeActivity'
import { fakeCosts } from './fakeCosts'
import { fakeQuality } from './fakeQuality'
import { E2E } from './paths'

// A stand-in coordinator: admin aggregate reads with the right
// bearer token only.
export const startFakeWorker = async (
  token: string,
): Promise<{ url: string; stop: () => Promise<void> }> => {
  const body = await readFile(join(E2E.fixtures, 'worker-status.json'))
  const server = createServer((request, response) => {
    const allowed = request.headers.authorization === `Bearer ${token}`
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    const known = [
      '/v1/status',
      '/v1/activity',
      '/v1/costs',
      '/v1/quality',
    ].includes(url.pathname)
    if (!known || !allowed) {
      response.writeHead(allowed ? 404 : 401).end()
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
