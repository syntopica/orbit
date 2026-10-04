import type { Handler } from 'hono'

import type { OrbitEnv } from '../../types/OrbitEnv'
import type { PollerRegistry } from '../../types/PollerRegistry'

export const getPoller =
  (
    poller: PollerRegistry | undefined,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  (c) =>
    c.json({ now: now(), rows: poller?.rows() ?? [] })
