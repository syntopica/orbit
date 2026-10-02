import { ProcessError } from '../../process/ProcessError'
import type { WorkerStatus } from '../../types/WorkerStatus'
import { workerStatusSchema } from './workerStatusSchema'

export const parseWorkerStatus = (text: string): WorkerStatus => {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new ProcessError('schema_invalid')
  }
  const parsed = workerStatusSchema.safeParse(json)
  if (!parsed.success) throw new ProcessError('schema_invalid')
  return parsed.data
}
