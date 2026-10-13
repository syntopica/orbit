import type { WorkerErrorBody } from '../../types/WorkerErrorBody'

export const workerErrorCode = (body: string): unknown => {
  try {
    return (JSON.parse(body) as WorkerErrorBody).error
  } catch {
    return null
  }
}
