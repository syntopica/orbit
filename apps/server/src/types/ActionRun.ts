export type ActionRun = {
  readonly id: string
  readonly kind: string
  readonly target: string
  readonly state: 'started' | 'succeeded' | 'failed'
  readonly startedAt: number
  readonly exitCode: number
  readonly durationMs: number
}
