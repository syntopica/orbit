import type { Server } from 'node:http'

import type { RequestHandler } from '../types/RequestHandler'
import { listenLoopback } from './listenLoopback'

// The port Tailscale Serve publishes, when one is configured: the same
// application, told apart from the machine's own port by the socket a request
// arrived on.
export const listenRemotePort = async (
  remotePort: number | undefined,
  handler: RequestHandler | undefined,
): Promise<Server[]> => {
  if (remotePort === undefined || handler === undefined) return []
  const { server } = await listenLoopback(remotePort, () => handler)
  return [server]
}
