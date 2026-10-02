import type { HttpBindings } from '@hono/node-server'

export type RequestHandler = (
  request: Request,
  env: HttpBindings,
) => Response | Promise<Response>
