import type { ServeStatus } from '../../types/ServeStatus'
import { parseJsonOrNull } from './parseJsonOrNull'
import { serveHost } from './serveHost'
import { serveStatusSchema } from './serveStatusSchema'

// Names whose `/` handler proxies to this port, and which of them Funnel
// exposes. Anything unparseable reads as nothing served.
export const readServeStatus = (stdout: string, port: number): ServeStatus => {
  const parsed = serveStatusSchema.safeParse(parseJsonOrNull(stdout))
  const data = parsed.success ? parsed.data : {}
  const target = `http://127.0.0.1:${String(port)}`
  const served = Object.entries(data.Web ?? {}).filter(([, web]) => {
    const proxy = web.Handlers['/']?.Proxy
    return proxy === target || proxy === `${target}/`
  })
  return {
    served: served.map(([hostPort]) => serveHost(hostPort)),
    funnelled: served
      .filter(([hostPort]) => data.AllowFunnel?.[hostPort] === true)
      .map(([hostPort]) => serveHost(hostPort)),
  }
}
