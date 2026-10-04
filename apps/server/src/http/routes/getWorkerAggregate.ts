import type { WorkerCosts, WorkerQuality } from '@orbit/contract'
import type { Handler } from 'hono'

import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'

export const getWorkerAggregate =
  <Report>({
    read,
    pool,
    now,
    ranges,
    convert,
  }: {
    read: ((days: number, signal: AbortSignal) => Promise<Report>) | null
    pool: DetailPool
    now: () => number
    ranges: ReadonlyMap<string, number>
    convert: (report: Report, at: number) => WorkerCosts | WorkerQuality
  }): Handler<OrbitEnv, string> =>
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
