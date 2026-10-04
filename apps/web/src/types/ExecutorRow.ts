export type ExecutorRow = {
  readonly provider: string
  readonly model: string
  readonly queues: readonly string[]
  readonly attempts: number
  readonly succeeded: number
  readonly judged: number
  readonly meanScore: number | null
  readonly lowSample: boolean
  readonly availableAt: number | null
}
