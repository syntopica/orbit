import { parseWorkerJson } from '../../adapters/worker/parseWorkerJson'
import { workerJobActionReportSchema } from '../../adapters/worker/workerJobActionReportSchema'
import { isIdentifier } from '../../workerView/isIdentifier'

export const parseWorkerAction = (
  body: string,
): { id: string; state: string; retryOf?: string } | null => {
  try {
    const report = parseWorkerJson(body, workerJobActionReportSchema)
    if (
      !isIdentifier(report.id) ||
      !isIdentifier(report.state) ||
      (report.retry_of !== undefined && !isIdentifier(report.retry_of))
    )
      return null
    return {
      id: report.id,
      state: report.state,
      ...(report.retry_of === undefined ? {} : { retryOf: report.retry_of }),
    }
  } catch {
    return null
  }
}
