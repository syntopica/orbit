import type { Context } from 'hono'

import type { GuardConfig } from '../types/GuardConfig'
import type { OrbitEnv } from '../types/OrbitEnv'

// Whether the connection arrived on the machine's own port while Tailscale
// Serve is pointed at a separate remote port. The socket's local port is set
// by the kernel, so unlike the Host header a client cannot choose it. Without
// a remote port every listener may carry published traffic, so none is local.
export const isLocalListener = (
  c: Context<OrbitEnv>,
  guard: GuardConfig,
): boolean =>
  guard.remotePort !== undefined &&
  (c.env as Partial<OrbitEnv['Bindings']> | undefined)?.incoming?.socket
    .localPort === guard.port
