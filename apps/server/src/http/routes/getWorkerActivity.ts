import type { Handler } from 'hono'

import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import type { WorkerActivityReader } from '../../types/WorkerActivityReader'
import { toActivityView } from '../../workerView/toActivityView'
import { ACTIVITY_RANGE_HOURS } from './activityRangeHours'

// Fixed JSON on any failure: upstream text is never echoed.
export const getWorkerActivity =
  (
    read: WorkerActivityReader | null,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    const hours = ACTIVITY_RANGE_HOURS.get(c.req.query('range') ?? '')
    if (hours === undefined) return c.json({ error: 'bad_request' }, 400)
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const report = await pool
      .run(async (signal) => read(hours, signal), 4000)
      .catch(() => null)
    return report === null
      ? c.json({ error: 'unavailable' }, 503)
      : c.json(toActivityView(report, now()))
  }
