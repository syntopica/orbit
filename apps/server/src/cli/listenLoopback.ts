import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

import { createAdaptorServer, type HttpBindings } from '@hono/node-server'

import type { ListeningServer } from '../types/ListeningServer'
import type { RequestHandler } from '../types/RequestHandler'

// Listens on 127.0.0.1 only. The handler is built once the real port is known,
// so a requested port 0 still yields a Host allowlist that matches.
export const listenLoopback = async (
  port: number,
  makeHandler: (actualPort: number) => RequestHandler,
): Promise<ListeningServer> =>
  new Promise((resolve, reject) => {
    let handler: RequestHandler = () => new Response(null, { status: 503 })
    // Without http2 options the adaptor builds a plain http.Server.
    const server = createAdaptorServer({
      fetch: async (request, env) => handler(request, env as HttpBindings),
    }) as Server
    server.once('error', () => {
      reject(new Error('orbit could not listen on the configured port'))
    })
    server.listen(port, '127.0.0.1', () => {
      const actual = (server.address() as AddressInfo).port
      handler = makeHandler(actual)
      resolve({ server, port: actual })
    })
  })
