export type WorkerSeenIds = {
  readonly failures: ReadonlySet<string>
  readonly cooldowns: ReadonlySet<string>
}
