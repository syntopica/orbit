import type { WorkerActivityReport } from './WorkerActivityReport'

export type WorkerActivityReader = (
  hours: number,
  signal: AbortSignal,
) => Promise<WorkerActivityReport>
