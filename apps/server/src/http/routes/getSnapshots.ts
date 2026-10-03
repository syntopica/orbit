import type { Handler } from 'hono'

import type { Hub } from '../../types/Hub'
import type { OrbitEnv } from '../../types/OrbitEnv'

export const getSnapshots =
  (hub: Hub): Handler<OrbitEnv, string> =>
  (c) =>
    c.json({
      lastId: hub.lastId(),
      snapshots: hub.snapshots(),
      events: hub.recentEvents().map((message) => message.event),
    })
