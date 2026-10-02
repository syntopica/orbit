import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'

import { E2E } from './paths'

// A stand-in coordinator: GET /v1/status with the right bearer token only.
export const startFakeWorker = async (
  token: string,
): Promise<{ url: string; stop: () => Promise<void> }> => {
  const body = await readFile(join(E2E.fixtures, 'worker-status.json'))
  const server = createServer((request, response) => {
    const allowed = request.headers.authorization === `Bearer ${token}`
    if (request.url !== '/v1/status' || !allowed) {
      response.writeHead(allowed ? 404 : 401).end()
      return
    }
    response.writeHead(200, { 'Content-Type': 'application/json' }).end(body)
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
