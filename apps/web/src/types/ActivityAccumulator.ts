export type ActivityAccumulator = {
  readonly segments: Map<string, number>
  readonly errors: Map<string, number>
  wallMs: number
  attempts: number
  sampling: number
}
