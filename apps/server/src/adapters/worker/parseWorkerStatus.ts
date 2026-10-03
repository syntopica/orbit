import type { WorkerStatus } from '../../types/WorkerStatus'
import { parseWorkerJson } from './parseWorkerJson'
import { workerStatusSchema } from './workerStatusSchema'

export const parseWorkerStatus = (text: string): WorkerStatus =>
  parseWorkerJson(text, workerStatusSchema)
