export type RunRequest = {
  readonly file: string
  readonly args: readonly string[]
  readonly env: Readonly<Record<string, string>>
  readonly timeoutMs: number
  readonly maxBytes: number
  readonly signal?: AbortSignal
}
