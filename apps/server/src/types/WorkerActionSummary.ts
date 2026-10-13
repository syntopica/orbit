export type WorkerActionSummary = {
  readonly id: string
  readonly state: string
  readonly retryOf?: string
}
