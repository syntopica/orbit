import type { WorkerCostsReport } from './WorkerCostsReport'

export type WorkerCostsReader = (
  days: number,
  signal: AbortSignal,
) => Promise<WorkerCostsReport>
