import type { Context, MiddlewareHandler } from 'hono'
import { bodyLimit } from 'hono/body-limit'

import type { OrbitEnv } from '../../types/OrbitEnv'

// Unauthenticated bodies are refused before parsing once they pass 4 KiB.
export const authBodyLimit = (): MiddlewareHandler =>
  bodyLimit({
    maxSize: 4096,
    onError: (c: Context<OrbitEnv, string>) =>
      c.json({ error: 'too_large' }, 413),
  })
