import type { Handler } from 'hono'

import type { OrbitEnv } from '../../types/OrbitEnv'
import type { WorkerAggregateOptions } from '../../types/WorkerAggregateOptions'

export const getWorkerAggregate =
  <Report>({
    read,
    pool,
    now,
    ranges,
    convert,
  }: WorkerAggregateOptions<Report>): Handler<OrbitEnv, string> =>
  async (c) => {
    const days = ranges.get(c.req.query('range') ?? '')
    if (days === undefined) return c.json({ error: 'bad_request' }, 400)
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const report = await pool
      .run(async (signal) => read(days, signal), 4000)
      .catch(() => null)
    return report === null
      ? c.json({ error: 'unavailable' }, 503)
      : c.json(convert(report, now()))
  }
