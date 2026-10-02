import type { Handler } from 'hono'

import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import type { WorkerReader } from '../../types/WorkerReader'
import { toWorkerView } from '../../workerView/toWorkerView'

// Fixed JSON on any failure: upstream text is never echoed.
export const getWorker =
  (
    read: WorkerReader | null,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const status = await pool.run(read, 4000).catch(() => null)
    return status === null
      ? c.json({ error: 'unavailable' }, 503)
      : c.json(toWorkerView(status, now()))
  }
