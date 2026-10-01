import type { SnapshotCore } from '@orbit/contract'

export type Recorder = {
  record(result: PromiseSettledResult<SnapshotCore>): void
  reset(): void
  failures(): number
}
