import type { WorkerQualityReport } from './WorkerQualityReport'

export type WorkerQualityReader = (
  days: number,
  signal: AbortSignal,
) => Promise<WorkerQualityReport>
