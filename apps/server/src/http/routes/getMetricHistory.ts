import { COMPONENT_IDS } from '@orbit/contract'
import type { Handler } from 'hono'
import type { DatabaseSync } from 'node:sqlite'
import { z } from 'zod'

import { readMetricHistory } from '../../history/readMetricHistory'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { HISTORY_RANGE_SPANS } from './historyRangeSpans'

export const getMetricHistory =
  (historyDb: DatabaseSync, now: () => number): Handler<OrbitEnv, string> =>
  (c) => {
    const span = HISTORY_RANGE_SPANS.get(c.req.query('range') ?? '')
    const component = z.enum(COMPONENT_IDS).safeParse(c.req.query('component'))
    if (span === undefined || !component.success)
      return c.json({ error: 'bad_request' }, 400)
    const at = now()
    const from = at - span
    return c.json({
      now: at,
      from,
      ...readMetricHistory(historyDb, component.data, from, at),
    })
  }
