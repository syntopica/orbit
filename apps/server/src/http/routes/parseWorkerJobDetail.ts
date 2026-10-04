import type { WorkerJobDetail } from '@orbit/contract'
import { parseWorkerJson } from '../../adapters/worker/parseWorkerJson'
import { workerJobDetailReportSchema } from '../../adapters/worker/workerJobDetailReportSchema'
import { toJobDetailView } from '../../workerView/toJobDetailView'

export const parseWorkerJobDetail = (body: string): WorkerJobDetail | null => {
  try {
    return toJobDetailView(parseWorkerJson(body, workerJobDetailReportSchema))
  } catch {
    return null
  }
}
