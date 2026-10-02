export type CliIo = {
  readonly out: (line: string) => void
  readonly err: (line: string) => void
  readonly env: NodeJS.ProcessEnv
}
