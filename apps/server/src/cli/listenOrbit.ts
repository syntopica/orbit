import type { Server } from 'node:http'

import type { RequestHandler } from '../types/RequestHandler'
import { listenLoopback } from './listenLoopback'
import { listenRemotePort } from './listenRemotePort'

// Binds the machine's own port, then the published `remotePort` when set, both
// serving the one handler built for the port really bound. A remote port that
// cannot be bound closes the first listener before the failure is rethrown.
export const listenOrbit = async (
  ports: { readonly port: number; readonly remotePort?: number | undefined },
  makeHandler: (actualPort: number) => RequestHandler,
): Promise<{ servers: Server[]; port: number }> => {
  const built: { handler?: RequestHandler } = {}
  const primary = await listenLoopback(
    ports.port,
    (actual) => (built.handler = makeHandler(actual)),
  )
  try {
    const remote = await listenRemotePort(ports.remotePort, built.handler)
    return { servers: [primary.server, ...remote], port: primary.port }
  } catch (error) {
    primary.server.close()
    throw error
  }
}
