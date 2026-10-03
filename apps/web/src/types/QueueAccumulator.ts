export type QueueAccumulator = {
  readonly succeeded: number[]
  readonly outcomes: Map<string, number>
  readonly providers: Map<string, number>
  readonly errors: Map<string, number>
  wallMs: number
  attempts: number
  tokensIn: number
  tokensOut: number
}
