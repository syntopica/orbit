import type { HttpBindings } from '@hono/node-server'
import type { Context } from 'hono'

export const sourceKey = (
  c: Context<{ Bindings: HttpBindings }, string>,
): string => {
  const forwarded = c.req.header('X-Forwarded-For')?.split(',').at(-1)?.trim()
  if (forwarded !== undefined && forwarded !== '') return forwarded
  const bindings = c.env as HttpBindings | undefined
  return bindings?.incoming.socket.remoteAddress ?? 'unknown'
}
