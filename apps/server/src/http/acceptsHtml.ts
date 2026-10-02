import type { Context } from 'hono'

import type { OrbitEnv } from '../types/OrbitEnv'

export const acceptsHtml = (c: Context<OrbitEnv, string>): boolean =>
  (c.req.header('Accept') ?? '').includes('text/html')
