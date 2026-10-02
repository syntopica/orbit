import type { WorkerStatus } from './WorkerStatus'

export type WorkerReader = (signal: AbortSignal) => Promise<WorkerStatus>
