import { parseWorkerJson } from '../../adapters/worker/parseWorkerJson'
import { workerJobContentReportSchema } from '../../adapters/worker/workerJobContentReportSchema'
import type { WorkerContentSummary } from '../../types/WorkerContentSummary'

export const parseWorkerContent = (
  body: string,
): WorkerContentSummary | null => {
  try {
    return parseWorkerJson(body, workerJobContentReportSchema)
  } catch {
    return null
  }
}
