export type GuardConfig = {
  readonly port: number
  readonly remotePort?: number | undefined
  readonly allowedHosts: readonly string[]
  readonly allowedLogins: readonly string[]
}
