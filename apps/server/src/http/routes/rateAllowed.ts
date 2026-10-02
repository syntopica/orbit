import type { Context } from 'hono'

import { consumeRateLimit } from '../../auth/consumeRateLimit'
import type { AuthRouteDeps } from '../../types/AuthRouteDeps'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { sourceKey } from '../sourceKey'

// Every attempt consumes both buckets, even one the source bucket already refuses.
export const rateAllowed = (
  deps: AuthRouteDeps,
  c: Context<OrbitEnv, string>,
  scope: 'session' | 'pair',
): boolean => {
  const now = deps.now()
  const perSource = consumeRateLimit(
    deps.db,
    { key: `${scope}:${sourceKey(c)}`, limit: 5 },
    now,
  )
  const global = consumeRateLimit(
    deps.db,
    { key: 'auth:global', limit: 30 },
    now,
  )
  return perSource && global
}
