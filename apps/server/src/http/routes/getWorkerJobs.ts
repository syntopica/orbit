import type { Handler } from 'hono'

import { parseWorkerJson } from '../../adapters/worker/parseWorkerJson'
import { workerJobListReportSchema } from '../../adapters/worker/workerJobListReportSchema'
import type { DetailPool } from '../../types/DetailPool'
import type { OrbitEnv } from '../../types/OrbitEnv'
import type { WorkerJobClient } from '../../types/WorkerJobClient'
import { toJobView } from '../../workerView/toJobView'
import { workerAdminError } from './workerAdminError'
import { workerJobListPath } from './workerJobListPath'

export const getWorkerJobs =
  (read: WorkerJobClient | null, pool: DetailPool): Handler<OrbitEnv, string> =>
  async (c) => {
    const path = workerJobListPath(c.req.query())
    if ('error' in path) return c.json({ error: path.error }, 400)
    if (read === null) return c.json({ error: 'unavailable' }, 503)
    const result = await pool
      .run(async (signal) => read(path.path, 'GET', null, signal), 4000)
      .catch(() => null)
    if (result === null) return c.json({ error: 'unavailable' }, 503)
    if (result.status !== 200)
      return workerAdminError(c, result.status, result.body)
    try {
      const report = parseWorkerJson(result.body, workerJobListReportSchema)
      return c.json({
        jobs: report.jobs.map(toJobView).filter((job) => job !== null),
        next: report.next,
      })
    } catch {
      return c.json({ error: 'unavailable' }, 503)
    }
  }
