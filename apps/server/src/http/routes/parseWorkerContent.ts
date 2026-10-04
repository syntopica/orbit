import { parseWorkerJson } from '../../adapters/worker/parseWorkerJson'
import { workerJobContentReportSchema } from '../../adapters/worker/workerJobContentReportSchema'

export const parseWorkerContent = (
  body: string,
): { input?: unknown; output?: unknown } | null => {
  try {
    return parseWorkerJson(body, workerJobContentReportSchema)
  } catch {
    return null
  }
}
