export type ResolvedEngine = {
  readonly file: string
  readonly subcommands: readonly (readonly string[])[]
  readonly env: Readonly<Record<string, string>>
  readonly timeoutMs?: number
}
