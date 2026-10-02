import type { ServeStatus } from '../../types/ServeStatus'
import { isOrbitProxy } from './isOrbitProxy'
import { parseJsonOrNull } from './parseJsonOrNull'
import { serveEntrySchema } from './serveEntrySchema'
import { serveHost } from './serveHost'
import { serveStatusSchema } from './serveStatusSchema'

// served: names whose `/` handler proxies to this port. funnelled: names
// Funnel exposes whose handlers (any path) proxy to it. Entries that do not
// parse are skipped alone; anything unparseable reads as nothing served.
export const readServeStatus = (stdout: string, port: number): ServeStatus => {
  const parsed = serveStatusSchema.safeParse(parseJsonOrNull(stdout))
  const data = parsed.success ? parsed.data : {}
  const served: string[] = []
  const funnelled: string[] = []
  for (const [hostPort, raw] of Object.entries(data.Web ?? {})) {
    const entry = serveEntrySchema.safeParse(raw)
    if (!entry.success) continue
    const handlers = entry.data.Handlers
    const host = serveHost(hostPort)
    if (isOrbitProxy(handlers['/']?.Proxy, port)) served.push(host)
    const any = Object.values(handlers).some((h) => isOrbitProxy(h.Proxy, port))
    if (any && data.AllowFunnel?.[hostPort] === true) funnelled.push(host)
  }
  return { served, funnelled }
}
